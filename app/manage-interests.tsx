import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
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
  Search,
  X,
  Tv,
} from "lucide-react-native";
import { Chip } from "../src/components/ui/Chip";
import { Button } from "../src/components/ui/Button";
import {
  getUserInterests,
  setUserInterests,
  searchChannels,
  type ChannelSearchResult,
} from "../src/features/interests/api";
import { useInterestsManager } from "../src/features/interests/hooks";
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

  // Channel management hook
  const {
    followedChannels,
    isLoadingChannels,
    toggleChannel,
  } = useInterestsManager();

  // Search state
  const [channelQuery, setChannelQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ChannelSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

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

  // Debounced search for channels
  useEffect(() => {
    if (!channelQuery.trim()) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);
      try {
        const results = await searchChannels(channelQuery.trim());
        setSearchResults(results);
        if (results.length === 0) {
          setSearchError(`No channels found matching "${channelQuery.trim()}"`);
        }
      } catch (err: any) {
        setSearchError(err.message || "Failed to search channels");
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [channelQuery]);

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleToggleChannel = async (channelId: string, name: string) => {
    const isFollowed = followedChannels.some((c) => c.channel_id === channelId);
    try {
      await toggleChannel(channelId, name, isFollowed);
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.message || `Failed to ${isFollowed ? "unfollow" : "follow"} channel.`
      );
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
            keyboardShouldPersistTaps="handled"
          >
            {/* ── Section 1: Study Topics ── */}
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

            {/* ── Section 2: Channel Search ── */}
            <Text className="text-base font-bold text-white mb-1">
              Search & Follow Channels 📺
            </Text>
            <Text className="text-[#71717A] text-xs mb-3">
              Search any YouTube educational creator to pull their videos into your feed.
            </Text>

            {/* Plain Search Bar */}
            <View className="flex-row items-center bg-[#121216] border border-[#222228] rounded-xl px-3 py-2.5 mb-4">
              <Search size={16} color="#71717A" />
              <TextInput
                value={channelQuery}
                onChangeText={setChannelQuery}
                placeholder="Search channels (e.g. 3Blue1Brown, Veritasium)..."
                placeholderTextColor="#52525B"
                className="flex-1 text-sm text-white ml-2.5 p-0"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
              />
              {channelQuery.length > 0 && (
                <Pressable
                  onPress={() => setChannelQuery("")}
                  hitSlop={8}
                  className="p-1"
                >
                  <X size={14} color="#71717A" />
                </Pressable>
              )}
            </View>

            {/* Search Results List */}
            {isSearching ? (
              <View className="py-4 items-center mb-4">
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text className="text-xs text-[#71717A] mt-2 font-mono">
                  Searching channels...
                </Text>
              </View>
            ) : searchError ? (
              <View className="p-3 mb-4 rounded-xl bg-[#161212] border border-red-500/20">
                <Text className="text-xs text-red-400 text-center">{searchError}</Text>
              </View>
            ) : searchResults.length > 0 ? (
              <View className="mb-6 gap-2">
                <Text className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1">
                  Search Results
                </Text>
                {searchResults.map((result) => {
                  const isFollowed = followedChannels.some(
                    (c) => c.channel_id === result.channelId
                  );
                  return (
                    <View
                      key={result.channelId}
                      className="flex-row items-center justify-between p-3 rounded-xl bg-[#121216] border border-[#222228]"
                    >
                      <View className="flex-row items-center gap-3 flex-1 mr-3">
                        {result.thumbnailUrl ? (
                          <Image
                            source={{ uri: result.thumbnailUrl }}
                            className="w-9 h-9 rounded-full bg-[#1F1F24]"
                          />
                        ) : (
                          <View className="w-9 h-9 rounded-full bg-[#1F1F24] items-center justify-center">
                            <Tv size={16} color="#A1A1AA" />
                          </View>
                        )}
                        <Text
                          className="text-sm font-semibold text-white flex-1"
                          numberOfLines={1}
                        >
                          {result.name}
                        </Text>
                      </View>

                      <Pressable
                        onPress={() => handleToggleChannel(result.channelId, result.name)}
                        className={`px-3 py-1.5 rounded-full border ${
                          isFollowed
                            ? "bg-white/10 border-white/20"
                            : "bg-white border-white"
                        }`}
                      >
                        <Text
                          className={`text-xs font-bold ${
                            isFollowed ? "text-white" : "text-black"
                          }`}
                        >
                          {isFollowed ? "Following" : "Follow"}
                        </Text>
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            ) : null}

            {/* ── Section 3: Currently Following ── */}
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-base font-bold text-white tracking-tight">
                  Currently following
                </Text>
                <Text className="text-xs font-mono text-[#71717A]">
                  {followedChannels.length} channels
                </Text>
              </View>

              {isLoadingChannels ? (
                <View className="py-4 items-center">
                  <ActivityIndicator size="small" color="#FFFFFF" />
                </View>
              ) : followedChannels.length === 0 ? (
                <View className="p-4 rounded-xl bg-[#121216] border border-[#222228] items-center justify-center">
                  <Text className="text-xs text-[#71717A] text-center">
                    No channels followed yet. Search above to find and follow channels.
                  </Text>
                </View>
              ) : (
                <View className="flex-row flex-wrap gap-2">
                  {followedChannels.map((channel) => (
                    <View
                      key={channel.channel_id}
                      className="flex-row items-center bg-[#141418] border border-[#27272A] rounded-full pl-3.5 pr-2 py-1.5"
                    >
                      <Text
                        className="text-xs font-semibold text-white mr-1.5"
                        numberOfLines={1}
                      >
                        {channel.name}
                      </Text>
                      <Pressable
                        onPress={() =>
                          handleToggleChannel(channel.channel_id, channel.name)
                        }
                        hitSlop={8}
                        className="w-5 h-5 rounded-full bg-white/10 items-center justify-center active:bg-white/20"
                      >
                        <X size={11} color="#A1A1AA" />
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}
            </View>
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
