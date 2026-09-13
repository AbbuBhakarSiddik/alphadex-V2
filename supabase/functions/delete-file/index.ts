// supabase/functions/delete-file/index.ts
// Deploy with: supabase functions deploy delete-file
// Requires secrets:
//   R2_ACCOUNT_ID
//   R2_ACCESS_KEY_ID
//   R2_SECRET_ACCESS_KEY
//   R2_BUCKET_NAME
// Injected automatically: SUPABASE_URL, SUPABASE_ANON_KEY

declare const Deno: any;

// @ts-ignore
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// @ts-ignore
import { AwsClient } from "https://esm.sh/aws4fetch@1";
import { corsHeaders } from "../_shared/cors.ts";

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
    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(
        JSON.stringify({ success: false, reason: "Server misconfiguration" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

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
    const { fileId } = body;

    if (!fileId) {
      return new Response(
        JSON.stringify({ success: false, reason: "fileId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch the r2_key for this file (scoped to user via userClient + user_id check)
    const { data: fileRow, error: fetchErr } = await userClient
      .from("user_files")
      .select("id, r2_key, user_id")
      .eq("id", fileId)
      .eq("user_id", user.id)
      .single();

    if (fetchErr || !fileRow) {
      return new Response(
        JSON.stringify({ success: false, reason: "File not found or unauthorized" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const r2AccountId = Deno.env.get("R2_ACCOUNT_ID");
    const r2AccessKeyId = Deno.env.get("R2_ACCESS_KEY_ID");
    const r2SecretAccessKey = Deno.env.get("R2_SECRET_ACCESS_KEY");
    const r2BucketName = Deno.env.get("R2_BUCKET_NAME");

    if (r2AccountId && r2AccessKeyId && r2SecretAccessKey && r2BucketName && fileRow.r2_key) {
      const aws = new AwsClient({
        accessKeyId: r2AccessKeyId,
        secretAccessKey: r2SecretAccessKey,
        service: "s3",
        region: "auto",
      });

      const endpoint = `https://${r2AccountId}.r2.cloudflarestorage.com/${r2BucketName}/${fileRow.r2_key}`;
      try {
        await aws.fetch(endpoint, { method: "DELETE" });
      } catch (err) {
        console.warn("R2 delete error (continuing with database row deletion):", err);
      }
    }

    // Delete the row in user_files
    const { error: deleteErr } = await userClient
      .from("user_files")
      .delete()
      .eq("id", fileId)
      .eq("user_id", user.id);

    if (deleteErr) {
      return new Response(
        JSON.stringify({ success: false, reason: deleteErr.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, reason: err?.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
