import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";
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
} from "lucide-react-native";
import { Chip } from "../../src/components/ui/Chip";
import { Button } from "../../src/components/ui/Button";

const TOPICS = [
  { id: "math", name: "Mathematics", icon: Calculator },
  { id: "physics", name: "Physics", icon: Atom },
  { id: "biology", name: "Biology", icon: FlaskConical },
  { id: "cs", name: "Computer Science", icon: Code2 },
  { id: "ai", name: "AI & ML", icon: Brain },
  { id: "tech", name: "Technology", icon: Cpu },
  { id: "history", name: "History", icon: History },
  { id: "geography", name: "Geography", icon: Globe },
  { id: "finance", name: "Finance", icon: Coins },
  { id: "business", name: "Business", icon: TrendingUp },
  { id: "music", name: "Music", icon: Music },
  { id: "art", name: "Art & Design", icon: Palette },
  { id: "literature", name: "Literature", icon: BookOpen },
  { id: "photography", name: "Photography", icon: Camera },
  { id: "health", name: "Health", icon: Heart },
];

export default function Interests() {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const isContinueDisabled = selectedIds.length < 3;

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={["top", "bottom"]}>
      {/* Progress Bar Header */}
      <View className="px-6 pt-4 pb-2">
        <Text className="text-xs text-gray-500 mb-1">Step 3 of 3</Text>
        <View className="w-full h-1.5 bg-[#E8E8E8] rounded-full overflow-hidden">
          <LinearGradient
            colors={["#FF6B35", "#F72C25"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ width: "100%", height: "100%" }}
          />
        </View>
      </View>

      <ScrollView className="flex-1 px-6 mt-6" contentContainerStyle={{ paddingBottom: 32 }}>
        <Text className="text-3xl font-bold text-[#1A1A1A] mb-2">
          What are you into? 🎓
        </Text>
        <Text className="text-gray-500 text-sm mb-6">
          Select at least 3 topics to build your personalized feed.
        </Text>

        {/* Chip grid (wrap) */}
        <View className="flex-row flex-wrap gap-2 mb-8">
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

      {/* Continue Action Container */}
      <View className="px-6 py-4 border-t border-[#E8E8E8] bg-white">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-gray-500 text-sm">Selected</Text>
          <Text className="text-sm font-semibold text-[#FF6B35]">
            {selectedIds.length} of 3 required
          </Text>
        </View>

        <Button
          label="Continue →"
          onPress={() => router.replace("/(tabs)/feed")}
          disabled={isContinueDisabled}
          variant="primary"
        />
      </View>
    </SafeAreaView>
  );
}
