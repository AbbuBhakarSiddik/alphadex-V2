import React from "react";
import { Pressable, Text, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
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
      <Animated.View style={[animStyle, { borderRadius: 16 }]} className="w-full">
        <LinearGradient
          colors={disabled ? ["#FFB899", "#FA9995"] : ["#FF6B35", "#F72C25"]}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={{ borderRadius: 16 }}
        >
          <Pressable
            onPress={onPress}
            disabled={disabled || isLoading}
            onPressIn={() => {
              scale.value = withSpring(0.96);
            }}
            onPressOut={() => {
              scale.value = withSpring(1);
            }}
            className="w-full py-4 items-center justify-center"
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-center font-semibold text-base">
                {label}
              </Text>
            )}
          </Pressable>
        </LinearGradient>
      </Animated.View>
    );
  }

  // Destructive / Secondary Button
  return (
    <Animated.View style={[animStyle, { borderRadius: 16 }]} className="w-full">
      <Pressable
        onPress={onPress}
        disabled={disabled || isLoading}
        onPressIn={() => {
          scale.value = withSpring(0.96);
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
        className={`w-full py-4 rounded-2xl items-center justify-center bg-white border ${
          isDestructive ? "border-[#F72C25] active:bg-[#FFF5F5]" : "border-[#E8E8E8] active:border-primary active:bg-[#FFF5F0]"
        } ${disabled || isLoading ? "opacity-50" : ""}`}
      >
        {isLoading ? (
          <ActivityIndicator color={isDestructive ? "#F72C25" : "#FF6B35"} />
        ) : (
          <Text className={`${isDestructive ? "text-[#F72C25]" : "text-[#1A1A1A]"} text-center font-semibold text-base`}>
            {label}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

