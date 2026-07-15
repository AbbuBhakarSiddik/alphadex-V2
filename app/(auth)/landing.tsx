import React from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Button } from "../../src/components/ui/Button";

export default function Landing() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={["top"]}>
      {/* Hero Illustration Section */}
      <View className="flex-[6] justify-center items-center relative px-6 overflow-hidden">
        {/* Decorative background blobs */}
        <LinearGradient
          colors={["rgba(255, 107, 53, 0.15)", "rgba(247, 44, 37, 0.15)"]}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={{
            position: "absolute",
            width: 300,
            height: 300,
            borderRadius: 150,
            top: -50,
            right: -50,
          }}
        />
        <LinearGradient
          colors={["rgba(16, 185, 129, 0.15)", "rgba(52, 211, 153, 0.15)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: "absolute",
            width: 250,
            height: 250,
            borderRadius: 125,
            bottom: -50,
            left: -50,
          }}
        />

        {/* Hero Subject & Wordmark Overlay */}
        <View className="items-center z-10">
          <View className="bg-white/80 border border-[#E8E8E8] rounded-full p-6 mb-6 shadow-sm shadow-gray-200/50">
            <Text className="text-[#FF6B35] text-7xl font-extrabold select-none">α</Text>
          </View>
          <Text className="text-4xl font-extrabold text-[#1A1A1A]">
            Alphadex
          </Text>
        </View>
      </View>

      {/* Bottom Sheet White Panel */}
      <View className="flex-[4] bg-white rounded-t-[32px] p-8 shadow-lg shadow-gray-300/50 border-t border-[#E8E8E8] justify-between pb-10">
        <View className="mb-4">
          <Text className="text-2xl font-bold text-[#1A1A1A] text-center mb-2">
            Your personalized learning feed
          </Text>
          <Text className="text-gray-500 text-sm text-center">
            Curated from the channels and topics you care about.
          </Text>
        </View>

        <View className="w-full gap-3">
          <Button label="Get Started" onPress={() => router.push("/(auth)/register")} variant="primary" />
          <Button label="I already have an account" onPress={() => router.push("/(auth)/login")} variant="secondary" />
        </View>
      </View>
    </SafeAreaView>
  );
}
