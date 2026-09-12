import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../../lib/supabase";
import {
  fetchMessages,
  uploadAttachment,
  sendMessage,
} from "./api";
import type { ChatMessage, SendMessageResponse } from "./types";

export function useChat(roomId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial messages
  const loadMessages = useCallback(async () => {
    if (!roomId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchMessages(roomId);
      setMessages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load chat messages");
    } finally {
      setIsLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Subscribe to real-time inserts for this room
  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel(`room_messages_${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          const raw = payload.new as any;
          if (raw.status !== "visible") return;

          // Fetch sender profile details for the incoming message
          let sender_name = "Anonymous";
          let sender_avatar_url: string | null = null;

          if (raw.user_id) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name, avatar_url")
              .eq("id", raw.user_id)
              .maybeSingle();

            if (profile) {
              sender_name = profile.full_name ?? "Anonymous";
              sender_avatar_url = profile.avatar_url ?? null;
            }
          }

          const newMsg: ChatMessage = {
            id: raw.id,
            room_id: raw.room_id,
            user_id: raw.user_id,
            text: raw.text,
            attachment_url: raw.attachment_url,
            attachment_type: raw.attachment_type,
            status: raw.status,
            created_at: raw.created_at,
            sender_name,
            sender_avatar_url,
          };

          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) {
              return prev;
            }
            // List is inverted, so newest messages are at index 0
            return [newMsg, ...prev];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  // Send a text message
  const sendText = useCallback(
    async (text: string): Promise<SendMessageResponse> => {
      const trimmed = text.trim();
      if (!trimmed || !roomId) {
        return { success: false, reason: "Message text cannot be empty" };
      }

      setIsSending(true);
      try {
        const res = await sendMessage(roomId, trimmed);
        if (res.success && res.message) {
          // Add to local state if not already received via realtime
          setMessages((prev) => {
            if (prev.some((m) => m.id === res.message!.id)) return prev;
            return [res.message!, ...prev];
          });
        }
        return res;
      } catch (err) {
        const reason = err instanceof Error ? err.message : "Failed to send message";
        return { success: false, reason };
      } finally {
        setIsSending(false);
      }
    },
    [roomId]
  );

  // Send an attachment (and optional accompanying text caption)
  const sendAttachment = useCallback(
    async (
      fileUri: string,
      mimeType: string,
      fileExtension: string,
      attachmentType: "image" | "pdf",
      text?: string
    ): Promise<SendMessageResponse> => {
      if (!fileUri || !roomId) {
        return { success: false, reason: "No file selected" };
      }

      setIsSending(true);
      try {
        // Step 1: Upload to chat-pending bucket
        const pendingPath = await uploadAttachment(fileUri, mimeType, fileExtension);

        // Step 2: Invoke Edge Function for validation & moderation
        const res = await sendMessage(roomId, text?.trim() || undefined, pendingPath, attachmentType);

        if (res.success && res.message) {
          // Add to local state if not already present
          setMessages((prev) => {
            if (prev.some((m) => m.id === res.message!.id)) return prev;
            return [res.message!, ...prev];
          });
        }
        return res;
      } catch (err) {
        const reason = err instanceof Error ? err.message : "Failed to upload or send attachment";
        return { success: false, reason };
      } finally {
        setIsSending(false);
      }
    },
    [roomId]
  );

  return {
    messages,
    isLoading,
    isSending,
    error,
    refresh: loadMessages,
    sendText,
    sendAttachment,
  };
}
