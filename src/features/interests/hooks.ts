import { useCallback, useEffect, useState } from "react";
import { useFeedStore } from "../feed/store";
import {
  getFollowedChannels,
  followChannel,
  unfollowChannel,
  type FollowedChannel,
} from "./api";

/**
 * Manages the user's followed channels with optimistic UI updates and
 * automatic feed-cache invalidation after mutations.
 */
export function useInterestsManager() {
  const setNeedsRefresh = useFeedStore((s) => s.setNeedsRefresh);

  const [followedChannels, setFollowedChannels] = useState<FollowedChannel[]>([]);
  const [isLoadingChannels, setIsLoadingChannels] = useState(true);
  const [channelsError, setChannelsError] = useState<string | null>(null);

  const loadChannels = useCallback(async () => {
    setIsLoadingChannels(true);
    setChannelsError(null);
    try {
      const channels = await getFollowedChannels();
      setFollowedChannels(channels);
    } catch (err) {
      setChannelsError(
        err instanceof Error ? err.message : "Failed to load followed channels"
      );
    } finally {
      setIsLoadingChannels(false);
    }
  }, []);

  useEffect(() => {
    loadChannels();
  }, [loadChannels]);

  /**
   * Invalidates the server-side feed cache so the next feed load picks up
   * the new channels. Mirrors the pattern used in manage-interests.tsx for topics.
   */
  const invalidateFeedCache = useCallback(() => {
    setNeedsRefresh(true);
  }, [setNeedsRefresh]);

  /**
   * Toggles follow/unfollow for a channel the user already has a channelId for.
   * Uses an optimistic update — the UI flips immediately and reverts on failure.
   */
  const toggleChannel = useCallback(
    async (channelId: string, name: string, isCurrentlyFollowed: boolean) => {
      // Optimistic update
      if (isCurrentlyFollowed) {
        setFollowedChannels((prev) =>
          prev.filter((c) => c.channel_id !== channelId)
        );
      } else {
        setFollowedChannels((prev) => [
          ...prev,
          { channel_id: channelId, name, priority: 1 },
        ]);
      }

      try {
        if (isCurrentlyFollowed) {
          await unfollowChannel(channelId);
        } else {
          await followChannel(channelId, name);
        }
        invalidateFeedCache();
      } catch (err) {
        // Revert the optimistic update on failure
        setFollowedChannels((prev) =>
          isCurrentlyFollowed
            ? [...prev, { channel_id: channelId, name, priority: 1 }]
            : prev.filter((c) => c.channel_id !== channelId)
        );
        throw err;
      }
    },
    [invalidateFeedCache]
  );

  return {
    followedChannels,
    isLoadingChannels,
    channelsError,
    toggleChannel,
    reloadChannels: loadChannels,
  };
}
