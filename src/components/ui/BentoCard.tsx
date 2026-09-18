import React from "react";
import { View, Pressable, type StyleProp, type ViewStyle, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

export type BentoVariant =
  | "default"
  | "lavender"
  | "peach"
  | "mint"
  | "sky"
  | "rose";

interface BentoCardProps {
  children: React.ReactNode;
  variant?: BentoVariant;
  className?: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  disabled?: boolean;
}

const GRADIENT_MAP: Record<BentoVariant, [string, string] | null> = {
  default: null,
  lavender: ["rgba(237, 233, 254, 0.45)", "rgba(224, 231, 255, 0.25)"],
  peach: ["rgba(255, 237, 213, 0.50)", "rgba(254, 243, 199, 0.30)"],
  mint: ["rgba(236, 253, 245, 0.55)", "rgba(204, 251, 241, 0.30)"],
  sky: ["rgba(238, 242, 255, 0.60)", "rgba(224, 231, 255, 0.30)"],
  rose: ["rgba(255, 228, 230, 0.50)", "rgba(252, 231, 243, 0.30)"],
};

export function BentoCard({
  children,
  variant = "default",
  className = "",
  style,
  onPress,
  disabled,
}: BentoCardProps) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const gradientColors = GRADIENT_MAP[variant];

  const cardContent = (
    <View
      className={`relative overflow-hidden bg-white rounded-3xl border border-black/[0.04] ${className}`}
      style={[
        Platform.select({
          ios: {
            shadowColor: "#0F172A",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.04,
            shadowRadius: 12,
          },
          android: {
            elevation: 2,
          },
        }),
        style,
      ]}
    >
      {gradientColors && (
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
          pointerEvents="none"
        />
      )}
      {children}
    </View>
  );

  if (!onPress) {
    return cardContent;
  }

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        onPressIn={() => {
          scale.value = withSpring(0.98, { damping: 16, stiffness: 350 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 16, stiffness: 350 });
        }}
      >
        {cardContent}
      </Pressable>
    </Animated.View>
  );
}
