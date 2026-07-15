import { LinearGradient } from "expo-linear-gradient";
import { Pressable, Text, ActivityIndicator } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

type Props = {
  label: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
};

export function GradientButton({ label, onPress, isLoading, disabled }: Props) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <Animated.View style={[animStyle, { borderRadius: 16 }]} className="w-full">
      <LinearGradient
        colors={disabled ? ["#FFB899", "#FA9995"] : ["#FF6B35", "#F72C25"]}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={{ borderRadius: 16 }}
      >
        <Pressable
          onPress={onPress}
          disabled={disabled || isLoading}
          onPressIn={() => { scale.value = withSpring(0.96); }}
          onPressOut={() => { scale.value = withSpring(1); }}
          className="py-4 items-center justify-center w-full"
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-semibold text-base">{label}</Text>
          )}
        </Pressable>
      </LinearGradient>
    </Animated.View>
  );
}
