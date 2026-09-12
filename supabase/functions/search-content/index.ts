import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

type UnifiedResult = {
    id: string;
    type: "youtube" | "news" | "paper";
    title: string;
    description: string | null;
    thumbnailUrl: string | null;
    url: string;
    publishedAt: string | null;
};

function extractTag(xml: string, tag: string): string | null {
    const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
    return match ? match[1].trim() : null;
}

async function searchArxiv(query: string): Promise<UnifiedResult[]> {
    try {
        const url = `http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(
            query
        )}&start=0&max_results=8&sortBy=relevance`;
        const res = await fetch(url);
        if (!res.ok) return [];
        const xml = await res.text();

        const entries = xml.split("<entry>").slice(1);
        return entries.map((entryXml) => {
            const id = extractTag(entryXml, "id") ?? crypto.randomUUID();
            const title = (extractTag(entryXml, "title") ?? "Untitled paper").replace(/\s+/g, " ");
            const summary = (extractTag(entryXml, "summary") ?? "").replace(/\s+/g, " ").slice(0, 300);
            const published = extractTag(entryXml, "published");

            return {
                id,
                type: "paper" as const,
                title,
                description: summary,
                thumbnailUrl: null,
                url: id, // arXiv's <id> tag IS the abstract page URL
                publishedAt: published,
            };
        });
    } catch (_err) {
        return [];
    }
}

async function searchContentItems(
    service: ReturnType<typeof createClient>,
    query: string
): Promise<UnifiedResult[]> {
    const { data, error } = await service
        .from("content_items")
        .select("id, source, external_id, title, description, thumbnail_url, published_at")
        .textSearch("search_vector", query, { type: "plain", config: "english" })
        .limit(20);

    if (error || !data) return [];

    return data.map((row: any) => ({
        id: row.id,
        type: row.source as "youtube" | "news",
        title: row.title,
        description: row.description,
        thumbnailUrl: row.thumbnail_url,
        url:
            row.source === "youtube"
                ? `https://www.youtube.com/watch?v=${row.external_id}`
                : row.external_id,
        publishedAt: row.published_at,
    }));
}

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { query } = await req.json();
        if (!query || typeof query !== "string" || !query.trim()) {
            return new Response(JSON.stringify({ error: "Query is required" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const serviceClient = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        const [contentResults, paperResults] = await Promise.all([
            searchContentItems(serviceClient, query),
            searchArxiv(query),
        ]);

        // Interleave rather than concatenate, so papers aren't buried at the bottom
        const results: UnifiedResult[] = [];
        const maxLen = Math.max(contentResults.length, paperResults.length);
        for (let i = 0; i < maxLen; i++) {
            if (contentResults[i]) results.push(contentResults[i]);
            if (paperResults[i]) results.push(paperResults[i]);
        }

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