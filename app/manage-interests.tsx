import React, { useEffect, useState } from "react";
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
import { useInterestsManager } from "../src/features/interests/hooks";
import { RECOMMENDED_STUDY_CHANNELS } from "../src/features/interests/types";
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

  const {
    followedChannels,
    isLoadingChannels,
    resolvingHandles,
    followRecommended,
  } = useInterestsManager();

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
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to save your interests.");
    } finally {
      setIsSaving(false);
    }
  };

  const isSaveDisabled = selectedIds.length < 3;

  /** Returns the channelId for a followed recommended channel, or undefined. */
  const getFollowedChannelId = (displayName: string): string | undefined =>
    followedChannels.find(
      (c) => c.name.toLowerCase() === displayName.toLowerCase()
    )?.channel_id;

  const handleRecommendedPress = async (
    handle: string,
    displayName: string
  ) => {
    const followedId = getFollowedChannelId(displayName);
    const isFollowed = !!followedId;
    try {
      await followRecommended(handle, displayName, isFollowed, followedId);
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.message || `Failed to ${isFollowed ? "unfollow" : "follow"} channel.`
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black" edges={["top", "bottom"]}>
      {/* Header */}
      <View className="px-5 py-3.5 flex-row items-center border-b border-[#1A1A1A] bg-black">
        <Pressable
          onPress={() => router.back()}
          className="w-9 h-9 bg-[#141414] border border-[#222222] rounded-full items-center justify-center mr-3 active:bg-[#222222]"
        >
          <ArrowLeft size={18} color="#FFFFFF" strokeWidth={1.8} />
        </Pressable>
        <Text className="text-lg font-bold text-white tracking-tight">Manage Interests</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text className="text-[#71717A] text-xs mt-3">Loading your interests...</Text>
        </View>
      ) : (
        <>
          <ScrollView
            className="flex-1 px-5 mt-5"
            contentContainerStyle={{ paddingBottom: 32 }}
          >
            <Text className="text-xl font-bold text-white mb-1 tracking-tight">
              Update your topics 🎯
            </Text>
            <Text className="text-[#71717A] text-xs mb-5 leading-relaxed">
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

            {/* ── Recommended for Study ── */}
            <Text className="text-base font-bold text-white mb-1">
              Recommended for Study 📚
            </Text>
            <Text className="text-[#71717A] text-xs mb-4">
              Tap to follow top educational YouTube channels instantly.
            </Text>

            {isLoadingChannels ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <View className="flex-row flex-wrap gap-2 mb-4">
                {RECOMMENDED_STUDY_CHANNELS.map(({ handle, displayName }) => {
                  const isResolving = resolvingHandles.has(handle);
                  const isFollowed = !!getFollowedChannelId(displayName);

                  return (
                    <Pressable
                      key={handle}
                      onPress={() => handleRecommendedPress(handle, displayName)}
                      disabled={isResolving}
                      className={`flex-row items-center px-3.5 py-1.5 rounded-full border ${
                        isFollowed
                          ? "bg-white border-white"
                          : "bg-[#141414] border-[#27272A]"
                      }`}
                    >
                      {isResolving ? (
                        <ActivityIndicator
                          size="small"
                          color={isFollowed ? "#000000" : "#FFFFFF"}
                          style={{ marginRight: 6 }}
                        />
                      ) : null}
                      <Text
                        className={`text-xs font-semibold ${
                          isFollowed ? "text-black" : "text-[#A1A1AA]"
                        }`}
                      >
                        {displayName}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </ScrollView>

          {/* Action Container */}
          <View className="px-5 py-4 border-t border-[#1A1A1A] bg-black">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-[#71717A] text-xs">Selected Topics</Text>
              <Text className="text-xs font-bold text-white">
                {selectedIds.length} of 3 minimum
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

