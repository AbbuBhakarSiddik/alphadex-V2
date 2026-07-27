import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Settings, Bell, Bookmark } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/features/auth/hooks";
import { useFeed } from "../../src/features/feed/hooks";
import { getUserInterests } from "../../src/features/interests/api";
import { Button } from "../../src/components/ui/Button";
import { Chip } from "../../src/components/ui/Chip";
import { ContentCard } from "../../src/components/layout/ContentCard";

export default function Profile() {
  const { profile, session, signOut } = useAuth();
  const { items, like, save } = useFeed();
  const router = useRouter();

  const [topics, setTopics] = useState<string[]>([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const result = await getUserInterests();
        if (isMounted) setTopics(result);
      } catch {
        // Non-critical for this screen — just show the empty state below
      } finally {
        if (isMounted) setIsLoadingTopics(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const savedItems = items.filter((item) => item.saved).slice(0, 2);
  const likedItemsCount = items.filter((item) => item.liked).length;
  const savedItemsCount = items.filter((item) => item.saved).length;

  const initials = profile?.full_name
    ? profile.full_name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
    : session?.user?.email?.[0]?.toUpperCase() ?? "A";

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={["top"]}>
      {/* Header icon row */}
      <View className="h-14 flex-row justify-end items-center px-6 gap-3">
        <Pressable
          onPress={() => Alert.alert("Notifications", "No new notifications.")}
          className="w-10 h-10 bg-white border border-[#E8E8E8] rounded-full items-center justify-center shadow-sm shadow-gray-200/50"
        >
          <Bell size={18} color="#6B7280" strokeWidth={1.5} />
        </Pressable>
        <Pressable
          onPress={() => Alert.alert("Settings", "App preferences (stub).")}
          className="w-10 h-10 bg-white border border-[#E8E8E8] rounded-full items-center justify-center shadow-sm shadow-gray-200/50"
        >
          <Settings size={18} color="#6B7280" strokeWidth={1.5} />
        </Pressable>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Profile Info */}
        <View className="items-center px-6 mt-2 mb-6">
          <View className="w-24 h-24 rounded-full bg-[#FFF5F0] border-2 border-[#FF6B35] items-center justify-center shadow-sm shadow-gray-200/50 mb-3">
            <Text className="text-[#FF6B35] text-3xl font-bold">{initials}</Text>
          </View>
          <Text className="text-2xl font-bold text-[#1A1A1A]">
            {profile?.full_name ?? "Sophia Nguyen"}
          </Text>
          <Text className="text-gray-500 text-sm mt-0.5">{session?.user?.email}</Text>
        </View>

        {/* Stats Row */}
        <View className="flex-row mx-6 bg-white border border-[#E8E8E8] rounded-2xl p-4 shadow-sm shadow-gray-200/60 mb-6">
          <View className="flex-1 items-center border-r border-[#F5F5F5]">
            <Text className="text-2xl font-bold text-[#1A1A1A]">{savedItemsCount}</Text>
            <Text className="text-xs text-gray-500 mt-0.5">Saved</Text>
          </View>
          <View className="flex-1 items-center border-r border-[#F5F5F5]">
            <Text className="text-2xl font-bold text-[#1A1A1A]">{likedItemsCount}</Text>
            <Text className="text-xs text-gray-500 mt-0.5">Liked</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-2xl font-bold text-[#1A1A1A]">12</Text>
            <Text className="text-xs text-gray-500 mt-0.5">Days Streak</Text>
          </View>
        </View>

        {/* Topics List */}
        <View className="px-6 mb-6">
          <Text className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">
            My Topics
          </Text>
          <Pressable
            onPress={() => router.push("/manage-interests")}
            className="bg-gray-200 items-center justify-center rounded-xl border-1 border-black px-8 py-3.5 mb-3"
          >
            <Text className="text-[#1A1A1A] font-semibold">Manage Interests</Text>
          </Pressable>

          {isLoadingTopics ? (
            <ActivityIndicator color="#FF6B35" style={{ marginVertical: 8 }} />
          ) : topics.length === 0 ? (
            <Text className="text-gray-400 text-sm">
              No topics yet — tap "Manage Interests" to add some.
            </Text>
          ) : (
            <View className="flex-row flex-wrap gap-2">
              {topics.map((topic) => (
                <Chip key={topic} label={topic} isActive />
              ))}
            </View>
          )}
        </View>

        {/* Saved Content Section */}
        <View className="px-6 mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-sm font-bold text-gray-500 uppercase tracking-widest">
              Saved Content
            </Text>
            {savedItemsCount > 2 && (
              <Pressable onPress={() => Alert.alert("Saved Items", `Showing ${savedItemsCount} saved items.`)}>
                <Text className="text-xs font-semibold text-[#FF6B35]">View All ({savedItemsCount})</Text>
              </Pressable>
            )}
          </View>

          {savedItems.length === 0 ? (
            <View className="bg-white border border-[#E8E8E8] rounded-2xl p-6 items-center justify-center shadow-sm">
              <Bookmark size={24} color="#D1D1D1" strokeWidth={1.5} className="mb-2" />
              <Text className="text-gray-500 text-sm">No saved content yet.</Text>
            </View>
          ) : (
            <View>
              {savedItems.map((item) => (
                <ContentCard
                  key={item.id}
                  item={item}
                  onLike={() => like(item.id, item.liked)}
                  onSave={() => save(item.id, item.saved)}
                />
              ))}
            </View>
          )}
        </View>

        {/* Sign Out Action */}
        <View className="px-6">
          <Button label="Sign Out" onPress={signOut} variant="destructive" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}