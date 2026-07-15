import React from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Users, FileText, Heart, Bookmark, Share2, Activity } from "lucide-react-native";
import { StatCard } from "../../src/components/layout/StatCard";

const TOP_CONTENT = [
  { rank: 1, title: "Linear Algebra in Neural Networks", likes: 821 },
  { rank: 2, title: "Why Computers are Fundamentally Unstable", likes: 712 },
  { rank: 3, title: "The Rise of Quantum Superposition", likes: 698 },
];

const RECENT_SIGNUPS = [
  { initials: "JD", email: "john.doe@gmail.com", time: "2 mins ago" },
  { initials: "AS", email: "alice.smith@outlook.com", time: "15 mins ago" },
  { initials: "MW", email: "michael.w@university.edu", time: "1 hour ago" },
];

export default function Admin() {
  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={["top"]}>
      {/* Header */}
      <View className="px-6 pt-4 pb-2 flex-row justify-between items-center border-b border-[#E8E8E8] bg-white h-14 shadow-sm shadow-gray-100/50">
        <Text className="text-lg font-bold text-[#1A1A1A]">Admin Dashboard</Text>
        <View className="flex-row items-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-2.5 py-1">
          <View className="w-2 h-2 rounded-full bg-[#10B981]" />
          <Text className="text-xs font-semibold text-[#10B981]">Live</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 mt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* BENTO ROW 1: 2 wide cards */}
        <View className="flex-row gap-3 mb-3">
          <StatCard
            icon={Users}
            value="3,240"
            label="Total Users"
            delta="↑ 12.4% from last week"
            deltaPositive={true}
          />
          <StatCard
            icon={FileText}
            value="18,420"
            label="Total Items"
            delta="↑ 8.1% from last week"
            deltaPositive={true}
          />
        </View>

        {/* BENTO ROW 2: Full-width chart placeholder */}
        <View className="bg-white border border-[#E8E8E8] rounded-2xl p-4 shadow-sm shadow-gray-200/50 mb-3">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-sm font-bold text-gray-500 uppercase tracking-widest">
              Feed Engagement
            </Text>
            <Activity size={16} color="#6B7280" />
          </View>
          <View className="h-32 bg-[#FAFAFA] rounded-xl items-center justify-center border border-dashed border-gray-200">
            <Text className="text-gray-400 text-xs font-medium">Engagement chart visualizer stub</Text>
            <Text className="text-[10px] text-gray-400 mt-1">Coming soon: live Postgres queries</Text>
          </View>
        </View>

        {/* BENTO ROW 3: 3 small stat cards */}
        <View className="flex-row gap-3 mb-6">
          <StatCard icon={Heart} value="9,821" label="Likes" />
          <StatCard icon={Bookmark} value="4,130" label="Saves" />
          <StatCard icon={Share2} value="892" label="Shares" />
        </View>

        {/* Ranked Top Content */}
        <View className="mb-6">
          <Text className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">
            Top Content
          </Text>
          <View className="bg-white border border-[#E8E8E8] rounded-2xl p-4 shadow-sm shadow-gray-200/50 gap-3">
            {TOP_CONTENT.map((content) => (
              <View
                key={content.rank}
                className="flex-row items-center justify-between pb-3 last:pb-0 border-b border-[#F5F5F5] last:border-b-0"
              >
                <View className="flex-row items-center gap-3 flex-1 pr-4">
                  <View className="w-6 h-6 rounded-md bg-[#FFF5F0] items-center justify-center border border-[#FF6B35]/10">
                    <Text className="text-[#FF6B35] font-bold text-xs">{content.rank}</Text>
                  </View>
                  <Text className="text-[#1A1A1A] font-semibold text-sm flex-1" numberOfLines={1}>
                    {content.title}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Heart size={14} color="#FA5252" fill="#FA5252" />
                  <Text className="text-xs text-gray-500 font-semibold">{content.likes}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Signups */}
        <View className="mb-6">
          <Text className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">
            Recent Signups
          </Text>
          <View className="bg-white border border-[#E8E8E8] rounded-2xl p-4 shadow-sm shadow-gray-200/50 gap-3">
            {RECENT_SIGNUPS.map((signup, i) => (
              <View
                key={i}
                className="flex-row items-center justify-between pb-3 last:pb-0 border-b border-[#F5F5F5] last:border-b-0"
              >
                <View className="flex-row items-center gap-3">
                  <View className="w-8 h-8 rounded-full bg-[#FFF5F0] items-center justify-center border border-[#FF6B35]/10">
                    <Text className="text-[#FF6B35] font-semibold text-xs">{signup.initials}</Text>
                  </View>
                  <View>
                    <Text className="text-sm font-semibold text-[#1A1A1A]">{signup.email}</Text>
                    <Text className="text-[10px] text-gray-400">{signup.time}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
