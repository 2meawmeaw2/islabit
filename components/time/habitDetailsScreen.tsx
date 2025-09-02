import { PRAYERS, COLORS as PRAYER_COLORS } from "@/lib/prayers";
import { shadowStyle } from "@/lib/shadow";
import { HabitDay, HabitProps } from "@/types/habit";
import { PrayerKey } from "@/types/salat";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { CategorySelector } from "../CategorySelector";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const { width: screenWidth } = Dimensions.get("window");

// Constants
const DAY_NAMES = [
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];
// PRIORITY_OPTIONS removed - no longer needed

type HabitDetailsScreenProps = { habit?: HabitProps };

// Simple Header Component
const Header = ({
  isEditing,
  hasChanges,
  isSaving,
  isDeleting,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onBack,
}: {
  isEditing: boolean;
  hasChanges: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onBack: () => void;
}) => (
  <View style={styles.header}>
    <View style={styles.headerContent}>
      <Pressable onPress={onBack} style={styles.headerBtn} hitSlop={12}>
        <Ionicons name="arrow-forward" size={24} color="#fff" />
      </Pressable>

      <Text className="text-white font-ibm-plex-arabic-bold text-xl text-center">
        تفاصيل العادة
      </Text>

      <View style={styles.headerActions}>
        {isEditing ? (
          <>
            <Pressable onPress={onCancel} style={styles.headerBtn} hitSlop={12}>
              <Ionicons name="close" size={22} color="#9CA3AF" />
            </Pressable>
            <Pressable
              onPress={onSave}
              disabled={!hasChanges || isSaving}
              style={[
                styles.headerBtn,
                styles.saveBtn,
                (!hasChanges || isSaving) && styles.disabled,
              ]}
              hitSlop={12}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="checkmark" size={22} color="#fff" />
              )}
            </Pressable>
          </>
        ) : (
          <>
            <Pressable onPress={onEdit} style={styles.headerBtn} hitSlop={12}>
              <Ionicons name="create-outline" size={22} color="#00AEEF" />
            </Pressable>
            <Pressable
              onPress={onDelete}
              disabled={isDeleting}
              style={[styles.headerBtn, isDeleting && styles.disabled]}
              hitSlop={12}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <Ionicons name="trash-outline" size={22} color="#EF4444" />
              )}
            </Pressable>
          </>
        )}
      </View>
    </View>
  </View>
);

