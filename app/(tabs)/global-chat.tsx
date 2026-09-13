import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as WebBrowser from "expo-web-browser";
import {
  SendHorizontal,
  Image as ImageIcon,
  FileText,
  MessageCircle,
  ExternalLink,
  RefreshCw,
} from "lucide-react-native";
import { AuroraBackground } from "../../src/components/ui/AuroraBackground";
import { useAuth } from "../../src/features/auth/hooks";
import { useChat } from "../../src/features/chat/hooks";
import { getSignedAttachmentUrl } from "../../src/features/chat/api";
import type { ChatMessage } from "../../src/features/chat/types";

const GLOBAL_ROOM_ID = "00000000-0000-0000-0000-000000000001";

function AttachmentView({
  attachmentUrl,
  attachmentType,
  isMe,
}: {
  attachmentUrl: string;
  attachmentType: "image" | "pdf" | null;
  isMe: boolean;
}) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    if (attachmentType === "image" && attachmentUrl) {
      setIsLoadingUrl(true);
      getSignedAttachmentUrl(attachmentUrl)
        .then((url) => {
          if (isMounted) setSignedUrl(url);
        })
        .catch(() => {
          // fallback
        })
        .finally(() => {
          if (isMounted) setIsLoadingUrl(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [attachmentUrl, attachmentType]);

  const handleOpenAttachment = async () => {
    try {
      let targetUrl = signedUrl;
      if (!targetUrl) {
        setIsLoadingUrl(true);
        targetUrl = await getSignedAttachmentUrl(attachmentUrl);
        setSignedUrl(targetUrl);
      }
      if (targetUrl) {
        await WebBrowser.openBrowserAsync(targetUrl);
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to open attachment");
    } finally {
      setIsLoadingUrl(false);
    }
  };

  if (attachmentType === "image") {
    return (
      <Pressable
        onPress={handleOpenAttachment}
        className="mt-2 rounded-xl overflow-hidden bg-black/5"
      >
        {signedUrl ? (
          <Image
            source={{ uri: signedUrl }}
            className="w-56 h-40 rounded-xl"
            resizeMode="cover"
          />
        ) : (
          <View className="w-56 h-40 items-center justify-center bg-gray-100 rounded-xl">
            {isLoadingUrl ? (
              <ActivityIndicator size="small" color="#FF6B35" />
            ) : (
              <View className="items-center">
                <ImageIcon size={24} color="#9CA3AF" strokeWidth={1.5} />
                <Text className="text-xs text-gray-500 mt-1">Tap to view image</Text>
              </View>
            )}
          </View>
        )}
      </Pressable>
    );
  }

  if (attachmentType === "pdf") {
    return (
      <Pressable
        onPress={handleOpenAttachment}
        className={`mt-2 flex-row items-center gap-3 p-3 rounded-xl border ${
          isMe
            ? "bg-neutral-100 border-neutral-300"
            : "bg-[#181818] border-[#2E2E32]"
        }`}
      >
        <FileText size={16} color={isMe ? "#000000" : "#FFFFFF"} strokeWidth={1.8} />
        <View className="flex-1">
          <Text
            className={`text-xs font-semibold ${
              isMe ? "text-black" : "text-[#F5F5F7]"
            }`}
            numberOfLines={1}
          >
            PDF Attachment
          </Text>
          <Text
            className={`text-[10px] ${
              isMe ? "text-neutral-600" : "text-[#71717A]"
            }`}
          >
            Tap to view document
          </Text>
        </View>
        <ExternalLink
          size={14}
          color={isMe ? "#000000" : "#A1A1AA"}
          strokeWidth={1.8}
        />
      </Pressable>
    );
  }

  return null;
}

export default function GlobalChat() {
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const currentUserId = session?.user?.id;
  const composerBottomPadding = (insets.bottom > 0 ? insets.bottom : 8) + 54;

  const {
    messages,
    isLoading,
    isSending,
    error,
    refresh,
    sendText,
    sendAttachment,
  } = useChat(GLOBAL_ROOM_ID);

  const [inputText, setInputText] = useState("");
  const [selectedFile, setSelectedFile] = useState<{
    uri: string;
    mimeType: string;
    extension: string;
    type: "image" | "pdf";
    name: string;
  } | null>(null);

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant camera roll permissions to upload images."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const uri = asset.uri;
        const mimeType = asset.mimeType || "image/jpeg";
        const extension = asset.fileName
          ? asset.fileName.split(".").pop() || "jpg"
          : uri.split(".").pop() || "jpg";

        setSelectedFile({
          uri,
          mimeType,
          extension,
          type: "image",
          name: asset.fileName || "Image Attachment",
        });
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to pick image");
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const uri = asset.uri;
        const mimeType = asset.mimeType || "application/pdf";
        const extension = "pdf";

        setSelectedFile({
          uri,
          mimeType,
          extension,
          type: "pdf",
          name: asset.name || "PDF Document",
        });
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to pick document");
    }
  };

  const handleSend = async () => {
    if (isSending) return;

    if (selectedFile) {
      const fileToSend = selectedFile;
      const textCaption = inputText.trim();

      // Clear composer state right away
      setSelectedFile(null);
      setInputText("");

      const res = await sendAttachment(
        fileToSend.uri,
        fileToSend.mimeType,
        fileToSend.extension,
        fileToSend.type,
        textCaption || undefined
      );

      if (!res.success) {
        Alert.alert("Couldn't send", res.reason || "Content moderation rejected this upload");
      }
      return;
    }

    const textToSend = inputText.trim();
    if (!textToSend) return;

    setInputText("");
    const res = await sendText(textToSend);

    if (!res.success) {
      Alert.alert("Couldn't send", res.reason || "Content moderation rejected this message");
    }
  };

  const formatMessageTime = (isoString?: string) => {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const renderMessageBubble = ({ item }: { item: ChatMessage }) => {
    const isMe = item.user_id === currentUserId;
    const initial = (item.sender_name || "A").charAt(0).toUpperCase();

    return (
      <View
        className={`mb-4 flex-row items-end gap-2 ${
          isMe ? "justify-end" : "justify-start"
        }`}
      >
        {!isMe && (
          <View className="w-7 h-7 rounded-full bg-[#181818] border border-[#27272A] items-center justify-center mb-1">
            {item.sender_avatar_url ? (
              <Image
                source={{ uri: item.sender_avatar_url }}
                className="w-7 h-7 rounded-full"
              />
            ) : (
              <Text className="text-xs font-bold text-white">{initial}</Text>
            )}
          </View>
        )}

        <View className={`max-w-[78%] ${isMe ? "items-end" : "items-start"}`}>
          {!isMe && (
            <Text className="text-[10px] font-medium text-[#71717A] mb-1 ml-1">
              {item.sender_name || "Anonymous"}
            </Text>
          )}

          <View
            className={`px-4 py-3 rounded-2xl ${
              isMe
                ? "bg-white rounded-br-xs"
                : "bg-[#141414] rounded-bl-xs border border-[#27272A]"
            }`}
          >
            {item.text ? (
              <Text
                className={`text-sm leading-5 ${
                  isMe ? "text-black font-medium" : "text-[#F5F5F7] font-normal"
                }`}
              >
                {item.text}
              </Text>
            ) : null}

            {item.attachment_url && (
              <AttachmentView
                attachmentUrl={item.attachment_url}
                attachmentType={item.attachment_type}
                isMe={isMe}
              />
            )}
          </View>

          <Text
            className={`text-[10px] text-[#52525B] mt-1 ${
              isMe ? "mr-1 text-right" : "ml-1 text-left"
            }`}
          >
            {formatMessageTime(item.created_at)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <AuroraBackground>
      <SafeAreaView className="flex-1" edges={["top"]}>
        {/* Swiss Minimalist Header */}
        <View className="h-14 border-b border-white/10 px-5 flex-row items-center justify-between bg-black/40 backdrop-blur-md">
          <View className="flex-row items-center gap-2.5">
            <View className="w-7 h-7 rounded-full bg-white/10 border border-white/20 items-center justify-center">
              <MessageCircle size={14} color="#FFFFFF" strokeWidth={1.8} />
            </View>
            <View>
              <View className="flex-row items-center gap-1.5">
                <Text className="text-sm font-bold text-white tracking-wide">Global Chat</Text>
                <Text className="text-[10px] font-mono text-[#52525B]">04</Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <View className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                <Text className="text-[10px] text-emerald-400 font-mono font-semibold uppercase tracking-wider">
                  AI Moderated · Live
                </Text>
              </View>
            </View>
          </View>

          <Pressable
            onPress={refresh}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 items-center justify-center active:bg-white/15"
          >
            <RefreshCw size={14} color="#A1A1AA" strokeWidth={1.8} />
          </Pressable>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1"
        >
          {/* Messages List */}
          {isLoading && messages.length === 0 ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text className="text-[#71717A] text-xs font-mono mt-3">Connecting to stream...</Text>
            </View>
          ) : messages.length === 0 ? (
            <View className="flex-1 items-center justify-center px-8">
              <View className="w-14 h-14 rounded-2xl bg-[#0E0E14]/80 border border-white/15 items-center justify-center mb-4 shadow-lg">
                <MessageCircle size={26} color="#FFFFFF" strokeWidth={1.8} />
              </View>
              <Text className="text-base font-bold text-white text-center tracking-tight">
                Global Learning Stream 🎓
              </Text>
              <Text className="text-xs text-[#71717A] text-center mt-1 max-w-[280px] leading-relaxed">
                Connect with engineers & learners worldwide. Real-time Gemini moderation active.
              </Text>
            </View>
          ) : (
            <View className="flex-1 px-4 pt-4">
              <FlashList
                data={[...messages].reverse()}
                renderItem={renderMessageBubble}
                keyExtractor={(item) => item.id}
                maintainVisibleContentPosition={{
                  startRenderingFromBottom: true,
                  autoscrollToBottomThreshold: 0.1,
                }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 16 }}
              />
            </View>
          )}

          {/* Selected Attachment Banner */}
          {selectedFile && (
            <View className="bg-[#12121A] border-t border-white/10 px-4 py-2 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2 flex-1 mr-2">
                {selectedFile.type === "image" ? (
                  <ImageIcon size={16} color="#FFFFFF" strokeWidth={1.8} />
                ) : (
                  <FileText size={16} color="#FFFFFF" strokeWidth={1.8} />
                )}
                <Text className="text-xs font-semibold text-white flex-1" numberOfLines={1}>
                  {selectedFile.name}
                </Text>
              </View>
              <Pressable
                onPress={() => setSelectedFile(null)}
                className="px-2 py-1 bg-white/10 rounded-md"
              >
                <Text className="text-xs text-[#A1A1AA] font-medium">Remove</Text>
              </Pressable>
            </View>
          )}

          {/* Frosted Glass Composer with Safe Area Insets */}
          <View
            style={{ paddingBottom: composerBottomPadding }}
            className="border-t border-white/10 bg-black/60 backdrop-blur-md px-4 pt-3 flex-row items-center gap-2"
          >
            {/* Image Picker Button */}
            <Pressable
              onPress={handlePickImage}
              disabled={isSending}
              className="w-9 h-9 rounded-full bg-[#14141A] items-center justify-center border border-white/15 active:bg-white/15"
            >
              <ImageIcon size={16} color="#A1A1AA" strokeWidth={1.8} />
            </Pressable>

            {/* PDF Document Picker Button */}
            <Pressable
              onPress={handlePickDocument}
              disabled={isSending}
              className="w-9 h-9 rounded-full bg-[#14141A] items-center justify-center border border-white/15 active:bg-white/15"
            >
              <FileText size={16} color="#A1A1AA" strokeWidth={1.8} />
            </Pressable>

            {/* Text Input */}
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder={
                selectedFile ? "Add an optional caption..." : "Share insights with learners..."
              }
              placeholderTextColor="#71717A"
              className="flex-1 bg-[#12121A] rounded-full px-4 py-2.5 text-sm text-[#F5F5F7] border border-white/15"
              editable={!isSending}
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />

            {/* Send Button */}
            <Pressable
              onPress={handleSend}
              disabled={isSending || (!inputText.trim() && !selectedFile)}
              className={`w-9 h-9 rounded-full items-center justify-center ${
                (inputText.trim() || selectedFile) && !isSending
                  ? "bg-white shadow-md shadow-white/20"
                  : "bg-[#181820] opacity-50"
              }`}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="#000000" />
              ) : (
                <SendHorizontal
                  size={16}
                  color={(inputText.trim() || selectedFile) ? "#000000" : "#71717A"}
                  strokeWidth={2}
                />
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AuroraBackground>
  );
}
