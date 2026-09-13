import { useState, useEffect, useCallback, useMemo } from "react";
import type { UserFile } from "./types";
import { fetchFiles, getUploadUrl, uploadToR2, confirmUpload, deleteFile } from "./api";

export function useStorage() {
  const [files, setFiles] = useState<UserFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadFiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchFiles();
      setFiles(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load files");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const totalUsedBytes = useMemo(() => {
    return files.reduce((acc, f) => acc + (f.file_size_bytes || 0), 0);
  }, [files]);

  const upload = useCallback(
    async (
      fileUri: string,
      fileName: string,
      fileSizeBytes: number,
      fileType: string
    ): Promise<UserFile> => {
      setIsUploading(true);
      setUploadError(null);

      try {
        // 1. Get presigned R2 PUT URL
        const presignResult = await getUploadUrl(fileName, fileSizeBytes, fileType);
        if (!presignResult.success || !presignResult.uploadUrl || !presignResult.r2Key) {
          const errMsg = presignResult.reason || "Storage quota exceeded or upload request failed";
          setUploadError(errMsg);
          throw new Error(errMsg);
        }

        // 2. Upload directly to R2
        await uploadToR2(presignResult.uploadUrl, fileUri, fileType);

        // 3. Confirm upload in database
        const newFile = await confirmUpload(
          presignResult.r2Key,
          fileName,
          fileSizeBytes,
          fileType
        );

        setFiles((prev) => [newFile, ...prev]);
        return newFile;
      } catch (err: any) {
        const msg = err?.message || "Upload failed";
        setUploadError(msg);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  const remove = useCallback(async (fileId: string) => {
    const previous = files;
    // Optimistic removal
    setFiles((prev) => prev.filter((f) => f.id !== fileId));

    try {
      const result = await deleteFile(fileId);
      if (!result.success) {
        throw new Error(result.reason || "Failed to delete file");
      }
    } catch (err: any) {
      // Revert if delete failed
      setFiles(previous);
      throw err;
    }
  }, [files]);

  return {
    files,
    totalUsedBytes,
    isLoading,
    isUploading,
    uploadError,
    error,
    upload,
    remove,
    refresh: loadFiles,
  };
}
