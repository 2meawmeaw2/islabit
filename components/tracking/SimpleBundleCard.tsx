import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type SimpleBundleCardProps = {
  title: string;
  subtitle?: string;
  habitCount?: number;
  onPress?: () => void;
};

export const SimpleBundleCard: React.FC<SimpleBundleCardProps> = ({
  title,
  subtitle,
  habitCount = 0,
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
    console.log("SimpleBundleCard pressed:", { title, subtitle, habitCount });
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
        className="bg-fore rounded-2xl p-4 mb-3 mx-2"
      >
        {/* Bundle Header with Icon */}
        <View className="flex-row-reverse items-center justify-between mb-3">
          <View className="flex-row-reverse items-center">
            <View className="bg-text-brand/20 rounded-full p-2 ml-3">
              <MaterialCommunityIcons
                name="package-variant"
                size={20}
                color="#00AEEF"
              />
            </View>
            <Text className="text-text-primary font-ibm-plex-arabic-medium text-lg text-right">
              bundle color {title}
            </Text>
          </View>

          {/* Habit Count Badge */}
          <View className="bg-border-highlight/20 border border-border-highlight/40 rounded-full px-3 py-1">
            <Text className="text-border-highlight font-ibm-plex-arabic-medium text-xs">
              bundle color {habitCount} عادة
            </Text>
          </View>
        </View>

        {/* Subtitle */}
        {subtitle && (
          <Text className="text-text-muted font-ibm-plex-arabic-light text-sm text-right mb-3">
            {subtitle}
          </Text>
        )}

        {/* Bundle Preview - Small habit indicators */}
        <View className="flex-row-reverse justify-end space-x-reverse space-x-2">
          {[...Array(Math.min(habitCount, 4))].map((_, index) => (
            <View
              key={index}
              className="w-2 h-2 bg-text-brand/60 rounded-full"
            />
          ))}
          {habitCount > 4 && (
            <View className="w-2 h-2 bg-text-muted rounded-full items-center justify-center">
              <Text className="text-text-muted text-[8px] font-ibm-plex-arabic-light">
                +
              </Text>
            </View>
          )}
        </View>

        {/* Arrow indicator */}
        <View className="absolute left-4 top-1/2 -translate-y-2">
          <Ionicons name="chevron-back" size={18} color="#6C7684" />
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
};
