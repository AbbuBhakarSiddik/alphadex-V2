import React from "react";
import { View, Text, Image, Linking } from "react-native";
import { CirclePlay, Newspaper, FileText, ExternalLink } from "lucide-react-native";
import type { SearchResult } from "../../features/search/types";
import { AnimatedPressable } from "../animations/AnimatedPressable";

type Props = { item: SearchResult };

export function SearchResultCard({ item }: Props) {
  const isVideo = item.type === "youtube";
  const isPaper = item.type === "paper";

  return (
    <AnimatedPressable
      onPress={() => Linking.openURL(item.url)}
      className="bg-[#0A0A0E] rounded-2xl mb-4 overflow-hidden border border-white/10 active:border-white/25"
    >
      {/* Specular border highlight */}
      <View pointerEvents="none" className="h-[1px] w-full bg-white/15" />

      {item.thumbnailUrl ? (
        <View className="relative w-full aspect-video bg-[#121216]">
          <Image
            source={{ uri: item.thumbnailUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
          <View className="absolute bottom-2 right-2 bg-black/85 px-2 py-0.5 rounded-md border border-white/15 backdrop-blur-md">
            <Text className="text-[10px] font-mono font-semibold text-white tracking-wider">
              {isVideo ? "VIDEO // 4K" : isPaper ? "ARXIV // PDF" : "ARTICLE"}
            </Text>
          </View>
        </View>
      ) : null}

      <View className="p-3.5">
        <View className="flex-row items-center justify-between mb-1.5">
          <View className="flex-row items-center gap-1.5">
            {isVideo ? (
              <CirclePlay size={13} color="#EF4444" strokeWidth={2} />
            ) : isPaper ? (
              <FileText size={13} color="#A78BFA" strokeWidth={2} />
            ) : (
              <Newspaper size={13} color="#A1A1AA" strokeWidth={2} />
            )}
            <Text className="text-[#A1A1AA] text-[10px] font-mono font-bold uppercase tracking-wider">
              {item.type === "paper" ? "Research Paper" : item.type}
            </Text>
          </View>
          <ExternalLink size={13} color="#71717A" />
        </View>

        <Text
          className="text-[#F5F5F7] text-sm font-semibold leading-snug tracking-tight mb-1"
          numberOfLines={2}
        >
          {item.title}
        </Text>

        {item.description ? (
          <Text className="text-[#71717A] text-xs leading-relaxed" numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
      </View>
    </AnimatedPressable>
  );
}