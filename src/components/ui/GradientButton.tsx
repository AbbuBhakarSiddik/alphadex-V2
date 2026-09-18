import React, { useRef } from "react";
import { Pressable, Text, ActivityIndicator, Animated } from "react-native";

type Props = {
  label: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
};

export function GradientButton({ label, onPress, isLoading, disabled }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
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

  return (
    <Animated.View style={{ transform: [{ scale }], borderRadius: 9999, width: "100%" }}>
      <Pressable
        onPress={onPress}
        disabled={disabled || isLoading}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
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
