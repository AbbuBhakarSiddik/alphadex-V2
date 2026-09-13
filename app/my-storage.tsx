import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import {
  ArrowLeft,
  UploadCloud,
  Trash2,
  HardDrive,
  FileText,
  FileCode,
  Image as ImageIcon,
  Film,
  FileSpreadsheet,
  File,
  AlertCircle,
} from "lucide-react-native";
import { useStorage } from "../src/features/storage/hooks";
import { Button } from "../src/components/ui/Button";

const TOTAL_QUOTA_BYTES = 5 * 1024 * 1024 * 1024; // 5 GB

function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 B";
  const k = 1024;
  if (bytes < k) return `${bytes} B`;
  if (bytes < k * k) return `${(bytes / k).toFixed(1)} KB`;
  if (bytes < k * k * k) return `${(bytes / (k * k)).toFixed(1)} MB`;
  return `${(bytes / (k * k * k)).toFixed(2)} GB`;
}

function getFileIcon(fileName: string, mimeType: string) {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  if (mimeType.startsWith("image/") || ["png", "jpg", "jpeg", "webp", "gif"].includes(ext)) {
    return <ImageIcon size={20} color="#FF6B35" strokeWidth={1.8} />;
  }
  if (mimeType.startsWith("video/") || ["mp4", "mov", "mkv", "webm"].includes(ext)) {
    return <Film size={20} color="#A78BFA" strokeWidth={1.8} />;
  }
  if (["ts", "tsx", "js", "jsx", "py", "json", "html", "css", "sql"].includes(ext)) {
    return <FileCode size={20} color="#38BDF8" strokeWidth={1.8} />;
  }
  if (["csv", "xlsx", "xls"].includes(ext)) {
    return <FileSpreadsheet size={20} color="#34D399" strokeWidth={1.8} />;
  }
  if (["pdf", "doc", "docx", "txt", "md"].includes(ext)) {
    return <FileText size={20} color="#FBBF24" strokeWidth={1.8} />;
  }
  return <File size={20} color="#94A3B8" strokeWidth={1.8} />;
}

