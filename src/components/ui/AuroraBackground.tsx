import React from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface AuroraBackgroundProps {
  children?: React.ReactNode;
}

export function AuroraBackground({ children }: AuroraBackgroundProps) {
  const { width, height } = useWindowDimensions();

  return (
    <View className="flex-1 bg-[#050507]">
      {/* Aurora Ambient Glow Layer */}
      <View
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
        className="overflow-hidden"
      >
        {/* Top-Right Ambient Violet Halo */}
        <LinearGradient
          colors={["rgba(139, 92, 246, 0.14)", "rgba(99, 102, 241, 0.05)", "transparent"]}
          start={{ x: 0.8, y: 0 }}
          end={{ x: 0.2, y: 0.6 }}
          style={{
            position: "absolute",
            top: -60,
            right: -60,
            width: width * 0.9,
            height: width * 0.9,
            borderRadius: 9999,
          }}
        />

        {/* Center-Left Ambient Cyan / Teal Glow */}
        <LinearGradient
          colors={["rgba(6, 182, 212, 0.08)", "rgba(16, 185, 129, 0.03)", "transparent"]}
          start={{ x: 0, y: 0.3 }}
          end={{ x: 0.8, y: 0.8 }}
          style={{
            position: "absolute",
            top: height * 0.35,
            left: -100,
            width: width * 0.85,
            height: width * 0.85,
            borderRadius: 9999,
          }}
        />

        {/* Bottom-Right Ambient Indigo Glow */}
        <LinearGradient
          colors={["rgba(99, 102, 241, 0.09)", "rgba(79, 70, 229, 0.02)", "transparent"]}
          start={{ x: 0.9, y: 0.8 }}
          end={{ x: 0.1, y: 0.2 }}
          style={{
            position: "absolute",
            bottom: -80,
            right: -80,
            width: width * 0.95,
            height: width * 0.95,
            borderRadius: 9999,
          }}
        />
      </View>

      {/* Screen Content Layer */}
      {children}
    </View>
  );
}
