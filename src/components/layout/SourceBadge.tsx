import React from "react";
import { View, Text } from "react-native";
import { CirclePlay, Newspaper } from "lucide-react-native";

type Props = {
  source: "youtube" | "news";
};

export function SourceBadge({ source }: Props) {
  if (source === "youtube") {
    return (
      <View className="flex-row items-center gap-1 bg-red-50 rounded-full px-2.5 py-1 self-start">
        <CirclePlay size={12} color="#EF4444" strokeWidth={1.5} />
        <Text className="text-xs font-semibold text-red-500 uppercase tracking-wide">
          YouTube
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-row items-center gap-1 bg-gray-100 rounded-full px-2.5 py-1 self-start">
      <Newspaper size={12} color="#6B7280" strokeWidth={1.5} />
      <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        Article
      </Text>
    </View>
  );
}