export default function MyStorage() {
  const router = useRouter();
  const {
    files,
    totalUsedBytes,
    isLoading,
    isUploading,
    uploadError,
    upload,
    remove,
  } = useStorage();

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const usagePercent = Math.min(
    100,
    Math.max(0, (totalUsedBytes / TOTAL_QUOTA_BYTES) * 100)
  );

  const handlePickAndUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      const fileName = asset.name;
      const fileSizeBytes = asset.size ?? 0;
      const fileType = asset.mimeType || "application/octet-stream";

      if (fileSizeBytes <= 0) {
        Alert.alert("Invalid File", "Selected file is empty.");
        return;
      }

      await upload(asset.uri, fileName, fileSizeBytes, fileType);
      Alert.alert("Success", `Uploaded "${fileName}" to Cloudflare R2.`);
    } catch (err: any) {
      const msg = err?.message || "Failed to upload file.";
      Alert.alert("Upload Failed", msg);
    }
  };

  const handleDelete = (fileId: string, fileName: string) => {
    Alert.alert(
      "Delete File",
      `Are you sure you want to permanently delete "${fileName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeletingId(fileId);
            try {
              await remove(fileId);
            } catch (err: any) {
              Alert.alert("Error", err?.message || "Failed to delete file.");
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-black" edges={["top", "bottom"]}>
      {/* Header */}
      <View className="px-5 py-3.5 flex-row items-center justify-between border-b border-[#1A1A1A] bg-black">
        <View className="flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            className="w-9 h-9 bg-[#141414] border border-[#222222] rounded-full items-center justify-center mr-3 active:bg-[#222222]"
          >
            <ArrowLeft size={18} color="#FFFFFF" strokeWidth={1.8} />
          </Pressable>
          <View>
            <Text className="text-lg font-bold text-white tracking-tight">Cloud Storage</Text>
            <Text className="text-[11px] font-mono text-[#71717A]">Cloudflare R2 • 5 GB Quota</Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 18 }}
      >
        {/* Storage Usage Card */}
        <View className="bg-[#0F0F12] border border-[#222228] rounded-2xl p-5 mb-5 shadow-lg">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center gap-2">
              <HardDrive size={18} color="#FF6B35" strokeWidth={2} />
              <Text className="text-sm font-bold text-white tracking-tight">Storage Usage</Text>
            </View>
            <Text className="text-xs font-mono font-semibold text-white">
              {formatBytes(totalUsedBytes)} of 5.0 GB
            </Text>
          </View>

          {/* Progress bar matching manage-interests style */}
          <View className="w-full h-2.5 bg-[#1C1C24] rounded-full overflow-hidden my-2.5">
            <View
              className="h-full rounded-full"
              style={{
                width: `${Math.max(usagePercent, 2)}%`,
                backgroundColor:
                  usagePercent > 90
                    ? "#EF4444"
                    : usagePercent > 70
                    ? "#F59E0B"
                    : "#FF6B35",
              }}
            />
          </View>

          <View className="flex-row items-center justify-between mt-1">
            <Text className="text-[11px] font-mono text-[#71717A]">
              {usagePercent.toFixed(1)}% used
            </Text>
            <Text className="text-[11px] font-mono text-[#71717A]">
              {formatBytes(Math.max(0, TOTAL_QUOTA_BYTES - totalUsedBytes))} free
            </Text>
          </View>
        </View>

        {/* Quota Error Banner if surfaced */}
        {uploadError && (
          <View className="bg-red-950/40 border border-red-800/60 rounded-xl p-3.5 mb-5 flex-row items-center gap-3">
            <AlertCircle size={20} color="#F87171" strokeWidth={2} />
            <Text className="text-xs text-red-200 flex-1 leading-snug font-medium">
              {uploadError}
            </Text>
          </View>
        )}

        {/* Upload Button */}
        <View className="mb-6">
          <Button
            label={isUploading ? "Uploading to R2..." : "Upload File"}
            onPress={handlePickAndUpload}
            isLoading={isUploading}
            variant="primary"
          />
          <Text className="text-[#71717A] text-[11px] text-center mt-2">
            Upload PDFs, study notes, datasets, or code files up to 5 GB.
          </Text>
        </View>

        {/* File List Header */}
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-[11px] font-mono font-bold text-[#71717A] uppercase tracking-wider">
            YOUR STORED FILES ({files.length})
          </Text>
        </View>

        {/* Loading State */}
        {isLoading ? (
          <View className="py-12 items-center justify-center">
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text className="text-xs text-[#71717A] mt-3 font-mono">Loading storage items...</Text>
          </View>
        ) : files.length === 0 ? (
          /* Empty State */
          <View className="bg-[#0D0D10] border border-dashed border-[#222228] rounded-2xl p-8 items-center justify-center my-4">
            <View className="w-12 h-12 rounded-full bg-[#181820] items-center justify-center mb-3">
              <UploadCloud size={24} color="#71717A" strokeWidth={1.8} />
            </View>
            <Text className="text-sm font-semibold text-white mb-1">No files uploaded yet</Text>
            <Text className="text-xs text-[#71717A] text-center leading-relaxed">
              Tap "Upload File" above to upload study materials, cheat sheets, or datasets to your Cloudflare R2 storage.
            </Text>
          </View>
        ) : (
          /* List of files */
          <View className="gap-2.5">
            {files.map((file) => {
              const isDeleting = deletingId === file.id;
              const dateStr = file.created_at
                ? new Date(file.created_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "";

              return (
                <View
                  key={file.id}
                  className="bg-[#0F0F12] border border-[#222228] rounded-xl p-3.5 flex-row items-center justify-between active:border-[#333340]"
                >
                  <View className="flex-row items-center flex-1 mr-3">
                    <View className="w-10 h-10 rounded-lg bg-[#181822] items-center justify-center mr-3 border border-white/5">
                      {getFileIcon(file.file_name, file.file_type)}
                    </View>
                    <View className="flex-1">
                      <Text
                        className="text-sm font-semibold text-white tracking-tight"
                        numberOfLines={1}
                      >
                        {file.file_name}
                      </Text>
                      <View className="flex-row items-center gap-2 mt-1">
                        <Text className="text-[11px] font-mono text-[#A1A1AA]">
                          {formatBytes(file.file_size_bytes)}
                        </Text>
                        {dateStr ? (
                          <>
                            <Text className="text-[10px] text-[#52525B]">•</Text>
                            <Text className="text-[11px] font-mono text-[#71717A]">
                              {dateStr}
                            </Text>
                          </>
                        ) : null}
                      </View>
                    </View>
                  </View>

                  <Pressable
                    onPress={() => handleDelete(file.id, file.file_name)}
                    disabled={isDeleting}
                    className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 items-center justify-center active:bg-red-500/20 active:border-red-500/30"
                    hitSlop={8}
                  >
                    {isDeleting ? (
                      <ActivityIndicator size="small" color="#EF4444" />
                    ) : (
                      <Trash2 size={16} color="#A1A1AA" strokeWidth={1.8} />
                    )}
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
