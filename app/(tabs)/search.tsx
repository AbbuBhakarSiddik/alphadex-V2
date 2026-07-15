import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import { Search as SearchIcon, X, Check, Plus } from "lucide-react-native";
import { useFeed } from "../../src/features/feed/hooks";
import { ContentCard } from "../../src/components/layout/ContentCard";
import { Chip } from "../../src/components/ui/Chip";
import { LinearGradient } from "expo-linear-gradient";

const TRENDING_TOPICS = ["Artificial Intelligence", "Mathematics", "Quantum Physics", "Computer Science"];

const POPULAR_CHANNELS = [
  { id: "3b1b", name: "3Blue1Brown", subs: "5.2M subscribers", initials: "3B" },
  { id: "veritasium", name: "Veritasium", subs: "14.5M subscribers", initials: "VE" },
  { id: "mit", name: "MIT OpenCourseWare", subs: "4.8M subscribers", initials: "MT" },
];

export default function Search() {
  const { items, like, save } = useFeed();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [followedChannels, setFollowedChannels] = useState<string[]>(["3b1b"]);

  const toggleFollow = (id: string) => {
    if (followedChannels.includes(id)) {
      setFollowedChannels(followedChannels.filter((x) => x !== id));
    } else {
      setFollowedChannels([...followedChannels, id]);
    }
  };

  const filteredItems = items.filter(
    (item) =>
      query.length >= 2 &&
      (item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description?.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={["top"]}>
      {/* Title */}
      <View className="px-6 pt-4 pb-2">
        <Text className="text-3xl font-bold text-[#1A1A1A]">Search</Text>
      </View>

      {/* Search Input Bar */}
      <View className="px-6 py-2.5">
        <View
          className={`bg-white rounded-2xl flex-row items-center border shadow-sm shadow-gray-200/50 px-4 h-14 ${
            isFocused ? "border-primary" : "border-[#E8E8E8]"
          }`}
        >
          <SearchIcon size={18} color="#9CA3AF" strokeWidth={1.5} className="mr-2" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search topics, articles, videos..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 text-base text-[#1A1A1A] h-full"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} className="p-1">
              <X size={18} color="#6B7280" strokeWidth={1.5} />
            </Pressable>
          )}
        </View>
      </View>

      {query.length < 2 ? (
        <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}>
          {/* Trending Topics */}
          <View className="mt-4">
            <Text className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">
              Trending Topics
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {TRENDING_TOPICS.map((topic) => (
                <Chip
                  key={topic}
                  label={topic}
                  isActive={false}
                  onPress={() => setQuery(topic)}
                />
              ))}
            </View>
          </View>

          {/* Popular Channels */}
          <View className="mt-8">
            <Text className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">
              Popular Channels
            </Text>
            <View className="gap-3">
              {POPULAR_CHANNELS.map((channel) => {
                const isFollowing = followedChannels.includes(channel.id);
                return (
                  <View
                    key={channel.id}
                    className="flex-row items-center justify-between bg-white border border-[#E8E8E8] rounded-2xl p-4 shadow-sm shadow-gray-200/50"
                  >
                    <View className="flex-row items-center gap-3">
                      <View className="w-10 h-10 rounded-full bg-[#FFF5F0] items-center justify-center border border-[#FF6B35]/10">
                        <Text className="text-[#FF6B35] font-semibold text-sm">
                          {channel.initials}
                        </Text>
                      </View>
                      <View>
                        <Text className="text-base font-semibold text-[#1A1A1A]">
                          {channel.name}
                        </Text>
                        <Text className="text-xs text-gray-500">{channel.subs}</Text>
                      </View>
                    </View>

                    {isFollowing ? (
                      <LinearGradient
                        colors={["#10B981", "#34D399"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{ borderRadius: 9999 }}
                      >
                        <Pressable
                          onPress={() => toggleFollow(channel.id)}
                          className="flex-row items-center gap-1 px-4 py-1.5"
                        >
                          <Check size={12} color="#FFFFFF" strokeWidth={2} />
                          <Text className="text-white text-xs font-semibold">Following</Text>
                        </Pressable>
                      </LinearGradient>
                    ) : (
                      <Pressable
                        onPress={() => toggleFollow(channel.id)}
                        className="flex-row items-center gap-1 border border-[#FF6B35] rounded-full px-4 py-1.5"
                      >
                        <Plus size={12} color="#FF6B35" strokeWidth={2} />
                        <Text className="text-[#FF6B35] text-xs font-semibold">Follow</Text>
                      </Pressable>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      ) : (
        // Results List
        <View className="flex-1">
          {filteredItems.length === 0 ? (
            <View className="flex-1 justify-center items-center px-6 mt-10">
              <Text className="text-[#1A1A1A] text-lg font-semibold mb-1">
                No results found
              </Text>
              <Text className="text-gray-500 text-center text-sm">
                No matching content items found for "{query}".
              </Text>
            </View>
          ) : (
            <View className="flex-1 px-6">
              <Text className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-4 mb-3">
                Search Results ({filteredItems.length})
              </Text>
              <FlashList
                data={filteredItems}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 32 }}
                renderItem={({ item }) => (
                  <ContentCard
                    item={item}
                    onLike={() => like(item.id, item.liked)}
                    onSave={() => save(item.id, item.saved)}
                  />
                )}
              />
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
