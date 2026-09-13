import { supabase } from "../../lib/supabase";
import type {
  UserFile,
  GetUploadUrlResponse,
  ConfirmUploadResponse,
  DeleteFileResponse,
} from "./types";

/**
 * Fetches the caller's stored files from the user_files table.
 */
export async function fetchFiles(): Promise<UserFile[]> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error("User must be authenticated to fetch files");
  }

  const { data, error } = await supabase
    .from("user_files")
    .select("id, user_id, r2_key, file_name, file_size_bytes, file_type, created_at")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    user_id: row.user_id,
    r2_key: row.r2_key,
    file_name: row.file_name,
    file_size_bytes: Number(row.file_size_bytes) || 0,
    file_type: row.file_type || "application/octet-stream",
    created_at: row.created_at,
  }));
}

/**
 * Calls the get-upload-url Edge Function to check quota and get an R2 presigned PUT URL.
 */
export async function getUploadUrl(
  fileName: string,
  fileSizeBytes: number,
  fileType: string
): Promise<GetUploadUrlResponse> {
  const { data, error } = await supabase.functions.invoke("get-upload-url", {
    body: { fileName, fileSizeBytes, fileType },
  });

  if (error) {
    return {
      success: false,
      reason: error.message || "Failed to generate upload URL",
    };
  }

  return data as GetUploadUrlResponse;
}

/**
 * Performs a raw HTTP PUT request to Cloudflare R2 using the presigned URL.
 * R2 presigned URLs don't need Supabase auth headers.
 */
export async function uploadToR2(
  uploadUrl: string,
  fileUri: string,
  fileType?: string
): Promise<void> {
  const fileResponse = await fetch(fileUri);
  if (!fileResponse.ok) {
    throw new Error("Failed to read local file for upload");
  }
  const blob = await fileResponse.blob();

  const headers: Record<string, string> = {};
  if (fileType) {
    headers["Content-Type"] = fileType;
  }

  const putResponse = await fetch(uploadUrl, {
    method: "PUT",
    body: blob,
    headers,
  });

  if (!putResponse.ok) {
    const errorText = await putResponse.text().catch(() => "");
    throw new Error(
      `Cloudflare R2 upload rejected with status ${putResponse.status}: ${errorText.slice(0, 100)}`
    );
  }
}

/**
 * Calls confirm-upload Edge Function to insert the file record into user_files.
 */
export async function confirmUpload(
  r2Key: string,
  fileName: string,
  fileSizeBytes: number,
  fileType: string
): Promise<UserFile> {
  const { data, error } = await supabase.functions.invoke("confirm-upload", {
    body: { r2Key, fileName, fileSizeBytes, fileType },
  });

  if (error) {
    throw new Error(error.message || "Failed to confirm file upload");
  }

  const res = data as ConfirmUploadResponse;
  if (!res.success && res.reason) {
    throw new Error(res.reason);
  }

  const file = res.file ?? (data as any);
  if (!file || !file.id) {
    throw new Error("Invalid response from server when confirming upload");
  }

  return {
    id: file.id,
    user_id: file.user_id,
    r2_key: file.r2_key,
    file_name: file.file_name,
    file_size_bytes: Number(file.file_size_bytes) || 0,
    file_type: file.file_type || "application/octet-stream",
    created_at: file.created_at,
  };
}

/**
 * Calls delete-file Edge Function to delete the file from R2 and the database.
 */
export async function deleteFile(fileId: string): Promise<DeleteFileResponse> {
  const { data, error } = await supabase.functions.invoke("delete-file", {
    body: { fileId },
  });

  if (error) {
    return {
      success: false,
      reason: error.message || "Failed to delete file",
    };
  }

  return data as DeleteFileResponse;
}
