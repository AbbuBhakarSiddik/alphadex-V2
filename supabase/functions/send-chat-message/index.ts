// supabase/functions/send-chat-message/index.ts
// Deploy with: supabase functions deploy send-chat-message
// Requires secrets (set via `supabase secrets set GEMINI_API_KEY=value`):
//   GEMINI_API_KEY
// SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY are injected automatically by Supabase.

declare const Deno: any;

// @ts-ignore
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const MAX_ATTACHMENT_SIZE_BYTES = 3 * 1024 * 1024; // 3MB

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = "";
  const len = bytes.byteLength;
  const chunkSize = 8192;
  for (let i = 0; i < len; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
    binary += String.fromCharCode.apply(null, chunk as any);
  }
  return btoa(binary);
}

function detectImageMimeType(bytes: Uint8Array): "image/png" | "image/jpeg" | "image/webp" | null {
  if (bytes.length < 4) return null;

  // PNG: 89 50 4E 47 (\x89PNG)
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return "image/png";
  }

  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }

  // WEBP: RIFF....WEBP (0x52 0x49 0x46 0x46 ... 0x57 0x45 0x42 0x50)
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }

  return null;
}

function isPdf(bytes: Uint8Array): boolean {
  if (bytes.length < 4) return false;
  // %PDF -> 0x25 0x50 0x44 0x46
  return bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
}

function extractPdfText(bytes: Uint8Array): string {
  const textDecoder = new TextDecoder("latin1");
  const raw = textDecoder.decode(bytes);

  let extracted = "";

  // Extract from BT ... ET blocks
  const btMatches = raw.matchAll(/BT[\s\S]*?ET/g);
  for (const match of btMatches) {
    const block = match[0];
    const strMatches = block.matchAll(/\((.*?)\)/g);
    for (const sm of strMatches) {
      if (sm[1]) {
        extracted += sm[1] + " ";
      }
    }
  }

  // Unescape standard PDF character escapes
  extracted = extracted
    .replace(/\\([()\\])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

  return extracted;
}

async function moderateText(
  text: string,
  geminiApiKey: string
): Promise<{ isClean: boolean; reason?: string }> {
  try {
    const prompt = `Is this message toxic, harassing, or harmful? Respond with only CLEAN or REJECT: <reason>\n\nMessage: "${text}"`;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${geminiApiKey}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return {
        isClean: false,
        reason: `Moderation service error (${res.status}): ${errText.slice(0, 100)}`,
      };
    }

    const data = await res.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";

    if (reply.toUpperCase().startsWith("CLEAN")) {
      return { isClean: true };
    }

    const reason = reply.replace(/^REJECT:\s*/i, "").trim() || "Content violated safety guidelines";
    return { isClean: false, reason };
  } catch (err) {
    return {
      isClean: false,
      reason: err instanceof Error ? err.message : "Moderation check failed",
    };
  }
}

