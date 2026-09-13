import React from "react";
import { View, Text, Image, Share, Alert } from "react-native";
import { Bookmark, Share2, MoreVertical, Sparkles } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import type { ScoredContentItem } from "../../features/feed/types";
import { SourceBadge } from "./SourceBadge";
import { LikeHeartButton } from "../animations/LikeHeartButton";
import { AnimatedPressable } from "../animations/AnimatedPressable";

type Props = {
  item: ScoredContentItem;
  onLike: () => void;
  onSave: () => void;
  index?: number;
};

function formatRelativeTime(dateString?: string | null): string {
  if (!dateString) return "Recent";
  try {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 4) return `${diffWeeks}w ago`;
    return `${Math.floor(diffDays / 30)}mo ago`;
  } catch {
    return "Recent";
  }
}

export function ContentCard({ item, onLike, onSave, index = 0 }: Props) {
  const isFeatured = item.score > 0.82;

  const channelName = String(
    item.metadata?.channel_title ??
    item.metadata?.author ??
    (item.source === "youtube" ? "Engineering Deep Dive" : "Tech Dispatch")
  );

  const durationBadge = String(
    item.metadata?.duration ??
    item.metadata?.read_time ??
    (item.source === "youtube" ? "14:25" : "6 min")
  );

  const initialLetter = channelName.charAt(0).toUpperCase() || "A";

  const handleShare = async () => {
    try {
      await Share.share({
        title: item.title,
        message: `${item.title} - Shared from Alphadex`,
      });
    } catch {
      // Ignored
    }
  };

  const handleOptions = () => {
    Alert.alert(channelName, item.title, [
      { text: "Not interested in this", style: "destructive" },
      { text: "Don't recommend this channel" },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const CardBody = (
    <View className="bg-[#0A0A0E] rounded-2xl overflow-hidden border border-white/10">
      {/* Top Specular Edge Highlight (Glassmorphic) */}
      <View pointerEvents="none" className="h-[1px] w-full bg-white/20" />

      {/* 16:9 Fluid Responsive Thumbnail */}
      <View className="relative w-full aspect-video bg-[#121216] overflow-hidden">
        {item.thumbnail_url ? (
          <Image
            source={{ uri: item.thumbnail_url }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full items-center justify-center bg-[#131318]">
            <Sparkles size={32} color="#383844" />
          </View>
        )}

        {/* Swiss Tag: Top-Left Featured Tag */}
        {isFeatured && (
          <View className="absolute top-2.5 left-2.5 bg-white/95 px-2 py-0.5 rounded-md flex-row items-center gap-1 shadow-md shadow-black">
            <Sparkles size={10} color="#000000" />
            <Text className="text-[10px] font-black text-black tracking-wider uppercase">
              TOP PICK
            </Text>
          </View>
        )}

        {/* Swiss Duration Badge: Bottom-Right Overlay */}
        <View className="absolute bottom-2 right-2 bg-black/85 px-2 py-0.5 rounded-md border border-white/15 backdrop-blur-md">
          <Text className="text-[11px] font-mono font-semibold text-white tracking-tight">
            {durationBadge}
          </Text>
        </View>
      </View>

      {/* Info Block (Avatar + Swiss Title & Metadata) */}
      <View className="p-3.5">
        <View className="flex-row items-start gap-3">
          {/* Creator / Channel Avatar with subtle glow ring */}
          <View className="w-9 h-9 rounded-full bg-[#181820] border border-white/20 items-center justify-center mt-0.5 shadow-sm">
            <Text className="text-white text-xs font-bold">{initialLetter}</Text>
          </View>

          {/* Title & Metadata */}
          <View className="flex-1">
            <Text
              className="text-[#F5F5F7] text-[15px] font-semibold leading-5 tracking-tight"
              numberOfLines={2}
            >
              {item.title}
            </Text>

            <View className="flex-row items-center gap-1.5 mt-1.5 flex-wrap">
              <Text className="text-[#A1A1AA] text-xs font-medium" numberOfLines={1}>
                {channelName}
              </Text>
              <Text className="text-[#52525B] text-xs">•</Text>
              <Text className="text-[#71717A] text-xs">
                {formatRelativeTime(item.published_at)}
              </Text>
            </View>
          </View>

          {/* Overflow Menu */}
          <AnimatedPressable
            onPress={handleOptions}
            className="p-1 rounded-full active:bg-white/10"
            hitSlop={10}
          >
            <MoreVertical size={16} color="#71717A" />
          </AnimatedPressable>
        </View>

        {/* Interactive Action Bar (Glassmorphic & Swiss) */}
        <View className="flex-row items-center justify-between mt-3 pt-2.5 border-t border-white/5">
          <View className="flex-row items-center gap-1 sm:gap-2">
            {/* Animated Like Heart */}
            <LikeHeartButton
              isLiked={item.liked}
              count={item.liked ? 1 : 0}
              onPress={onLike}
            />

            {/* Bookmark Action */}
            <AnimatedPressable
              onPress={onSave}
              className="flex-row items-center gap-1.5 py-1 px-2.5 rounded-full active:bg-white/10"
              hitSlop={8}
            >
              <Bookmark
                size={16}
                color={item.saved ? "#FFFFFF" : "#A1A1AA"}
                fill={item.saved ? "#FFFFFF" : "transparent"}
                strokeWidth={1.8}
              />
              <Text
                className={`text-xs font-medium ${
                  item.saved ? "text-white" : "text-[#A1A1AA]"
                }`}
              >
                {item.saved ? "Saved" : "Save"}
              </Text>
            </AnimatedPressable>

            {/* Share Action */}
            <AnimatedPressable
              onPress={handleShare}
              className="flex-row items-center gap-1.5 py-1 px-2.5 rounded-full active:bg-white/10"
              hitSlop={8}
            >
              <Share2 size={15} color="#A1A1AA" strokeWidth={1.8} />
              <Text className="text-xs font-medium text-[#A1A1AA]">Share</Text>
            </AnimatedPressable>
          </View>

          {/* Source Pill */}
          <SourceBadge source={item.source} />
        </View>
      </View>
    </View>
  );

  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index * 50, 250)).duration(300)}
      className="mb-5 w-full"
    >
      {/* Featured Aurora Glow Halo */}
      {isFeatured ? (
        <LinearGradient
          colors={["rgba(139, 92, 246, 0.4)", "rgba(6, 182, 212, 0.25)", "rgba(99, 102, 241, 0.1)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 17, padding: 1.2 }}
        >
          {CardBody}
        </LinearGradient>
      ) : (
        CardBody
      )}
    </Animated.View>
  );
}
