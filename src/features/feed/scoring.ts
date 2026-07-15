import type { ContentItem } from "./types";

export type ScoringInput = {
  item: ContentItem;
  followedChannelIds: Set<string>;
  channelPriority: Map<string, number>; // channel_id -> priority (1-5)
  interestTopics: string[]; // lowercase topic keywords
  likedChannelIds: Set<string>; // channels the user has liked content from before
};

const RECENCY_HALF_LIFE_HOURS = 48;

/**
 * Scores a single content item for a specific user. Higher = show sooner.
 *
 * Signals, in order of weight:
 * 1. Recency — exponential decay, so a great video from 3 weeks ago doesn't
 *    permanently outrank everything new.
 * 2. Followed-channel match — direct signal the user explicitly asked for.
 * 3. Channel priority — user-set weighting among their followed channels.
 * 4. Interest/topic keyword match against title+description.
 * 5. Past-engagement — small boost if they've liked this channel before,
 *    even if they don't formally follow it.
 */
export function scoreContentItem({
  item,
  followedChannelIds,
  channelPriority,
  interestTopics,
  likedChannelIds,
}: ScoringInput): number {
  let score = 0;

  // 1. Recency decay
  if (item.published_at) {
    const ageHours =
      (Date.now() - new Date(item.published_at).getTime()) / (1000 * 60 * 60);
    const recencyScore = Math.pow(0.5, ageHours / RECENCY_HALF_LIFE_HOURS);
    score += recencyScore * 40; // recency contributes up to 40 points
  }

  // 2. Followed channel match
  if (item.channel_id && followedChannelIds.has(item.channel_id)) {
    score += 30;

    // 3. Channel priority (1-5, default 1) scales that boost
    const priority = channelPriority.get(item.channel_id) ?? 1;
    score += priority * 4; // up to +20 for priority 5
  }

  // 4. Interest keyword match (simple substring match — fine for a v2 baseline,
  // swap for a proper embedding-similarity search later if you want to go further)
  const haystack = `${item.title} ${item.description ?? ""}`.toLowerCase();
  const matchedTopics = interestTopics.filter((topic) =>
    haystack.includes(topic)
  );
  score += matchedTopics.length * 8;

  // 5. Past engagement with this channel, even if not formally followed
  if (item.channel_id && likedChannelIds.has(item.channel_id)) {
    score += 6;
  }

  return Math.round(score * 100) / 100;
}

/**
 * Scores and sorts a full list of items, highest score first.
 */
export function rankFeed(
  items: ContentItem[],
  context: Omit<ScoringInput, "item">
): { item: ContentItem; score: number }[] {
  return items
    .map((item) => ({ item, score: scoreContentItem({ item, ...context }) }))
    .sort((a, b) => b.score - a.score);
}
