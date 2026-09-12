import { supabase } from "../../lib/supabase";
import type { TutorMessage, SendTutorMessageResponse } from "./types";

/**
 * Fetches the entire chat history for the currently logged-in user,
 * ordered by created_at ascending (chronological).
 */
export async function fetchChatHistory(): Promise<TutorMessage[]> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error("User must be authenticated to fetch tutor chat history");
  }

  const { data, error } = await supabase
    .from("chat_history")
    .select("id, role, content, created_at")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data || []).map((row: any) => ({
    id: row.id,
    role: row.role as "user" | "assistant",
    content: row.content,
    created_at: row.created_at,
  }));
}

/**
 * Invokes the `ai-tutor-chat` Edge Function with the user's message.
 */
export async function sendTutorMessage(
  message: string
): Promise<SendTutorMessageResponse> {
  const { data, error } = await supabase.functions.invoke("ai-tutor-chat", {
    body: { message },
  });

  if (error) {
    return {
      success: false,
      reason: error.message || "Failed to contact AI Tutor",
    };
  }

  return data as SendTutorMessageResponse;
}
