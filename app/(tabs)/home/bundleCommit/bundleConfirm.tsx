import React, { useContext, useEffect, useState } from "react";
import {
  Text,
  View,
  Pressable,
  Alert,
  ActivityIndicator,
  ScrollView,
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
  FadeInDown,
  FadeOutUp,
  Layout,
  withSpring,
  useAnimatedStyle,
  useSharedValue,
  LinearTransition,
  withTiming,
} from "react-native-reanimated";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  Bundle,
  addBundleToUserCommitedBundles,
  addUserToBundleEnrolledUsers,
} from "@/lib/bundles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "@/lib/auth";
import { supabase } from "@/utils/supabase";

const BundleConfirmationScreen = () => {
  const { bundleData } = useLocalSearchParams<{
    bundleData?: string;
  }>();
  const router = useRouter();
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const [expandedHabits, setExpandedHabits] = useState<Set<number>>(new Set());
  const user = useContext(AuthContext);

  // Date selection state
  const [selectedEndDate, setSelectedEndDate] = useState<Date>(() => {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30); // Default to 30 days
    return defaultDate;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Scroll detection state and animated values
  const [isNearEnd, setIsNearEnd] = useState(false);
  const buttonHeight = useSharedValue(60); // Initial height in pixels

  // Parse bundle data from params
  useEffect(() => {
    if (bundleData) {
      try {
        console.log("this is in commit from the params", bundleData);
        const parsedBundle = JSON.parse(bundleData);
        console.log(
          "this is in commit from the params after parsing",
          parsedBundle
        );
        setBundle(parsedBundle);
      } catch (err) {
        console.error("Error parsing bundle data:", err);
        setError("خطأ في تحميل بيانات الحزمة");
      }
    } else {
      setError("لم يتم العثور على بيانات الحزمة");
    }
  }, [bundleData]);

  // Animate button when scroll position changes
  useEffect(() => {
    buttonHeight.value = withSpring(isNearEnd ? 100 : 60, {
      mass: 1,
      damping: 15,
      stiffness: 150,
    });
  }, [isNearEnd, buttonHeight]);

  // Handle scroll events
  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;

    // Calculate if user is near the end (within 100px of bottom)
    const paddingToBottom = 150;
    const isCloseToEnd =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;

    // Update state if changed
    if (isCloseToEnd !== isNearEnd) {
      setIsNearEnd(isCloseToEnd);
    }
  };

  // Animated style for the button
  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: buttonHeight.value,
    };
  });

  // Ensure bundle has required properties
  const safeBundle = bundle
    ? {
        id: bundle.id || "unknown",
        title: bundle.title || "عنوان غير محدد",
        subtitle: bundle.subtitle || "وصف فرعي غير محدد",
        description: bundle.description || "وصف غير محدد",
        category: bundle.category || { text: "عام", hexColor: "#00AEEF" },
        habits: Array.isArray(bundle.habits) ? bundle.habits : [],
        benefits: Array.isArray(bundle.benefits) ? bundle.benefits : [],
        comments: Array.isArray(bundle.comments) ? bundle.comments : [],
        rating: bundle.rating || 0,
        color: bundle.color || "#00AEEF",
        enrolled_users: bundle.enrolled_users,
      }
    : null;

  // Get current date in Arabic
  const getCurrentDateInArabic = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    };
    return now.toLocaleDateString("ar-SA", options);
  };

  // Calculate end date using selected date
  const getEndDateInArabic = () => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    };
    return selectedEndDate.toLocaleDateString("ar-SA", options);
  };

  // Calculate journey duration in days
  const getJourneyDuration = () => {
    const startDate = new Date();
    const timeDiff = selectedEndDate.getTime() - startDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return Math.max(1, daysDiff); // Ensure at least 1 day
  };

  // Function to handle confirming enrollment
  const handleConfirmEnroll = async () => {
    if (!safeBundle) return;

    try {
      setIsEnrolling(true);

      // Get existing bundles from AsyncStorage
      const existingBundlesData = await AsyncStorage.getItem("bundles");
      const existingBundles = existingBundlesData
        ? JSON.parse(existingBundlesData)
        : [];

      // Check if user is already enrolled in this bundle by checking the bundle's enrolled_users
      const { data: bundle } = await supabase
        .from("bundles")
        .select("enrolled_users")
        .eq("id", safeBundle.id)
        .single();

      const isAlreadyEnrolled = bundle?.enrolled_users?.includes(
        user?.user?.id
      );

      if (isAlreadyEnrolled) {
        Alert.alert("مُسجل بالفعل", "أنت مُسجل بالفعل في هذه الرحلة.", [
          { text: "حسنًا", style: "cancel" },
        ]);
        return;
      }

      // Convert the habits in the bundle to proper habit objects for local storage
      const bundleHabits = (safeBundle?.habits || []).map(
        (habit: string | any, index: number) => {
          // Check if the habit is a string or an object (backward compatibility with old data format)
          const isHabitObject = typeof habit !== "string";
          const habitTitle = isHabitObject ? habit.title : habit;

          // Create a new habit object for local storage (with proper field names)
          const newHabit = {
            id: `bundle_${safeBundle.id}_${index}`, // Generate unique ID for local storage
            title: habitTitle,
            quote: isHabitObject ? habit.subtitle : safeBundle.title,
            description: isHabitObject
              ? habit.description
              : `جزء من رحلة: ${safeBundle.title}`,
            relatedDays: isHabitObject
              ? Array.isArray(habit.relatedDays) && habit.relatedDays.length > 0
                ? habit.relatedDays
                : [0, 1, 2, 3, 4, 5, 6]
              : [0, 1, 2, 3, 4, 5, 6],
            relatedSalat: isHabitObject
              ? Array.isArray(habit.relatedSalat) &&
                habit.relatedSalat.length > 0
                ? habit.relatedSalat
                : ["fajr"]
              : ["fajr"],
            category: (safeBundle as any).category || {
              text: "عام",
              hexColor: "#8B5CF6",
            },
            completed: [], // Initialize empty completion array
            streak: 0, // Initialize streak
            bestStreak: 0,
          };
          addBundleToUserCommitedBundles(
            user?.user?.id ?? "",
            safeBundle.id,
            "end date"
          );
          return newHabit;
        }
      );

      // Calculate complete date information for the bundle using selected end date
      const startDate = new Date();
      const journeyDuration = getJourneyDuration();

      // Create complete date structure
      const bundleDates = {
        enrolled_at: new Date().toISOString(), // When user enrolled
        start_date: startDate.toISOString(), // Journey start date
        end_date: selectedEndDate.toISOString(), // User-selected journey end date
        duration_days: journeyDuration, // Total journey duration based on selected date
        current_day: 1, // Current day in the journey (starts at 1)
        is_active: true, // Whether the bundle journey is currently active
        completed_days: [], // Array to track which days have been completed (will be calculated based on habit completions)
        last_activity: new Date().toISOString(), // Last time user interacted with this bundle
      };

      // Save bundle data to local storage with "bundles" key
      const bundleToSave = {
        id: safeBundle.id,
        title: safeBundle.title,
        subtitle: safeBundle.subtitle,
        description: safeBundle.description,
        category: safeBundle.category,
        image_url: (safeBundle as any).image_url || "",
        color: safeBundle.color,
        dates: bundleDates, // Complete date information
        habits: bundleHabits, // Store the processed habits directly
      };

      const updatedBundles = [...existingBundles, bundleToSave];
      await AsyncStorage.setItem("bundles", JSON.stringify(updatedBundles));

      // Add user to bundle's enrolled_users array in the database
      await addUserToBundleEnrolledUsers(safeBundle.id, user?.user?.id ?? "");

      const bundles2 = await AsyncStorage.getItem("bundles");
      console.log("bundlesalllll", JSON.parse(bundles2 || "[]"));

      // Show success message
      Alert.alert(
        "تم التسجيل بنجاح",
        `تمت إضافة ${bundleHabits.length} عادات جديدة من "${safeBundle.title}" إلى قائمة عاداتك.`,
        [
          {
            text: "عرض العادات",
            onPress: () => router.navigate("/(tabs)/time"),
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

  // Show error state
  if (error || !safeBundle) {
    return (
      <SafeAreaView className="flex-1 bg-bg">
        <View className="flex-1 justify-center items-center px-6">
          <Text className="font-ibm-plex-arabic text-feedback-error text-center mb-4">
            {error || "لم يتم العثور على الحزمة"}
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="bg-fore px-6 py-3 rounded-2xl border border-white/10"
          >
            <Text className="font-ibm-plex-arabic text-text-primary">
              العودة
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      {/* Header */}
      <View className="flex-row-reverse items-center justify-between px-6 py-4 bg-fore border-b border-white/10">
        <Text className="font-ibm-plex-arabic-bold text-xl text-text-brand">
          تأكيد التسجيل
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="w-8 h-8 bg-white/10 rounded-full items-center justify-center"
        >
          <Ionicons name="arrow-back" size={20} color="#E5F8FF" />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-32"
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16} // Smooth scroll detection
      >
        {/* Title Section */}
        <Animated.View
          entering={FadeInUp.delay(100).duration(600)}
          className="px-6 py-6"
        >
          <View className="bg-fore rounded-2xl p-6 border border-white/10 shadow-sm">
            <View className="items-center mb-4">
              <View className="w-16 h-16 bg-text-brand/20 rounded-full items-center justify-center mb-3">
                <Ionicons name="checkmark-circle" size={32} color="#00AEEF" />
              </View>
              <Text className="font-ibm-plex-arabic-bold text-2xl text-text-primary text-center pb-2">
                أنت على وشك البدء في
              </Text>
              <Text
                className="font-ibm-plex-arabic-bold text-xl text-center pb-2"
                style={{ color: safeBundle.category.hexColor }}
              >
                {safeBundle.title}
              </Text>
              <View className="bg-text-brand/10 px-3  rounded-full py-2">
                <Text className="font-ibm-plex-arabic text-md text-text-brand">
                  {safeBundle.category.text}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Habits List */}
        <Animated.View
          entering={FadeInUp.delay(200).duration(600)}
          className="px-6 mb-6"
        >
          <Text className="font-ibm-plex-arabic-bold text-lg text-text-brand mb-4 text-right">
            العادات التي ستحصل عليها ({safeBundle.habits.length})
          </Text>
          <View className="gap-3">
            {safeBundle.habits.map((habit: any, index: number) => {
              const isExpanded = expandedHabits.has(index);
              const habitData =
                typeof habit === "string" ? { title: habit } : habit;

              // Get days and salats for this habit
              const relatedDays = habitData.relatedDays || [
                0, 1, 2, 3, 4, 5, 6,
              ];
              const relatedSalat = habitData.relatedSalat || ["fajr"];

              // Convert day numbers to Arabic names
              const getDayName = (dayNumber: number) => {
                const days = [
                  "الأحد",
                  "الإثنين",
                  "الثلاثاء",
                  "الأربعاء",
                  "الخميس",
                  "الجمعة",
                  "السبت",
                ];
                return days[dayNumber];
              };

              // Convert salat names to Arabic
              const getSalatName = (salat: string) => {
                const salatNames: { [key: string]: string } = {
                  fajr: "الفجر",
                  dhuhr: "الظهر",
                  asr: "العصر",
                  maghrib: "المغرب",
                  isha: "العشاء",
                };
                return salatNames[salat] || salat;
              };

              return (
                <HabitDropdownItem
                  key={index}
                  index={index}
                  habitData={habitData}
                  isExpanded={isExpanded}
                  onToggle={() => {
                    setExpandedHabits((prev) => {
                      const newSet = new Set(prev);
                      if (newSet.has(index)) {
                        newSet.delete(index);
                      } else {
                        newSet.add(index);
                      }
                      return newSet;
                    });
                  }}
                  relatedDays={relatedDays}
                  relatedSalat={relatedSalat}
                  getDayName={getDayName}
                  getSalatName={getSalatName}
                />
              );
            })}
          </View>
        </Animated.View>

        {/* Date Information */}
        <Animated.View layout={LinearTransition}>
          <Animated.View
            entering={FadeInUp.delay(400).duration(600)}
            className="px-6 mb-6"
          >
            <Text className="font-ibm-plex-arabic-bold text-lg text-text-brand mb-4 text-right">
              معلومات الرحلة
            </Text>

            <View className="bg-fore rounded-2xl border border-white/10 shadow-sm overflow-hidden">
              {/* Start Date */}
              <View className="p-4 border-b border-white/10">
                <View className="flex-row-reverse items-center gap-3">
                  <View className="w-10 h-10 bg-green-500/20 rounded-xl items-center justify-center">
                    <Ionicons name="play-circle" size={20} color="#22C55E" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-ibm-plex-arabic-bold text-text-primary text-right mb-1">
                      تاريخ البداية
                    </Text>
                    <Text className="font-ibm-plex-arabic text-text-secondary text-right">
                      اليوم - {getCurrentDateInArabic()}
                    </Text>
                  </View>
                </View>
              </View>

              {/* End Date - Interactive */}
              <Pressable
                onPress={() => setShowDatePicker(true)}
                className="p-4 active:bg-white/5"
              >
                <View className="flex-row-reverse items-center gap-3">
                  <View className="w-10 h-10 bg-amber-400/20 rounded-xl items-center justify-center">
                    <Ionicons name="calendar" size={20} color="#FBBF24" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-ibm-plex-arabic-bold text-text-primary text-right mb-1">
                      تاريخ الإنتهاء المتوقع
                    </Text>
                    <Text className="font-ibm-plex-arabic text-text-secondary text-right">
                      {getEndDateInArabic()} ({getJourneyDuration()} يوماً)
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#8B5CF6" />
                </View>
              </Pressable>

              {/* Date Picker Modal */}
              {showDatePicker && (
                <View className="px-4 pb-4 border-t border-white/10">
                  <Text className="font-ibm-plex-arabic-bold text-text-primary text-right mb-3 mt-3">
                    اختر تاريخ الانتهاء
                  </Text>
                  <DateTimePicker
                    value={selectedEndDate}
                    mode="date"
                    display="default"
                    minimumDate={new Date()} // Can't select past dates
                    onChange={(event: any, selectedDate?: Date) => {
                      setShowDatePicker(false);
                      if (selectedDate) {
                        setSelectedEndDate(selectedDate);
                      }
                    }}
                    style={{ alignSelf: "flex-end" }}
                  />
                </View>
              )}
            </View>
          </Animated.View>

          {/* Benefits Preview */}
          <Animated.View
            entering={FadeInUp.delay(500).duration(600)}
            className="px-6 mb-8"
          >
            <Text className="font-ibm-plex-arabic-bold text-lg text-text-brand mb-4 text-right">
              ماذا ستحقق؟
            </Text>
            <View className="bg-fore rounded-2xl p-4 border border-white/10 shadow-sm">
              <View className="flex-row-reverse items-center gap-3 mb-3">
                <Ionicons name="trophy" size={24} color="#FBBF24" />
                <Text className="font-ibm-plex-arabic text-text-primary text-right flex-1">
                  تكوين عادات إيجابية تدوم مدى الحياة
                </Text>
              </View>
              <View className="flex-row-reverse items-center gap-3 mb-3">
                <Ionicons name="trending-up" size={24} color="#22C55E" />
                <Text className="font-ibm-plex-arabic text-text-primary text-right flex-1">
                  تحسين مستمر في نمط الحياة
                </Text>
              </View>
              <View className="flex-row-reverse items-center gap-3">
                <Ionicons name="heart" size={24} color="#EF4444" />
                <Text className="font-ibm-plex-arabic text-text-primary text-right flex-1">
                  شعور أفضل بالراحة والإنجاز
                </Text>
              </View>
            </View>
          </Animated.View>
        </Animated.View>
      </ScrollView>

      {/* Confirmation Buttons with Height Animation */}
      <View
        className="absolute"
        style={{
          bottom: insets?.bottom || 0,
          zIndex: 50,
          elevation: 50,
          width: "100%",
        }}
        pointerEvents="box-none"
      >
        <Animated.View
          entering={FadeInUp.delay(600).duration(600)}
          className="w-full"
        >
          {/* Main Enroll Button with Animated Height */}
          <Animated.View
            style={[
              buttonAnimatedStyle,
              {
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                backgroundColor: "#00AEEF", // text-brand color
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
          >
            <Pressable
              className="w-full h-full items-center justify-center active:opacity-90"
              onPress={handleConfirmEnroll}
              disabled={isEnrolling}
            >
              {isEnrolling ? (
                <View className="flex-row items-center gap-2">
                  <ActivityIndicator color="#fff" size="small" />
                  <Text className="text-white font-ibm-plex-arabic text-lg">
                    جاري التسجيل...
                  </Text>
                </View>
              ) : (
                <View className="flex-row items-center gap-2">
                  <Ionicons name="rocket" size={20} color="#fff" />
                  <Text className="text-white font-ibm-plex-arabic-bold text-lg">
                    ابدأ رحلتي الآن
                  </Text>
                </View>
              )}
            </Pressable>
          </Animated.View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const HabitDropdownItem = ({
  index,
  habitData,
  isExpanded,
  onToggle,
  relatedDays,
  relatedSalat,
  getDayName,
  getSalatName,
}: {
  index: number;
  habitData: any;
  isExpanded: boolean;
  onToggle: () => void;
  relatedDays: number[];
  relatedSalat: string[];
  getDayName: (day: number) => string;
  getSalatName: (salat: string) => string;
}) => {
  // Shared value for chevron rotation
  const chevronRotation = useSharedValue(0);

  // Update chevron rotation when expanded state changes
  React.useEffect(() => {
    chevronRotation.value = withSpring(isExpanded ? 180 : 0, {
      damping: 15,
      stiffness: 150,
    });
  }, [isExpanded, chevronRotation]);

  // Animated style for chevron rotation
  const chevronStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: `${chevronRotation.value}deg`,
        },
      ],
    };
  });

  return (
    <Animated.View
      entering={FadeInRight.delay(300 + index * 100)
        .duration(800)
        .springify()
        .damping(20)
        .stiffness(90)}
      layout={LinearTransition.springify().damping(18).stiffness(110).mass(1)}
      className="bg-fore rounded-2xl border border-white/10 shadow-sm overflow-hidden"
    >
      {/* Habit Header - Always Visible */}
      <Pressable onPress={onToggle} className="p-4">
        <View className="flex-row-reverse items-center gap-3">
          {/* Habit Number */}
          <Animated.View
            className="w-8 h-8 bg-text-brand rounded-full items-center justify-center"
            entering={FadeInRight.delay(400 + index * 100)
              .duration(600)
              .springify()
              .damping(15)
              .stiffness(120)}
          >
            <Text className="text-white font-ibm-plex-arabic-bold text-sm">
              {index + 1}
            </Text>
          </Animated.View>

          {/* Habit Details */}
          <View className="flex-1">
            <Animated.Text
              className="font-ibm-plex-arabic text-text-primary text-right mb-1"
              entering={FadeInRight.delay(500 + index * 100)
                .duration(700)
                .springify()
                .damping(16)
                .stiffness(100)}
            >
              {habitData.title}
            </Animated.Text>
            <Animated.Text
              className="font-ibm-plex-arabic-light text-text-disabled text-xs text-right"
              entering={FadeInRight.delay(600 + index * 100)
                .duration(700)
                .springify()
                .damping(16)
                .stiffness(100)}
            >
              {habitData.subtitle || "عادة يومية مفيدة"}
            </Animated.Text>
          </View>

          {/* Expand/Collapse Icon */}
          <Animated.View
            className="w-10 h-10 bg-text-brand/20 rounded-xl items-center justify-center"
            entering={FadeInRight.delay(700 + index * 100)
              .duration(600)
              .springify()
              .damping(15)
              .stiffness(120)}
          >
            <Animated.View
              style={chevronStyle}
              layout={Layout.springify().damping(20).stiffness(150).mass(0.8)}
            >
              <Ionicons name="chevron-down" size={20} color="#00AEEF" />
            </Animated.View>
          </Animated.View>
        </View>
      </Pressable>

      {/* Dropdown Content - Ultra Fast Version */}
      {isExpanded && (
        <Animated.View
          entering={FadeInDown.duration(250)}
          exiting={FadeOutUp.duration(200)}
          className="border-t border-white/10"
        >
          <View className="px-4 pb-4">
            {/* Days Section */}
            <View className="mt-4 mb-3">
              <Text className="font-ibm-plex-arabic-bold text-text-secondary text-sm text-right mb-2">
                أيام الأسبوع:
              </Text>
              <View className="flex-row-reverse flex-wrap gap-2">
                {relatedDays.map((day: number) => (
                  <View
                    key={day}
                    className="bg-text-brand/20 px-3 py-1 rounded-full"
                  >
                    <Text className="font-ibm-plex-arabic text-xs text-text-brand">
                      {getDayName(day)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Salat Section */}
            <View>
              <Text className="font-ibm-plex-arabic-bold text-text-secondary text-sm text-right mb-2">
                مرتبط بصلاة:
              </Text>
              <View className="flex-row-reverse flex-wrap gap-2">
                {relatedSalat.map((salat: string) => (
                  <View
                    key={salat}
                    className="bg-green-500/20 px-3 py-1 rounded-full"
                  >
                    <Text className="font-ibm-plex-arabic text-xs text-green-500">
                      {getSalatName(salat)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );
};

export default BundleConfirmationScreen;
