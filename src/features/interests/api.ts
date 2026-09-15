import { supabase } from "../../lib/supabase";

// ---------------------------------------------------------------------------
// Interest (topic) helpers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Channel follow helpers
// ---------------------------------------------------------------------------

export interface FollowedChannel {
  channel_id: string;
  name: string;
  priority: number;
}

/**
 * Returns all channels the current user follows.
 */
export async function getFollowedChannels(): Promise<FollowedChannel[]> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;

  const userId = userData.user?.id;
  if (!userId) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("followed_channels")
    .select("channel_id, channel_name, priority")
    .eq("user_id", userId);

  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    channel_id: row.channel_id,
    name: row.channel_name ?? row.name ?? "",
    priority: row.priority,
  }));
}

/**
 * Follows a YouTube channel for the current user.
 */
export async function followChannel(
  channelId: string,
  name: string
): Promise<void> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;

  const userId = userData.user?.id;
  if (!userId) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("followed_channels")
    .upsert(
      { user_id: userId, channel_id: channelId, channel_name: name, priority: 1 },
      { onConflict: "user_id,channel_id" }
    );

  if (error) throw error;
}

/**
 * Unfollows a YouTube channel for the current user.
 */
export async function unfollowChannel(channelId: string): Promise<void> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;

  const userId = userData.user?.id;
  if (!userId) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("followed_channels")
    .delete()
    .match({ user_id: userId, channel_id: channelId });

  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Channel search / resolve
// ---------------------------------------------------------------------------

export interface ChannelSearchResult {
  channelId: string;
  name: string;
  thumbnailUrl: string | null;
}

/**
 * Searches YouTube channels by fuzzy query string via the search-channels Edge Function.
 */
export async function searchChannels(
  query: string
): Promise<ChannelSearchResult[]> {
  const { data, error } = await supabase.functions.invoke("search-channels", {
    body: { query },
  });
  if (error) throw error;
  return (data?.results ?? []) as ChannelSearchResult[];
}
