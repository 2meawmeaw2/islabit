import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
} from "react-native-reanimated";
import { BundleCategory } from "@/lib/bundles";
import { LinearGradient } from "expo-linear-gradient";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface SimpleBundleCardProps {
  title: string;
  subtitle?: string;
  habitCount?: number;
  color?: string;
  category?: BundleCategory;
  onPress?: () => void;
}

export const SimpleBundleCard: React.FC<SimpleBundleCardProps> = ({
  title,
  subtitle,
  habitCount = 0,
  color,
  category,
  onPress,
}) => {
  // Animation for press feedback
  console.log("color", color);
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

  const gradientColors = [color + "05", color + "10", color + "30"] as const;

  return (
    <Animated.View entering={FadeInDown.duration(250).springify()}>
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={animatedStyle}
        className="bg-fore rounded-2xl p-4 mb-3 mx-2 overflow-hidden"
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="absolute top-0 left-0 right-0 bottom-0"
        />

        <View className="flex-row-reverse items-center justify-between mb-3">
          <View className="flex-row-reverse items-center flex-1">
            <View className="flex-1">
              <Text className="text-text-primary font-ibm-plex-arabic-medium text-lg text-right">
                {title}
              </Text>
            </View>
          </View>
        </View>

        {/* Subtitle */}
        {subtitle && (
          <Text className="text-text-muted font-ibm-plex-arabic-light text-sm text-right ">
            {subtitle}
          </Text>
        )}

        {/* Arrow indicator */}
        <View
          className="absolute left-4 top-1/2 -translate-y-2 rounded-full p-2"
          style={{ backgroundColor: `${color}15` }}
        >
          <MaterialCommunityIcons name="chevron-left" size={20} color={color} />
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
};
