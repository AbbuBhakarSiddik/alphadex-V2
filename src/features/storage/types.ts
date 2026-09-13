export interface UserFile {
  id: string;
  user_id: string;
  r2_key: string;
  file_name: string;
  file_size_bytes: number;
  file_type: string;
  created_at: string;
}

export interface GetUploadUrlResponse {
  success: boolean;
  uploadUrl?: string;
  r2Key?: string;
  reason?: string;
}

export interface ConfirmUploadResponse {
  success: boolean;
  file?: UserFile;
  reason?: string;
}

export interface DeleteFileResponse {
  success: boolean;
  reason?: string;
}
