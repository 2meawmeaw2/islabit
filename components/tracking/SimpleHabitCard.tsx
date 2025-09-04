import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type SimpleHabitCardProps = {
  title: string;
  subtitle?: string;
  onPress?: () => void;
};

export const SimpleHabitCard: React.FC<SimpleHabitCardProps> = ({
  title,
  subtitle,
  onPress,
}) => {
  // Animation for press feedback
  const pressScale = useSharedValue(1);

  const handlePressIn = () => {
    pressScale.value = withSpring(0.98, {
      mass: 0.8,
      damping: 14,
      stiffness: 180,
    });
  };

  const handlePressOut = () => {
    pressScale.value = withSpring(1, {
      mass: 0.8,
      damping: 14,
      stiffness: 180,
    });
  };

  const handlePress = () => {
    console.log("SimpleHabitCard pressed:", { title, subtitle });
    onPress?.();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  return (
    <Animated.View entering={FadeInDown.duration(250).springify()}>
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={animatedStyle}
        className="bg-fore flex-row-reverse justify-between items-center rounded-2xl p-4 mb-3 mx-2"
      >
        <View className="space-y-2">
          {/* Title */}
          <Text className="text-text-primary font-ibm-plex-arabic-medium text-lg text-right">
            {title}
          </Text>

          {/* Subtitle */}
          {subtitle && (
            <Text className="text-text-muted font-ibm-plex-arabic-light text-sm text-right">
              {subtitle}
            </Text>
          )}
        </View>
        <View className="bg-text-brand rounded-full p-1">
          <Ionicons name="chevron-back" size={18} color="#E5F8FF" />
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
};
