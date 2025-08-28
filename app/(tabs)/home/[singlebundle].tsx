import React, { useState } from "react";
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
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { habitBundles } from "@/components/habits/HabitBundlesSection";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HabitProps } from "@/types/habit";

const SingleBundleScreen = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const [isEnrolling, setIsEnrolling] = useState(false);
  const insets = useSafeAreaInsets();

  // track scroll to reveal the header title after some offset
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });
  const titleAnimatedStyle = useAnimatedStyle(() => {
    const visible = scrollY.value > 30;
    return {
      opacity: withTiming(visible ? 1 : 0, { duration: 200 }),
      transform: [
        { translateY: withTiming(visible ? 0 : 6, { duration: 200 }) },
      ],
    };
  });
  const imageTitleAnimatedStyle = useAnimatedStyle(() => {
    const visible = scrollY.value <= 30;
    return {
      opacity: withTiming(visible ? 1 : 0, { duration: 200 }),
      transform: [
        { translateY: withTiming(visible ? 0 : -6, { duration: 200 }) },
      ],
    };
  });
  const subtitleAnimatedStyle = useAnimatedStyle(() => {
    const visible = scrollY.value > 30;
    return {
      opacity: withTiming(visible ? 1 : 0, { duration: 200 }),
      transform: [
        { translateY: withTiming(visible ? 0 : 6, { duration: 200 }) },
      ],
    };
  });
  const bundle =
    habitBundles.find((b) => String(b.id) === String(id)) ?? habitBundles[0];

  const benefits: string[] = (bundle as any).benefits ?? [];
  const phases: { id: string; title: string; summary: string }[] =
    (bundle as any).phases ?? [];
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

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-row-reverse items-center justify-between px-4 h-12">
        <Animated.Text
          style={titleAnimatedStyle as any}
          className="font-ibm-plex-arabic-bold text-xl text-text-brand"
        >
          {bundle.title}
        </Animated.Text>
        <Pressable
          onPress={() => router.back()}
          className="bg-fore p-2 rounded-full"
        >
          <Ionicons name="close" size={20} color="#fff" />
        </Pressable>
      </View>

      <Animated.ScrollView
        contentContainerClassName="pb-40"
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <View
          style={{
            width: "100%",
            height: 220,
            overflow: "hidden",
            marginBottom: 40,
          }}
        >
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
          <View
            className="flex-1 items-end justify-start mt-4 p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.3)", flex: 1 }}
          >
            <Animated.View style={imageTitleAnimatedStyle as any}>
              <Text className="font-ibm-plex-arabic-bold text-right text-2xl text-white mb-1">
                {bundle.title}
              </Text>
              <Text className="font-ibm-plex-arabic text-sm text-gray-200">
                {bundle.subtitle}
              </Text>
            </Animated.View>
          </View>
        </View>

        <View
          style={[{ width: 250, alignSelf: "center", marginBottom: 10 }]}
          className="bg-fore border border-text-brand  py-2 rounded-xl "
        >
          <Animated.Text
            style={subtitleAnimatedStyle}
            className="font-ibm-plex-arabic  py-2 text-center text-xl text-white"
          >
            {bundle.subtitle}
          </Animated.Text>
        </View>

        <Animated.View
          entering={FadeInUp.delay(500)}
          className="px-4 py-4 gap-3"
        >
          <Text className="text-text-primary font-ibm-plex-arabic text-base text-right">
            {bundle.description ? bundle.description : ""}
          </Text>
        </Animated.View>

        {Array.isArray((bundle as any).habits) &&
          (bundle as any).habits.length > 0 && (
            <Animated.View
              entering={FadeInUp.delay(530)}
              className="px-4 pb-2 gap-2"
            >
              <Text className="text-text-brand font-ibm-plex-arabic-semibold text-lg text-right">
                العادات في هذه الرحلة
              </Text>
              <View className="flex-row-reverse flex-wrap gap-2">
                {(bundle as any).habits.map((h: any, i: number) => (
                  <View key={i} className="bg-fore px-3 py-1.5 rounded-full">
                    <Text className="text-text-primary font-ibm-plex-arabic text-sm">
                      {typeof h === "string" ? h : h.title}
                    </Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          )}

        {benefits.length > 0 && (
          <Animated.View
            entering={FadeInUp.delay(550)}
            className="px-4 py-2 gap-2"
          >
            <Text className="text-text-brand font-ibm-plex-arabic-semibold text-lg text-right">
              الفوائد الرئيسية
            </Text>
            <View className="gap-2">
              {benefits.map((b, idx) => (
                <View key={idx} className="flex-row-reverse items-start gap-2">
                  <View
                    className="bg-text-brand rounded-full "
                    style={{ padding: 3 }}
                  >
                    <Ionicons name="checkmark" size={13} color="#fff" />
                  </View>
                  <Text className="text-text-primary font-ibm-plex-arabic text-sm text-right flex-1">
                    {b}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        {phases.length > 0 && (
          <Animated.View entering={FadeInUp.delay(500)} className="px-4 py-4">
            <Text className="text-text-brand font-ibm-plex-arabic-semibold text-lg mb-3 text-right">
              خارطة الطريق
            </Text>
            <View className="flex-col">
              {phases.map((p, idx) => (
                <View key={p.id} className="flex-row-reverse items-stretch">
                  <View className="items-center">
                    <View className="w-3 h-3 rounded-full bg-sky-400 mt-2" />
                    {idx !== phases.length - 1 && (
                      <View className="w-[2px] bg-white/20 grow" />
                    )}
                  </View>
                  <View className="flex-1 mr-3 mb-4 rounded-xl bg-fore p-3">
                    <Text className="text-text-primary font-ibm-plex-arabic-semibold text-base text-right">
                      {p.title}
                    </Text>
                    <Text className="text-text-secondary font-ibm-plex-arabic-medium text-sm mt-1 text-right">
                      {p.summary}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        <Animated.View entering={FadeInUp.delay(540)} className="px-4 py-4">
          <Text className="text-text-brand font-ibm-plex-arabic-semibold text-lg mb-3 text-right">
            التعليقات
          </Text>
          <View className="gap-3">
            {comments.map((c) => (
              <View
                key={c.id}
                className="flex-row-reverse items-start gap-3 bg-fore rounded-xl p-3"
              >
                <View className="w-9 h-9 rounded-full bg-sky-500 items-center justify-center">
                  <Text className="text-white font-ibm-plex-arabic-semibold">
                    {c.user.substring(0, 1)}
                  </Text>
                </View>
                <View className="flex-1">
                  <View className="flex-row-reverse items-center justify-between">
                    <Text className="text-text-primary font-ibm-plex-arabic-semibold">
                      {c.user}
                    </Text>
                    <Text className="text-text-secondary font-ibm-plex-arabic-medium text-xs">
                      {c.time}
                    </Text>
                  </View>
                  <Text className="text-text-primary font-ibm-plex-arabic-medium text-sm mt-1 text-right">
                    {c.text}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>
      </Animated.ScrollView>
      <View
        className="absolute left-4 right-4"
        style={{
          bottom: (insets?.bottom || 0) + 12,
          zIndex: 50,
          elevation: 50,
        }}
        pointerEvents="box-none"
      >
        <Pressable
          className="bg-sky-500 rounded-2xl py-4 items-center"
          onPress={handleEnroll}
          disabled={isEnrolling}
        >
          {isEnrolling ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text className="text-white font-ibm-plex-arabic-semibold text-base">
              ابدأ رحلتي
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default SingleBundleScreen;
