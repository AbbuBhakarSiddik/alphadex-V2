import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, RefreshControl, Image } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { CirclePlay, Newspaper, Inbox, Bell } from "lucide-react-native";
import { useAuth } from "../../src/features/auth/hooks";
import { useFeed } from "../../src/features/feed/hooks";
import { getUserInterests } from "../../src/features/interests/api";
import { ContentCard } from "../../src/components/layout/ContentCard";
import { Chip } from "../../src/components/ui/Chip";
import { Button } from "../../src/components/ui/Button";
import { AuroraBackground } from "../../src/components/ui/AuroraBackground";
import { AnimatedPressable } from "../../src/components/animations/AnimatedPressable";

type SourceFilter = "all" | "youtube" | "news";

export default function Feed() {
  const { profile, session } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
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

  // Load user interests
  const loadTopics = useCallback(async () => {
    try {
      const topics = await getUserInterests();
      setUserTopics(topics);
    } catch {
      // Non-critical
    }
  }, []);

  useEffect(() => {
    loadTopics();
  }, [loadTopics]);

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
    <ScrollView className="flex-1 px-4 mt-2" showsVerticalScrollIndicator={false}>
      {[1, 2, 3].map((i) => (
        <View key={i} className="mb-5 bg-[#0A0A0E] rounded-2xl overflow-hidden border border-white/10 p-3.5">
          <View className="w-full aspect-video bg-[#13131A] rounded-xl" />
          <View className="flex-row items-start gap-3 mt-3">
            <View className="w-9 h-9 rounded-full bg-[#181822]" />
            <View className="flex-1 gap-2 pt-0.5">
              <View className="w-4/5 h-4 bg-[#181822] rounded" />
              <View className="w-2/5 h-3 bg-[#13131A] rounded" />
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : session?.user?.email?.[0]?.toUpperCase() ?? "A";

  const hasContent = !isLoading && !error && items.length > 0;
  const bottomPadding = (insets.bottom > 0 ? insets.bottom : 8) + 68;

  return (
    <AuroraBackground>
      <SafeAreaView className="flex-1" edges={["top"]}>
        {/* Top App Bar (Swiss Minimalist Header) */}
        <View className="px-4 py-3 flex-row justify-between items-center border-b border-white/10 bg-black/40 backdrop-blur-md">
          <View className="flex-row items-center gap-2">
            <Image
              source={require("../../assets/logo.png")}
              style={{ width: 22, height: 22, borderRadius: 6 }}
              resizeMode="cover"
            />
            <Text className="text-white text-[15px] font-black tracking-[2.5px]">
              ALPHADEX
            </Text>
            <Text className="text-[#52525B] text-[11px] font-mono font-medium ml-0.5">
              01 // STREAM
            </Text>
          </View>

          <View className="flex-row items-center gap-2.5">
            <AnimatedPressable
              onPress={() => router.push("/(tabs)/search")}
              className="w-8 h-8 rounded-full items-center justify-center bg-white/5 border border-white/10 active:bg-white/15"
              hitSlop={8}
            >
              <Bell size={16} color="#F5F5F7" strokeWidth={1.8} />
            </AnimatedPressable>

            <AnimatedPressable
              onPress={() => router.push("/(tabs)/profile")}
              className="w-7 h-7 rounded-full bg-[#181820] border border-white/20 items-center justify-center"
              hitSlop={6}
            >
              <Text className="text-white text-[10px] font-bold">{initials}</Text>
            </AnimatedPressable>
          </View>
        </View>

        {/* Frosted Category Filter Bar */}
        {hasContent && (
          <View className="py-2.5 border-b border-white/5 bg-black/30 backdrop-blur-md">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 6 }}
            >
              <Chip
                label="All"
                isActive={activeSourceFilter === "all" && activeTopicFilter === null}
                onPress={() => {
                  setActiveSourceFilter("all");
                  setActiveTopicFilter(null);
                }}
              />
              <Chip
                label="Videos"
                isActive={activeSourceFilter === "youtube"}
                icon={CirclePlay}
                onPress={() =>
                  setActiveSourceFilter(activeSourceFilter === "youtube" ? "all" : "youtube")
                }
              />
              <Chip
                label="Articles"
                isActive={activeSourceFilter === "news"}
                icon={Newspaper}
                onPress={() =>
                  setActiveSourceFilter(activeSourceFilter === "news" ? "all" : "news")
                }
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

        {/* Main Feed Content with Safe Bottom Padding */}
        {isLoading ? (
          renderSkeleton()
        ) : error ? (
          <View className="flex-1 justify-center items-center px-6">
            <Text className="text-red-400 text-base font-semibold text-center mb-1">
              Couldn't load your feed
            </Text>
            <Text className="text-[#71717A] text-center text-xs mb-6">{error}</Text>
            <View className="w-40">
              <Button label="Retry" onPress={refresh} />
            </View>
          </View>
        ) : items.length === 0 ? (
          <View className="flex-1 justify-center items-center px-6">
            <Inbox size={40} color="#383844" strokeWidth={1.5} className="mb-3" />
            <Text className="text-white text-base font-bold mb-1">
              No content yet
            </Text>
            <Text className="text-[#71717A] text-center text-xs mb-6 max-w-[260px]">
              Follow study channels or select interests to populate your Swiss technical stream.
            </Text>
            <View className="w-44">
              <Button
                label="Manage Interests"
                onPress={() => router.push("/manage-interests")}
              />
            </View>
          </View>
        ) : filteredItems.length === 0 ? (
          <View className="flex-1 justify-center items-center px-6">
            <Inbox size={36} color="#383844" strokeWidth={1.5} className="mb-3" />
            <Text className="text-white text-base font-bold mb-1">
              No matches found
            </Text>
            <Text className="text-[#71717A] text-center text-xs mb-5">
              Reset topic filter or explore other technical categories.
            </Text>
            <View className="w-40">
              <Button
                label="Show All"
                onPress={() => {
                  setActiveSourceFilter("all");
                  setActiveTopicFilter(null);
                }}
              />
            </View>
          </View>
        ) : (
          <FlashList
            data={filteredItems}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: bottomPadding,
            }}
            renderItem={({ item, index }) => (
              <ContentCard
                item={item}
                index={index}
                onLike={() => like(item.id, item.liked)}
                onSave={() => save(item.id, item.saved)}
              />
            )}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={refresh}
                tintColor="#FFFFFF"
                colors={["#FFFFFF"]}
                progressBackgroundColor="#181822"
              />
            }
          />
        )}
      </SafeAreaView>
    </AuroraBackground>
  );
}