async function moderateImage(
  bytes: Uint8Array,
  mimeType: string,
  geminiApiKey: string
): Promise<{ isClean: boolean; reason?: string }> {
  try {
    const base64Data = uint8ArrayToBase64(bytes);
    const prompt =
      "Evaluate this image for harmful, explicit, adult, violent, or dangerous content. Respond with only CLEAN or REJECT: <reason>.";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${geminiApiKey}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Data,
                },
              },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return {
        isClean: false,
        reason: `Image moderation error (${res.status}): ${errText.slice(0, 100)}`,
      };
    }

    const data = await res.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";

    if (reply.toUpperCase().startsWith("CLEAN")) {
      return { isClean: true };
    }

    const reason = reply.replace(/^REJECT:\s*/i, "").trim() || "Image violated safety guidelines";
    return { isClean: false, reason };
  } catch (err) {
    return {
      isClean: false,
      reason: err instanceof Error ? err.message : "Image moderation check failed",
    };
  }
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
    const { roomId, text, attachmentPath, attachmentType } = body;

    if (!roomId) {
      return new Response(
        JSON.stringify({ success: false, reason: "roomId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!text && !attachmentPath) {
      return new Response(
        JSON.stringify({ success: false, reason: "Message must include text or an attachment" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ success: false, reason: "GEMINI_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Text moderation check
    if (text && typeof text === "string" && text.trim().length > 0) {
      const textMod = await moderateText(text.trim(), geminiApiKey);
      if (!textMod.isClean) {
        if (attachmentPath) {
          await serviceClient.storage.from("chat-pending").remove([attachmentPath]);
        }
        return new Response(
          JSON.stringify({ success: false, reason: textMod.reason || "Message was rejected by moderation" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    let finalAttachmentPath: string | null = null;
    let finalAttachmentType: "image" | "pdf" | null = null;

    // 2. Attachment moderation check
    if (attachmentPath) {
      if (attachmentType !== "image" && attachmentType !== "pdf") {
        await serviceClient.storage.from("chat-pending").remove([attachmentPath]);
        return new Response(
          JSON.stringify({ success: false, reason: "Invalid attachmentType (must be 'image' or 'pdf')" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Download from chat-pending bucket
      const { data: fileBlob, error: downloadError } = await serviceClient.storage
        .from("chat-pending")
        .download(attachmentPath);

      if (downloadError || !fileBlob) {
        return new Response(
          JSON.stringify({ success: false, reason: "Failed to download attachment from pending storage" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const arrayBuf = await fileBlob.arrayBuffer();
      const bytes = new Uint8Array(arrayBuf);

      // Check size limit (3MB)
      if (bytes.length > MAX_ATTACHMENT_SIZE_BYTES) {
        await serviceClient.storage.from("chat-pending").remove([attachmentPath]);
        return new Response(
          JSON.stringify({ success: false, reason: "Attachment exceeds 3MB size limit" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      let detectedMime: string | null = null;
      let fileExt = "bin";

      if (attachmentType === "pdf") {
        if (!isPdf(bytes)) {
          await serviceClient.storage.from("chat-pending").remove([attachmentPath]);
          return new Response(
            JSON.stringify({ success: false, reason: "File signature does not match PDF format" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        detectedMime = "application/pdf";
        fileExt = "pdf";

        // Extract PDF text
        const extractedText = extractPdfText(bytes);
        if (!extractedText || extractedText.length === 0) {
          await serviceClient.storage.from("chat-pending").remove([attachmentPath]);
          return new Response(
            JSON.stringify({
              success: false,
              reason: "Could not extract readable text from PDF for content moderation. Encrypted or scanned PDFs are not supported.",
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const pdfTextMod = await moderateText(extractedText, geminiApiKey);
        if (!pdfTextMod.isClean) {
          await serviceClient.storage.from("chat-pending").remove([attachmentPath]);
          return new Response(
            JSON.stringify({ success: false, reason: `PDF content rejected: ${pdfTextMod.reason}` }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } else if (attachmentType === "image") {
        detectedMime = detectImageMimeType(bytes);
        if (!detectedMime) {
          await serviceClient.storage.from("chat-pending").remove([attachmentPath]);
          return new Response(
            JSON.stringify({ success: false, reason: "File signature does not match JPEG, PNG, or WEBP image format" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        fileExt = detectedMime === "image/png" ? "png" : detectedMime === "image/webp" ? "webp" : "jpg";

        const imageMod = await moderateImage(bytes, detectedMime, geminiApiKey);
        if (!imageMod.isClean) {
          await serviceClient.storage.from("chat-pending").remove([attachmentPath]);
          return new Response(
            JSON.stringify({ success: false, reason: `Image rejected: ${imageMod.reason}` }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      // Move file from chat-pending to chat-attachments
      const newPath = `${roomId}/${crypto.randomUUID()}.${fileExt}`;
      const { error: uploadError } = await serviceClient.storage
        .from("chat-attachments")
        .upload(newPath, bytes, {
          contentType: detectedMime ?? undefined,
          upsert: true,
        });

      if (uploadError) {
        await serviceClient.storage.from("chat-pending").remove([attachmentPath]);
        return new Response(
          JSON.stringify({ success: false, reason: `Failed to save verified attachment: ${uploadError.message}` }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Delete from pending
      await serviceClient.storage.from("chat-pending").remove([attachmentPath]);

      finalAttachmentPath = newPath;
      finalAttachmentType = attachmentType;
    }

    // 3. Insert message into chat_messages
    const { data: insertedMessage, error: insertError } = await serviceClient
      .from("chat_messages")
      .insert({
        room_id: roomId,
        sender_id: user.id,
        content: text && typeof text === "string" ? text.trim() : null,
        attachment_url: finalAttachmentPath,
        attachment_type: finalAttachmentType,
        status: "visible",
      })
      .select("*, profiles(full_name, avatar_url)")
      .single();

    if (insertError) {
      return new Response(
        JSON.stringify({ success: false, reason: `Database insert failed: ${insertError.message}` }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const formattedMessage = {
      id: insertedMessage.id,
      room_id: insertedMessage.room_id,
      sender_id: insertedMessage.sender_id,
      content: insertedMessage.content,
      attachment_url: insertedMessage.attachment_url,
      attachment_type: insertedMessage.attachment_type,
      status: insertedMessage.status,
      created_at: insertedMessage.created_at,
      sender_name: insertedMessage.profiles?.full_name ?? "Anonymous",
      sender_avatar_url: insertedMessage.profiles?.avatar_url ?? null,
    };

    return new Response(
      JSON.stringify({ success: true, message: formattedMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
