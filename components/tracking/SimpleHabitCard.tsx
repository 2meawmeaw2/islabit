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
  streak?: number;
  color?: string;
  onPress?: () => void;
};

export const SimpleHabitCard: React.FC<SimpleHabitCardProps> = ({
  title,
  subtitle,
  streak,
  color = "#00AEEF",
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
        className="bg-fore flex-row-reverse justify-between items-center rounded-2xl p-4 mb-3 mx-2 relative"
      >
        {/* Streak Indicator - Top Right Corner */}
        <View className="absolute -top-1 -right-1 z-10">
          <View
            style={{ backgroundColor: "#cc552a" }}
            className=" rounded-full px-2 py-1 flex-row items-center gap-1 shadow-lg"
          >
            <Ionicons name="flame" size={12} color="#FFFFFF" />
            <Text className="text-white font-ibm-plex-arabic-medium text-xs">
              {streak}
            </Text>
          </View>
        </View>

        <View className="gap-2 flex-1 pr-3">
          {/* Title */}
          <Text className="text-text-primary font-ibm-plex-arabic-medium text-lg text-right">
            {title}
          </Text>

          {/* Subtitle with streak info */}
          {subtitle && (
            <View className="gap-1">
              <Text className="text-text-muted font-ibm-plex-arabic-light text-sm text-right">
                {subtitle}
              </Text>
            </View>
          )}
        </View>

        <View
          style={{ backgroundColor: `${color ? color : "#00AEEF"}60` }}
          className="rounded-full p-1"
        >
          <Ionicons name="chevron-back" size={18} color={color} />
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
};
