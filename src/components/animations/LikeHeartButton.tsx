import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Heart } from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import { AnimatedPressable } from "./AnimatedPressable";

interface LikeHeartButtonProps {
  isLiked: boolean;
  count?: number;
  onPress: () => void;
  size?: number;
}

export function LikeHeartButton({
  isLiked,
  count,
  onPress,
  size = 18,
}: LikeHeartButtonProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isLiked) {
      scale.value = withSequence(
        withSpring(1.35, { damping: 10, stiffness: 400 }),
        withSpring(1, { damping: 14, stiffness: 300 })
      );
    } else {
      scale.value = withSpring(1);
    }
  }, [isLiked]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      className="flex-row items-center gap-1.5 py-1 px-2 rounded-full active:bg-[#1A1A1A]"
      hitSlop={6}
    >
      <Animated.View style={animatedStyle}>
        <Heart
          size={size}
          color={isLiked ? "#FFFFFF" : "#A1A1AA"}
          fill={isLiked ? "#FFFFFF" : "transparent"}
          strokeWidth={1.8}
        />
      </Animated.View>
      {count !== undefined && count > 0 && (
        <Text
          className={`text-xs font-medium ${
            isLiked ? "text-white" : "text-[#A1A1AA]"
          }`}
        >
          {count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count}
        </Text>
      )}
    </AnimatedPressable>
  );
}
