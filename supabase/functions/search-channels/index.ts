// supabase/functions/search-channels/index.ts
// Deploy with: supabase functions deploy search-channels
// Requires secrets:
//   YOUTUBE_API_KEY - YouTube Data API v3 key

declare const Deno: any;

// @ts-ignore
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("YOUTUBE_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "YOUTUBE_API_KEY secret not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { query, handle } = body as { query?: string; handle?: string };

    // -----------------------------------------------------------------
    // Path A: exact handle lookup via channels?forHandle=@<handle>
    // -----------------------------------------------------------------
    if (handle) {
      const normalised = handle.startsWith("@") ? handle : `@${handle}`;
      const url = `https://www.googleapis.com/youtube/v3/channels?key=${apiKey}&forHandle=${encodeURIComponent(normalised)}&part=snippet&maxResults=1`;
      const res = await fetch(url);
      if (!res.ok) {
        const errText = await res.text();
        return new Response(
          JSON.stringify({ error: `YouTube API error: ${errText}` }),
          { status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const json = await res.json();
      const items = json.items ?? [];
      const results = items
        .map((item: any) => ({
          channelId: item.id,
          name: item.snippet?.title ?? "",
          thumbnailUrl: item.snippet?.thumbnails?.default?.url ?? null,
        }))
        .filter((r: any) => r.channelId && r.name);

      return new Response(JSON.stringify({ results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // -----------------------------------------------------------------
    // Path B: fuzzy search by query string
    // -----------------------------------------------------------------
    if (!query || typeof query !== "string" || query.trim() === "") {
      return new Response(
        JSON.stringify({ error: "Provide either `query` or `handle` in the request body." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const url = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&q=${encodeURIComponent(query.trim())}&type=channel&part=snippet&maxResults=10`;
    const res = await fetch(url);
    if (!res.ok) {
      const errText = await res.text();
      return new Response(
        JSON.stringify({ error: `YouTube API error: ${errText}` }),
        { status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const json = await res.json();
    const results = (json.items ?? [])
      .map((item: any) => ({
        channelId: item.snippet?.channelId ?? item.id?.channelId,
        name: item.snippet?.channelTitle ?? item.snippet?.title ?? "",
        thumbnailUrl: item.snippet?.thumbnails?.default?.url ?? null,
      }))
      .filter((r: any) => r.channelId && r.name);

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
