import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import {
  SendHorizontal,
  Bot,
  Sparkles,
  RefreshCw,
  AlertCircle,
  RotateCw,
  X,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTutorChat } from "../../src/features/assistant/hooks";
import type { TutorMessage } from "../../src/features/assistant/types";

const SUGGESTED_PROMPTS = [
  "Summarize today's feed 📰",
  "Explain quantum computing ⚛️",
  "Quiz me on computer science 💻",
  "Recommend what to study next 🎯",
];

function formatTime(isoString?: string): string {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export default function AssistantScreen() {
  const {
    messages,
    isLoading,
    isSending,
    error,
    send,
    retry,
    clearError,
    refresh,
  } = useTutorChat();

  const [inputText, setInputText] = useState("");

  const handleSend = useCallback(
    (textToSend?: string) => {
      const message = (textToSend ?? inputText).trim();
      if (!message || isSending) return;
      setInputText("");
      send(message);
    },
    [inputText, isSending, send]
  );

  const renderItem = useCallback(({ item }: { item: TutorMessage }) => {
    const isUser = item.role === "user";

    return (
      <View
        className={`mb-4 flex-row items-end gap-2 px-4 ${
          isUser ? "justify-end" : "justify-start"
        }`}
      >
        {!isUser && (
          <View className="w-8 h-8 rounded-full bg-[#FFF5F0] border border-[#FF6B35]/20 items-center justify-center mb-1">
            <Bot size={18} color="#FF6B35" strokeWidth={1.5} />
          </View>
        )}

        <View className={`max-w-[78%] ${isUser ? "items-end" : "items-start"}`}>
          {!isUser && (
            <Text className="text-[11px] font-medium text-gray-500 mb-1 ml-1">
              Alphadex Tutor
            </Text>
          )}

          <View
            className={`px-4 py-3 rounded-2xl ${
              isUser
                ? "bg-[#FF6B35] rounded-br-xs shadow-sm shadow-[#FF6B35]/30"
                : "bg-white rounded-bl-xs border border-[#E8E8E8] shadow-sm shadow-gray-200/50"
            }`}
          >
            <Text
              className={`text-sm leading-5 ${
                isUser ? "text-white font-normal" : "text-[#1A1A1A] font-normal"
              }`}
            >
              {item.content}
            </Text>
          </View>

          <Text
            className={`text-[10px] text-gray-400 mt-1 ${
              isUser ? "mr-1 text-right" : "ml-1 text-left"
            }`}
          >
            {formatTime(item.created_at)}
          </Text>
        </View>
      </View>
    );
  }, []);

  const renderListFooter = useMemo(() => {
    if (!isSending) return null;

    return (
      <View className="mb-4 flex-row items-end gap-2 px-4 justify-start">
        <View className="w-8 h-8 rounded-full bg-[#FFF5F0] border border-[#FF6B35]/20 items-center justify-center mb-1">
          <Bot size={18} color="#FF6B35" strokeWidth={1.5} />
        </View>
        <View className="max-w-[78%] items-start">
          <Text className="text-[11px] font-medium text-gray-500 mb-1 ml-1">
            Alphadex Tutor
          </Text>
          <View className="px-4 py-3 bg-white rounded-2xl rounded-bl-xs border border-[#E8E8E8] shadow-sm shadow-gray-200/50 flex-row gap-1.5 items-center">
            <ActivityIndicator size="small" color="#FF6B35" />
            <Text className="text-xs text-gray-500 font-medium ml-1.5">
              Thinking...
            </Text>
          </View>
        </View>
      </View>
    );
  }, [isSending]);

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={["top"]}>
      {/* Header */}
      <View className="h-14 bg-white border-b border-[#E8E8E8] px-6 flex-row items-center justify-between shadow-sm shadow-gray-100/50">
        <View className="flex-row items-center gap-2.5">
          <View className="w-8 h-8 rounded-full bg-[#FFF5F0] items-center justify-center">
            <Bot size={18} color="#FF6B35" strokeWidth={1.5} />
          </View>
          <View>
            <Text className="text-sm font-bold text-[#1A1A1A]">AI Study Guide</Text>
            <View className="flex-row items-center gap-1.5">
              <View className="w-2 h-2 rounded-full bg-[#10B981]" />
              <Text className="text-[10px] text-[#10B981] font-semibold">
                Online · Context-Aware
              </Text>
            </View>
          </View>
        </View>

        <Pressable
          onPress={refresh}
          className="w-9 h-9 rounded-full bg-[#F5F5F5] items-center justify-center border border-[#E8E8E8] active:bg-gray-200"
          hitSlop={8}
        >
          <RefreshCw size={16} color="#6B7280" strokeWidth={1.5} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        {/* Main Content Area */}
        {isLoading && messages.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#FF6B35" />
            <Text className="text-gray-500 text-sm mt-3">
              Loading chat history...
            </Text>
          </View>
        ) : messages.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6">
            <View className="w-16 h-16 rounded-full bg-[#FFF5F0] border border-[#FF6B35]/20 items-center justify-center mb-4">
              <Sparkles size={32} color="#FF6B35" strokeWidth={1.5} />
            </View>
            <Text className="text-lg font-bold text-[#1A1A1A] text-center">
              Ask me anything about what you're learning
            </Text>
            <Text className="text-xs text-gray-500 text-center mt-1.5 max-w-[300px]">
              I know your favorite topics and recent activity. Ask questions, request summaries, or take quizzes.
            </Text>

            {/* Quick Prompt Starters */}
            <View className="mt-6 w-full max-w-[340px] gap-2">
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <Pressable
                  key={i}
                  onPress={() => handleSend(prompt)}
                  className="bg-white border border-[#E8E8E8] rounded-xl px-4 py-2.5 flex-row items-center justify-between active:bg-[#FFF5F0] active:border-[#FF6B35]/30 shadow-xs"
                >
                  <Text className="text-xs font-semibold text-[#1A1A1A]">
                    {prompt}
                  </Text>
                  <SendHorizontal size={14} color="#FF6B35" strokeWidth={1.5} />
                </Pressable>
              ))}
            </View>
          </View>
        ) : (
          <View className="flex-1 pt-3">
            <FlashList
              data={messages}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              maintainVisibleContentPosition={{
                startRenderingFromBottom: true,
                autoscrollToBottomThreshold: 0.1,
              }}
              ListFooterComponent={renderListFooter}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 16 }}
            />
          </View>
        )}

        {/* Error / Rejection Banner with Retry */}
        {error && (
          <View className="mx-4 mb-2 p-3 bg-red-50 border border-red-200 rounded-xl flex-row items-center justify-between shadow-xs">
            <View className="flex-row items-center gap-2 flex-1 mr-2">
              <AlertCircle size={16} color="#DC2626" strokeWidth={1.5} />
              <Text className="text-xs text-red-700 flex-1" numberOfLines={2}>
                {error}
              </Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <Pressable
                onPress={retry}
                disabled={isSending}
                className="bg-white border border-red-200 px-2.5 py-1 rounded-md flex-row items-center gap-1 active:bg-red-50"
              >
                <RotateCw size={12} color="#DC2626" />
                <Text className="text-[11px] font-semibold text-red-700">
                  Retry
                </Text>
              </Pressable>
              <Pressable
                onPress={clearError}
                className="p-1 rounded-md active:bg-red-100"
                hitSlop={8}
              >
                <X size={14} color="#6B7280" />
              </Pressable>
            </View>
          </View>
        )}

        {/* Input Composer */}
        <View className="bg-white border-t border-[#E8E8E8] px-4 py-3 flex-row items-center gap-2.5">
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask me anything about what you're learning..."
            placeholderTextColor="#9CA3AF"
            returnKeyType="send"
            onSubmitEditing={() => handleSend()}
            editable={!isSending}
            className="flex-1 bg-[#F5F5F5] rounded-full px-4 py-2.5 text-sm text-[#1A1A1A] border border-[#E8E8E8]"
          />

          <LinearGradient
            colors={
              inputText.trim() && !isSending
                ? ["#FF6B35", "#F72C25"]
                : ["#D1D5DB", "#9CA3AF"]
            }
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
            style={{ borderRadius: 9999 }}
          >
            <Pressable
              onPress={() => handleSend()}
              disabled={!inputText.trim() || isSending}
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
