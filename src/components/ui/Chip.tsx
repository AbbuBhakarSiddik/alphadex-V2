import React from "react";
import { Pressable, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

type Props = {
  label: string;
  isActive?: boolean;
  onPress?: () => void;
  icon?: React.ComponentType<any>;
};

export function Chip({ label, isActive, onPress, icon: Icon }: Props) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const activeBg = "bg-[#0F172A] border-[#0F172A] shadow-sm";
  const inactiveBg = "bg-white border-black/[0.06] shadow-xs";
  const activeText = "text-white font-semibold text-xs";
  const inactiveText = "text-[#334155] font-medium text-xs";

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.95, { damping: 16, stiffness: 350 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 16, stiffness: 350 });
        }}
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
