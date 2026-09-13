import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Sparkles,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Trash2,
  Bot,
  User,
  X,
} from "lucide-react-native";
import { useSchedule } from "../src/features/schedule/hooks";
import { Button } from "../src/components/ui/Button";

function formatDateHeader(dateString: string): string {
  if (!dateString || dateString === "Undated") return "Undated Sessions";
  const [year, month, day] = dateString.split("-").map(Number);
  if (!year || !month || !day) return dateString;

  const targetDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const targetTime = targetDate.getTime();
  if (targetTime === today.getTime()) {
    return `Today • ${targetDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
  }
  if (targetTime === tomorrow.getTime()) {
    return `Tomorrow • ${targetDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
  }

  return targetDate.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function getTodayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function StudySchedule() {
  const router = useRouter();
  const {
    items,
    groupedByDate,
    sortedDates,
    isLoading,
    isGenerating,
    error,
    add,
    toggle,
    remove,
    generateAIPlan,
  } = useSchedule();

  // Modal form state for adding a manual session
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [scheduledDate, setScheduledDate] = useState(getTodayString());
  const [durationMinutes, setDurationMinutes] = useState("45");
  const [isSaving, setIsSaving] = useState(false);

  const handleGeneratePlan = async () => {
    try {
      await generateAIPlan(7);
      Alert.alert(
        "Study Plan Generated!",
        "Gemini proposed customized study sessions for the next 7 days based on your interests."
      );
    } catch (err: any) {
      Alert.alert("Plan Generation", err?.message || "Couldn't generate a plan, try again.");
    }
  };

  const handleAddSession = async () => {
    if (!title.trim()) {
      Alert.alert("Required", "Please enter a session title.");
      return;
    }
    if (!topic.trim()) {
      Alert.alert("Required", "Please enter a topic.");
      return;
    }

    const duration = parseInt(durationMinutes, 10) || 30;
    setIsSaving(true);
    try {
      await add(title.trim(), topic.trim(), scheduledDate.trim(), duration);
      setTitle("");
      setTopic("");
      setScheduledDate(getTodayString());
      setDurationMinutes("45");
      setIsModalOpen(false);
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to save session.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSession = (id: string, sessionTitle: string) => {
    Alert.alert("Delete Session", `Delete "${sessionTitle}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await remove(id);
          } catch (err: any) {
            Alert.alert("Error", err?.message || "Failed to delete session.");
          }
        },
      },
    ]);
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
            <Text className="text-lg font-bold text-white tracking-tight">Study Schedule</Text>
            <Text className="text-[11px] font-mono text-[#71717A]">
              Adaptive Curriculum & Sessions
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => setIsModalOpen(true)}
          className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 active:bg-white/20"
        >
          <Plus size={14} color="#FFFFFF" strokeWidth={2.5} />
          <Text className="text-xs font-bold text-white">Add</Text>
        </Pressable>
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 18 }}
      >
        {/* AI Plan Generation Banner */}
        <View className="bg-gradient-to-r from-[#181824] to-[#12121A] border border-[#2B2B3D] rounded-2xl p-4 mb-6 shadow-xl">
          <View className="flex-row items-center gap-2 mb-1.5">
            <View className="w-7 h-7 rounded-lg bg-[#FF6B35]/20 items-center justify-center border border-[#FF6B35]/40">
              <Sparkles size={15} color="#FF6B35" strokeWidth={2} />
            </View>
            <Text className="text-sm font-bold text-white tracking-tight">
              AI Study Plan Assistant
            </Text>
          </View>

          <Text className="text-xs text-[#A1A1AA] mb-4 leading-relaxed">
            Generate an intelligent 7-day study curriculum synthesized from your saved topics and recent activity.
          </Text>

          <Button
            label={isGenerating ? "Generating 7-Day Plan..." : "Generate AI Study Plan (7 Days)"}
            onPress={handleGeneratePlan}
            isLoading={isGenerating}
            variant="primary"
          />
        </View>

        {error && (
          <View className="bg-red-950/40 border border-red-800/60 rounded-xl p-3 mb-5">
            <Text className="text-xs text-red-300">{error}</Text>
          </View>
        )}

        {/* Sessions List Header */}
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-[11px] font-mono font-bold text-[#71717A] uppercase tracking-wider">
            UPCOMING SESSIONS ({items.length})
          </Text>
        </View>

        {isLoading ? (
          <View className="py-12 items-center justify-center">
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text className="text-xs text-[#71717A] mt-3 font-mono">Loading your curriculum...</Text>
          </View>
        ) : items.length === 0 ? (
          <View className="bg-[#0D0D10] border border-dashed border-[#222228] rounded-2xl p-8 items-center justify-center my-4">
            <View className="w-12 h-12 rounded-full bg-[#181820] items-center justify-center mb-3">
              <Calendar size={24} color="#71717A" strokeWidth={1.8} />
            </View>
            <Text className="text-sm font-semibold text-white mb-1">No sessions scheduled</Text>
            <Text className="text-xs text-[#71717A] text-center leading-relaxed mb-4">
              Tap "Generate AI Study Plan" above to create a personalized schedule or manually add your own study sessions.
            </Text>
            <Button
              label="Add Manual Session"
              onPress={() => setIsModalOpen(true)}
              variant="secondary"
            />
          </View>
        ) : (
          /* Grouped by Date */
          <View className="gap-6">
            {sortedDates.map((dateKey) => {
              const sessionGroup = groupedByDate[dateKey] || [];
              return (
                <View key={dateKey}>
                  <View className="flex-row items-center gap-2 mb-2.5">
                    <Calendar size={13} color="#FF6B35" strokeWidth={2} />
                    <Text className="text-xs font-bold text-white tracking-tight">
                      {formatDateHeader(dateKey)}
                    </Text>
                    <Text className="text-[10px] font-mono text-[#71717A]">
                      ({sessionGroup.length})
                    </Text>
                  </View>

                  <View className="gap-2.5">
                    {sessionGroup.map((item) => {
                      const isCompleted = item.completed;
                      return (
                        <View
                          key={item.id}
                          className={`bg-[#0F0F12] border rounded-xl p-3.5 flex-row items-start justify-between ${
                            isCompleted
                              ? "border-[#1F1F24] opacity-60"
                              : "border-[#222228]"
                          }`}
                        >
                          {/* Checkbox Toggle */}
                          <Pressable
                            onPress={() => toggle(item.id)}
                            className="mr-3 mt-0.5"
                            hitSlop={8}
                          >
                            {isCompleted ? (
                              <CheckCircle2 size={20} color="#10B981" strokeWidth={2} />
                            ) : (
                              <Circle size={20} color="#71717A" strokeWidth={1.8} />
                            )}
                          </Pressable>

                          {/* Content */}
                          <View className="flex-1 mr-2">
                            <Text
                              className={`text-sm font-semibold tracking-tight ${
                                isCompleted
                                  ? "line-through text-[#71717A]"
                                  : "text-white"
                              }`}
                            >
                              {item.title}
                            </Text>

                            <View className="flex-row items-center flex-wrap gap-2 mt-2">
                              {/* Topic Badge */}
                              <View className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                                <Text className="text-[10px] font-semibold text-[#A1A1AA]">
                                  {item.topic}
                                </Text>
                              </View>

                              {/* Duration */}
                              <View className="flex-row items-center gap-1">
                                <Clock size={11} color="#71717A" />
                                <Text className="text-[10px] font-mono text-[#71717A]">
                                  {item.duration_minutes}m
                                </Text>
                              </View>

                              {/* Source Badge */}
                              <View className="flex-row items-center gap-1">
                                {item.source === "ai" ? (
                                  <>
                                    <Bot size={11} color="#A78BFA" />
                                    <Text className="text-[10px] font-mono text-[#A78BFA]">
                                      AI Plan
                                    </Text>
                                  </>
                                ) : (
                                  <>
                                    <User size={11} color="#38BDF8" />
                                    <Text className="text-[10px] font-mono text-[#38BDF8]">
                                      Manual
                                    </Text>
                                  </>
                                )}
                              </View>
                            </View>
                          </View>

                          {/* Delete Action */}
                          <Pressable
                            onPress={() => handleDeleteSession(item.id, item.title)}
                            className="p-1.5 rounded-lg active:bg-red-500/20"
                            hitSlop={8}
                          >
                            <Trash2 size={15} color="#71717A" strokeWidth={1.8} />
                          </Pressable>
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Add Session Modal Form */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View className="flex-1 justify-end bg-black/70">
          <View className="bg-[#121216] border-t border-[#2A2A34] rounded-t-3xl p-5 pb-8">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-base font-bold text-white tracking-tight">
                Add Study Session
              </Text>
              <Pressable
                onPress={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 items-center justify-center"
              >
                <X size={18} color="#A1A1AA" />
              </Pressable>
            </View>

            {/* Title Input */}
            <Text className="text-xs text-[#A1A1AA] mb-1 font-medium">Session Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Graph Algorithms & Shortest Path"
              placeholderTextColor="#52525B"
              className="bg-[#0A0A0C] border border-[#22222A] rounded-xl px-3.5 py-2.5 text-sm text-white mb-3"
            />

            {/* Topic Input */}
            <Text className="text-xs text-[#A1A1AA] mb-1 font-medium">Topic</Text>
            <TextInput
              value={topic}
              onChangeText={setTopic}
              placeholder="e.g. Computer Science"
              placeholderTextColor="#52525B"
              className="bg-[#0A0A0C] border border-[#22222A] rounded-xl px-3.5 py-2.5 text-sm text-white mb-3"
            />

            {/* Date Input */}
            <Text className="text-xs text-[#A1A1AA] mb-1 font-medium">Date (YYYY-MM-DD)</Text>
            <TextInput
              value={scheduledDate}
              onChangeText={setScheduledDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#52525B"
              className="bg-[#0A0A0C] border border-[#22222A] rounded-xl px-3.5 py-2.5 text-sm font-mono text-white mb-3"
            />

            {/* Duration Quick Selector */}
            <Text className="text-xs text-[#A1A1AA] mb-1.5 font-medium">
              Duration (minutes)
            </Text>
            <View className="flex-row gap-2 mb-5">
              {["25", "45", "60", "90"].map((mins) => (
                <Pressable
                  key={mins}
                  onPress={() => setDurationMinutes(mins)}
                  className={`flex-1 py-2 rounded-xl items-center border ${
                    durationMinutes === mins
                      ? "bg-white border-white"
                      : "bg-[#0A0A0C] border-[#22222A]"
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      durationMinutes === mins ? "text-black" : "text-[#A1A1AA]"
                    }`}
                  >
                    {mins}m
                  </Text>
                </Pressable>
              ))}
            </View>

            <Button
              label={isSaving ? "Adding..." : "Save Session"}
              onPress={handleAddSession}
              isLoading={isSaving}
              variant="primary"
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
