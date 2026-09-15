/**
 * Types for the interests / channel-follow feature.
 */

export interface FollowedChannel {
  channel_id: string;
  name: string;
  priority: number;
}

export interface ChannelSearchResult {
  channelId: string;
  name: string;
  thumbnailUrl: string | null;
}
