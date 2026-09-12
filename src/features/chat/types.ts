export type ChatMessage = {
  id: string;
  room_id: string;
  user_id: string;
  text: string | null;
  attachment_url: string | null;
  attachment_type: "image" | "pdf" | null;
  status: "visible" | "hidden" | "deleted" | string;
  created_at: string;
  sender_name?: string | null;
  sender_avatar_url?: string | null;
};

export type SendMessageResponse = {
  success: boolean;
  message?: ChatMessage;
  reason?: string;
};
