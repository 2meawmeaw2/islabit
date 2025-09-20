import { WEEK_DAYS_AR } from "@/lib/dates";
import { PRAYERS } from "@/assets/constants/prayers";
import {
  HabitDay,
  Category,
  DEFAULT_CATEGORIES,
  HabitProps,
} from "@/types/habit";
import { PrayerKey } from "@/types/salat";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  SlideInRight,
  SlideOutLeft,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { CategorySelector } from "@/components/CategorySelector";
import { createHabit, convertApiHabitToStore } from "@/lib/habits-api";
import { useHabitsStore } from "@/store/habitsStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function generateHabitId(title: string): string {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return `custom_${slug || "untitled"}_${Date.now()}`;
}

const isBlank = (s?: string) => !s || !s.trim();

// Enhanced validation with specific error messages
const validateStep = (step: number, habit: HabitProps) => {
  switch (step) {
    case 0:
      if (isBlank(habit.title)) return "يرجى إدخال عنوان للعادة";
      if (habit.title.length < 3) return "العنوان يجب أن يكون 3 أحرف على الأقل";
      return null;
    case 1:
      if (habit.description && habit.description.length < 10)
        return "الوصف يجب أن يكون 10 أحرف على الأقل إذا تم إدخاله";
      return null;
    case 2:
      if (habit.relatedDays.length === 0)
        return "يرجى اختيار يوم واحد على الأقل";
      if (habit.relatedSalat.length === 0)
        return "يرجى اختيار صلاة واحدة على الأقل";
      return null;
    default:
      return null;
  }
};

