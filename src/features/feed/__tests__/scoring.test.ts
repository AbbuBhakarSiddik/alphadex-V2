import { scoreContentItem } from "../scoring";
import type { ContentItem } from "../types";

function makeItem(overrides: Partial<ContentItem> = {}): ContentItem {
  return {
    id: "1",
    source: "youtube",
    external_id: "yt-1",
    title: "Intro to Machine Learning",
    description: "A beginner friendly walkthrough of ML basics",
    thumbnail_url: null,
    channel_id: "chan-1",
    published_at: new Date().toISOString(),
    metadata: {},
    ...overrides,
  };
}

const baseContext = {
  followedChannelIds: new Set<string>(),
  channelPriority: new Map<string, number>(),
  interestTopics: [] as string[],
  likedChannelIds: new Set<string>(),
};

describe("scoreContentItem", () => {
  it("gives a recent item a higher recency contribution than an old one", () => {
    const recent = makeItem({ published_at: new Date().toISOString() });
    const old = makeItem({
      published_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    });

    const recentScore = scoreContentItem({ item: recent, ...baseContext });
    const oldScore = scoreContentItem({ item: old, ...baseContext });

    expect(recentScore).toBeGreaterThan(oldScore);
  });

  it("boosts items from followed channels", () => {
    const item = makeItem({ channel_id: "chan-1" });

    const notFollowed = scoreContentItem({ item, ...baseContext });
    const followed = scoreContentItem({
      item,
      ...baseContext,
      followedChannelIds: new Set(["chan-1"]),
    });

    expect(followed).toBeGreaterThan(notFollowed);
  });

  it("scales the followed-channel boost with priority", () => {
    const item = makeItem({ channel_id: "chan-1" });
    const context = {
      ...baseContext,
      followedChannelIds: new Set(["chan-1"]),
    };

    const lowPriority = scoreContentItem({
      item,
      ...context,
      channelPriority: new Map([["chan-1", 1]]),
    });
    const highPriority = scoreContentItem({
      item,
      ...context,
      channelPriority: new Map([["chan-1", 5]]),
    });

    expect(highPriority).toBeGreaterThan(lowPriority);
  });

  it("boosts items matching interest topics", () => {
    const item = makeItem({ title: "Deep dive into neural networks" });

    const noMatch = scoreContentItem({ item, ...baseContext });
    const match = scoreContentItem({
      item,
      ...baseContext,
      interestTopics: ["neural networks"],
    });

    expect(match).toBeGreaterThan(noMatch);
  });

  it("gives a small boost for channels the user has liked before, even if unfollowed", () => {
    const item = makeItem({ channel_id: "chan-2" });

    const noHistory = scoreContentItem({ item, ...baseContext });
    const withHistory = scoreContentItem({
      item,
      ...baseContext,
      likedChannelIds: new Set(["chan-2"]),
    });

    expect(withHistory).toBeGreaterThan(noHistory);
  });
});
