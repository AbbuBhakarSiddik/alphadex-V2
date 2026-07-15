import React, { useState } from "react";
import { View, Text, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import { Sparkles, CirclePlay, Newspaper, Inbox } from "lucide-react-native";
import { useAuth } from "../../src/features/auth/hooks";
import { useFeed } from "../../src/features/feed/hooks";
import { ContentCard } from "../../src/components/layout/ContentCard";
import { Chip } from "../../src/components/ui/Chip";
import { GradientButton } from "../../src/components/ui/GradientButton";

export default function Feed() {
  const { profile } = useAuth();
  const { items, isLoading, isRefreshing, error, refresh, like, save } = useFeed();
  const [activeFilter, setActiveFilter] = useState<"all" | "youtube" | "news">("all");

  const filteredItems = items.filter(
    (item) => activeFilter === "all" || item.source === activeFilter
  );

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

      {/* Filter Chip ScrollView */}
      {!isLoading && !error && items.length > 0 && (
        <View className="py-2.5">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}
          >
            <Chip
              label="All Content"
              isActive={activeFilter === "all"}
              icon={Sparkles}
              onPress={() => setActiveFilter("all")}
            />
            <Chip
              label="Videos"
              isActive={activeFilter === "youtube"}
              icon={CirclePlay}
              onPress={() => setActiveFilter("youtube")}
            />
            <Chip
              label="Articles"
              isActive={activeFilter === "news"}
              icon={Newspaper}
              onPress={() => setActiveFilter("news")}
            />
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
            <GradientButton label="Explore Topics" onPress={() => {}} />
          </View>
        </View>
      ) : filteredItems.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <Inbox size={48} color="#D1D1D1" strokeWidth={1.5} className="mb-4" />
          <Text className="text-[#1A1A1A] text-lg font-semibold mb-1">
            No matches found
          </Text>
          <Text className="text-gray-500 text-center text-sm">
            Try switching to another filter or check back later.
          </Text>
        </View>
      ) : (
        <FlashList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}
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
