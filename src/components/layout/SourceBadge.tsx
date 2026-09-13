import React from "react";
import { View, Text } from "react-native";
import { CirclePlay, Newspaper } from "lucide-react-native";

type Props = {
  source: "youtube" | "news";
};

export function SourceBadge({ source }: Props) {
  if (source === "youtube") {
    return (
      <View className="flex-row items-center gap-1.5 bg-[#1F1212] border border-[#3B1A1A] rounded-full px-2.5 py-0.5 self-start">
        <CirclePlay size={11} color="#EF4444" strokeWidth={2} />
        <Text className="text-[10px] font-semibold text-red-400 uppercase tracking-wider">
          YouTube
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-row items-center gap-1.5 bg-[#1A1A1A] border border-[#27272A] rounded-full px-2.5 py-0.5 self-start">
      <Newspaper size={11} color="#A1A1AA" strokeWidth={2} />
      <Text className="text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-wider">
        Article
      </Text>
    </View>
  );
}
