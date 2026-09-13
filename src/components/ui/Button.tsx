import React from "react";
import { Pressable, Text, ActivityIndicator } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

type Props = {
  label: string;
  onPress: () => void;
  isLoading?: boolean;
  variant?: "primary" | "secondary" | "destructive";
  disabled?: boolean;
};

export function Button({
  label,
  onPress,
  isLoading,
  variant = "primary",
  disabled,
}: Props) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isPrimary = variant === "primary";
  const isDestructive = variant === "destructive";

  if (isPrimary) {
    return (
      <Animated.View style={[animStyle, { borderRadius: 9999 }]} className="w-full">
        <Pressable
          onPress={onPress}
          disabled={disabled || isLoading}
          onPressIn={() => {
            scale.value = withSpring(0.96, { damping: 16, stiffness: 350 });
          }}
          onPressOut={() => {
            scale.value = withSpring(1, { damping: 16, stiffness: 350 });
          }}
          className={`w-full py-3.5 px-6 rounded-full items-center justify-center bg-white ${
            disabled || isLoading ? "opacity-50" : "active:bg-neutral-200"
          }`}
        >
          {isLoading ? (
            <ActivityIndicator color="#000000" size="small" />
          ) : (
            <Text className="text-black text-center font-bold text-sm tracking-wide">
              {label}
            </Text>
          )}
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[animStyle, { borderRadius: 9999 }]} className="w-full">
      <Pressable
        onPress={onPress}
        disabled={disabled || isLoading}
        onPressIn={() => {
          scale.value = withSpring(0.96, { damping: 16, stiffness: 350 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 16, stiffness: 350 });
        }}
        className={`w-full py-3.5 px-6 rounded-full items-center justify-center border ${
          isDestructive
            ? "bg-[#181111] border-[#3B1A1A] active:bg-[#251616]"
            : "bg-[#161616] border-[#27272A] active:bg-[#222222]"
        } ${disabled || isLoading ? "opacity-50" : ""}`}
      >
        {isLoading ? (
          <ActivityIndicator color={isDestructive ? "#F87171" : "#FFFFFF"} size="small" />
        ) : (
          <Text
            className={`${
              isDestructive ? "text-red-400" : "text-[#F5F5F7]"
            } text-center font-semibold text-sm`}
          >
            {label}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
}
