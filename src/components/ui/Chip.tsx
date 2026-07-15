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

  const activeBg = "bg-primary border-primary";
  const inactiveBg = "bg-[#F5F5F5] border border-[#E8E8E8]";
  const activeText = "text-white font-medium text-sm";
  const inactiveText = "text-gray-700 font-medium text-sm";

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.95);
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
        className={`flex-row items-center justify-center px-4 py-2 rounded-full border ${
          isActive ? activeBg : inactiveBg
        }`}
      >
        {Icon && (
          <Icon
            size={14}
            color={isActive ? "#FFFFFF" : "#6B7280"}
            strokeWidth={1.5}
            style={{ marginRight: 4 }}
          />
        )}
        <Text className={isActive ? activeText : inactiveText}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}
