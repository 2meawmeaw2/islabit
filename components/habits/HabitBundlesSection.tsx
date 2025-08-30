import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Category } from "@/types/habit";
import { DEFAULT_CATEGORIES } from "@/types/habit";
import { router } from "expo-router";

// Habit Bundle Data - Collections of related habits
export const habitBundles = [
  {
    id: "1",
    title: "اقل القليل",
    subtitle: "عادات بسيطة لتغيير كبير",
    description:
      "استيقظ مبكراً، مارس حركة خفيفة، وتناول وجبة صحية بسيطة. هذه الرحلة تركز على القليل المستمر الذي يعيد ضبط يومك بلطف ويقوّي هويتك عبر خطوات يسهل المحافظة عليها بإيقاعٍ يتوافق مع أوقات الصلاة.",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop",
    color: "#22C55E",
    category: DEFAULT_CATEGORIES[1], // Health category
    habits: [
      {
        title: "استيقاظ مبكر",
        subtitle: "بداية يوم مباركة",
        description: "النهوض قبل الفجر للاستفادة من بركة الوقت.",
        emoji: "🌅",
        priority: "high",
        relatedDays: [0, 1, 2, 3, 4, 5, 6],
        relatedSalat: ["fajr"],
      },
      {
        title: "رياضة خفيفة",
        subtitle: "تنشيط الجسم",
        description: "تمارين بسيطة بعد الفجر لتحريك الدورة الدموية.",
        emoji: "💪",
        priority: "medium",
        relatedDays: [1, 3, 5],
        relatedSalat: ["fajr", "asr"],
      },
      {
        title: "تغذية صحية",
        subtitle: "وقود متوازن",
        description: "اختيار وجبات متوازنة وشرب الماء الكافي.",
        emoji: "🥗",
        priority: "medium",
        relatedDays: [0, 1, 2, 3, 4, 5, 6],
        relatedSalat: ["dhuhr"],
      },
    ],
    // new dummy fields for single bundle page
    benefits: [
      "طاقة أفضل طوال اليوم",
      "تحسن المزاج والتركيز",
      "تقوية الهوية الإيمانية بالبدء من الفجر",
      "اتساق يومي سهل الاستمرار",
    ],

    comments: [
      {
        id: "c1",
        user: "خالد",
        text: "بدأت بهذه الرحلة وكانت خطوة موفّقة.",
      },
      {
        id: "c2",
        user: "هبة",
        text: "أحببت بساطة المهام، سهل الالتزام.",
      },
    ],
  },
  {
    id: "2",
    title: "روتين الصباح",
    subtitle: "ابدأ يومك بقوة",
    description:
      "ابدأ يومك بالفجر، أذكار قصيرة، تلاوة يسيرة، وتمرين خفيف. روتين متوازن يمنحك صفاءً مبكراً ويثبت الانضباط تدريجياً حتى يصبح عادةً محببة تدفع يومك كله للأمام.",
    image: "https://images.unsplash.com/third bundle",
    color: "#0EA5E9",
    category: DEFAULT_CATEGORIES[0], // Spiritual category
    habits: [
      {
        title: "صلاة الفجر",
        subtitle: "أول اليوم",
        description: "أداء صلاة الفجر في وقتها ومع الجماعة إن أمكن.",
        emoji: "🕌",
        priority: "high",
        relatedDays: [0, 1, 2, 3, 4, 5, 6],
        relatedSalat: ["fajr"],
      },
      {
        title: "أذكار الصباح",
        subtitle: "تحصين اليوم",
        description: "قراءة أذكار الصباح بعد الفجر.",
        emoji: "📿",
        priority: "medium",
        relatedDays: [0, 1, 2, 3, 4, 5, 6],
        relatedSalat: ["fajr"],
      },
      {
        title: "قراءة قرآن",
        subtitle: "ورد يومي",
        description: "تلاوة صفحات يومية بتدبر.",
        emoji: "📖",
        priority: "medium",
        relatedDays: [0, 1, 2, 3, 4, 5, 6],
        relatedSalat: ["fajr", "isha"],
      },
      {
        title: "تمرين",
        subtitle: "نشاط بدني",
        description: "تمارين بسيطة للياقة أساسية.",
        emoji: "🏃‍♂️",
        priority: "low",
        relatedDays: [1, 3, 5],
        relatedSalat: ["fajr"],
      },
    ],
    benefits: [
      "صفاء وطمأنينة مع بداية اليوم",
      "تحسين الانضباط والالتزام",
      "لياقة أساسية خفيفة",
    ],

    comments: [
      {
        id: "c1",
        user: "سارة",
        text: "روتين الصباح هذا غيّر يومي للأفضل.",
      },
    ],
  },
  {
    id: "3",
    title: "صحة العقل",
    subtitle: "عقل سليم في جسم سليم",
    description:
      "تنفّس بوعي لبضع دقائق، اقرأ شيئاً نافعاً، اكتب سطراً، وأعد الاتصال بنفسك. رحلة عملية تعزّز هدوء العقل وترفع التركيز عبر خطوات قصيرة لكنها منتظمة وسهلة الالتزام.",
    image:
      "data:image/jpeg;base64,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",
    color: "#A855F7",
    category: DEFAULT_CATEGORIES[2], // Educational category
    habits: [
      {
        title: "تأمل يومي",
        subtitle: "تفكر وطمأنينة",
        description: "دقائق من التفكر في آيات الله وخلقه.",
        emoji: "🧘‍♂️",
        priority: "medium",
        relatedDays: [0, 2, 4, 6],
        relatedSalat: ["fajr", "maghrib"],
      },
      {
        title: "قراءة",
        subtitle: "غذاء العقل",
        description: "قراءة صفحات من كتاب نافع يوميًا.",
        emoji: "📚",
        priority: "medium",
        relatedDays: [0, 1, 2, 3, 4, 5, 6],
        relatedSalat: ["asr", "isha"],
      },
      {
        title: "كتابة",
        subtitle: "ترتيب الأفكار",
        description: "تقييد خواطر أو تلخيص المقروء.",
        emoji: "✍️",
        priority: "low",
        relatedDays: [1, 3, 5],
        relatedSalat: ["isha"],
      },
      {
        title: "تمارين تنفس",
        subtitle: "استرخاء وتركيز",
        description: "تمارين تنفس عميق لتحسين الهدوء.",
        emoji: "🫁",
        priority: "low",
        relatedDays: [0, 1, 2, 3, 4, 5, 6],
        relatedSalat: ["fajr", "isha"],
      },
    ],
    benefits: ["هدوء ذهني", "تركيز أعلى", "إدارة توتر أفضل"],

    comments: [
      {
        id: "c1",
        user: "إياد",
        text: "ساعدتني على تقليل القلق كثيرًا.",
      },
    ],
  },
];

