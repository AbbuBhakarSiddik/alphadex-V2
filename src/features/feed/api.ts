import { supabase } from "../../lib/supabase";
import type { FeedCachePayload, UserActionType } from "./types";

/**
 * Invokes the `feed-rank` Edge Function, which (server-side):
 *  1. checks feed_cache freshness for this user
 *  2. if stale, ingests new content from YouTube/News for their
 *     followed channels + interests, upserts into content_items
 *  3. scores + ranks everything, writes the result to feed_cache
 *  4. returns the payload
 *
 * This is what "on-demand ingestion" means in practice — the client
 * triggers it, but all the API keys and DB writes happen server-side.
 */
export async function fetchFeed(options?: {
  forceRefresh?: boolean;
}): Promise<FeedCachePayload> {
  const { data, error } = await supabase.functions.invoke("feed-rank", {
    body: { forceRefresh: options?.forceRefresh ?? false },
  });
  if (error) throw error;
  return data as FeedCachePayload;
}

export async function setUserAction(
  contentId: string,
  action: UserActionType,
  isActive: boolean
) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  const userId = userData.user?.id;
  if (!userId) throw new Error("Not authenticated");

  if (isActive) {
    const { error } = await supabase
      .from("user_actions")
      .upsert(
        { user_id: userId, content_id: contentId, action },
        { onConflict: "user_id,content_id,action" }
      );
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("user_actions")
      .delete()
      .match({ user_id: userId, content_id: contentId, action });
    if (error) throw error;
  }
}
