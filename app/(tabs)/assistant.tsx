import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  SendHorizontal,
  Paperclip,
  Sparkles,
  Bot,
  MoreVertical,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

type Message = {
  id: string;
  sender: "user" | "assistant";
  text: string;
  time: string;
};

const SUGGESTED_PROMPTS = [
  "Summarize today's feed 📰",
  "Explain quantum computing ⚛️",
  "Quiz me on computer science 💻",
];

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "assistant",
      text: "Hello! I'm your Alphadex AI Assistant. Ask me anything about the topics in your feed, or request a summary. 🎓",
      time: "12:00 PM",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const formatTime = () => {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleSend = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: textToSend,
      time: formatTime(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    // Scroll to bottom
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    // Simulated response
    setTimeout(() => {
      let reply = "";
      if (textToSend.includes("Summarize")) {
        reply = "Sure! Today's top articles cover Linear Algebra in Neural Networks and Veritasium's video on quantum physics. Would you like me to generate a 3-bullet summary of either?";
      } else if (textToSend.includes("quantum")) {
        reply = "Quantum computing uses superposition and entanglement of qubits to solve extremely complex calculations much faster than classical computers. ⚛️";
      } else if (textToSend.includes("Quiz")) {
        reply = "Let's do it! Here is question 1: What does 'CPU' stand for? (Reply with your answer)";
      } else {
        reply = "That's a great question! In Phase 2, I'll use Gemini & Groq to answer all your learning queries live. For now, try clicking one of the suggested prompts above! 🚀";
      }

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: reply,
        time: formatTime(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);

      // Scroll to bottom
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }, 1500);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={["top"]}>
      {/* Header */}
      <View className="h-14 bg-white border-b border-[#E8E8E8] px-6 flex-row items-center justify-between shadow-sm shadow-gray-100/50">
        <View className="flex-row items-center gap-2">
          <View className="w-8 h-8 rounded-full bg-[#FFF5F0] items-center justify-center">
            <Bot size={18} color="#FF6B35" strokeWidth={1.5} />
          </View>
          <View>
            <Text className="text-sm font-bold text-[#1A1A1A]">Alphadex AI</Text>
            <Text className="text-[10px] text-[#10B981] font-semibold">Online</Text>
          </View>
        </View>
        <Pressable onPress={() => Alert.alert("Settings", "AI preferences and voice mode settings (stub).")}>
          <MoreVertical size={20} color="#6B7280" strokeWidth={1.5} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-6 pt-4"
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => {
            const isUser = msg.sender === "user";
            return (
              <View
                key={msg.id}
                className={`mb-4 max-w-[80%] ${isUser ? "self-end" : "self-start"}`}
              >
                <View
                  className={`px-4 py-3 rounded-[24px] ${
                    isUser
                      ? "bg-primary rounded-br-sm"
                      : "bg-white rounded-bl-sm border border-[#E8E8E8] shadow-sm shadow-gray-200/50"
                  }`}
                >
                  <Text className={isUser ? "text-white text-sm" : "text-[#1A1A1A] text-sm"}>
                    {msg.text}
                  </Text>
                </View>
                <Text
                  className={`text-[10px] text-gray-400 mt-1 ${
                    isUser ? "text-right mr-1" : "text-left ml-1"
                  }`}
                >
                  {msg.time}
                </Text>
              </View>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <View className="mb-4 max-w-[80%] self-start">
              <View className="px-4 py-3 bg-white rounded-[24px] rounded-bl-sm border border-[#E8E8E8] shadow-sm shadow-gray-200/50 flex-row gap-1.5 items-center">
                <View className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                <View className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ marginHorizontal: 1 }} />
                <View className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Suggested Prompts List */}
        {messages.length === 1 && !isTyping && (
          <View className="pb-3 px-6">
            <Text className="text-xs text-gray-400 font-semibold mb-2 uppercase tracking-wider">
              Suggested Prompts
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <Pressable
                  key={i}
                  onPress={() => handleSend(prompt)}
                  className="bg-[#FFF5F0] border border-[#FF6B35]/20 rounded-full px-4 py-2 mr-2"
                >
                  <Text className="text-xs font-semibold text-[#FF6B35]">{prompt}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Input Bar */}
        <View className="bg-white border-t border-[#E8E8E8] px-4 py-3.5 flex-row items-center gap-3">
          <Pressable
            onPress={() => Alert.alert("Attachment", "File uploads coming soon.")}
            className="w-10 h-10 rounded-full bg-[#F5F5F5] items-center justify-center border border-[#E8E8E8]"
          >
            <Paperclip size={18} color="#6B7280" strokeWidth={1.5} />
          </Pressable>

          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask Alphadex AI..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 bg-[#F5F5F5] rounded-full px-4 py-2.5 text-sm text-[#1A1A1A] border border-[#E8E8E8]"
          />

          <LinearGradient
            colors={["#FF6B35", "#F72C25"]}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
            style={{ borderRadius: 9999 }}
          >
            <Pressable
              onPress={() => handleSend(inputText)}
              className="w-10 h-10 items-center justify-center"
            >
              <SendHorizontal size={18} color="#FFFFFF" strokeWidth={1.5} />
            </Pressable>
          </LinearGradient>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
