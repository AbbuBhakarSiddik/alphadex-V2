import React, { useRef } from "react";
import { Pressable, Text, Animated } from "react-native";

type Props = {
  label: string;
  isActive?: boolean;
  onPress?: () => void;
  icon?: React.ComponentType<any>;
};

export function Chip({ label, isActive, onPress, icon: Icon }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
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

  const activeBg = "bg-[#0F172A] border-[#0F172A]";
  const inactiveBg = "bg-white border-black/[0.06]";
  const activeText = "text-white font-semibold text-xs";
  const inactiveText = "text-[#334155] font-medium text-xs";

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        className={`flex-row items-center justify-center px-4 py-2.5 rounded-2xl border ${
          isActive ? activeBg : inactiveBg
        }`}
      >
        {Icon && (
          <Icon
            size={15}
            color={isActive ? "#FFFFFF" : "#64748B"}
            strokeWidth={1.8}
            style={{ marginRight: 6 }}
          />
        )}
        <Text className={isActive ? activeText : inactiveText}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}
