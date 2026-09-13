import React from "react";
import { View, StyleSheet, type StyleProp, type ViewStyle, Platform } from "react-native";
import { BlurView } from "expo-blur";

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
  intensity?: number;
  hasSpecularBorder?: boolean;
}

export function GlassCard({
  children,
  style,
  className = "",
  intensity = 35,
  hasSpecularBorder = true,
}: GlassCardProps) {
  return (
    <View
      className={`rounded-2xl overflow-hidden border border-white/10 ${className}`}
      style={[
        {
          backgroundColor: Platform.OS === "ios" ? "rgba(18, 18, 22, 0.45)" : "rgba(18, 18, 22, 0.85)",
        },
        style,
      ]}
    >
      <BlurView
        intensity={intensity}
        tint="dark"
        style={StyleSheet.absoluteFill}
      />
      {hasSpecularBorder && (
        <View
          pointerEvents="none"
          className="absolute top-0 left-0 right-0 h-[1px] bg-white/20"
        />
      )}
      {children}
    </View>
  );
}
