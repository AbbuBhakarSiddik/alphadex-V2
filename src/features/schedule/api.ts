import { supabase } from "../../lib/supabase";
import type { StudyScheduleItem, GenerateStudyPlanResponse } from "./types";

/**
 * Fetches all study schedule items for the authenticated user, ordered by scheduled date.
 */
export async function fetchSchedule(): Promise<StudyScheduleItem[]> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error("User must be authenticated to fetch study schedule");
  }

  const { data, error } = await supabase
    .from("study_schedule_items")
    .select("id, user_id, title, topic, scheduled_date, duration_minutes, completed, source, created_at")
    .eq("user_id", userData.user.id)
    .order("scheduled_date", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    topic: row.topic,
    scheduled_date: row.scheduled_date,
    duration_minutes: Number(row.duration_minutes) || 30,
    completed: Boolean(row.completed),
    source: (row.source === "ai" ? "ai" : "manual") as "ai" | "manual",
    created_at: row.created_at,
  }));
}

/**
 * Manually adds a study session item.
 */
export async function addScheduleItem(
  title: string,
  topic: string,
  scheduledDate: string,
  durationMinutes: number
): Promise<StudyScheduleItem> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error("User must be authenticated to add study item");
  }

  const { data, error } = await supabase
    .from("study_schedule_items")
    .insert({
      user_id: userData.user.id,
      title: title.trim(),
      topic: topic.trim(),
      scheduled_date: scheduledDate,
      duration_minutes: durationMinutes,
      completed: false,
      source: "manual",
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    user_id: data.user_id,
    title: data.title,
    topic: data.topic,
    scheduled_date: data.scheduled_date,
    duration_minutes: Number(data.duration_minutes) || 30,
    completed: Boolean(data.completed),
    source: data.source as "ai" | "manual",
    created_at: data.created_at,
  };
}

/**
 * Updates the completed status of a study schedule item.
 */
export async function toggleComplete(id: string, completed: boolean): Promise<void> {
  const { error } = await supabase
    .from("study_schedule_items")
    .update({ completed })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Deletes a study schedule item.
 */
export async function deleteScheduleItem(id: string): Promise<void> {
  const { error } = await supabase
    .from("study_schedule_items")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Invokes the generate-study-plan Edge Function.
 */
export async function generatePlan(daysAhead = 7): Promise<GenerateStudyPlanResponse> {
  const { data, error } = await supabase.functions.invoke("generate-study-plan", {
    body: { daysAhead },
  });

  if (error) {
    return {
      success: false,
      reason: error.message || "Failed to generate study plan",
    };
  }

  return data as GenerateStudyPlanResponse;
}
