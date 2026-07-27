import { supabase } from "../../lib/supabase";

/**
 * Fetches the topics/interests associated with the currently authenticated user.
 */
export async function getUserInterests(): Promise<string[]> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  
  const userId = userData.user?.id;
  if (!userId) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("interests")
    .select("topic")
    .eq("user_id", userId);

  if (error) throw error;
  return (data ?? []).map((row) => row.topic);
}

/**
 * Replaces the user's current interests with a new list of topics.
 */
export async function setUserInterests(topics: string[]): Promise<void> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;

  const userId = userData.user?.id;
  if (!userId) throw new Error("Not authenticated");

  // Since interests is a simple user_id -> topic mapping, we delete existing and insert new
  const { error: deleteError } = await supabase
    .from("interests")
    .delete()
    .eq("user_id", userId);

  if (deleteError) throw deleteError;

  if (topics.length === 0) return;

  const { error: insertError } = await supabase
    .from("interests")
    .insert(
      topics.map((topic) => ({
        user_id: userId,
        topic,
      }))
    );

  if (insertError) throw insertError;
}
