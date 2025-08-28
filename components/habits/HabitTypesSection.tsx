import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

// Habit Types Data - Different categories of habits
export const habitTypes = [
  {
    id: "spiritual",
    title: "عادات روحية",
    description: "صلاة، ذكر، قراءة قرآن، دعاء",
    icon: "🕌",
    color: "#7E57C2",
  },
  {
    id: "health",
    title: "عادات صحية",
    description: "رياضة، تغذية، نوم، ماء",
    icon: "💪",
    color: "#4CAF50",
  },
  {
    id: "productivity",
    title: "عادات إنتاجية",
    description: "قراءة، تعلم، تخطيط، تنظيم",
    icon: "📚",
    color: "#2196F3",
  },
  {
    id: "social",
    title: "عادات اجتماعية",
    description: "صلة رحم، مساعدة الآخرين، تواصل",
    icon: "🤝",
    color: "#FF9800",
  },
  {
    id: "mindfulness",
    title: "عادات ذهنية",
    description: "تأمل، تفكر، صمت، استرخاء",
    icon: "🧘",
    color: "#9C27B0",
  },
  {
    id: "financial",
    title: "عادات مالية",
    description: "توفير، إنفاق حكيم، استثمار",
    icon: "💰",
    color: "#FFC107",
  },
];

interface HabitTypesSectionProps {
  onHabitTypePress: (typeId: string) => void;
}

const HabitTypesSection: React.FC<HabitTypesSectionProps> = ({
  onHabitTypePress,
}) => {
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
      </View>
    </Animated.View>
  );
};

export default HabitTypesSection;
