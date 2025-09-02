import { WEEK_DAYS_AR } from "@/lib/dates";
import { PRAYERS, COLORS as PRAYER_COLORS } from "@/lib/prayers";
import {
  HabitDay,
  HabitProps,
  Category,
  DEFAULT_CATEGORIES,
} from "@/types/habit";
import { PrayerKey } from "@/types/salat";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
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
  View,
} from "react-native";
import { CategorySelector } from "../CategorySelector";

const isBlank = (s?: string) => !s || !s.trim();

interface AddHabitScreenProps {
  onClose?: () => void;
}

export const AddHabitScreen: React.FC<AddHabitScreenProps> = ({ onClose }) => {
  const router = useRouter();
  const [screenMode, setScreenMode] = useState<"selection" | "custom">(
    "selection"
  );
  const [title, setTitle] = useState("");
  const [quote, setQuote] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDays, setSelectedDays] = useState<HabitDay[]>([0]);
  const [salat, setSalat] = useState<PrayerKey[]>(["fajr"]);
  // priority state removed - no longer needed
  const [category, setCategory] = useState<Category>(DEFAULT_CATEGORIES[0]); // Default to first category

  // Live preview props (kept separate so we don't mutate the final object by mistake)

  const toggleDay = (d: HabitDay) => {
    setSelectedDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  };

  const toggleSalat = (key: PrayerKey) => {
    setSalat((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const onSave = async () => {
    if (isBlank(title)) {
      Alert.alert("العنوان مطلوب", "يرجى إدخال اسم العادة.");
      return;
    }

    // Build a FINAL, strictly-typed habit object
    const newHabit: HabitProps = {
      id: String(Date.now()),
      title: title.trim(),
      quote: quote.trim() || undefined,
      description: description.trim() || undefined,
      streak: 0,
      completed: [], // no days completed yet
      relatedDays: [...selectedDays].sort((a, b) => a - b),
      relatedSalat: [...salat],
      // priority removed - no longer needed
      category, // Add the selected category
    };

    try {
      const existingHabits = await AsyncStorage.getItem("habits");
      const habits = existingHabits ? JSON.parse(existingHabits) : [];
      habits.push(newHabit);

      await AsyncStorage.setItem("habits", JSON.stringify(habits));
      console.log("Saved new habit:", newHabit);
      console.log("Total habits now:", habits.length);

      if (onClose) {
        onClose();
      } else {
        router.navigate("/(tabs)/time");
      }
    } catch (error) {
      console.error("Error saving habit:", error);
      Alert.alert("خطأ", "حدث خطأ أثناء حفظ العادة. يرجى المحاولة مرة أخرى.");
    }
  };

  // Selection screen for choosing between custom habit and browsing habits
  const renderSelectionScreen = () => (
    <>
      <View className="w-full my-8 ">
        <Text className="text-white font-ibm-plex-arabic-bold text-xl text-center mb-6">
          اختر طريقة إضافة العادة
        </Text>

        <View className="gap-5">
          <Pressable
            onPress={() => setScreenMode("custom")}
            accessibilityRole="button"
            accessibilityLabel="إنشاء عادة مخصصة"
            className="rounded-2xl px-4 py-5 bg-[#1E40AF] active:opacity-90 active:scale-95"
            android_ripple={{ color: "#3B82F6" }}
          >
            <View className="flex-row-reverse items-center justify-center gap-3">
              <Ionicons name="create-outline" size={24} color="#fff" />
              <Text className="text-center font-ibm-plex-arabic-semibold text-white text-lg">
                إنشاء عادة مخصصة
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => router.navigate("/(tabs)/home/(habit)")}
            accessibilityRole="button"
            accessibilityLabel="تصفح العادات المقترحة"
            className="rounded-2xl px-4 py-5 bg-[#164E63] active:opacity-90 active:scale-95"
            android_ripple={{ color: "#0E7490" }}
          >
            <View className="flex-row-reverse items-center justify-center gap-3">
              <Ionicons name="list-outline" size={24} color="#fff" />
              <Text className="text-center font-ibm-plex-arabic-semibold text-white text-lg">
                تصفح العادات المقترحة
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </>
  );

  // Custom habit creation form
  const renderCustomHabitForm = () => (
    <>
      {/* Preview */}
      <View style={styles.previewBlock}></View>

      {/* Title */}
      <View style={styles.section}>
        <Text className="text-text-primary font-ibm-plex-arabic text-right">
          عنوان العادة
        </Text>
        <TextInput
          className="font-ibm-plex-arabic-light text-sm py-4 border-[1px] border-text-primary  px-3 text-text-primary rounded-2xl "
          style={[{ writingDirection: "rtl" }]}
          value={title}
          onChangeText={setTitle}
          placeholder="مثال: قراءة 10 آيات"
          placeholderTextColor="#94A3B8"
          maxLength={80}
          returnKeyType="done"
          accessibilityLabel="Habit title"
        />
      </View>

      {/* Quote */}
      <View style={styles.section}>
        <Text className="text-text-primary font-ibm-plex-arabic text-right">
          عبارة ذات صلة ( اختياري )
        </Text>
        <TextInput
          className="font-ibm-plex-arabic-light text-sm py-4 border-[1px] border-text-primary  px-3 text-text-primary rounded-2xl "
          style={[{ writingDirection: "rtl" }]}
          value={quote}
          onChangeText={setQuote}
          placeholder="أَرَأَيْتَ مَنِ اتَّخَذَ إِلَٰهَهُ هَوَاهُ"
          placeholderTextColor="#94A3B8"
          maxLength={120}
          returnKeyType="done"
          accessibilityLabel="Habit quote"
        />
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text className="text-text-primary font-ibm-plex-arabic text-right">
          الوصف
        </Text>
        <TextInput
          className="font-ibm-plex-arabic-light text-sm py-4 border-[1px] border-text-primary  px-3 text-text-primary rounded-2xl "
          style={[{ writingDirection: "rtl" }]}
          value={description}
          onChangeText={setDescription}
          placeholder="تفاصيل أو ملاحظات للعادة"
          placeholderTextColor="#94A3B8"
          maxLength={200}
          returnKeyType="done"
          multiline
          numberOfLines={3}
          accessibilityLabel="Habit description"
        />
      </View>

      {/* Priority selector removed - no longer needed */}

      {/* Category selector */}
      <View style={styles.section}>
        <CategorySelector
          selectedCategory={category}
          onCategoryChange={setCategory}
          title="فئة العادة"
        />
      </View>

      {/* Days selector */}
      <View style={styles.section}>
        <Text className="text-text-primary font-ibm-plex-arabic text-right">
          أيام التنفيذ
        </Text>
        <View style={styles.daysRow}>
          {WEEK_DAYS_AR.map((label, idx) => {
            const day = idx as HabitDay;
            const selected = selectedDays.includes(day);
            return (
              <Pressable
                key={label}
                onPress={() => toggleDay(day)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                className={`rounded-xl px-3 py-2 ${
                  selected ? "bg-text-brand" : "bg-transparent"
                }`}
                style={[styles.dayPill]}
              >
                <Text
                  style={[
                    !selected ? { color: "#6B7280" } : { color: "#E5F8FF" },
                  ]}
                  className="font-ibm-plex-arabic "
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Salat selector */}
      <View style={styles.section}>
        <Text className="text-text-primary font-ibm-plex-arabic text-right">
          مرتبطة بصلاة
        </Text>
        <View style={styles.salatRow}>
          {PRAYERS.map((p) => {
            const active = salat.includes(p.key);
            return (
              <Pressable
                key={p.key}
                onPress={() => toggleSalat(p.key)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={[
                  styles.salatItem,
                  {
                    borderColor: active ? "#00AEEF" : "#1F2937",
                  },
                  active && { backgroundColor: "#0F172A" },
                ]}
              >
                <Text style={styles.salatName} className="font-ibm-plex-arabic">
                  {p.name}
                </Text>
                <Text style={styles.salatTime}>{p.time}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Actions */}
      <View className="mt-6">
        <Pressable
          onPress={onSave}
          disabled={isBlank(title)}
          accessibilityRole="button"
          accessibilityLabel="حفظ"
          android_ripple={{ color: "#F3F4F6" }}
          className="rounded-2xl px-4 py-3 bg-text-brand active:opacity-90 active:scale-95 disabled:opacity-50"
        >
          <Text className="text-center font-ibm-plex-arabic-semibold text-text-primary">
            حفظ
          </Text>
        </Pressable>
      </View>
    </>
  );

  return (
    <ScrollView contentContainerStyle={styles.content} className="flex-1">
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            onClose ? onClose() : router.navigate("/(tabs)/time")
          }
          style={styles.headerBtn}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </Pressable>
        <Text className="text-white font-ibm-plex-arabic-bold text-xl">
          {screenMode === "selection"
            ? "اختيار نوع العادة"
            : "إنشاء عادة مخصصة"}
        </Text>
        <View style={styles.headerBtn} />
      </View>

      {/* Render content based on mode */}
      {screenMode === "selection"
        ? renderSelectionScreen()
        : renderCustomHabitForm()}

      <View style={{ height: 24 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0B1220" },
  flex: { flex: 1 },
  content: {
    padding: 12,
    justifyContent: "center",
    backgroundColor: "#000000",
  },
  header: {
    height: 48,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row-reverse",
    marginBottom: 8,
  },
  headerBtn: { width: 40, alignItems: "center", justifyContent: "center" },
  previewBlock: { marginTop: 6, marginBottom: 12 },
  section: { marginTop: 14 },
  daysRow: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  dayPill: {
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  salatRow: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 10,
  },
  salatItem: {
    width: "31%",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    alignItems: "center",
    gap: 6,
  },
  salatEmoji: { fontSize: 18 },
  salatName: { color: "#E5E7EB" },
  salatTime: { color: "#94A3B8", fontSize: 11 },
  // priorityRow style removed - no longer needed
});

export default AddHabitScreen;
