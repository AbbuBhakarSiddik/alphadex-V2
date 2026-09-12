// supabase/functions/ai-tutor-chat/index.ts
// Deploy with: supabase functions deploy ai-tutor-chat
// Requires secrets (set via `supabase secrets set KEY=value`):
//   GEMINI_API_KEY
//   GROQ_API_KEY
// SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY are injected automatically by Supabase.

declare const Deno: any;

// @ts-ignore
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const REQUEST_TIMEOUT_MS = 15000;

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs = REQUEST_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

type ChatRow = {
  role: "user" | "assistant";
  content: string;
};

/**
 * Calls Google Gemini generateContent with gemini-pro-latest.
 */
async function callGemini(
  systemPrompt: string,
  history: ChatRow[],
  userMessage: string,
  apiKey: string
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-latest:generateContent?key=${apiKey}`;

  // Map history to Gemini format (roles: 'user' | 'model')
  const contents: { role: "user" | "model"; parts: { text: string }[] }[] = [];

  for (const h of history) {
    const role = h.role === "assistant" ? "model" : "user";
    const last = contents[contents.length - 1];
    if (last && last.role === role) {
      last.parts[0].text += `\n\n${h.content}`;
    } else {
      contents.push({ role, parts: [{ text: h.content }] });
    }
  }

  // Gemini contents must start with a 'user' turn
  if (contents.length > 0 && contents[0].role === "model") {
    contents.shift();
  }

  // Append new user message
  const last = contents[contents.length - 1];
  if (last && last.role === "user") {
    last.parts[0].text += `\n\n${userMessage}`;
  } else {
    contents.push({ role: "user", parts: [{ text: userMessage }] });
  }

  const res = await fetchWithTimeout(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
      contents,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(
      `Gemini API returned status ${res.status}: ${errorText.slice(0, 150)}`
    );
  }

  const data = await res.json();
  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!reply) {
    throw new Error("Gemini returned empty text response");
  }

  return reply;
}

/**
 * Fallback: Calls Groq OpenAI-compatible chat completions with openai/gpt-oss-20b.
 */
async function callGroq(
  systemPrompt: string,
  history: ChatRow[],
  userMessage: string,
  apiKey: string
): Promise<string> {
  const url = "https://api.groq.com/openai/v1/chat/completions";

  const messages = [
    { role: "system", content: systemPrompt },
    ...history.map((h) => ({ role: h.role, content: h.content })),
    { role: "user", content: userMessage },
  ];

  const res = await fetchWithTimeout(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-20b",
      messages,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(
      `Groq API returned status ${res.status}: ${errorText.slice(0, 150)}`
    );
  }

  const data = await res.json();
  const reply = data.choices?.[0]?.message?.content?.trim();
  if (!reply) {
    throw new Error("Groq returned empty text response");
  }

  return reply;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, reason: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, reason: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { message } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return new Response(
        JSON.stringify({ success: false, reason: "Message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cleanMessage = message.trim();

    // Fetch user context in parallel:
    // 1. Their interests (topics)
    // 2. Last 10 user_actions (like/save) joined with content_items to get titles
    // 3. Last 10 chat_history rows (both roles) ordered chronologically
    const [interestsRes, actionsRes, historyRes] = await Promise.all([
      userClient
        .from("interests")
        .select("topic")
        .eq("user_id", user.id),
      userClient
        .from("user_actions")
        .select("action, created_at, content_items(title)")
        .eq("user_id", user.id)
        .in("action", ["like", "save"])
        .order("created_at", { ascending: false })
        .limit(10),
      userClient
        .from("chat_history")
        .select("role, content, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    const topics: string[] = (interestsRes.data ?? [])
      .map((i: any) => i.topic)
      .filter(Boolean);

    const engagedTitles: string[] = (actionsRes.data ?? [])
      .map((a: any) => a.content_items?.title)
      .filter(Boolean);

    // Reverse history to chronological order (oldest to newest)
    const recentHistory: ChatRow[] = (historyRes.data ?? [])
      .reverse()
      .map((h: any) => ({
        role: h.role as "user" | "assistant",
        content: h.content as string,
      }));

    const topicsText = topics.length > 0 ? topics.join(", ") : "general topics";
    const titlesText =
      engagedTitles.length > 0
        ? engagedTitles.map((t) => `"${t}"`).join(", ")
        : "no recent items yet";

    const systemPrompt = `You are Alphadex's AI study guide. This learner's interests: ${topicsText}. They've recently engaged with: ${titlesText}. Give encouraging, concise, educational guidance that references their actual learning activity where relevant — don't just answer generically.`;

    let reply: string | null = null;
    let geminiError: string | null = null;
    let groqError: string | null = null;

    // 1. Attempt Gemini (gemini-pro-latest)
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (geminiApiKey) {
      try {
        reply = await callGemini(
          systemPrompt,
          recentHistory,
          cleanMessage,
          geminiApiKey
        );
      } catch (err: any) {
        geminiError = err?.message || "Gemini call failed";
      }
    } else {
      geminiError = "GEMINI_API_KEY not configured";
    }

    // 2. Fallback to Groq (openai/gpt-oss-20b) if Gemini failed
    if (!reply) {
      const groqApiKey = Deno.env.get("GROQ_API_KEY");
      if (groqApiKey) {
        try {
          reply = await callGroq(
            systemPrompt,
            recentHistory,
            cleanMessage,
            groqApiKey
          );
        } catch (err: any) {
          groqError = err?.message || "Groq fallback call failed";
        }
      } else {
        groqError = "GROQ_API_KEY not configured";
      }
    }

    // If both providers failed, return graceful failure rather than throwing
    if (!reply) {
      return new Response(
        JSON.stringify({
          success: false,
          reason: `AI service unavailable. Primary: ${geminiError}; Fallback: ${groqError}`,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. On success: insert two rows into chat_history using service role client
    const { error: insertError } = await serviceClient.from("chat_history").insert([
      {
        user_id: user.id,
        role: "user",
        content: cleanMessage,
      },
      {
        user_id: user.id,
        role: "assistant",
        content: reply,
      },
    ]);

    if (insertError) {
      // Still return reply to user even if history logging encountered an issue
      console.error("Failed to insert chat_history rows:", insertError);
    }

    return new Response(
      JSON.stringify({ success: true, reply }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        reason: err instanceof Error ? err.message : "Internal server error",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
