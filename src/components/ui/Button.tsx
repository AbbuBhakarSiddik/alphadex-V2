import React from "react";
import { Pressable, Text, ActivityIndicator, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

type Props = {
  label: string;
  onPress: () => void;
  isLoading?: boolean;
  variant?: "primary" | "secondary" | "destructive" | "outline" | "ghost";
  disabled?: boolean;
  icon?: React.ReactNode;
  size?: "default" | "sm" | "lg";
};

export function Button({
  label,
  onPress,
  isLoading,
  variant = "primary",
  disabled,
  icon,
  size = "default",
}: Props) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isPrimary = variant === "primary";
  const isSecondary = variant === "secondary";
  const isDestructive = variant === "destructive";
  const isOutline = variant === "outline";
  const isGhost = variant === "ghost";

  // Size configurations
  const sizeStyles = {
    sm: "py-2.5 px-4 rounded-xl",
    default: "py-3.5 px-6 rounded-2xl",
    lg: "py-4 px-8 rounded-3xl",
  }[size];

  const textSizes = {
    sm: "text-xs",
    default: "text-sm",
    lg: "text-base",
  }[size];

  // Container styling based on Soft Modern Bento Grid theme
  let containerStyles = "w-full flex-row items-center justify-center ";
  let textStyles = `font-semibold text-center tracking-tight ${textSizes} `;

  if (isPrimary) {
    containerStyles +=
      "bg-[#0F172A] shadow-sm active:bg-[#1E293B] border border-black/10";
    textStyles += "text-white font-bold";
  } else if (isSecondary) {
    containerStyles +=
      "bg-white border border-black/[0.06] shadow-sm active:bg-[#F8F9FA]";
    textStyles += "text-[#0F172A]";
  } else if (isDestructive) {
    containerStyles +=
      "bg-rose-50 border border-rose-200/80 active:bg-rose-100";
    textStyles += "text-rose-600";
  } else if (isOutline) {
    containerStyles +=
      "bg-transparent border border-slate-200 active:bg-slate-100/60";
    textStyles += "text-[#0F172A]";
  } else if (isGhost) {
    containerStyles += "bg-transparent active:bg-slate-100/60";
    textStyles += "text-[#64748B]";
  }

  const spinnerColor = isPrimary ? "#FFFFFF" : isDestructive ? "#E11D48" : "#0F172A";

  return (
    <Animated.View style={[animStyle]} className="w-full">
      <Pressable
        onPress={onPress}
        disabled={disabled || isLoading}
        onPressIn={() => {
          scale.value = withSpring(0.98, { damping: 16, stiffness: 350 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 16, stiffness: 350 });
        }}
        className={`${containerStyles} ${sizeStyles} ${
          disabled || isLoading ? "opacity-50" : ""
        }`}
      >
        {isLoading ? (
          <ActivityIndicator color={spinnerColor} size="small" />
        ) : (
          <View className="flex-row items-center justify-center gap-2">
            {icon && <View>{icon}</View>}
            <Text className={textStyles}>{label}</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}
