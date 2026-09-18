import React from "react";
import { View, Text, Image, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Flame, Sparkles, BookOpenCheck, ArrowRight } from "lucide-react-native";
import { Button } from "../../src/components/ui/Button";

const { width } = Dimensions.get("window");

export default function Landing() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#F9F9FB]" edges={["top", "bottom"]}>
      {/* Ambient Pastel Background Glows */}
      <LinearGradient
        colors={["rgba(237, 233, 254, 0.7)", "rgba(224, 231, 255, 0.3)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          position: "absolute",
          top: -80,
          right: -60,
          width: width * 0.75,
          height: width * 0.75,
          borderRadius: 9999,
          opacity: 0.8,
        }}
        pointerEvents="none"
      />
      <LinearGradient
        colors={["rgba(255, 237, 213, 0.6)", "rgba(254, 243, 199, 0.25)"]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{
          position: "absolute",
          top: 180,
          left: -80,
          width: width * 0.65,
          height: width * 0.65,
          borderRadius: 9999,
          opacity: 0.7,
        }}
        pointerEvents="none"
      />

      <View className="flex-1 px-6 justify-between pt-4 pb-4">
        {/* Top Micro-Pill Floating Badges */}
        <View className="flex-row items-center justify-between pt-2">
          {/* Streak Badge Pill */}
          <View className="flex-row items-center bg-white/90 border border-black/[0.04] px-3.5 py-1.5 rounded-full shadow-xs">
            <Flame size={14} color="#F97316" fill="#F97316" />
            <Text className="ml-1.5 text-xs font-bold text-[#0F172A]">
              12 Days Streak
            </Text>
          </View>

          {/* XP Badge Pill */}
          <View className="flex-row items-center bg-white/90 border border-black/[0.04] px-3.5 py-1.5 rounded-full shadow-xs">
            <Sparkles size={13} color="#6366F1" />
            <Text className="ml-1.5 text-xs font-semibold text-[#0F172A]">
              5,240 XP
            </Text>
          </View>
        </View>

        {/* Hero Bento Tile Showcase */}
        <View className="items-center my-auto">
          {/* Main Logo Card */}
          <View className="relative bg-white rounded-3xl border border-black/[0.04] p-5 shadow-sm mb-6 items-center">
            <LinearGradient
              colors={["rgba(237, 233, 254, 0.4)", "rgba(255, 237, 213, 0.3)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: 24,
              }}
            />
            <Image
              source={require("../../assets/logo.png")}
              style={{ width: 84, height: 84, borderRadius: 20 }}
              resizeMode="cover"
            />
          </View>

          {/* Title & Tagline */}
          <Text className="text-3xl font-extrabold text-[#0F172A] tracking-tight text-center">
            Alphadex
          </Text>
          <Text className="text-sm font-medium text-[#64748B] text-center mt-1.5 max-w-[260px]">
            Soft Modern Bento Learning for curious minds
          </Text>

          {/* Micro Bento Preview Badges */}
          <View className="flex-row gap-2.5 mt-6 w-full max-w-[320px]">
            {/* Flashcard Tile Preview */}
            <View className="flex-1 bg-white/95 rounded-2xl p-3 border border-black/[0.04] shadow-xs">
              <View className="flex-row items-center justify-between mb-1">
                <View className="w-6 h-6 rounded-lg bg-indigo-50 items-center justify-center">
                  <BookOpenCheck size={13} color="#4F46E5" />
                </View>
                <Text className="text-[10px] font-bold text-indigo-600">Active</Text>
              </View>
              <Text className="text-[11px] font-bold text-[#0F172A]">Recall Hub</Text>
              <Text className="text-[10px] text-[#64748B]">18 cards due</Text>
            </View>

            {/* Habit / Streak Preview */}
            <View className="flex-1 bg-white/95 rounded-2xl p-3 border border-black/[0.04] shadow-xs">
              <View className="flex-row items-center justify-between mb-1">
                <View className="w-6 h-6 rounded-lg bg-emerald-50 items-center justify-center">
                  <Flame size={13} color="#10B981" />
                </View>
                <Text className="text-[10px] font-bold text-emerald-600">Daily</Text>
              </View>
              <Text className="text-[11px] font-bold text-[#0F172A]">Habit Tracker</Text>
              <Text className="text-[10px] text-[#64748B]">Weekly 100%</Text>
            </View>
          </View>
        </View>

        {/* Bottom Bento Action Card */}
        <View className="bg-white rounded-3xl p-6 border border-black/[0.04] shadow-sm">
          <Text className="text-xl font-bold text-[#0F172A] text-center mb-1.5">
            Master Any Topic Fast
          </Text>
          <Text className="text-xs text-[#64748B] text-center mb-6 leading-relaxed">
            Curated lessons, smart spaced repetition, and real-time community challenges.
          </Text>

          <View className="w-full gap-3">
            <Button
              label="Get Started"
              onPress={() => router.push("/(auth)/register")}
              variant="primary"
              icon={<ArrowRight size={16} color="#FFFFFF" strokeWidth={2.2} />}
            />
            <Button
              label="I already have an account"
              onPress={() => router.push("/(auth)/login")}
              variant="secondary"
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
