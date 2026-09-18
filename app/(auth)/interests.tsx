import React, { useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  Calculator,
  FlaskConical,
  Code2,
  Palette,
  Globe,
  BookOpen,
  Atom,
  Cpu,
  Brain,
  History,
  Music,
  Camera,
  Heart,
  TrendingUp,
  Coins,
  Compass,
  Check,
  ArrowRight,
} from "lucide-react-native";
import { Chip } from "../../src/components/ui/Chip";
import { Button } from "../../src/components/ui/Button";
import { setUserInterests } from "../../src/features/interests/api";

const TOPICS = [
  { id: "ai", name: "AI & Machine Learning", icon: Brain },
  { id: "cs", name: "Computer Science", icon: Code2 },
  { id: "math", name: "Mathematics", icon: Calculator },
  { id: "tech", name: "Technology", icon: Cpu },
  { id: "physics", name: "Physics", icon: Atom },
  { id: "finance", name: "Finance & Wealth", icon: Coins },
  { id: "business", name: "Entrepreneurship", icon: TrendingUp },
  { id: "biology", name: "Biology & Life", icon: FlaskConical },
  { id: "art", name: "Design & UX", icon: Palette },
  { id: "literature", name: "Literature & Writing", icon: BookOpen },
  { id: "history", name: "World History", icon: History },
  { id: "geography", name: "Earth & Geography", icon: Globe },
  { id: "music", name: "Music Theory", icon: Music },
  { id: "photography", name: "Visual Arts", icon: Camera },
  { id: "health", name: "Health & Wellness", icon: Heart },
];

export default function Interests() {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleContinue = async () => {
    setIsSaving(true);
    try {
      await setUserInterests(selectedIds);
      router.replace("/(tabs)/feed");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to save your interests.");
    } finally {
      setIsSaving(false);
    }
  };

  const isContinueDisabled = selectedIds.length < 3;
  const progressPercent = Math.min(100, Math.round((selectedIds.length / 3) * 100));

  return (
    <SafeAreaView className="flex-1 bg-[#F9F9FB]" edges={["top", "bottom"]}>
      {/* Ambient Pastel Background Glow */}
      <LinearGradient
        colors={["rgba(237, 233, 254, 0.4)", "rgba(204, 251, 241, 0.25)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 280,
          height: 280,
          borderRadius: 140,
        }}
        pointerEvents="none"
      />

      {/* Progress Bar Header */}
      <View className="px-6 pt-4 pb-3">
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center gap-1.5 bg-white border border-black/[0.04] px-3 py-1 rounded-full shadow-xs">
            <Compass size={12} color="#4F46E5" />
            <Text className="text-[11px] font-bold text-[#0F172A]">
              Step 2 of 2
            </Text>
          </View>
          <Text className="text-xs font-semibold text-[#64748B]">
            {selectedIds.length} / 3 selected
          </Text>
        </View>

        {/* Progress bar container */}
        <View className="w-full h-1.5 bg-slate-200/70 rounded-full overflow-hidden">
          <LinearGradient
            colors={["#4F46E5", "#06B6D4"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ width: `${progressPercent}%`, height: "100%" }}
          />
        </View>
      </View>

      <ScrollView
        className="flex-1 px-6 mt-3"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-extrabold text-[#0F172A] tracking-tight mb-1">
          Curate Your Feed ✨
        </Text>
        <Text className="text-xs text-[#64748B] mb-5 leading-relaxed">
          Select 3 or more topics to personalize your lessons, flashcards, and daily challenges.
        </Text>

        {/* Bento Chip Wrap Grid */}
        <View className="flex-row flex-wrap gap-2.5 mb-6">
          {TOPICS.map((topic) => {
            const isActive = selectedIds.includes(topic.id);
            return (
              <Chip
                key={topic.id}
                label={topic.name}
                isActive={isActive}
                icon={topic.icon}
                onPress={() => toggleSelect(topic.id)}
              />
            );
          })}
        </View>
      </ScrollView>

      {/* Sticky Bottom Bento Action Container */}
      <View className="px-6 py-4 bg-white rounded-t-3xl border-t border-black/[0.04] shadow-sm">
        <View className="flex-row items-center justify-between mb-3.5">
          <Text className="text-xs font-medium text-[#64748B]">
            Required selection
          </Text>
          <View className="flex-row items-center gap-1.5">
            {selectedIds.length >= 3 ? (
              <View className="w-4 h-4 rounded-full bg-emerald-100 items-center justify-center">
                <Check size={11} color="#059669" strokeWidth={2.5} />
              </View>
            ) : null}
            <Text
              className={`text-xs font-bold ${
                selectedIds.length >= 3 ? "text-emerald-600" : "text-[#4F46E5]"
              }`}
            >
              {selectedIds.length} of 3 selected
            </Text>
          </View>
        </View>

        <Button
          label={selectedIds.length >= 3 ? "Complete & Open Feed" : "Select at least 3 topics"}
          onPress={handleContinue}
          isLoading={isSaving}
          disabled={isContinueDisabled}
          variant="primary"
          icon={<ArrowRight size={16} color="#FFFFFF" strokeWidth={2.2} />}
        />
      </View>
    </SafeAreaView>
  );
}
