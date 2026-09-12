export type TutorMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

export type SendTutorMessageResponse = {
  success: boolean;
  reply?: string;
  reason?: string;
};
