import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  View,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  FadeInUp,
  FadeInRight,
  Layout,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  FadeOutDown,
  FadeOutUp,
  LinearTransition,
} from "react-native-reanimated";
import { habitBundles } from "@/components/habits/HabitBundlesSection";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HabitProps } from "@/types/habit";
import { PRAYERS } from "@/lib/prayers";

const SingleBundleScreen = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [expandedHabits, setExpandedHabits] = useState<Set<number>>(new Set());
  const insets = useSafeAreaInsets();

  // Animated values for arrow rotations
  const arrowRotations = useSharedValue<{ [key: number]: number }>({});

  // track scroll to reveal the header title after some offset
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const titleAnimatedStyle = useAnimatedStyle(() => {
    const visible = scrollY.value > 150;
    return {
      opacity: withTiming(visible ? 1 : 0, { duration: 200 }),
      transform: [
        { translateY: withTiming(visible ? 0 : 6, { duration: 200 }) },
      ],
    };
  });

  const imageTitleAnimatedStyle = useAnimatedStyle(() => {
    const visible = scrollY.value <= 150;
    return {
      opacity: withTiming(visible ? 1 : 0, { duration: 200 }),
      transform: [
        { translateY: withTiming(visible ? 0 : -6, { duration: 200 }) },
      ],
    };
  });

  const bundle =
    habitBundles.find((b) => String(b.id) === String(id)) ?? habitBundles[0];

  const benefits: string[] = (bundle as any).benefits ?? [];

  // Arabic day names for the week
  const dayNames = [
    "الأحد", // Sunday
    "الإثنين", // Monday
    "الثلاثاء", // Tuesday
    "الأربعاء", // Wednesday
    "الخميس", // Thursday
    "الجمعة", // Friday
    "السبت", // Saturday
  ];

  const comments: { id: string; user: string; text: string; time: string }[] =
    ((bundle as any).comments as any[]) ?? [
      {
        id: "c1",
        user: "مريم",
        text: "رحلة لطيفة وسهلة البدء، أحببت تقسيم المراحل.",
        time: "منذ يوم",
      },
      {
        id: "c2",
        user: "أحمد",
        text: "أول أسبوع ساعدني جدًا على الالتزام بعد الفجر.",
        time: "منذ 3 أيام",
      },
      {
        id: "c3",
        user: "ليان",
        text: "الفوائد واضحة وشعرت بطاقة أفضل.",
        time: "منذ أسبوع",
      },
    ];

  // Function to toggle habit dropdown
  const toggleHabitDropdown = (index: number) => {
    const newExpandedHabits = new Set(expandedHabits);
    if (newExpandedHabits.has(index)) {
      newExpandedHabits.delete(index);
      // Animate arrow back to 0 degrees
      arrowRotations.value[index] = withTiming(0, { duration: 300 });
    } else {
      newExpandedHabits.add(index);
      // Animate arrow to 180 degrees
      arrowRotations.value[index] = withTiming(180, { duration: 300 });
    }
    setExpandedHabits(newExpandedHabits);
  };

  // Function to get animated style for arrow rotation
  const getArrowAnimatedStyle = (index: number) => {
    return useAnimatedStyle(() => {
      const rotation = arrowRotations.value[index] || 0;
      return {
        transform: [{ rotate: `${rotation}deg` }],
      };
    });
  };

  // Function to handle enrolling in bundle
  const handleEnroll = async () => {
    try {
      setIsEnrolling(true);

      // Get existing habits from AsyncStorage
      const existingHabitsData = await AsyncStorage.getItem("habits");
      const existingHabits = existingHabitsData
        ? JSON.parse(existingHabitsData)
        : [];

      // Convert the habits in the bundle to proper habit objects
      const bundleHabits = ((bundle as any).habits || []).map(
        (habit: string | any, index: number) => {
          // Check if the habit is a string or an object (backward compatibility with old data format)
          const isHabitObject = typeof habit !== "string";
          const habitTitle = isHabitObject ? habit.title : habit;

          // Create a new habit object
          const newHabit: HabitProps = {
            id: `bundle_${bundle.id}_habit_${index}_${Date.now()}`,
            title: habitTitle,
            quote: isHabitObject ? habit.subtitle : bundle.title, // Using habit subtitle or bundle title as quote
            description: isHabitObject
              ? habit.description
              : `جزء من رحلة: ${bundle.title}`, // Using proper description if available
            streak: 0,
            completed: [],
            relatedDays: isHabitObject
              ? Array.isArray(habit.relatedDays) && habit.relatedDays.length > 0
                ? habit.relatedDays
                : [0, 1, 2, 3, 4, 5, 6]
              : [0, 1, 2, 3, 4, 5, 6], // Use habit's related days or default to all days
            relatedSalat: isHabitObject
              ? Array.isArray(habit.relatedSalat) &&
                habit.relatedSalat.length > 0
                ? habit.relatedSalat
                : []
              : [], // Use habit's related salats or default to empty
            priority: String((bundle as any).title || "رحلة"),
            priorityColor: (bundle as any).color || "#22C55E",
            category: (bundle as any).category || {
              text: "عام",
              hexColor: "#8B5CF6",
            }, // Add category from bundle
          };
          return newHabit;
        }
      );

      // Add the new habits to the existing habits
      const updatedHabits = [...existingHabits, ...bundleHabits];

      // Save the updated habits to AsyncStorage
      await AsyncStorage.setItem("habits", JSON.stringify(updatedHabits));

      // Show success message
      Alert.alert(
        "تم التسجيل بنجاح",
        `تمت إضافة ${bundleHabits.length} عادات جديدة من "${bundle.title}" إلى قائمة عاداتك.`,
        [
          {
            text: "عرض العادات",
            onPress: () => router.navigate("/(tabs)/(time)"),
          },
          {
            text: "حسنًا",
            style: "cancel",
          },
        ]
      );
    } catch (error) {
      console.error("Error enrolling in bundle:", error);
      Alert.alert(
        "خطأ",
        "حدث خطأ أثناء التسجيل في الرحلة. يرجى المحاولة مرة أخرى."
      );
    } finally {
      setIsEnrolling(false);
    }
  };

  useEffect(() => {}, []);
  return (
    <SafeAreaView className="flex-1 bg-bg">
      {/* Modern Header */}
      <View className="flex-row-reverse items-center justify-between px-6 py-4 bg-fore border-b border-white/10">
        <Animated.Text
          style={titleAnimatedStyle as any}
          className="font-ibm-plex-arabic-bold text-xl text-text-brand"
        >
          {bundle.title}
        </Animated.Text>
        <Pressable
          onPress={() => router.navigate("/(tabs)/home")}
          className="w-8 h-8 bg-white/10 rounded-full items-center justify-center"
        >
          <Ionicons name="close" size={20} color="#fff" />
        </Pressable>
      </View>

      <Animated.ScrollView
        contentContainerClassName="pb-32"
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        className="flex-1"
      >
        {/* Hero Section */}
        <View className="relative h-80 mb-8">
          <Image
            source={require("../../../assets/images/logo.png")}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              width: "100%",
              height: "100%",
              transform: [{ translateX: -50 }],
            }}
            resizeMode="cover"
          />
          {/* Dark overlay for better text readability */}
          <View className="absolute inset-0 bg-black/40" />

          {/* Content overlay */}
          <View className="flex-1 justify-end items-end p-6">
            <Animated.View style={imageTitleAnimatedStyle as any}>
              <View className="self-end  rounded-full mb-3">
                <Text
                  style={{
                    color: (bundle as any).category?.hexColor || "#8B5CF6",
                  }}
                  className="font-ibm-plex-arabic pb-2 text-sm text-white"
                >
                  {(bundle as any).category?.text || "عام"}
                </Text>
              </View>
              <Text className="font-ibm-plex-arabic-bold text-3xl text-white mb-3 leading-tight">
                {bundle.title}
              </Text>
              {/* Category Tag */}

              <Animated.View
                entering={FadeInRight.delay(200).duration(600)}
                className="flex-row items-end justify-end mr-1 gap-4"
              >
                <Animated.View
                  entering={FadeInRight.delay(200).duration(600)}
                  className="flex-row items-center gap-1"
                >
                  <Ionicons name="star" size={16} color="#FBBF24" />
                  <Text className="text-white font-ibm-plex-arabic-semibold text-sm">
                    4.9
                  </Text>
                </Animated.View>
                <Animated.View
                  entering={FadeInRight.delay(200).duration(600)}
                  className="flex-row items-center gap-1"
                >
                  <Ionicons name="download" size={16} color="#9CA3AF" />
                  <Text className="text-gray-300 font-ibm-plex-arabic-medium text-sm">
                    1.4K
                  </Text>
                </Animated.View>
              </Animated.View>
            </Animated.View>
          </View>
        </View>

        {/* Description Section */}
        <Animated.View
          entering={FadeInUp.delay(200).duration(600)}
          className="px-6 mb-8"
        >
          <Text className="text-text-primary font-ibm-plex-arabic text-base leading-6 text-right">
            {bundle.description
              ? bundle.description
              : "تعزيز إنتاجيتك وتحقيق أهدافك من خلال هذا الروتين المصمم لتحسين التركيز والتنظيم ومهارات إدارة الوقت. اكتسب عادات تدعم نهجًا منظمًا وفعالًا للحياة اليومية."}
          </Text>
        </Animated.View>

        {/* Habits Section */}
        {Array.isArray((bundle as any).habits) &&
          (bundle as any).habits.length > 0 && (
            <Animated.View
              entering={FadeInUp.delay(400).duration(600)}
              className="px-6 mb-8"
            >
              <Text className="text-text-brand font-ibm-plex-arabic-bold text-xl mb-4 text-right">
                العادات في هذه الرحلة
              </Text>
              <View className="gap-3">
                {(bundle as any).habits.map((h: any, i: number) => (
                  <Animated.View
                    key={i}
                    entering={FadeInUp.delay(500 + i * 100).duration(600)}
                    layout={Layout.springify().damping(20).stiffness(200)}
                    className="bg-fore rounded-2xl border border-white/10 shadow-sm overflow-hidden"
                  >
                    {/* Habit Header - Clickable */}
                    <Pressable
                      onPress={() => toggleHabitDropdown(i)}
                      className="px-4 py-3 active:opacity-80"
                    >
                      <View className="flex-row-reverse items-center gap-3">
                        {/* Habit emoji - only show if emoji exists */}
                        {typeof h !== "string" && h.emoji && (
                          <View className="w-10 h-10 bg-white/10 rounded-xl items-center justify-center">
                            <Text className="text-2xl">{h.emoji}</Text>
                          </View>
                        )}

                        {/* Habit content */}
                        <View className="flex-1">
                          <Text
                            style={{ paddingBottom: 6 }}
                            className="text-text-primary  font-ibm-plex-arabic  text-2sm text-right "
                          >
                            {typeof h === "string" ? h : h.title}
                          </Text>
                          <Text className="text-text-disabled font-ibm-plex-arabic-light text-xs text-right pb-2">
                            {typeof h === "string"
                              ? "عادة مهمة لتحسين حياتك اليومية"
                              : h.subtitle || "عادة مهمة لتحسين حياتك اليومية"}
                          </Text>
                        </View>

                        {/* Expandable Arrow */}
                        <Animated.View style={getArrowAnimatedStyle(i)}>
                          <Ionicons
                            name="chevron-down"
                            size={20}
                            color="#9CA3AF"
                          />
                        </Animated.View>
                      </View>
                    </Pressable>

                    {/* Dropdown Content */}
                    {expandedHabits.has(i) && (
                      <Animated.View
                        entering={FadeInUp.duration(300)}
                        exiting={FadeOutUp.duration(300)}
                        layout={Layout.springify().damping(15).stiffness(300)}
                        className="px-4 pb-4 border-t border-white/10"
                      >
                        <View className="pt-4">
                          <Text className="text-text-primary font-ibm-plex-arabic text-sm leading-6 text-right mb-3">
                            {typeof h === "string"
                              ? "عادة مهمة لتحسين حياتك اليومية"
                              : h.description ||
                                "لا يوجد وصف متاح لهذه العادة."}
                          </Text>

                          {/* Habit Schedule - Days */}
                          <View className="mb-3">
                            <Text className="text-text-secondary font-ibm-plex-arabic-medium text-xs mb-2 text-right">
                              أيام التطبيق:
                            </Text>
                            <View className="flex-row-reverse flex-wrap gap-1">
                              {dayNames.map((day, index) => {
                                const isRelated =
                                  typeof h !== "string" &&
                                  Array.isArray(h.relatedDays) &&
                                  h.relatedDays.includes(index);

                                return (
                                  <>
                                    {isRelated && (
                                      <View
                                        key={day}
                                        className={`px-2 py-1 rounded-full items-center justify-center `}
                                      >
                                        <Text
                                          className={`text-xs font-ibm-plex-arabic-medium text-text-brand`}
                                          numberOfLines={1}
                                        >
                                          {day}
                                        </Text>
                                      </View>
                                    )}
                                  </>
                                );
                              })}
                            </View>
                          </View>

                          {/* Habit Schedule - Salats */}
                          <View>
                            <Text className="text-text-secondary font-ibm-plex-arabic-medium text-xs mb-2 text-right">
                              الأوقات المرتبطة:
                            </Text>
                            <View className="flex-row-reverse flex-wrap gap-2">
                              {PRAYERS.map((prayer, index) => {
                                const isRelated =
                                  typeof h !== "string" &&
                                  Array.isArray(h.relatedSalat) &&
                                  h.relatedSalat.includes(prayer.key);

                                return (
                                  <>
                                    {isRelated && (
                                      <View
                                        key={index}
                                        className={`px-2 py-1 rounded-full`}
                                      >
                                        <Text
                                          className={`text-xs font-ibm-plex-arabic-medium text-text-brand`}
                                        >
                                          {prayer.name}
                                        </Text>
                                      </View>
                                    )}
                                  </>
                                );
                              })}
                            </View>

                            {/* Fallback for habits without specific salat info */}
                            {typeof h !== "string" &&
                              (!Array.isArray(h.relatedSalat) ||
                                h.relatedSalat.length === 0) && (
                                <Text className="text-text-disabled font-ibm-plex-arabic text-xs text-right mt-2">
                                  يمكن تطبيق هذه العادة في أي وقت
                                </Text>
                              )}
                          </View>
                        </View>
                      </Animated.View>
                    )}
                  </Animated.View>
                ))}
              </View>
            </Animated.View>
          )}

        <Animated.View layout={LinearTransition}>
          {benefits.length > 0 && (
            <Animated.View
              entering={FadeInUp.delay(600).duration(600)}
              className="px-6 mb-8"
            >
              <Text className="text-text-brand font-ibm-plex-arabic-bold text-xl mb-4 text-right">
                الفوائد الرئيسية
              </Text>
              <View className="gap-3">
                {benefits.map((b, idx) => (
                  <Animated.View
                    key={idx}
                    entering={FadeInUp.delay(700 + idx * 100).duration(600)}
                    className="flex-row-reverse items-start gap-3"
                  >
                    <View className="w-6 h-6 bg-text-brand rounded-full items-center justify-center mt-0.5">
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    </View>
                    <Text className="text-text-primary font-ibm-plex-arabic text-base text-right flex-1 leading-6">
                      {b}
                    </Text>
                  </Animated.View>
                ))}
              </View>
            </Animated.View>
          )}

          {/* Comments Section */}
          <Animated.View
            entering={FadeInUp.delay(1000).duration(600)}
            className="px-6 mb-8"
          >
            <Text className="text-text-brand font-ibm-plex-arabic-bold text-xl mb-4 text-right">
              التعليقات
            </Text>
            <View className="gap-3">
              {comments.map((c, idx) => (
                <Animated.View
                  key={c.id}
                  entering={FadeInUp.delay(1100 + idx * 100).duration(600)}
                  className="bg-fore rounded-2xl p-4 border border-white/10 shadow-sm"
                >
                  <View className="flex-row-reverse items-start gap-3">
                    <View className="w-10 h-10 bg-sky-500 rounded-full items-center justify-center">
                      <Text className="text-white font-ibm-plex-arabic-bold text-lg">
                        {c.user.substring(0, 1)}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <View className="flex-row-reverse items-center justify-between mb-2">
                        <Text className="text-text-primary font-ibm-plex-arabic-bold text-base">
                          {c.user}
                        </Text>
                        <Text className="text-text-secondary font-ibm-plex-arabic-medium text-sm">
                          {c.time}
                        </Text>
                      </View>
                      <Text className="text-text-primary font-ibm-plex-arabic-medium text-sm text-right leading-5">
                        {c.text}
                      </Text>
                    </View>
                  </View>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        </Animated.View>
      </Animated.ScrollView>

      {/* Modern Call-to-Action Button */}
      <View
        className="absolute left-6 right-6"
        style={{
          bottom: (insets?.bottom || 0) + 20,
          zIndex: 50,
          elevation: 50,
        }}
        pointerEvents="box-none"
      >
        <Pressable
          className="bg-sky-500 rounded-2xl py-5 items-center shadow-lg"
          onPress={handleEnroll}
          disabled={isEnrolling}
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
          }}
        >
          {isEnrolling ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text className="text-white font-ibm-plex-arabic-bold text-lg">
              ابدأ رحلتي
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default SingleBundleScreen;
