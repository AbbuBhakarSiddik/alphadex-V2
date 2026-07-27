import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
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
import { Chip } from "../src/components/ui/Chip";
import { Button } from "../src/components/ui/Button";
import { getUserInterests, setUserInterests } from "../src/features/interests/api";
import { useFeedStore } from "../src/features/feed/store";

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

export default function ManageInterests() {
  const router = useRouter();
  const setNeedsRefresh = useFeedStore((s) => s.setNeedsRefresh);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const result = await getUserInterests();
        if (isMounted) {
          setSelectedIds(result);
        }
      } catch (err: any) {
        Alert.alert("Error", err.message || "Failed to load current interests.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setUserInterests(selectedIds);
      // Signal the feed to force-refresh with the new interests
      setNeedsRefresh(true);
      Alert.alert("Success", "Interests updated successfully!", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to save your interests.");
    } finally {
      setIsSaving(false);
    }
  };

  const isSaveDisabled = selectedIds.length < 3;

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={["top", "bottom"]}>
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center border-b border-[#E8E8E8] bg-white">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 bg-white border border-[#E8E8E8] rounded-full items-center justify-center shadow-sm shadow-gray-200/50 mr-4"
        >
          <ArrowLeft size={20} color="#1A1A1A" strokeWidth={1.5} />
        </Pressable>
        <Text className="text-xl font-bold text-[#1A1A1A]">Manage Interests</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text className="text-gray-500 mt-2">Loading your interests...</Text>
        </View>
      ) : (
        <>
          <ScrollView className="flex-1 px-6 mt-6" contentContainerStyle={{ paddingBottom: 32 }}>
            <Text className="text-2xl font-bold text-[#1A1A1A] mb-2">
              Update your topics 🎯
            </Text>
            <Text className="text-gray-500 text-sm mb-6">
              Pick at least 3 topics to customize your feeds and AI recommendations.
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

          {/* Action Container */}
          <View className="px-6 py-4 border-t border-[#E8E8E8] bg-white">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-500 text-sm">Selected</Text>
              <Text className="text-sm font-semibold text-[#FF6B35]">
                {selectedIds.length} of 3 required
              </Text>
            </View>

            <Button
              label="Save Changes"
              onPress={handleSave}
              isLoading={isSaving}
              disabled={isSaveDisabled}
              variant="primary"
            />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
