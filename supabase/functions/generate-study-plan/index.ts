// supabase/functions/generate-study-plan/index.ts
// Deploy with: supabase functions deploy generate-study-plan
// Requires secrets:
//   GEMINI_API_KEY
// Injected automatically: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

declare const Deno: any;

// @ts-ignore
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const REQUEST_TIMEOUT_MS = 25000;

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

function cleanJsonResponse(rawText: string): string {
  let text = rawText.trim();
  // Remove markdown code block fences if present
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  }
  return text;
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

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ success: false, reason: "Server misconfiguration" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

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
    const daysAhead = Math.min(Math.max(Number(body.daysAhead) || 7, 1), 30);

    // Fetch caller's interests and recent liked/saved user_actions
    const [interestsRes, actionsRes] = await Promise.all([
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
    ]);

    const topics: string[] = (interestsRes.data ?? [])
      .map((i: any) => i.topic)
      .filter(Boolean);

    const engagedTitles: string[] = (actionsRes.data ?? [])
      .map((a: any) => a.content_items?.title)
      .filter(Boolean);

    const topicsText = topics.length > 0 ? topics.join(", ") : "Computer Science, Mathematics, Science";
    const titlesText =
      engagedTitles.length > 0
        ? engagedTitles.map((t: string) => `"${t}"`).join(", ")
        : "Foundational learning";

    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          reason: "GEMINI_API_KEY secret is not configured on the server",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build today's date and date reference
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    const prompt = `You are Alphadex's intelligent study curriculum planner.
Learner's topics: ${topicsText}.
Recent activity/interests: ${titlesText}.

Today's date is ${todayStr}.
Generate a structured study schedule for the next ${daysAhead} days. Propose 1 or 2 focused study sessions per day.
Each session must have:
- title: concise, engaging session goal (e.g. "Deep dive into Neural Attention Mechanisms")
- topic: one of the learner's topics or a relevant sub-topic
- scheduled_date: string in "YYYY-MM-DD" format starting from tomorrow or today and spreading across the next ${daysAhead} days
- duration_minutes: integer between 20 and 90 (e.g. 30, 45, 60)

CRITICAL REQUIREMENT: Return ONLY a valid JSON array of objects with keys: "title", "topic", "scheduled_date", "duration_minutes".
Do NOT return any other text, markdown explanations, or preamble. Return purely JSON like:
[
  {
    "title": "Introduction to Linear Algebra for ML",
    "topic": "Mathematics",
    "scheduled_date": "${todayStr}",
    "duration_minutes": 45
  }
]`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-latest:generateContent?key=${geminiApiKey}`;

    const geminiRes = await fetchWithTimeout(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text().catch(() => "");
      console.error("Gemini API error:", geminiRes.status, errBody);
      return new Response(
        JSON.stringify({
          success: false,
          reason: "Couldn't generate a plan, try again",
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiData = await geminiRes.json();
    const rawOutput = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!rawOutput) {
      return new Response(
        JSON.stringify({
          success: false,
          reason: "Couldn't generate a plan, try again",
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let parsedItems: any[] = [];
    try {
      const cleaned = cleanJsonResponse(rawOutput);
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) {
        parsedItems = parsed;
      } else if (parsed && Array.isArray(parsed.items)) {
        parsedItems = parsed.items;
      } else if (parsed && Array.isArray(parsed.sessions)) {
        parsedItems = parsed.sessions;
      } else {
        throw new Error("Invalid format: expected array");
      }
    } catch (parseErr) {
      console.error("Failed to parse Gemini response as JSON:", parseErr, rawOutput);
      return new Response(
        JSON.stringify({
          success: false,
          reason: "Couldn't generate a plan, try again",
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (parsedItems.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          reason: "Couldn't generate a plan, try again",
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prepare rows for study_schedule_items
    const rowsToInsert = parsedItems.map((item) => {
      const dateVal =
        typeof item.scheduled_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(item.scheduled_date)
          ? item.scheduled_date
          : todayStr;

      return {
        user_id: user.id,
        title: String(item.title || "Study Session").slice(0, 200),
        topic: String(item.topic || "General").slice(0, 100),
        scheduled_date: dateVal,
        duration_minutes: Math.max(10, Math.min(Number(item.duration_minutes) || 30, 240)),
        completed: false,
        source: "ai",
      };
    });

    // Insert with service role client
    const { data: inserted, error: insertError } = await serviceClient
      .from("study_schedule_items")
      .insert(rowsToInsert)
      .select();

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({
          success: false,
          reason: insertError.message || "Failed to save generated plan",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        items: inserted,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("generate-study-plan unhandled error:", err);
    return new Response(
      JSON.stringify({
        success: false,
        reason: "Couldn't generate a plan, try again",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
