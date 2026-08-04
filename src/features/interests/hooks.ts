import { useCallback, useEffect, useState } from "react";
import { useFeedStore } from "../feed/store";
import {
  getFollowedChannels,
  followChannel,
  unfollowChannel,
  resolveAndFollowChannel,
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

  // Track per-handle loading state while resolveAndFollowChannel is in-flight
  const [resolvingHandles, setResolvingHandles] = useState<Set<string>>(
    new Set()
  );

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

  /**
   * Resolves a YouTube channel by handle, then follows it.
   * Shows a per-chip loading indicator while resolving.
   * If the channel is already followed, unfollows it (toggles).
   */
  const followRecommended = useCallback(
    async (
      handle: string,
      displayName: string,
      isCurrentlyFollowed: boolean,
      followedChannelId?: string
    ) => {
      if (isCurrentlyFollowed && followedChannelId) {
        // For already-followed chips, delegate to toggleChannel (unfollow)
        await toggleChannel(followedChannelId, displayName, true);
        return;
      }

      // Mark this handle as resolving
      setResolvingHandles((prev) => new Set(prev).add(handle));
      try {
        await resolveAndFollowChannel(handle, displayName);
        // Reload channels to pick up the new entry with its real channelId
        await loadChannels();
        invalidateFeedCache();
      } finally {
        setResolvingHandles((prev) => {
          const next = new Set(prev);
          next.delete(handle);
          return next;
        });
      }
    },
    [toggleChannel, loadChannels, invalidateFeedCache]
  );

  return {
    followedChannels,
    isLoadingChannels,
    channelsError,
    resolvingHandles,
    toggleChannel,
    followRecommended,
    reloadChannels: loadChannels,
  };
}