// Progress component with better visual feedback
const ProgressIndicator = ({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring(currentStep / (totalSteps - 1));
  }, [currentStep]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${interpolate(progress.value, [0, 1], [0, 100])}%`,
  }));

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, animatedStyle]} />
      </View>
      <Text className="text-text-primary font-ibm-plex-arabic text-center mt-2">
        الخطوة {currentStep + 1} من {totalSteps}
      </Text>
    </View>
  );
};

// Error message component
const ErrorMessage = ({ message }: { message?: string | null }) => {
  if (!message) return null;

  return (
    <Animated.View entering={FadeInUp} style={styles.errorContainer}>
      <Ionicons name="alert-circle" size={16} color="#EF4444" />
      <Text style={styles.errorText}>{message}</Text>
    </Animated.View>
  );
};

// Success feedback component
const SuccessMessage = ({ message }: { message: string }) => (
  <Animated.View entering={FadeInUp} style={styles.successContainer}>
    <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
    <Text style={styles.successText}>{message}</Text>
  </Animated.View>
);

export default function CreateCustomHabit() {
  const router = useRouter();
  const { habits, setHabits, saveHabitsToStorage } = useHabitsStore();
  const insets = useSafeAreaInsets();

  const [habit, setHabit] = useState<HabitProps>({
    id: "",
    title: "",
    quote: "",
    description: "",
    streak: 0,
    bestStreak: 0,
    completed: [],
    relatedSalat: ["fajr"],
    relatedDays: [0],
    category: DEFAULT_CATEGORIES[0],
    color: "#7E57C2",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [step, setStep] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [containerWidth, setContainerWidth] = useState(
    Dimensions.get("window").width
  );

  const pagerRef = useRef<ScrollView>(null);
  const titleInputRef = useRef<TextInput>(null);

  // Auto-focus title input when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      titleInputRef.current?.focus();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Clear validation error when user makes changes
  useEffect(() => {
    if (validationError) {
      setValidationError(null);
    }
  }, [habit.title, habit.description, habit.relatedDays, habit.relatedSalat]);

  const toggleDay = useCallback((d: HabitDay) => {
    setHabit((prev) => ({
      ...prev,
      relatedDays: prev.relatedDays.includes(d)
        ? prev.relatedDays.filter((x) => x !== d)
        : [...prev.relatedDays, d],
    }));
    Haptics.selectionAsync();
  }, []);

  const toggleSalat = useCallback((key: PrayerKey) => {
    setHabit((prev) => ({
      ...prev,
      relatedSalat: prev.relatedSalat.includes(key)
        ? prev.relatedSalat.filter((k) => k !== key)
        : [...prev.relatedSalat, key],
    }));
    Haptics.selectionAsync();
  }, []);

  const onSave = async () => {
    const error = validateStep(step, habit);
    if (error) {
      setValidationError(error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsSaving(true);
    try {
      const ensuredId =
        habit.id && habit.id.length > 0
          ? habit.id
          : generateHabitId(habit.title);

      const newHabit: HabitProps = {
        ...habit,
        id: ensuredId,
      };

      const existingHabits = await AsyncStorage.getItem("habits");
      const habitsArray = existingHabits ? JSON.parse(existingHabits) : [];
      habitsArray.push(newHabit);
      await AsyncStorage.setItem("habits", JSON.stringify(habitsArray));

      const updatedHabits = [
        ...habits,
        { ...newHabit, source: "individual" as const },
      ];
      setHabits(updatedHabits);

      // Show success feedback before navigating
      setShowSuccess(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error) {
      console.error("Error creating habit:", error);
      setValidationError("حدث خطأ أثناء حفظ العادة. يرجى المحاولة مرة أخرى.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSaving(false);
    }
  };

  function scrollToStep(index: number) {
    if (!pagerRef.current) return;
    const clamped = Math.max(0, Math.min(3, index));
    pagerRef.current.scrollTo({ x: clamped * containerWidth, animated: true });
    setStep(clamped);
    Haptics.selectionAsync();
  }

  function goNext() {
    const error = validateStep(step, habit);
    if (error) {
      setValidationError(error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    scrollToStep(step + 1);
  }

  function goPrev() {
    scrollToStep(step - 1);
  }

  // Handle back gesture with confirmation
  const handleBack = () => {
    if (habit.title.trim() || (habit.description || "").trim()) {
      Alert.alert(
        "تأكيد الخروج",
        "هل تريد الخروج بدون حفظ؟ ستفقد جميع التغييرات.",
        [
          { text: "إلغاء", style: "cancel" },
          { text: "خروج", style: "destructive", onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  if (showSuccess) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successScreen}>
          <Animated.View
            entering={FadeInUp.delay(200)}
            style={styles.successContent}
          >
            <Ionicons name="checkmark-circle" size={80} color="#22C55E" />
            <Text className="text-white font-ibm-plex-arabic-bold text-2xl text-center mt-4">
              تم إنشاء العادة بنجاح!
            </Text>
            <Text className="text-gray-300 font-ibm-plex-arabic text-center mt-2">
              {habit.title}
            </Text>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        if (w && Math.abs(w - containerWidth) > 1) setContainerWidth(w);
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={insets.top + 56}
        style={styles.keyboardAvoid}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.7}
            onPress={handleBack}
            style={styles.headerBtn}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text className="text-white font-ibm-plex-arabic-bold text-lg">
            إنشاء عادة مخصصة
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Progress indicator */}
        <ProgressIndicator currentStep={step} totalSteps={4} />

        {/* Error message */}
        <ErrorMessage message={validationError} />

        <ScrollView
          ref={pagerRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onMomentumScrollEnd={(e) => {
            const x = e.nativeEvent.contentOffset.x;
            const nextStep = Math.round(x / containerWidth);
            setStep(nextStep);
          }}
          style={styles.pager}
        >
          {/* Step 1: Title */}
          <View style={[styles.page, { width: containerWidth }]}>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              automaticallyAdjustKeyboardInsets
              contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
              style={{ flex: 1 }}
            >
              <Animated.View
                entering={SlideInRight}
                style={styles.scrollContent}
              >
                <View style={styles.stepHeader}>
                  <Text className="text-white font-ibm-plex-arabic-bold text-xl text-center">
                    ما هي العادة التي تريد إنشاؤها؟
                  </Text>
                  <Text className="text-gray-400 font-ibm-plex-arabic text-center mt-2">
                    اختر عنواناً واضحاً ومحدداً
                  </Text>
                </View>

                <View style={styles.section}>
                  <Text className="text-text-primary font-ibm-plex-arabic text-right mb-3">
                    عنوان العادة *
                  </Text>
                  <TextInput
                    ref={titleInputRef}
                    className="font-ibm-plex-arabic-light text-lg py-5 border-2 border-text-primary px-4 text-text-primary rounded-2xl"
                    style={[
                      { writingDirection: "rtl" },
                      validationError && styles.inputError,
                      habit.title.trim() && styles.inputValid,
                    ]}
                    value={habit.title}
                    onChangeText={(t) => setHabit((p) => ({ ...p, title: t }))}
                    placeholder="مثال: قراءة 10 آيات يومياً"
                    placeholderTextColor="#94A3B8"
                    maxLength={80}
                    returnKeyType="done"
                    accessibilityLabel="عنوان العادة"
                  />
                  <Text className="text-gray-400 font-ibm-plex-arabic text-right text-sm mt-1">
                    {habit.title.length}/80
                  </Text>
                </View>
              </Animated.View>
            </ScrollView>
          </View>

          {/* Step 2: Description + Quote + Category */}
          <View style={[styles.page, { width: containerWidth }]}>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              automaticallyAdjustKeyboardInsets
              contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
              style={{ flex: 1 }}
            >
              <Animated.View
                entering={SlideInRight}
                style={styles.scrollContent}
              >
                <View style={styles.stepHeader}>
                  <Text className="text-white font-ibm-plex-arabic-bold text-xl text-center">
                    أضف التفاصيل
                  </Text>
                  <Text className="text-gray-400 font-ibm-plex-arabic text-center mt-2">
                    اجعل عادتك أكثر وضوحاً وإلهاماً
                  </Text>
                </View>

                <View style={styles.section}>
                  <Text className="text-text-primary font-ibm-plex-arabic text-right mb-3">
                    الوصف
                  </Text>
                  <TextInput
                    className="font-ibm-plex-arabic-light text-sm py-4 border-[1px] border-text-primary px-3 text-text-primary rounded-2xl"
                    style={[
                      { writingDirection: "rtl", minHeight: 80 },
                      (habit.description || "").trim() && styles.inputValid,
                    ]}
                    value={habit.description || ""}
                    onChangeText={(t) =>
                      setHabit((p) => ({ ...p, description: t }))
                    }
                    placeholder="وصف مفصل للعادة وكيفية تنفيذها"
                    placeholderTextColor="#94A3B8"
                    maxLength={200}
                    returnKeyType="done"
                    multiline
                    numberOfLines={4}
                    accessibilityLabel="وصف العادة"
                  />
                  <Text className="text-gray-400 font-ibm-plex-arabic text-right text-sm mt-1">
                    {(habit.description || "").length}/200
                  </Text>
                </View>

                <View style={styles.section}>
                  <Text className="text-text-primary font-ibm-plex-arabic text-right mb-3">
                    عبارة ملهمة (اختياري)
                  </Text>
                  <TextInput
                    className="font-ibm-plex-arabic-light text-sm py-4 border-[1px] border-text-primary px-3 text-text-primary rounded-2xl"
                    style={[
                      { writingDirection: "rtl" },
                      (habit.quote || "").trim() && styles.inputValid,
                    ]}
                    value={habit.quote || ""}
                    onChangeText={(t) => setHabit((p) => ({ ...p, quote: t }))}
                    placeholder="آية قرآنية أو حديث أو عبارة محفزة"
                    placeholderTextColor="#94A3B8"
                    maxLength={120}
                    returnKeyType="done"
                    accessibilityLabel="العبارة الملهمة"
                  />
                  <Text className="text-gray-400 font-ibm-plex-arabic text-right text-sm mt-1">
                    {(habit.quote || "").length}/120
                  </Text>
                </View>

                <View style={styles.section}>
                  <CategorySelector
                    selectedCategory={habit.category as Category}
                    onCategoryChange={(c) =>
                      setHabit((p) => ({ ...p, category: c }))
                    }
                    title="فئة العادة"
                  />
                </View>
              </Animated.View>
            </ScrollView>
          </View>

          {/* Step 3: Time (Days + Salat) */}
          <View style={[styles.page, { width: containerWidth }]}>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              automaticallyAdjustKeyboardInsets
              contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
              style={{ flex: 1 }}
            >
              <Animated.View
                entering={SlideInRight}
                style={styles.scrollContent}
              >
                <View style={styles.stepHeader}>
                  <Text className="text-white font-ibm-plex-arabic-bold text-xl text-center">
                    متى ستمارس هذه العادة؟
                  </Text>
                  <Text className="text-gray-400 font-ibm-plex-arabic text-center mt-2">
                    اختر الأيام والأوقات المناسبة
                  </Text>
                </View>

                <View style={styles.section}>
                  <Text className="text-text-primary font-ibm-plex-arabic text-right mb-3">
                    أيام التنفيذ *
                  </Text>
                  <View style={styles.daysRow}>
                    {WEEK_DAYS_AR.map((label, idx) => {
                      const day = idx as HabitDay;
                      const selected = habit.relatedDays.includes(day);
                      return (
                        <Pressable
                          key={label}
                          onPress={() => toggleDay(day)}
                          accessibilityRole="button"
                          accessibilityState={{ selected }}
                          style={[
                            styles.dayPill,
                            selected && styles.dayPillSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.dayText,
                              selected && styles.dayTextSelected,
                            ]}
                            className="font-ibm-plex-arabic"
                          >
                            {label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  <Text className="text-gray-400 font-ibm-plex-arabic text-right text-sm mt-2">
                    تم اختيار {habit.relatedDays.length} يوم
                  </Text>
                </View>

                <View style={styles.section}>
                  <Text className="text-text-primary font-ibm-plex-arabic text-right mb-3">
                    مرتبطة بصلاة *
                  </Text>
                  <View style={styles.salatRow}>
                    {PRAYERS.map(
                      (p: { key: PrayerKey; name: string; time: string }) => {
                        const active = habit.relatedSalat.includes(p.key);
                        return (
                          <Pressable
                            key={p.key}
                            onPress={() => toggleSalat(p.key)}
                            accessibilityRole="button"
                            accessibilityState={{ selected: active }}
                            style={[
                              styles.salatItem,
                              active && styles.salatItemSelected,
                            ]}
                          >
                            <Text
                              style={[
                                styles.salatName,
                                active && styles.salatNameSelected,
                              ]}
                              className="font-ibm-plex-arabic"
                            >
                              {p.name}
                            </Text>
                            <Text
                              style={[
                                styles.salatTime,
                                active && styles.salatTimeSelected,
                              ]}
                            >
                              {p.time}
                            </Text>
                          </Pressable>
                        );
                      }
                    )}
                  </View>
                  <Text className="text-gray-400 font-ibm-plex-arabic text-right text-sm mt-2">
                    تم اختيار {habit.relatedSalat.length} صلاة
                  </Text>
                </View>
              </Animated.View>
            </ScrollView>
          </View>

          {/* Step 4: Commit + Color Selection */}
          <View style={[styles.page, { width: containerWidth }]}>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              automaticallyAdjustKeyboardInsets
              contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
              style={{ flex: 1 }}
            >
              <Animated.View
                entering={SlideInRight}
                style={styles.scrollContent}
              >
                <View style={styles.stepHeader}>
                  <Text className="text-white font-ibm-plex-arabic-bold text-xl text-center">
                    اللمسة الأخيرة
                  </Text>
                  <Text className="text-gray-400 font-ibm-plex-arabic text-center mt-2">
                    اختر لوناً مميزاً وأكمل الإعداد
                  </Text>
                </View>

                {/* Habit Summary */}
                <Animated.View
                  entering={FadeInDown.delay(200)}
                  style={styles.summaryCard}
                >
                  <Text className="font-ibm-plex-arabic-semibold text-lg text-right text-text-primary mb-2">
                    ملخص العادة
                  </Text>
                  <Text className="text-white font-ibm-plex-arabic-bold text-xl text-right mb-2">
                    {habit.title || "بدون عنوان"}
                  </Text>
                  {habit.description && (
                    <Text className="text-gray-300 font-ibm-plex-arabic text-right mb-2">
                      {habit.description}
                    </Text>
                  )}
                  <Text className="text-blue-300 font-ibm-plex-arabic text-right">
                    {habit.relatedDays.length} أيام •{" "}
                    {habit.relatedSalat.length} صلوات
                  </Text>
                </Animated.View>

                {/* Color Selection */}
                <Animated.View
                  entering={FadeInDown.delay(400)}
                  style={styles.colorSection}
                >
                  <Text className="font-ibm-plex-arabic-semibold text-lg text-right text-text-primary mb-4">
                    لون العادة
                  </Text>
                  <View className="flex-row-reverse flex-wrap gap-3">
                    {[
                      "#7E57C2",
                      "#4CAF50",
                      "#2196F3",
                      "#FF9800",
                      "#E91E63",
                      "#00BCD4",
                      "#FF5722",
                      "#607D8B",
                    ].map((color) => (
                      <Pressable
                        key={color}
                        onPress={() => {
                          setHabit((prev) => ({ ...prev, color: color }));
                          Haptics.selectionAsync();
                        }}
                        className={`w-12 h-12 rounded-full border-3 ${
                          habit.color === color
                            ? "border-white"
                            : "border-white/30"
                        }`}
                        style={[
                          { backgroundColor: color },
                          habit.color === color && styles.selectedColor,
                        ]}
                      >
                        {habit.color === color && (
                          <View className="w-full h-full items-center justify-center">
                            <Ionicons name="checkmark" size={22} color="#fff" />
                          </View>
                        )}
                      </Pressable>
                    ))}
                  </View>
                </Animated.View>

                <Animated.View
                  entering={FadeInDown.delay(600)}
                  className="mt-8"
                >
                  <Pressable
                    onPress={onSave}
                    disabled={isSaving}
                    accessibilityRole="button"
                    accessibilityLabel="حفظ العادة"
                    style={[
                      styles.saveButton,
                      isSaving && styles.saveButtonDisabled,
                    ]}
                  >
                    <Text className="text-center font-ibm-plex-arabic-semibold text-white text-lg">
                      {isSaving ? "جاري الحفظ..." : "إنشاء العادة"}
                    </Text>
                    {!isSaving && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color="#fff"
                      />
                    )}
                  </Pressable>
                </Animated.View>
              </Animated.View>
            </ScrollView>
          </View>
        </ScrollView>

        {/* Enhanced Footer navigation */}
        <View style={styles.footer}>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={goPrev}
            disabled={step === 0}
            style={[styles.navBtn, step === 0 && styles.navBtnDisabled]}
          >
            <Ionicons
              name="chevron-back"
              size={18}
              color={step === 0 ? "#666" : "#fff"}
            />
            <Text
              className="font-ibm-plex-arabic ml-2"
              style={{ color: step === 0 ? "#666" : "#fff" }}
            >
              السابق
            </Text>
          </TouchableOpacity>

          {step < 3 ? (
            <TouchableOpacity
              accessibilityRole="button"
              onPress={goNext}
              style={styles.nextBtn}
            >
              <Text className="text-white font-ibm-plex-arabic mr-2">
                التالي
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#fff" />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 64 }} />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1220",
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#1A1E1F",
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
  },
  headerBtn: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00070A",
    borderRadius: 22,
    padding: 10,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progressTrack: {
    height: 4,
    backgroundColor: "#1F2937",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#00AEEF",
    borderRadius: 2,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderColor: "#FCA5A5",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
    marginLeft: 8,
    fontFamily: "IBMPlexSansArabic-Regular",
  },
  successContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  successText: {
    color: "#166534",
    fontSize: 14,
    marginLeft: 8,
    fontFamily: "IBMPlexSansArabic-Regular",
  },
  successScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0B1220",
  },
  successContent: {
    alignItems: "center",
    padding: 32,
  },
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    flex: 1,
  },
  stepHeader: {
    marginBottom: 32,
    paddingTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  inputError: {
    borderColor: "#EF4444",
    borderWidth: 2,
  },
  inputValid: {
    borderColor: "#22C55E",
  },
  daysRow: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 10,
  },
  dayPill: {
    borderWidth: 2,
    borderColor: "#1F2937",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "transparent",
  },
  dayPillSelected: {
    borderColor: "#00AEEF",
    backgroundColor: "#00AEEF20",
  },
  dayText: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  dayTextSelected: {
    color: "#00AEEF",
    fontWeight: "600",
  },
  salatRow: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 12,
  },
  salatItem: {
    width: "31%",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 2,
    borderColor: "#1F2937",
    alignItems: "center",
    gap: 6,
    backgroundColor: "transparent",
  },
  salatItemSelected: {
    borderColor: "#00AEEF",
    backgroundColor: "#00AEEF15",
  },
  salatName: {
    color: "#E5E7EB",
    fontSize: 14,
  },
  salatNameSelected: {
    color: "#00AEEF",
    fontWeight: "600",
  },
  salatTime: {
    color: "#94A3B8",
    fontSize: 11,
  },
  salatTimeSelected: {
    color: "#00AEEF",
  },
  summaryCard: {
    backgroundColor: "#1A1E1F",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#2D3748",
  },
  colorSection: {
    backgroundColor: "#1A1E1F",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#2D3748",
  },
  selectedColor: {
    transform: [{ scale: 1.1 }],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButton: {
    backgroundColor: "#00AEEF",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#00AEEF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonDisabled: {
    backgroundColor: "#374151",
    shadowOpacity: 0,
    elevation: 0,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#1F2937",
    backgroundColor: "#0B1220",
  },
  navBtn: {
    backgroundColor: "#1F2937",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 80,
  },
  navBtnDisabled: {
    backgroundColor: "#111827",
    opacity: 0.5,
  },
  nextBtn: {
    backgroundColor: "#00AEEF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 80,
  },
});
