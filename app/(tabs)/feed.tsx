import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { Sparkles, CirclePlay, Newspaper, Inbox } from "lucide-react-native";
import { useAuth } from "../../src/features/auth/hooks";
import { useFeed } from "../../src/features/feed/hooks";
import { getUserInterests } from "../../src/features/interests/api";
import { ContentCard } from "../../src/components/layout/ContentCard";
import { Chip } from "../../src/components/ui/Chip";
import { GradientButton } from "../../src/components/ui/GradientButton";

type SourceFilter = "all" | "youtube" | "news";

export default function Feed() {
  const { profile } = useAuth();
  const {
    items,
    isLoading,
    isRefreshing,
    error,
    needsRefresh,
    setNeedsRefresh,
    refresh,
    like,
    save,
  } = useFeed();

  const [activeSourceFilter, setActiveSourceFilter] = useState<SourceFilter>("all");
  const [activeTopicFilter, setActiveTopicFilter] = useState<string | null>(null);
  const [userTopics, setUserTopics] = useState<string[]>([]);

  // Load user interests to display as topic chips
  const loadTopics = useCallback(async () => {
    try {
      const topics = await getUserInterests();
      setUserTopics(topics);
    } catch {
      // Non-critical — just skip topic chips if unavailable
    }
  }, []);

  // On first mount, load topics
  useEffect(() => {
    loadTopics();
  }, [loadTopics]);

  // Refresh feed on focus if interests were updated
  useFocusEffect(
    useCallback(() => {
      if (needsRefresh) {
        setNeedsRefresh(false);
        loadTopics();
        refresh();
      }
    }, [needsRefresh, setNeedsRefresh, refresh, loadTopics])
  );

  // Apply source + topic filters
  const filteredItems = items.filter((item) => {
    const sourceMatch = activeSourceFilter === "all" || item.source === activeSourceFilter;
    const topicMatch =
      !activeTopicFilter ||
      `${item.title ?? ""} ${item.description ?? ""}`
        .toLowerCase()
        .includes(activeTopicFilter.toLowerCase());
    return sourceMatch && topicMatch;
  });

  const renderSkeleton = () => (
    <ScrollView className="flex-1 px-6 mt-4" showsVerticalScrollIndicator={false}>
      {[1, 2, 3].map((i) => (
        <View
          key={i}
          className="bg-white rounded-2xl mb-4 overflow-hidden border border-[#E8E8E8] shadow-sm shadow-gray-200/50"
        >
          <View className="w-full h-44 bg-gray-100" />
          <View className="p-4 gap-3">
            <View className="w-20 h-4 bg-gray-100 rounded-full" />
            <View className="w-3/4 h-5 bg-gray-100 rounded-full" />
            <View className="w-1/2 h-4 bg-gray-100 rounded-full" />
            <View className="h-[1px] bg-gray-100 my-1" />
            <View className="flex-row gap-4">
              <View className="w-10 h-6 bg-gray-100 rounded-full" />
              <View className="w-10 h-6 bg-gray-100 rounded-full" />
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const hasContent = !isLoading && !error && items.length > 0;

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={["top"]}>
      {/* Header */}
      <View className="px-6 pt-4 pb-2 flex-row justify-between items-center">
        <View>
          <Text className="text-gray-500 text-xs uppercase tracking-widest font-semibold">
            Learning Feed
          </Text>
          <Text className="text-2xl font-bold text-[#1A1A1A]">
            Hey{profile?.full_name ? `, ${profile.full_name}` : ""} 👋
          </Text>
        </View>
        {items.length > 0 && (
          <View className="bg-[#FFF5F0] px-2.5 py-1 rounded-full border border-[#FF6B35]/20">
            <Text className="text-[#FF6B35] text-xs font-semibold">
              {items.length} items
            </Text>
          </View>
        )}
      </View>

      {/* Source filter chips */}
      {hasContent && (
        <View className="pt-2 pb-1">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}
          >
            <Chip
              label="All Content"
              isActive={activeSourceFilter === "all"}
              icon={Sparkles}
              onPress={() => setActiveSourceFilter("all")}
            />
            <Chip
              label="Videos"
              isActive={activeSourceFilter === "youtube"}
              icon={CirclePlay}
              onPress={() => setActiveSourceFilter("youtube")}
            />
            <Chip
              label="Articles"
              isActive={activeSourceFilter === "news"}
              icon={Newspaper}
              onPress={() => setActiveSourceFilter("news")}
            />
          </ScrollView>
        </View>
      )}

      {/* Topic chips from user interests */}
      {hasContent && userTopics.length > 0 && (
        <View className="pb-2">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}
          >
            <Chip
              label="All Topics"
              isActive={activeTopicFilter === null}
              onPress={() => setActiveTopicFilter(null)}
            />
            {userTopics.map((topic) => (
              <Chip
                key={topic}
                label={topic.charAt(0).toUpperCase() + topic.slice(1)}
                isActive={activeTopicFilter === topic}
                onPress={() =>
                  setActiveTopicFilter(activeTopicFilter === topic ? null : topic)
                }
              />
            ))}
          </ScrollView>
        </View>
      )}

      {isLoading ? (
        renderSkeleton()
      ) : error ? (
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-[#F72C25] text-lg font-semibold text-center mb-1">
            Couldn't load your feed
          </Text>
          <Text className="text-gray-500 text-center text-sm mb-6">{error}</Text>
          <View className="w-48">
            <GradientButton label="Retry" onPress={refresh} />
          </View>
        </View>
      ) : items.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <Inbox size={48} color="#D1D1D1" strokeWidth={1.5} className="mb-4" />
          <Text className="text-[#1A1A1A] text-lg font-semibold mb-1">
            Nothing here yet
          </Text>
          <Text className="text-gray-500 text-center text-sm mb-6">
            Follow some channels or pick a few interests to get content flowing in.
          </Text>
          <View className="w-48">
            <GradientButton label="Explore Topics" onPress={refresh} />
          </View>
        </View>
      ) : filteredItems.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <Inbox size={48} color="#D1D1D1" strokeWidth={1.5} className="mb-4" />
          <Text className="text-[#1A1A1A] text-lg font-semibold mb-1">
            No matches found
          </Text>
          <Text className="text-gray-500 text-center text-sm mb-4">
            Try switching to another filter or check back later.
          </Text>
          {activeTopicFilter !== null && (
            <View className="w-48">
              <GradientButton
                label="Clear Topic Filter"
                onPress={() => setActiveTopicFilter(null)}
              />
            </View>
          )}
        </View>
      ) : (
        <FlashList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32, paddingTop: 4 }}
          renderItem={({ item }) => (
            <ContentCard
              item={item}
              onLike={() => like(item.id, item.liked)}
              onSave={() => save(item.id, item.saved)}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              colors={["#FF6B35"]}
              tintColor="#FF6B35"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}
