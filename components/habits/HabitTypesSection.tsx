import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { router } from "expo-router";
import { useEffect } from "react";

// Habit Types Data - Different categories of habits
export const habitTypes = [
  {
    id: "روحاني",
    title: "عادات روحية",
    description: "صلاة، ذكر، قراءة قرآن، دعاء",
    icon: "🕌",
    color: "#7E57C2",
  },
  {
    id: "صحي",
    title: "عادات صحية",
    description: "رياضة، تغذية، نوم، ماء",
    icon: "💪",
    color: "#4CAF50",
  },
  {
    id: "تعليمي",
    title: "عادات تعليمية",
    description: "قراءة، تعلم، تخطيط، تنظيم",
    icon: "📚",
    color: "#2196F3",
  },
  {
    id: "اجتماعي",
    title: "عادات اجتماعية",
    description: "صلة رحم، مساعدة الآخرين، تواصل",
    icon: "🤝",
    color: "#FF9800",
  },
  {
    id: "مالي",
    title: "عادات مالية",
    description: "توفير، إنفاق حكيم، استثمار",
    icon: "💰",
    color: "#FFC107",
  },
  {
    id: "عائلي",
    title: "عادات عائلية",
    description: "صلة رحم، رعاية الأسرة، علاقات",
    icon: "👨‍👩‍👧‍👦",
    color: "#E91E63",
  },
];

interface HabitTypesSectionProps {
  onHabitTypePress: (typeId: string) => void;
}

const HabitTypesSection: React.FC<HabitTypesSectionProps> = ({
  onHabitTypePress,
}) => {
  // Animated value for star pulsing effect
  const starScale = useSharedValue(1);

  useEffect(() => {
    starScale.value = withRepeat(withTiming(1.1, { duration: 1500 }), -1, true);
  }, []);

  const starAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: starScale.value }],
  }));

  return (
    <Animated.View entering={FadeInUp.delay(400)} className="px-5">
      <Text className=" mr-2 font-ibm-plex-arabic-semibold text-right  text-2xl text-text-brand mb-4">
        عادات
      </Text>

      <View className="gap-3">
        {habitTypes.map((type, index) => (
          <Animated.View
            key={type.id}
            entering={FadeInUp.delay(index * 100)}
            className="mb-3"
          >
            <Pressable
              onPress={() => onHabitTypePress(type.id)}
              className="relative overflow-hidden"
              android_ripple={{ color: "#F3F4F6" }} // Replaced rgba(126, 87, 194, 0.1) with solid light gray
            >
              {/* Simple, clean background */}
              <View
                className="h-20 rounded-2xl border border-border-primary/20"
                style={{
                  backgroundColor: type.color + "08",
                }}
              >
                {/* Content */}
                <View className="flex-row-reverse items-center h-full px-5">
                  {/* Icon with subtle background */}
                  <View
                    className="w-12 h-12 rounded-xl items-center justify-center"
                    style={{ backgroundColor: type.color + "20" }}
                  >
                    <Text className="text-2xl">{type.icon}</Text>
                  </View>

                  {/* Text content */}
                  <View className="flex-1 items-end mr-4">
                    <Text className="font-ibm-plex-arabic-medium text-lg text-text-primary mb-1">
                      {type.title}
                    </Text>
                    <Text className="font-ibm-plex-arabic text-sm text-text-disabled/80 text-right">
                      {type.description}
                    </Text>
                  </View>

                  {/* Simple arrow */}
                  <Ionicons name="chevron-back" size={16} color={type.color} />
                </View>

                {/* Subtle bottom accent */}
                <View
                  className="absolute  bottom-0 left-1/2 -translate-x-[50%] right-0 h-0.5 rounded-b-2xl"
                  style={{
                    backgroundColor: type.color + "40",
                    width: "90%",
                  }}
                />
              </View>
            </Pressable>
          </Animated.View>
        ))}

        {/* View All Habits Button */}
        <Animated.View entering={FadeInUp.delay(800)} className="mt-8">
          <View className="flex-row-reverse items-center justify-center mb-4">
            <View className="w-8 h-0.5 bg-brand/30 rounded-full" />
            <Text className="font-ibm-plex-arabic-medium text-sm text-text-muted mx-3">
              اكتشف المزيد
            </Text>
            <View className="w-8 h-0.5 bg-brand/30 rounded-full" />
          </View>
          <Pressable
            onPress={() => router.push("/home/explore-habits")}
            className="w-full py-4 px-6 rounded-2xl border-2 border-dashed border-brand/40 active:scale-95 relative overflow-hidden"
            style={{ backgroundColor: "rgba(0, 174, 239, 0.05)" }}
            android_ripple={{ color: "rgba(0, 174, 239, 0.1)" }}
          >
            {/* Subtle background pattern */}
            <View className="absolute inset-0 opacity-10">
              <View
                className="w-full h-full"
                style={{
                  backgroundColor: "#00AEEF",
                  opacity: 0.1,
                }}
              />
            </View>

            <View className="flex-row-reverse items-center justify-center relative z-10">
              <Animated.View style={starAnimatedStyle}>
                <Ionicons
                  name="star"
                  size={20}
                  color="#00AEEF"
                  className="ml-2"
                />
              </Animated.View>
              <Text className="font-ibm-plex-arabic-semibold text-base text-brand text-center">
                عرض جميع العادات
              </Text>
            </View>
            <Text className="font-ibm-plex-arabic text-sm text-text-muted text-center mt-1 relative z-10">
              اكتشف المزيد من العادات المفيدة
            </Text>

            {/* Subtle glow effect */}
            <View className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-brand/60 to-transparent" />

            {/* Arrow indicator */}
            <View className="absolute top-1/2 left-4 -translate-y-1/2">
              <Ionicons name="chevron-back" size={16} color="#00AEEF" />
            </View>
          </Pressable>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

export default HabitTypesSection;
