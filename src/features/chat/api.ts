import { supabase } from "../../lib/supabase";
import type { ChatMessage, SendMessageResponse } from "./types";

/**
 * Fetches visible messages for a chat room, joined with sender profile info.
 * Messages are returned in descending order (newest first) for inverted list rendering.
 */
export async function fetchMessages(
  roomId: string,
  limit = 50
): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("id, room_id, user_id, text, attachment_url, attachment_type, status, created_at, profiles(full_name, avatar_url)")
    .eq("room_id", roomId)
    .eq("status", "visible")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data || []).map((row: any) => ({
    id: row.id,
    room_id: row.room_id,
    user_id: row.user_id,
    text: row.text,
    attachment_url: row.attachment_url,
    attachment_type: row.attachment_type,
    status: row.status,
    created_at: row.created_at,
    sender_name: row.profiles?.full_name ?? "Anonymous",
    sender_avatar_url: row.profiles?.avatar_url ?? null,
  }));
}

/**
 * Uploads a local file to the `chat-pending` Supabase Storage bucket.
 * The Edge Function will verify the file magic bytes and moderation before
 * moving it to the permanent `chat-attachments` bucket.
 */
export async function uploadAttachment(
  fileUri: string,
  mimeType: string,
  fileExtension: string
): Promise<string> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error("User must be authenticated to upload attachments");
  }

  const cleanExt = fileExtension.replace(/^\./, "").toLowerCase() || "bin";
  const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const filePath = `${userData.user.id}/${uniqueId}.${cleanExt}`;

  const response = await fetch(fileUri);
  const blob = await response.blob();
  const arrayBuffer = await new Response(blob).arrayBuffer();

  const { data, error } = await supabase.storage
    .from("chat-pending")
    .upload(filePath, arrayBuffer, {
      contentType: mimeType,
      upsert: true,
    });

  if (error) throw error;
  return data.path;
}

/**
 * Invokes the `send-chat-message` Edge Function to moderate content
 * and insert the message into `chat_messages`.
 */
export async function sendMessage(
  roomId: string,
  text?: string,
  attachmentPath?: string,
  attachmentType?: "image" | "pdf"
): Promise<SendMessageResponse> {
  const { data, error } = await supabase.functions.invoke("send-chat-message", {
    body: { roomId, text, attachmentPath, attachmentType },
  });

  if (error) {
    return {
      success: false,
      reason: error.message || "Failed to send message via edge function",
    };
  }

  return data as SendMessageResponse;
}

/**
 * Creates a signed URL for a permanent attachment stored in `chat-attachments`.
 * The signed URL is valid for 1 hour (3600s).
 */
export async function getSignedAttachmentUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from("chat-attachments")
    .createSignedUrl(path, 3600);

  if (error) throw error;
  return data.signedUrl;
}
