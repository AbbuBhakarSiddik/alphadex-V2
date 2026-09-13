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

  const activeBg = "bg-white border-white";
  const inactiveBg = "bg-[#1A1A1A] border border-[#27272A]";
  const activeText = "text-black font-semibold text-xs";
  const inactiveText = "text-[#A1A1AA] font-medium text-xs";

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.94, { damping: 16, stiffness: 350 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 16, stiffness: 350 });
        }}
        className={`flex-row items-center justify-center px-3.5 py-1.5 rounded-full border ${
          isActive ? activeBg : inactiveBg
        }`}
      >
        {Icon && (
          <Icon
            size={13}
            color={isActive ? "#000000" : "#A1A1AA"}
            strokeWidth={2}
            style={{ marginRight: 5 }}
          />
        )}
        <Text className={isActive ? activeText : inactiveText}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}