// Simple Section Component
const Section = ({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text className="text-white font-ibm-plex-arabic-semibold text-lg text-right flex-1">
        {title}
      </Text>
      <Ionicons name={icon as any} size={18} color="#00AEEF" />
    </View>
    <View style={styles.sectionContent}>{children}</View>
  </View>
);

// Simple Editable Field Component
const EditableField = ({
  value,
  onChangeText,
  placeholder,
  multiline = false,
  numberOfLines = 1,
  keyboardType = "default",
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: "default" | "numeric";
}) => (
  <TextInput
    value={value}
    onChangeText={onChangeText}
    className="font-ibm-plex-arabic text-base py-4 px-4 border border-slate-600 rounded-xl text-white bg-slate-800"
    style={{ writingDirection: "rtl", textAlign: "right" }}
    placeholder={placeholder}
    placeholderTextColor="#64748B"
    multiline={multiline}
    numberOfLines={numberOfLines}
    keyboardType={keyboardType}
  />
);

// Simple Display Field Component
const DisplayField = ({
  text,
  fallback,
  className = "text-text-disabled font-ibm-plex-arabic text-base text-right",
}: {
  text: string;
  fallback: string;
  className?: string;
}) => <Text className={className}>{text || fallback}</Text>;

// Simple Day Pills Component
const DayPills = ({
  selectedDays,
  isEditing,
  onToggle,
}: {
  selectedDays: HabitDay[];
  isEditing: boolean;
  onToggle: (day: HabitDay) => void;
}) => (
  <View className="flex-row-reverse flex-wrap gap-2">
    {DAY_NAMES.map((label, idx) => {
      const day = idx as HabitDay;
      const active = selectedDays.includes(day);
      return (
        <Pressable
          key={`day-${idx}`}
          onPress={() => isEditing && onToggle(day)}
          disabled={!isEditing}
          className={`${active ? "bg-text-brand" : "bg-fore"}  px-2 py-1 rounded-lg my-1`}
        >
          <Text
            className={`${active ? "text-text-primary" : "text-text-muted"}    font-ibm-plex-arabic-medium text-md`}
          >
            {label}
          </Text>
        </Pressable>
      );
    })}
  </View>
);

// PrioritySelector component removed - no longer needed

// Simple Salat Selector Component
const SalatSelector = ({
  selectedSalat,
  onToggle,
}: {
  selectedSalat: PrayerKey[];
  onToggle: (salat: PrayerKey) => void;
}) => (
  <View style={styles.salatContainer}>
    {PRAYERS.map((prayer) => {
      const active = selectedSalat.includes(prayer.key);
      return (
        <Pressable
          key={prayer.key}
          onPress={() => onToggle(prayer.key)}
          style={[
            styles.salatOption,
            active && {
              borderColor: "#00AEEF",
              backgroundColor: "#00AEEF15",
            },
          ]}
        >
          <Text
            className="font-ibm-plex-arabic text-center text-sm"
            style={{ color: active ? "#00AEEF" : "#64748B" }}
          >
            {prayer.name}
          </Text>
        </Pressable>
      );
    })}
  </View>
);

// Main Component
export const HabitDetailsScreen: React.FC<HabitDetailsScreenProps> = ({
  habit: habitProp,
}) => {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [habit, setHabit] = useState<HabitProps | undefined>(habitProp);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const originalHabitRef = useRef<HabitProps | undefined>(habitProp);

  // Update habit state when habitProp changes
  useEffect(() => {
    if (habitProp) {
      setHabit(habitProp);
      originalHabitRef.current = habitProp;
    }
  }, [habitProp]);

  // Check for changes
  useEffect(() => {
    if (!isEditing && habit && habit.id && originalHabitRef.current?.id) {
      const timeoutId = setTimeout(() => {
        const changed =
          JSON.stringify(habit) !== JSON.stringify(originalHabitRef.current);
        setHasChanges(changed);
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [habit, isEditing]);

  // Define all hooks first
  // Update habit helper
  const updateHabit = useCallback((updates: Partial<HabitProps>) => {
    setHabit((prev) => (prev ? { ...prev, ...updates } : prev));
  }, []);

  // Toggle day selection
  const toggleDay = useCallback(
    (day: HabitDay) => {
      if (!isEditing) return;
      setHabit((prev) => {
        if (!prev) return prev;
        const currentDays = prev.relatedDays || [];
        const isDayIncluded = currentDays.includes(day);
        const newDays = isDayIncluded
          ? currentDays.filter((d) => d !== day)
          : [...currentDays, day].sort((a, b) => a - b);
        return { ...prev, relatedDays: newDays };
      });
    },
    [isEditing]
  );

  // Toggle salat selection
  const toggleSalat = useCallback(
    (salatKey: PrayerKey) => {
      if (!isEditing) return;
      setHabit((prev) => {
        if (!prev) return prev;
        const currentSalat = prev.relatedSalat || [];
        const isSalatIncluded = currentSalat.includes(salatKey);
        const newSalat = isSalatIncluded
          ? currentSalat.filter((s) => s !== salatKey)
          : [...currentSalat, salatKey];
        return { ...prev, relatedSalat: newSalat };
      });
    },
    [isEditing]
  );

  // Save changes
  const saveChanges = useCallback(async () => {
    if (!hasChanges || !habit) {
      setIsEditing(false);
      return;
    }

    try {
      setIsSaving(true);
      const habitsData = await AsyncStorage.getItem("habits");
      const habits = habitsData ? JSON.parse(habitsData) : [];
      const updatedHabits = habits.map((h: any) =>
        h.id === habit.id ? habit : h
      );
      await AsyncStorage.setItem("habits", JSON.stringify(updatedHabits));

      setIsEditing(false);
      setHasChanges(false);
      Alert.alert("تم الحفظ", "تم حفظ التغييرات بنجاح");
    } catch (error) {
      console.error("Error saving habit:", error);
      Alert.alert("خطأ", "حدث خطأ أثناء حفظ التغييرات");
    } finally {
      setIsSaving(false);
    }
  }, [habit, hasChanges]);

  // Delete habit
  const deleteHabit = useCallback(async () => {
    if (!habit) return;

    Alert.alert(
      "حذف العادة",
      "هل أنت متأكد من حذف هذه العادة؟ لا يمكن التراجع عن هذا الإجراء.",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "حذف",
          style: "destructive",
          onPress: async () => {
            try {
              setIsDeleting(true);
              const habitsData = await AsyncStorage.getItem("habits");
              const habits = habitsData ? JSON.parse(habitsData) : [];
              const updatedHabits = habits.filter(
                (h: any) => h.id !== habit.id
              );
              await AsyncStorage.setItem(
                "habits",
                JSON.stringify(updatedHabits)
              );

              Alert.alert("تم الحذف", "تم حذف العادة بنجاح");
              router.back();
            } catch (error) {
              console.error("Error deleting habit:", error);
              Alert.alert("خطأ", "حدث خطأ أثناء حذف العادة");
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  }, [habit, router]);

  // Cancel editing
  const cancelEditing = useCallback(() => {
    setHabit(originalHabitRef.current || habitProp);
    setIsEditing(false);
    setHasChanges(false);
  }, [habitProp]);

  // Calculate completion percentage
  const completionPercentage = habit
    ? Math.min(
        ((habit.completed?.length || 0) / (habit.relatedDays?.length || 1)) *
          100,
        100
      )
    : 0;

  // Early return AFTER all hooks have been called
  if (!habitProp) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00AEEF" />
          <Text className="text-text-disabled font-ibm-plex-arabic text-lg mt-4">
            جاري التحميل...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Safety check - if habit is not loaded yet, show loading
  if (!habit) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00AEEF" />
          <Text className="text-text-disabled font-ibm-plex-arabic text-lg mt-4">
            جاري التحميل...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Header
            isEditing={isEditing}
            hasChanges={hasChanges}
            isSaving={isSaving}
            isDeleting={isDeleting}
            onEdit={() => setIsEditing(true)}
            onSave={saveChanges}
            onCancel={cancelEditing}
            onDelete={deleteHabit}
            onBack={() => router.back()}
          />

          {/* Title Section */}
          <Section icon="text" title="عنوان العادة">
            {isEditing ? (
              <EditableField
                value={habit.title}
                onChangeText={(text) => updateHabit({ title: text })}
                placeholder="أدخل عنوان العادة"
              />
            ) : (
              <Text className="text-white font-ibm-plex-arabic-medium text-lg text-right leading-relaxed">
                {habit.title}
              </Text>
            )}
          </Section>

          {/* Quote Section */}
          <Section icon="chatbubble-ellipses" title="عبارة ملهمة">
            {isEditing ? (
              <EditableField
                value={habit.quote || ""}
                onChangeText={(text) =>
                  updateHabit({ quote: text || undefined })
                }
                placeholder="أدخل عبارة ملهمة (اختياري)"
                multiline
                numberOfLines={2}
              />
            ) : (
              <DisplayField
                text={habit.quote || ""}
                fallback="لا توجد عبارة ملهمة"
                className="text-slate-300 font-ibm-plex-arabic text-base text-right leading-relaxed"
              />
            )}
          </Section>

          {/* Description Section */}
          <Section icon="document-text" title="الوصف">
            {isEditing ? (
              <EditableField
                value={habit.description || ""}
                onChangeText={(text) =>
                  updateHabit({ description: text || undefined })
                }
                placeholder="أدخل وصف العادة (اختياري)"
                multiline
                numberOfLines={3}
              />
            ) : (
              <DisplayField
                text={habit.description || ""}
                fallback="لا يوجد وصف"
                className="text-slate-300 font-ibm-plex-arabic text-base text-right leading-relaxed"
              />
            )}
          </Section>

          {/* Priority Section removed - no longer needed */}

          {/* Category Section */}
          <Section icon="pricetag" title="الفئة">
            {isEditing ? (
              <CategorySelector
                selectedCategory={habit.category}
                onCategoryChange={(category) => updateHabit({ category })}
                title=""
              />
            ) : (
              <View
                style={[
                  styles.categoryBadge,
                  {
                    backgroundColor: `${habit.category.hexColor}15`,
                    borderColor: habit.category.hexColor,
                  },
                ]}
              >
                <Text
                  className="font-ibm-plex-arabic-medium text-sm ml-3"
                  style={{ color: habit.category.hexColor }}
                >
                  {habit.category.text}
                </Text>
                <View
                  style={[
                    styles.categoryDot,
                    { backgroundColor: habit.category.hexColor },
                  ]}
                />
              </View>
            )}
          </Section>

          {/* Days Section */}
          <Section icon="calendar" title="أيام التنفيذ">
            <DayPills
              selectedDays={(habit.relatedDays || []) as HabitDay[]}
              isEditing={isEditing}
              onToggle={toggleDay}
            />
          </Section>

          {/* Salat Section */}
          <Section icon="moon" title="مرتبطة بصلاة">
            {isEditing ? (
              <SalatSelector
                selectedSalat={habit.relatedSalat || []}
                onToggle={toggleSalat}
              />
            ) : (
              <View style={styles.salatRow}>
                {(habit.relatedSalat || []).length > 0 ? (
                  (habit.relatedSalat || []).map((salatKey) => {
                    const salat = PRAYERS.find((p) => p.key === salatKey);
                    return salat ? (
                      <View
                        key={salatKey}
                        style={[styles.salatBadge, { borderColor: "#00AEEF" }]}
                      >
                        <Text
                          className="font-ibm-plex-arabic-medium text-sm"
                          style={{ color: "#00AEEF" }}
                        >
                          {salat.name}
                        </Text>
                      </View>
                    ) : null;
                  })
                ) : (
                  <View style={styles.emptySalat}>
                    <Text className="text-slate-400 font-ibm-plex-arabic text-center text-sm">
                      غير مرتبطة بصلاة
                    </Text>
                  </View>
                )}
              </View>
            )}
          </Section>

          {/* Streak Section */}
          <Section icon="flame" title="سلسلة الإنجاز">
            {isEditing ? (
              <EditableField
                value={(habit.streak || 0).toString()}
                onChangeText={(text) =>
                  updateHabit({ streak: parseInt(text) || 0 })
                }
                placeholder="0"
                keyboardType="numeric"
              />
            ) : (
              <View style={styles.streakBadge}>
                <Text
                  className="font-ibm-plex-arabic-bold text-3xl text-center"
                  style={{ color: "#F59E0B" }}
                >
                  {habit.streak ?? 0}
                </Text>
                <Text
                  className="font-ibm-plex-arabic text-sm text-center"
                  style={{ color: "#94A3B8" }}
                >
                  يوم متتالي
                </Text>
              </View>
            )}
          </Section>

          {/* Stats Section */}
          <Section icon="stats-chart" title="إحصائيات الإنجاز">
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="calendar-outline" size={20} color="#00AEEF" />
                <Text className="text-text-disabled font-ibm-plex-arabic text-sm text-center">
                  إجمالي الأيام
                </Text>
                <Text className="text-text-primary font-ibm-plex-arabic-bold text-2xl text-center">
                  {(habit.completed || []).length}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="time-outline" size={20} color="#00AEEF" />
                <Text className="text-text-disabled font-ibm-plex-arabic text-sm text-center">
                  آخر إنجاز
                </Text>
                <Text className="text-text-primary font-ibm-plex-arabic-bold text-lg text-center">
                  {(habit.completed || []).length > 0
                    ? (() => {
                        const lastCompleted = (habit.completed || [])[
                          (habit.completed || []).length - 1
                        ];
                        // Handle both string dates and objects with date property
                        const dateValue =
                          typeof lastCompleted === "string"
                            ? lastCompleted
                            : (lastCompleted as any)?.date || lastCompleted;
                        return new Date(dateValue).toLocaleDateString("ar-SA");
                      })()
                    : "لا يوجد"}
                </Text>
              </View>
            </View>
          </Section>

          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Priority helper functions removed - no longer needed

// Clean, simplified styles
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#020617" },
  flex: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },

  // Header
  header: {
    backgroundColor: "#0F172A",
    paddingTop: 16,
    paddingBottom: 16,
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    height: 48,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  saveBtn: {
    backgroundColor: "#10B981",
    ...shadowStyle({
      color: "#10B981",
      offset: { width: 0, height: 2 },
      opacity: 0.3,
      radius: 4,
    }),
    elevation: 4,
  },
  disabled: { opacity: 0.4 },
  headerActions: { flexDirection: "row", gap: 12 },

  // Progress
  progressContainer: {
    marginBottom: 24,
    padding: 20,
    backgroundColor: "#1E293B",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#334155",
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#334155",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#00AEEF",
    borderRadius: 3,
    ...shadowStyle({
      color: "#00AEEF",
      offset: { width: 0, height: 1 },
      opacity: 0.5,
      radius: 2,
    }),
  },

  // Sections
  section: {
    marginBottom: 20,
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 0,
    borderWidth: 1,
    borderColor: "#334155",
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#0F172A",
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
    gap: 12,
  },
  sectionContent: {
    padding: 20,
  },

  // Days
  daysWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
  },
  dayButton: {
    width: "13%",
    aspectRatio: 1,
    backgroundColor: "#1E293B",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 35,
  },
  dayButtonActive: {
    backgroundColor: "#00AEEF",
    borderColor: "#00AEEF",
  },
  dayText: {
    fontSize: 12,
    fontFamily: "IBMPlexSansArabic-Medium",
    textAlign: "center",
  },

  // Priority styles removed - no longer needed
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    alignSelf: "center",
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  // Salat
  salatContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "space-between",
  },
  salatOption: {
    width: "30%",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#334155",
    backgroundColor: "#0F172A",
    minHeight: 50,
    justifyContent: "center",
  },
  salatBadge: {
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#334155",
    backgroundColor: "#0F172A",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  salatRow: {
    flexDirection: "row-reverse",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  emptySalat: {
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#0F172A",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    borderStyle: "dashed",
    justifyContent: "center",
  },

  // Streak
  streakBadge: {
    alignSelf: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 20,
    backgroundColor: "#0F172A",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#F59E0B",
    minWidth: 120,
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    gap: 16,
    justifyContent: "space-between",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: "#0F172A",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#334155",
    gap: 8,
  },
});
export default HabitDetailsScreen;
