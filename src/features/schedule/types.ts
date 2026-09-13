export interface StudyScheduleItem {
  id: string;
  user_id: string;
  title: string;
  topic: string;
  scheduled_date: string; // YYYY-MM-DD
  duration_minutes: number;
  completed: boolean;
  source: "manual" | "ai";
  created_at: string;
}

export interface GenerateStudyPlanResponse {
  success: boolean;
  items?: StudyScheduleItem[];
  reason?: string;
}
