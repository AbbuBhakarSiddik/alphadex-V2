import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Alert, ActivityIndicator, Image } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Settings,
  Bell,
  Bookmark,
  SlidersHorizontal,
  CalendarDays,
  HardDrive,
  ChevronRight,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/features/auth/hooks";
import { useFeed } from "../../src/features/feed/hooks";
import { getUserInterests } from "../../src/features/interests/api";
import { useSchedule } from "../../src/features/schedule/hooks";
import { useStorage } from "../../src/features/storage/hooks";
import { Button } from "../../src/components/ui/Button";
import { Chip } from "../../src/components/ui/Chip";
import { ContentCard } from "../../src/components/layout/ContentCard";
import { GlassCard } from "../../src/components/ui/GlassCard";
import { AuroraBackground } from "../../src/components/ui/AuroraBackground";
import { AnimatedPressable } from "../../src/components/animations/AnimatedPressable";

const TOTAL_QUOTA_BYTES = 5 * 1024 * 1024 * 1024; // 5 GB

function formatStorageSize(bytes: number): string {
  if (bytes <= 0) return "0 GB";
  const gb = bytes / (1024 * 1024 * 1024);
  if (gb >= 0.05) {
    return `${gb.toFixed(2)} GB`;
  }
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

export default function Profile() {
  const { profile, session, signOut } = useAuth();
  const { items, like, save } = useFeed();
  const { upcomingThisWeekCount } = useSchedule();
  const { totalUsedBytes } = useStorage();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [topics, setTopics] = useState<string[]>([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const result = await getUserInterests();
        if (isMounted) setTopics(result);
      } catch {
        // Non-critical
      } finally {
        if (isMounted) setIsLoadingTopics(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const savedItems = items.filter((item) => item.saved).slice(0, 3);
  const likedItemsCount = items.filter((item) => item.liked).length;
  const savedItemsCount = items.filter((item) => item.saved).length;

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : session?.user?.email?.[0]?.toUpperCase() ?? "A";

  const bottomPadding = (insets.bottom > 0 ? insets.bottom : 8) + 72;

  const storagePercent = Math.min(
    100,
    Math.max(0, (totalUsedBytes / TOTAL_QUOTA_BYTES) * 100)
  );

  return (
    <AuroraBackground>
      <SafeAreaView className="flex-1" edges={["top"]}>
        {/* Swiss Minimalist Header */}
        <View className="h-13 flex-row justify-between items-center px-5 border-b border-white/10 bg-black/40 backdrop-blur-md">
          <View className="flex-row items-center gap-2">
            <View className="w-1.5 h-1.5 rounded-full bg-violet-400 shadow-sm shadow-violet-400" />
            <Text className="text-white text-base font-bold tracking-tight">Identity</Text>
            <Text className="text-[#52525B] text-[11px] font-mono font-medium ml-1">
              05 // CURATION
            </Text>
          </View>

          <View className="flex-row items-center gap-2">
            <AnimatedPressable
              onPress={() => Alert.alert("Notifications", "No new notifications.")}
              className="w-8 h-8 rounded-full bg-white/5 border border-white/10 items-center justify-center"
              hitSlop={8}
            >
              <Bell size={15} color="#A1A1AA" strokeWidth={1.8} />
            </AnimatedPressable>
            <AnimatedPressable
              onPress={() => Alert.alert("Settings", "App preferences (stub).")}
              className="w-8 h-8 rounded-full bg-white/5 border border-white/10 items-center justify-center"
              hitSlop={8}
            >
              <Settings size={15} color="#A1A1AA" strokeWidth={1.8} />
            </AnimatedPressable>
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: bottomPadding }}
        >
          {/* Profile Card */}
          <View className="items-center px-6 mt-5 mb-5">
            <View className="w-20 h-20 rounded-full bg-[#181822] border-2 border-white/25 items-center justify-center mb-3 shadow-lg shadow-violet-500/20">
              <Text className="text-white text-2xl font-black">{initials}</Text>
            </View>
            <Text className="text-xl font-bold text-white tracking-tight">
              {profile?.full_name ?? "Alphadex Learner"}
            </Text>
            <Text className="text-[#71717A] text-xs font-mono mt-0.5">
              {session?.user?.email}
            </Text>
          </View>

          {/* Frosted Glass Stats Row */}
          <View className="mx-4 mb-6">
            <GlassCard className="p-4">
              <View className="flex-row items-center">
                <View className="flex-1 items-center border-r border-white/10">
                  <Text className="text-xl font-black text-white">{savedItemsCount}</Text>
                  <Text className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider mt-0.5">
                    Saved
                  </Text>
                </View>
                <View className="flex-1 items-center border-r border-white/10">
                  <Text className="text-xl font-black text-white">{likedItemsCount}</Text>
                  <Text className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider mt-0.5">
                    Liked
                  </Text>
                </View>
                <View className="flex-1 items-center">
                  <Text className="text-xl font-black text-white">14</Text>
                  <Text className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider mt-0.5">
                    Day Streak
                  </Text>
                </View>
              </View>
            </GlassCard>
          </View>

          {/* Learner Hub Section */}
          <View className="px-4 mb-6">
            <Text className="text-[11px] font-mono font-bold text-[#71717A] uppercase tracking-wider mb-3">
              LEARNER HUB
            </Text>

            <View className="gap-3">
              {/* Card 1: Study Topics / Interests */}
              <AnimatedPressable
                onPress={() => router.push("/manage-interests")}
                className="bg-[#0D0D11] border border-white/10 rounded-2xl p-4 active:border-white/20"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1 mr-2">
                    <View className="w-10 h-10 rounded-xl bg-[#FF6B35]/15 border border-[#FF6B35]/30 items-center justify-center mr-3">
                      <SlidersHorizontal size={18} color="#FF6B35" strokeWidth={2} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-white tracking-tight">
                        Curated Topics
                      </Text>
                      <Text className="text-xs text-[#A1A1AA] mt-0.5">
                        {isLoadingTopics
                          ? "Loading topics..."
                          : `${topics.length} topic${topics.length === 1 ? "" : "s"} configured`}
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={18} color="#71717A" />
                </View>

                {topics.length > 0 && (
                  <View className="flex-row flex-wrap gap-1.5 mt-3 pt-3 border-t border-white/5">
                    {topics.slice(0, 4).map((topic) => (
                      <View
                        key={topic}
                        className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10"
                      >
                        <Text className="text-[11px] font-medium text-white/90">
                          {topic}
                        </Text>
                      </View>
                    ))}
                    {topics.length > 4 && (
                      <View className="px-2 py-0.5 rounded-full bg-white/5">
                        <Text className="text-[11px] font-mono text-[#71717A]">
                          +{topics.length - 4} more
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </AnimatedPressable>

              {/* Card 2: Study Schedule */}
              <AnimatedPressable
                onPress={() => router.push("/study-schedule")}
                className="bg-[#0D0D11] border border-white/10 rounded-2xl p-4 active:border-white/20"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1 mr-2">
                    <View className="w-10 h-10 rounded-xl bg-[#FF6B35]/15 border border-[#FF6B35]/30 items-center justify-center mr-3">
                      <CalendarDays size={18} color="#FF6B35" strokeWidth={2} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-white tracking-tight">
                        Study Schedule
                      </Text>
                      <Text className="text-xs text-[#A1A1AA] mt-0.5">
                        {upcomingThisWeekCount > 0
                          ? `${upcomingThisWeekCount} session${upcomingThisWeekCount === 1 ? "" : "s"} planned this week`
                          : "No sessions planned this week"}
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={18} color="#71717A" />
                </View>
              </AnimatedPressable>

              {/* Card 3: Cloud Storage */}
              <AnimatedPressable
                onPress={() => router.push("/my-storage")}
                className="bg-[#0D0D11] border border-white/10 rounded-2xl p-4 active:border-white/20"
              >
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center flex-1 mr-2">
                    <View className="w-10 h-10 rounded-xl bg-[#FF6B35]/15 border border-[#FF6B35]/30 items-center justify-center mr-3">
                      <HardDrive size={18} color="#FF6B35" strokeWidth={2} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-white tracking-tight">
                        Cloud Storage
                      </Text>
                      <Text className="text-xs font-mono text-[#A1A1AA] mt-0.5">
                        {formatStorageSize(totalUsedBytes)} of 5.0 GB used
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={18} color="#71717A" />
                </View>

                {/* Mini Storage Usage Bar */}
                <View className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mt-1">
                  <View
                    className="h-full rounded-full bg-[#FF6B35]"
                    style={{ width: `${Math.max(storagePercent, 2)}%` }}
                  />
                </View>
              </AnimatedPressable>
            </View>
          </View>

          {/* Saved Content Section */}
          <View className="px-4 mb-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-[11px] font-mono font-bold text-[#71717A] uppercase tracking-wider">
                SAVED ARCHIVE ({savedItemsCount})
              </Text>
            </View>

            {savedItems.length === 0 ? (
              <View className="bg-[#0A0A0E] border border-white/10 rounded-2xl p-5 items-center justify-center">
                <Bookmark size={22} color="#383844" strokeWidth={1.5} className="mb-2" />
                <Text className="text-[#71717A] text-xs">No saved content in archive.</Text>
              </View>
            ) : (
              <View>
                {savedItems.map((item, idx) => (
                  <ContentCard
                    key={item.id}
                    item={item}
                    index={idx}
                    onLike={() => like(item.id, item.liked)}
                    onSave={() => save(item.id, item.saved)}
                  />
                ))}
              </View>
            )}
          </View>

          {/* Sign Out Action */}
          <View className="px-4">
            <Button label="Sign Out" onPress={signOut} variant="destructive" />
          </View>

          {/* App Branding Footer */}
          <View className="items-center mt-6 mb-4">
            <Image
              source={require("../../assets/logo.png")}
              style={{ width: 36, height: 36, borderRadius: 10, marginBottom: 8 }}
              resizeMode="cover"
            />
            <Text className="text-zinc-500 text-xs font-mono font-medium">Alphadex v1.0.0</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </AuroraBackground>
  );
}