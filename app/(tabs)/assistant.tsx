import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  Keyboard,
  Pressable,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
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
import { useTutorChat } from "../../src/features/assistant/hooks";
import type { TutorMessage } from "../../src/features/assistant/types";
import { AuroraBackground } from "../../src/components/ui/AuroraBackground";
import { AnimatedPressable } from "../../src/components/animations/AnimatedPressable";
import Markdown from "react-native-markdown-display";

const SUGGESTED_PROMPTS = [
  "Summarize today's feed 📰",
  "Explain quantum computing ⚛️",
  "Quiz me on computer science 💻",
  "Recommend what to study next 🎯",
];

const markdownStyles = StyleSheet.create({
  body: { color: "#1A1A1A", fontSize: 15, lineHeight: 22 },
  heading1: { fontSize: 19, fontWeight: "700", color: "#FF6B35", marginTop: 8, marginBottom: 4 },
  heading2: { fontSize: 17, fontWeight: "700", color: "#1A1A1A", marginTop: 8, marginBottom: 4 },
  strong: { fontWeight: "700", color: "#1A1A1A" },
  bullet_list: { marginVertical: 4 },
  ordered_list: { marginVertical: 4 },
  list_item: { marginBottom: 4 },
  code_inline: { backgroundColor: "#F5F5F5", padding: 4, borderRadius: 4, fontFamily: "Courier New" },
  code_block: { backgroundColor: "#F5F5F5", padding: 10, borderRadius: 8, fontFamily: "Courier New" },
  paragraph: { marginTop: 0, marginBottom: 8 },
});

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
  const insets = useSafeAreaInsets();
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
        className={`mb-4 flex-row ${isUser ? "items-end justify-end" : "items-start justify-start"
          } gap-2 px-4`}
      >
        {!isUser && (
          <View className="w-7 h-7 rounded-full bg-[#181824] border border-white/20 items-center justify-center mt-1">
            <Bot size={14} color="#FFFFFF" strokeWidth={1.8} />
          </View>
        )}

        <View className={isUser ? "max-w-[80%] items-end" : "flex-1 items-start"}>
          {!isUser && (
            <Text className="text-[10px] font-mono font-medium text-[#71717A] mb-1 ml-1 uppercase tracking-wider">
              ALPHADEX // AI TUTOR
            </Text>
          )}

          <View
            className={`px-4 py-3 rounded-2xl ${isUser
                ? "bg-white rounded-br-xs shadow-md shadow-white/10"
                : "w-full bg-white rounded-bl-xs border border-[#E8E8E8] shadow-sm"
              }`}
          >
            {isUser ? (
              <Text className="text-sm leading-5 text-black font-medium">
                {item.content}
              </Text>
            ) : (
              <Markdown style={markdownStyles}>{item.content}</Markdown>
            )}
          </View>

          <Text
            className={`text-[10px] text-[#52525B] mt-1 font-mono ${isUser ? "mr-1 text-right" : "ml-1 text-left"
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
      <View className="mb-4 flex-row items-start gap-2 px-4 justify-start">
        <View className="w-7 h-7 rounded-full bg-[#181824] border border-white/20 items-center justify-center mt-1">
          <Bot size={14} color="#FFFFFF" strokeWidth={1.8} />
        </View>
        <View className="flex-1 items-start">
          <Text className="text-[10px] font-mono font-medium text-[#71717A] mb-1 ml-1 uppercase tracking-wider">
            ALPHADEX // AI TUTOR
          </Text>
          <View className="px-4 py-2.5 bg-white rounded-2xl rounded-bl-xs border border-[#E8E8E8] flex-row gap-2 items-center shadow-sm">
            <ActivityIndicator size="small" color="#FF6B35" />
            <Text className="text-xs text-[#71717A] font-mono">
              Computing response...
            </Text>
          </View>
        </View>
      </View>
    );
  }, [isSending]);

  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, () => setIsKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setIsKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const bottomInset = insets.bottom > 0 ? insets.bottom : 8;
  const composerBottomPadding = isKeyboardVisible ? 8 : bottomInset + 54;

  return (
    <AuroraBackground>
      <SafeAreaView className="flex-1" edges={["top"]}>
        {/* Swiss Minimalist Header */}
        <View className="h-14 border-b border-white/10 px-5 flex-row items-center justify-between bg-black/40 backdrop-blur-md">
          <View className="flex-row items-center gap-2.5">
            <View className="w-7 h-7 rounded-full bg-white/10 border border-white/20 items-center justify-center">
              <Sparkles size={14} color="#FFFFFF" strokeWidth={2} />
            </View>
            <View>
              <View className="flex-row items-center gap-1.5">
                <Text className="text-sm font-bold text-white tracking-wide">
                  AI Study Guide
                </Text>
                <Text className="text-[10px] font-mono text-[#52525B]">02</Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <View className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                <Text className="text-[10px] text-emerald-400 font-mono font-semibold uppercase tracking-wider">
                  Live · Context-Aware
                </Text>
              </View>
            </View>
          </View>

          <AnimatedPressable
            onPress={refresh}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 items-center justify-center active:bg-white/15"
            hitSlop={8}
          >
            <RefreshCw size={14} color="#A1A1AA" strokeWidth={1.8} />
          </AnimatedPressable>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1"
        >
          {/* Main Content Area */}
          {isLoading && messages.length === 0 ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text className="text-[#71717A] text-xs font-mono mt-3">
                Connecting to tutor engine...
              </Text>
            </View>
          ) : messages.length === 0 ? (
            <View className="flex-1 items-center justify-center px-6">
              <View className="w-14 h-14 rounded-2xl bg-[#0E0E14]/80 border border-white/15 items-center justify-center mb-4 shadow-lg">
                <Sparkles size={24} color="#FFFFFF" strokeWidth={1.8} />
              </View>
              <Text className="text-base font-bold text-white text-center tracking-tight">
                Ask anything about your study stream
              </Text>
              <Text className="text-xs text-[#71717A] text-center mt-1.5 max-w-[280px] leading-relaxed">
                Trained on technical transcripts and your curated interests.
              </Text>

              {/* Swiss Quick Prompt Starters */}
              <View className="mt-6 w-full max-w-[340px] gap-2">
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <AnimatedPressable
                    key={i}
                    onPress={() => handleSend(prompt)}
                    className="bg-[#0E0E14]/80 border border-white/10 rounded-xl px-4 py-2.5 flex-row items-center justify-between active:bg-white/10"
                  >
                    <Text className="text-xs font-medium text-[#E4E4E7]">
                      {prompt}
                    </Text>
                    <SendHorizontal size={13} color="#FFFFFF" strokeWidth={1.8} />
                  </AnimatedPressable>
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

          {/* Error Banner with Retry */}
          {error && (
            <View className="mx-4 mb-2 p-3 bg-[#1F1212]/90 border border-red-500/30 rounded-xl flex-row items-center justify-between">
              <View className="flex-row items-center gap-2 flex-1 mr-2">
                <AlertCircle size={15} color="#F87171" strokeWidth={1.8} />
                <Text className="text-xs text-red-300 flex-1" numberOfLines={2}>
                  {error}
                </Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <AnimatedPressable
                  onPress={retry}
                  disabled={isSending}
                  className="bg-[#2B1717] border border-red-500/30 px-2.5 py-1 rounded-md flex-row items-center gap-1"
                >
                  <RotateCw size={11} color="#F87171" />
                  <Text className="text-[11px] font-semibold text-red-300">
                    Retry
                  </Text>
                </AnimatedPressable>
                <AnimatedPressable
                  onPress={clearError}
                  className="p-1 rounded-md active:bg-white/10"
                  hitSlop={8}
                >
                  <X size={14} color="#71717A" />
                </AnimatedPressable>
              </View>
            </View>
          )}

          {/* Glassmorphic Input Composer */}
          <View
            style={{ paddingBottom: composerBottomPadding }}
            className="border-t border-white/10 bg-black/60 backdrop-blur-md px-4 pt-3 flex-row items-center gap-2.5"
          >
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask anything or request a summary..."
              placeholderTextColor="#71717A"
              returnKeyType="send"
              onSubmitEditing={() => handleSend()}
              editable={!isSending}
              className="flex-1 bg-[#12121A] rounded-full px-4 py-2.5 text-sm text-[#F5F5F7] border border-white/15"
            />

            <Pressable
              onPress={() => handleSend()}
              disabled={!inputText.trim() || isSending}
              className={`w-9 h-9 rounded-full items-center justify-center ${inputText.trim() && !isSending
                  ? "bg-white shadow-md shadow-white/20 active:opacity-75"
                  : "bg-[#181820] opacity-50"
                }`}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="#000000" />
              ) : (
                <SendHorizontal
                  size={16}
                  color={inputText.trim() ? "#000000" : "#71717A"}
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