interface HabitBundlesSectionProps {
  onBundlePress: (bundleId: string) => void;
}

const HabitBundlesSection: React.FC<HabitBundlesSectionProps> = ({
  onBundlePress,
}) => {
  const handleMorePress = () => {
    router.push("/(tabs)/home/explore-bundles");
  };
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Scroll to the rightmost position after component mounts
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: false });
    }, 100);
  }, []);

  return (
    <Animated.View entering={FadeInUp.delay(200)} className="w-full">
      <View className="flex-row-reverse px-4 items-center justify-between mb-4">
        <Text className="font-ibm-plex-arabic-semibold text-2xl text-text-brand">
          رحلات
        </Text>
        <Pressable
          onPress={handleMorePress}
          className="flex-row-reverse items-center gap-2"
        >
          <Text className="font-ibm-plex-arabic-medium text-text-primary">
            المزيد
          </Text>
          <Ionicons name="chevron-back" size={15} color="#fff" />
        </Pressable>
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingLeft: 20,
          gap: 16,
        }}
      >
        {habitBundles.map((bundle) => (
          <Pressable
            key={bundle.id}
            onPress={() => onBundlePress(bundle.id)}
            className=" h-48 rounded-2xl overflow-hidden mx-4"
            style={{ width: 250, backgroundColor: "#1a1a1a" }}
          >
            <Image
              source={require("../../assets/images/logo.png")}
              className="w-full h-full"
              style={{ opacity: 0.7, transform: [{ translateX: -50 }] }}
            />
            <LinearGradient
              colors={[
                "rgba(00,00,00,0.98)",
                "rgba(00,00,00,0.45)",
                "rgba(00,00,00,0.00)",
              ]}
              start={{ x: 1, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{
                position: "absolute",
                inset: 0,
                padding: 16,
              }}
            >
              <View className="px-3  rounded-full self-end">
                <Text
                  style={{ color: bundle.category.hexColor }}
                  className="font-ibm-plex-arabic text-xs pb-2 "
                >
                  {bundle.category.text}
                </Text>
              </View>
              <View className="w-full  flex-1 items-end justify-center">
                <Text className="font-ibm-plex-arabic-bold text-xl text-white mb-1">
                  {bundle.title}
                </Text>
                <Text className="font-ibm-plex-arabic text-sm text-gray-300 mb-2">
                  {bundle.subtitle}
                </Text>
                {/* Category Tag */}
              </View>
              <View className="flex-row-reverse  items-center justify-end w-full">
                <View className="flex-row-reverse justify-start  w-full gap-1">
                  {bundle.habits.slice(0, 3).map((habit: any, index) => (
                    <View
                      key={index}
                      className="bg-white/20 px-2 py-1 rounded-full"
                    >
                      <Text className="font-ibm-plex-arabic text-xs text-white">
                        {index === 2 && bundle.habits.length >= 3
                          ? "..."
                          : typeof habit === "string"
                            ? habit
                            : habit.title}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </LinearGradient>
          </Pressable>
        ))}
      </ScrollView>
    </Animated.View>
  );
};

export default HabitBundlesSection;
