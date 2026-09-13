// supabase/functions/get-upload-url/index.ts
// Deploy with: supabase functions deploy get-upload-url
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

const MAX_STORAGE_BYTES = 5 * 1024 * 1024 * 1024; // 5 GB

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
    const { fileName, fileSizeBytes, fileType } = body;

    if (!fileName || typeof fileSizeBytes !== "number" || fileSizeBytes <= 0) {
      return new Response(
        JSON.stringify({ success: false, reason: "Invalid file metadata" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check current usage of caller
    const { data: files, error: usageError } = await userClient
      .from("user_files")
      .select("file_size_bytes")
      .eq("user_id", user.id);

    if (usageError) {
      return new Response(
        JSON.stringify({ success: false, reason: usageError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const currentUsage = (files ?? []).reduce(
      (acc: number, f: any) => acc + (Number(f.file_size_bytes) || 0),
      0
    );

    if (currentUsage + fileSizeBytes > MAX_STORAGE_BYTES) {
      return new Response(
        JSON.stringify({
          success: false,
          reason: "Storage full. Delete some files to free up space.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const r2AccountId = Deno.env.get("R2_ACCOUNT_ID");
    const r2AccessKeyId = Deno.env.get("R2_ACCESS_KEY_ID");
    const r2SecretAccessKey = Deno.env.get("R2_SECRET_ACCESS_KEY");
    const r2BucketName = Deno.env.get("R2_BUCKET_NAME");

    if (!r2AccountId || !r2AccessKeyId || !r2SecretAccessKey || !r2BucketName) {
      return new Response(
        JSON.stringify({ success: false, reason: "R2 storage credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aws = new AwsClient({
      accessKeyId: r2AccessKeyId,
      secretAccessKey: r2SecretAccessKey,
      service: "s3",
      region: "auto",
    });

    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const r2Key = `${user.id}/${crypto.randomUUID()}-${sanitizedFileName}`;
    const endpoint = `https://${r2AccountId}.r2.cloudflarestorage.com/${r2BucketName}/${r2Key}`;

    // Sign the PUT request as a presigned query URL
    const signedRequest = await aws.sign(new Request(endpoint, { method: "PUT" }), {
      aws: { signQuery: true },
    });

    return new Response(
      JSON.stringify({
        success: true,
        uploadUrl: signedRequest.url,
        r2Key,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, reason: err?.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
