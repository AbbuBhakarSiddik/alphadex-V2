import React from "react";
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface AnimatedPressableProps extends PressableProps {
  scaleTo?: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export function AnimatedPressable({
  scaleTo = 0.96,
  style,
  onPressIn,
  onPressOut,
  children,
  ...props
}: AnimatedPressableProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = (e: any) => {
    scale.value = withSpring(scaleTo, {
      damping: 18,
      stiffness: 350,
      mass: 0.5,
    });
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    scale.value = withSpring(1, {
      damping: 18,
      stiffness: 350,
      mass: 0.5,
    });
    onPressOut?.(e);
  };

  return (
    <Pressable
      {...props}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={style}
    >
      <Animated.View style={animatedStyle}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
