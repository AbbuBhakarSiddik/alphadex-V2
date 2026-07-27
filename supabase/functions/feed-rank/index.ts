// supabase/functions/feed-rank/index.ts
// Deploy with: supabase functions deploy feed-rank
// Requires secrets (set via `supabase secrets set KEY=value`):
//   YOUTUBE_API_KEY   - https://console.cloud.google.com (YouTube Data API v3, free quota)
//   NEWSAPI_KEY       - https://newsapi.org (free dev tier)
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically by Supabase.

declare const Deno: any;

// @ts-ignore
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const FEED_CACHE_TTL_MINUTES = 30;
const MAX_ITEMS_RETURNED = 50;
const RECENCY_HALF_LIFE_HOURS = 48;

type ContentRow = {
  id: string;
  source: "youtube" | "news";
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  channel_id: string | null;
  published_at: string | null;
};

// NOTE: this duplicates src/features/feed/scoring.ts on purpose — Metro (the
// React Native bundler) and Deno (Edge Functions) can't share a module
// without a monorepo/workspace setup. If you tune the formula, update BOTH
// this function and the client-side copy.
function scoreItem(
  item: ContentRow,
  ctx: {
    followedChannelIds: Set<string>;
    channelPriority: Map<string, number>;
    interestTopics: string[];
    likedChannelIds: Set<string>;
  }
): number {
  let score = 0;

  if (item.published_at) {
    const ageHours =
      (Date.now() - new Date(item.published_at).getTime()) / (1000 * 60 * 60);
    score += Math.pow(0.5, ageHours / RECENCY_HALF_LIFE_HOURS) * 40;
  }

  if (item.channel_id && ctx.followedChannelIds.has(item.channel_id)) {
    score += 30;
    score += (ctx.channelPriority.get(item.channel_id) ?? 1) * 4;
  }

  const haystack = `${item.title} ${item.description ?? ""}`.toLowerCase();
  score += ctx.interestTopics.filter((t) => haystack.includes(t)).length * 8;

  if (item.channel_id && ctx.likedChannelIds.has(item.channel_id)) {
    score += 6;
  }

  return Math.round(score * 100) / 100;
}

async function ingestYouTube(
  service: ReturnType<typeof createClient>,
  channelIds: string[]
) {
  const apiKey = Deno.env.get("YOUTUBE_API_KEY");
  if (!apiKey || channelIds.length === 0) return;

  for (const channelId of channelIds) {
    try {
      const url = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet&order=date&maxResults=10&type=video`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const json = await res.json();

      const rows = (json.items ?? [])
        .map((v: any) => ({
          source: "youtube",
          external_id: v.id?.videoId,
          title: v.snippet?.title,
          description: v.snippet?.description ?? null,
          thumbnail_url: v.snippet?.thumbnails?.medium?.url ?? null,
          channel_id: channelId,
          published_at: v.snippet?.publishedAt ?? null,
          metadata: {},
        }))
        .filter((r: any) => r.external_id && r.title);

      if (rows.length > 0) {
        await service
          .from("content_items")
          .upsert(rows, { onConflict: "source,external_id" });
      }
    } catch (_err) {
      // Best-effort ingestion — one failed channel shouldn't break the feed
      continue;
    }
  }
}

async function ingestYouTubeByTopic(
  service: ReturnType<typeof createClient>,
  topics: string[]
) {
  const apiKey = Deno.env.get("YOUTUBE_API_KEY");
  if (!apiKey || topics.length === 0) return;

  for (const topic of topics) {
    try {
      // Filter by videoCategoryId=27 (Education) to ensure a high-quality educational feed
      const url = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&q=${encodeURIComponent(
        topic
      )}&part=snippet&order=relevance&maxResults=10&type=video&videoCategoryId=27`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const json = await res.json();

      const rows = (json.items ?? [])
        .map((v: any) => ({
          source: "youtube",
          external_id: v.id?.videoId,
          title: v.snippet?.title,
          description: v.snippet?.description ?? null,
          thumbnail_url: v.snippet?.thumbnails?.medium?.url ?? null,
          channel_id: v.snippet?.channelId ?? null,
          published_at: v.snippet?.publishedAt ?? null,
          metadata: { matchedTopic: topic },
        }))
        .filter((r: any) => r.external_id && r.title);

      if (rows.length > 0) {
        await service
          .from("content_items")
          .upsert(rows, { onConflict: "source,external_id" });
      }
    } catch (_err) {
      continue;
    }
  }
}

