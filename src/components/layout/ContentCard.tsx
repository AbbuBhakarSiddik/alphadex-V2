import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import { Heart, Bookmark, Clock } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { ScoredContentItem } from "../../features/feed/types";
import { SourceBadge } from "./SourceBadge";

type Props = {
  item: ScoredContentItem;
  onLike: () => void;
  onSave: () => void;
};

export function ContentCard({ item, onLike, onSave }: Props) {
  const isFeatured = item.score > 0.8;

  // Render the core card contents
  const renderCardContent = () => (
    <View className="bg-white rounded-2xl overflow-hidden">
      {item.thumbnail_url ? (
        <Image
          source={{ uri: item.thumbnail_url }}
          className="w-full h-44 bg-gray-100"
          resizeMode="cover"
        />
      ) : null}

      <View className="p-4">
        <View className="mb-2">
          <SourceBadge source={item.source} />
        </View>

        <Text className="text-[#1A1A1A] text-base font-semibold mb-1" numberOfLines={2}>
          {item.title}
        </Text>

        {item.description ? (
          <Text className="text-gray-500 text-sm mb-3" numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}

        <View className="flex-row items-center gap-5 pt-3 border-t border-[#F5F5F5]">
          <Pressable onPress={onLike} className="flex-row items-center gap-1.5">
            <Heart
              size={18}
              color={item.liked ? "#FA5252" : "#9CA3AF"}
              fill={item.liked ? "#FA5252" : "none"}
              strokeWidth={1.5}
            />
          </Pressable>
          <Pressable onPress={onSave} className="flex-row items-center gap-1.5">
            <Bookmark
              size={18}
              color={item.saved ? "#10B981" : "#9CA3AF"}
              fill={item.saved ? "#10B981" : "none"}
              strokeWidth={1.5}
            />
          </Pressable>
          <View className="flex-row items-center gap-1 ml-auto">
            <Clock size={14} color="#9CA3AF" strokeWidth={1.5} />
            <Text className="text-xs text-gray-400">
              {String(item.metadata?.read_time ?? "5 min")}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  if (isFeatured) {
    return (
      <View className="mb-3 shadow-sm shadow-gray-200/60">
        <LinearGradient
          colors={["#FF6B35", "#F72C25"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ borderRadius: 16, padding: 2 }}
        >
          {renderCardContent()}
        </LinearGradient>
      </View>
    );
  }

  return (
    <View className="bg-white rounded-2xl mb-3 shadow-sm shadow-gray-200/60 border border-[#E8E8E8]">
      {renderCardContent()}
    </View>
  );
}
