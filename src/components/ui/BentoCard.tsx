import React, { useRef } from "react";
import { View, Pressable, type StyleProp, type ViewStyle, Platform, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

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
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.98,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start();
  };

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
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {cardContent}
      </Pressable>
    </Animated.View>
  );
}