async function ingestNews(
  service: ReturnType<typeof createClient>,
  topics: string[]
) {
  const apiKey = Deno.env.get("NEWSAPI_KEY");
  if (!apiKey || topics.length === 0) return;

  for (const topic of topics) {
    try {
      const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
        topic
      )}&sortBy=publishedAt&pageSize=10&apiKey=${apiKey}`;
      // NewsAPI requires a User-Agent header when fetched outside browsers (like in Deno)
      const res = await fetch(url, {
        headers: {
          "User-Agent": "alphadex-v2/1.0",
        },
      });
      if (!res.ok) continue;
      const json = await res.json();

      const rows = (json.articles ?? [])
        .map((a: any) => ({
          source: "news",
          external_id: a.url,
          title: a.title,
          description: a.description ?? null,
          thumbnail_url: a.urlToImage ?? null,
          channel_id: a.source?.id ?? a.source?.name ?? null,
          published_at: a.publishedAt ?? null,
          metadata: {},
        }))
        .filter((r: any) => r.external_id && r.title);

      if (rows.length > 0) {
        await service
          .from("content_items")
          .upsert(rows, { onConflict: "source,external_id" });
      }
    } catch (_err) {
      continue;
    }
  }
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization")!;
    const { forceRefresh } = await req.json().catch(() => ({}));

    // User-scoped client — respects RLS, used to read only what this user owns.
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Service-role client — bypasses RLS, used ONLY for writes to shared
    // tables (content_items) and feed_cache, which users can't write to directly.
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Check cache freshness
    if (!forceRefresh) {
      const { data: cached } = await userClient
        .from("feed_cache")
        .select("payload, generated_at")
        .eq("user_id", user.id)
        .maybeSingle();

      if (cached) {
        const ageMinutes =
          (Date.now() - new Date(cached.generated_at).getTime()) / 60000;
        if (ageMinutes < FEED_CACHE_TTL_MINUTES) {
          return new Response(JSON.stringify(cached.payload), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
    }

    // 2. Load this user's follows/interests/history (RLS-scoped reads)
    const [{ data: follows }, { data: interests }, { data: pastLikes }] =
      await Promise.all([
        userClient
          .from("followed_channels")
          .select("channel_id, priority")
          .eq("user_id", user.id),
        userClient.from("interests").select("topic").eq("user_id", user.id),
        userClient
          .from("user_actions")
          .select("content_id")
          .eq("user_id", user.id)
          .eq("action", "like"),
      ]);

    const channelIds = (follows ?? []).map((f: any) => f.channel_id as string);
    const topics = (interests ?? []).map((i: any) => i.topic.toLowerCase() as string);

    // 3. Ingest fresh content (service role — writes to the shared catalog)
    await Promise.all([
      ingestYouTube(serviceClient, channelIds),
      ingestYouTubeByTopic(serviceClient, topics),
      ingestNews(serviceClient, topics),
    ]);

    // 4. Pull candidate pool + this user's like/save state
    const { data: candidates } = await serviceClient
      .from("content_items")
      .select("*")
      .order("published_at", { ascending: false })
      .limit(300);

    const { data: userActions } = await userClient
      .from("user_actions")
      .select("content_id, action")
      .eq("user_id", user.id);

    const likedIds = new Set<string>(
      (userActions ?? []).filter((a: any) => a.action === "like").map((a: any) => a.content_id as string)
    );
    const savedIds = new Set<string>(
      (userActions ?? []).filter((a: any) => a.action === "save").map((a: any) => a.content_id as string)
    );

    // Channels the user has liked content from before, even if not followed
    const likedContentIds = (pastLikes ?? []).map((l: any) => l.content_id as string);
    const likedChannelIds = new Set<string>(
      (candidates ?? [])
        .filter((c: any) => likedContentIds.includes(c.id) && c.channel_id)
        .map((c: any) => c.channel_id as string)
    );

    const scoringContext = {
      followedChannelIds: new Set<string>(channelIds),
      channelPriority: new Map<string, number>(
        (follows ?? []).map((f: any) => [f.channel_id as string, (f.priority ?? 1) as number] as [string, number])
      ),
      interestTopics: topics,
      likedChannelIds,
    };

    const ranked = (candidates ?? [])
      .map((item: any) => ({
        ...item,
        score: scoreItem(item as ContentRow, scoringContext),
        liked: likedIds.has(item.id),
        saved: savedIds.has(item.id),
      }))
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, MAX_ITEMS_RETURNED);

    const payload = { items: ranked, generated_at: new Date().toISOString() };

    // 5. Cache it (service role — users have no insert policy on feed_cache)
    await serviceClient
      .from("feed_cache")
      .upsert({ user_id: user.id, payload, generated_at: payload.generated_at });

    return new Response(JSON.stringify(payload), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
