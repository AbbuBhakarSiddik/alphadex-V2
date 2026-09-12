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
import { SafeAreaView } from "react-native-safe-area-context";
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
import { LinearGradient } from "expo-linear-gradient";
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
            ? "bg-white/20 border-white/30"
            : "bg-[#FFF5F0] border-[#FF6B35]/20"
        }`}
      >
        <View
          className={`w-10 h-10 rounded-lg items-center justify-center ${
            isMe ? "bg-white/30" : "bg-[#FF6B35]/10"
          }`}
        >
          {isLoadingUrl ? (
            <ActivityIndicator
              size="small"
              color={isMe ? "#FFFFFF" : "#FF6B35"}
            />
          ) : (
            <FileText
              size={20}
              color={isMe ? "#FFFFFF" : "#FF6B35"}
              strokeWidth={1.5}
            />
          )}
        </View>
        <View className="flex-1">
          <Text
            className={`text-xs font-semibold ${
              isMe ? "text-white" : "text-[#1A1A1A]"
            }`}
            numberOfLines={1}
          >
            PDF Document
          </Text>
          <Text
            className={`text-[10px] ${
              isMe ? "text-white/80" : "text-gray-500"
            }`}
          >
            Tap to view document
          </Text>
        </View>
        <ExternalLink
          size={16}
          color={isMe ? "#FFFFFF" : "#9CA3AF"}
          strokeWidth={1.5}
        />
      </Pressable>
    );
  }

  return null;
}

export default function GlobalChat() {
  const { session } = useAuth();
  const currentUserId = session?.user?.id;

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
          <View className="w-8 h-8 rounded-full bg-[#FFF5F0] border border-[#FF6B35]/20 items-center justify-center mb-1">
            {item.sender_avatar_url ? (
              <Image
                source={{ uri: item.sender_avatar_url }}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <Text className="text-xs font-bold text-[#FF6B35]">{initial}</Text>
            )}
          </View>
        )}

        <View className={`max-w-[78%] ${isMe ? "items-end" : "items-start"}`}>
          {!isMe && (
            <Text className="text-[11px] font-medium text-gray-500 mb-1 ml-1">
              {item.sender_name || "Anonymous"}
            </Text>
          )}

          <View
            className={`px-4 py-3 rounded-2xl ${
              isMe
                ? "bg-primary rounded-br-xs"
                : "bg-white rounded-bl-xs border border-[#E8E8E8] shadow-sm shadow-gray-200/50"
            }`}
          >
            {item.text ? (
              <Text
                className={`text-sm leading-5 ${
                  isMe ? "text-white" : "text-[#1A1A1A]"
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
            className={`text-[10px] text-gray-400 mt-1 ${
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
    <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={["top"]}>
      {/* Header */}
      <View className="h-14 bg-white border-b border-[#E8E8E8] px-6 flex-row items-center justify-between shadow-sm shadow-gray-100/50">
        <View className="flex-row items-center gap-2.5">
          <View className="w-8 h-8 rounded-full bg-[#FFF5F0] items-center justify-center">
            <MessageCircle size={18} color="#FF6B35" strokeWidth={1.5} />
          </View>
          <View>
            <Text className="text-sm font-bold text-[#1A1A1A]">Global Chat</Text>
            <View className="flex-row items-center gap-1.5">
              <View className="w-2 h-2 rounded-full bg-[#10B981]" />
              <Text className="text-[10px] text-[#10B981] font-semibold">
                AI Moderated · Live
              </Text>
            </View>
          </View>
        </View>

        <Pressable
          onPress={refresh}
          className="w-9 h-9 rounded-full bg-[#F5F5F5] items-center justify-center"
        >
          <RefreshCw size={16} color="#6B7280" strokeWidth={1.5} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        {/* Messages List */}
        {isLoading && messages.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#FF6B35" />
            <Text className="text-gray-500 text-sm mt-3">Loading messages...</Text>
          </View>
        ) : messages.length === 0 ? (
          <View className="flex-1 items-center justify-center px-8">
            <View className="w-16 h-16 rounded-full bg-[#FFF5F0] items-center justify-center mb-4">
              <MessageCircle size={32} color="#FF6B35" strokeWidth={1.5} />
            </View>
            <Text className="text-lg font-bold text-[#1A1A1A] text-center">
              Welcome to Global Chat! 🎓
            </Text>
            <Text className="text-sm text-gray-500 text-center mt-1">
              Connect with fellow learners worldwide. All messages and attachments are automatically verified and moderated by Gemini AI.
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
          <View className="bg-white border-t border-[#E8E8E8] px-4 py-2.5 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2 flex-1 mr-2">
              {selectedFile.type === "image" ? (
                <ImageIcon size={18} color="#FF6B35" strokeWidth={1.5} />
              ) : (
                <FileText size={18} color="#FF6B35" strokeWidth={1.5} />
              )}
              <Text className="text-xs font-semibold text-[#1A1A1A] flex-1" numberOfLines={1}>
                {selectedFile.name}
              </Text>
            </View>
            <Pressable
              onPress={() => setSelectedFile(null)}
              className="px-2 py-1 bg-gray-100 rounded-md"
            >
              <Text className="text-xs text-gray-600 font-medium">Remove</Text>
            </Pressable>
          </View>
        )}

        {/* Composer */}
        <View className="bg-white border-t border-[#E8E8E8] px-4 py-3 flex-row items-center gap-2">
          {/* Image Picker Button */}
          <Pressable
            onPress={handlePickImage}
            disabled={isSending}
            className="w-10 h-10 rounded-full bg-[#F5F5F5] items-center justify-center border border-[#E8E8E8]"
          >
            <ImageIcon size={18} color="#6B7280" strokeWidth={1.5} />
          </Pressable>

          {/* PDF Document Picker Button */}
          <Pressable
            onPress={handlePickDocument}
            disabled={isSending}
            className="w-10 h-10 rounded-full bg-[#F5F5F5] items-center justify-center border border-[#E8E8E8]"
          >
            <FileText size={18} color="#6B7280" strokeWidth={1.5} />
          </Pressable>

          {/* Text Input */}
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder={
              selectedFile ? "Add an optional caption..." : "Type a message..."
            }
            placeholderTextColor="#9CA3AF"
            className="flex-1 bg-[#F5F5F5] rounded-full px-4 py-2.5 text-sm text-[#1A1A1A] border border-[#E8E8E8]"
            editable={!isSending}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />

          {/* Send Button */}
          <LinearGradient
            colors={
              isSending || (!inputText.trim() && !selectedFile)
                ? ["#FFB899", "#FA9995"]
                : ["#FF6B35", "#F72C25"]
            }
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
            style={{ borderRadius: 9999 }}
          >
            <Pressable
              onPress={handleSend}
              disabled={isSending || (!inputText.trim() && !selectedFile)}
              className="w-10 h-10 items-center justify-center"
            >
              {isSending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <SendHorizontal size={18} color="#FFFFFF" strokeWidth={1.5} />
              )}
            </Pressable>
          </LinearGradient>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
