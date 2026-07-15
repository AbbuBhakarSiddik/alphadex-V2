export type ContentItem = {
  id: string;
  source: "youtube" | "news";
  external_id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  channel_id: string | null;
  published_at: string | null;
  metadata: Record<string, unknown>;
};

export type ScoredContentItem = ContentItem & {
  score: number;
  liked: boolean;
  saved: boolean;
};

export type FeedCachePayload = {
  items: ScoredContentItem[];
  generated_at: string;
};

export type UserActionType = "like" | "save";
