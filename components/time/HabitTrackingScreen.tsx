import { PRAYERS } from "@/assets/constants/prayers";
import { HabitDay, HabitProps } from "@/types/habit";
import { PrayerKey } from "@/types/salat";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import HabitCalendar from "../tracking/habitCalendar";

// Arabic day names
const DAY_NAMES = [
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];

type HabitTrackingScreenProps = {
  habit: HabitProps;
};

// Header Component with back button and title
const Header = ({
  habit,
  onBack,
}: {
  habit: HabitProps;
  onBack: () => void;
}) => {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Pressable onPress={onBack} style={styles.backButton} hitSlop={12}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </Pressable>

        <View style={styles.titleContainer}>
          <Text className="text-white font-ibm-plex-arabic-bold text-xl text-center">
            تتبع العادة
          </Text>
          <Text className="text-slate-400 font-ibm-plex-arabic-medium text-sm text-center mt-1">
            {habit.title}
          </Text>
        </View>

        <Pressable
          onPress={() => {
            // Navigate to details screen
            router.push({
              pathname: "/(tabs)/time/habitDetails",
              params: { habit: JSON.stringify(habit) },
            });
          }}
          style={styles.backButton}
          hitSlop={12}
        >
          <Ionicons name="create-outline" size={22} color="#00AEEF" />
        </Pressable>
      </View>
    </View>
  );
};

// Progress Circle Component with animated percentage
const ProgressCircle = ({ percentage }: { percentage: number }) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: withSpring(`${percentage * 3.6}deg`, {
            damping: 15,
            stiffness: 100,
          }),
        },
      ],
    };
  });

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressCircle}>
        <View style={styles.progressBackground} />
        <Animated.View
          style={[
            styles.progressFill,
            animatedStyle,
            { backgroundColor: "#00AEEF" },
          ]}
        />
        <View style={styles.progressCenter}>
          <Text className="text-text-primary font-ibm-plex-arabic-bold text-3xl">
            {Math.round(percentage)}%
          </Text>
          <Text className="text-text-primary font-ibm-plex-arabic-medium text-sm">
            مكتمل
          </Text>
        </View>
      </View>
    </View>
  );
};

// Statistics Card Component
const StatCard = ({
  icon,
  title,
  value,
  color = "#00AEEF",
}: {
  icon: string;
  title: string;
  value: string | number;
  color?: string;
}) => (
  <View style={styles.statCard}>
    <View style={[styles.statIcon, { backgroundColor: `${color}15` }]}>
      <Ionicons name={icon as any} size={20} color={color} />
    </View>
    <View style={styles.statContent}>
      <Text className="text-white font-ibm-plex-arabic-bold text-2xl">
        {value}
      </Text>
      <Text className="text-text-disabled mt-2 font-ibm-plex-arabic text-center text-nowrap text-sm">
        {title}
      </Text>
    </View>
  </View>
);

// Days Display Component
const DaysDisplay = ({ selectedDays }: { selectedDays: HabitDay[] }) => (
  <View style={styles.daysContainer}>
    <Text className="text-white font-ibm-plex-arabic-semibold text-right text-lg mb-3">
      أيام التنفيذ
    </Text>
    <View style={styles.daysRow}>
      {DAY_NAMES.map((dayName, index) => {
        const isSelected = selectedDays.includes(index as HabitDay);
        return (
          <View
            key={index}
            style={[styles.dayPill, isSelected && styles.dayPillActive]}
          >
            <Text
              className="font-ibm-plex-arabic-medium  text-sm"
              style={{ color: isSelected ? "#E5F8FF" : "#64748B" }}
            >
              {dayName}
            </Text>
          </View>
        );
      })}
    </View>
  </View>
);

// Prayers Display Component
const PrayersDisplay = ({
  selectedPrayers,
}: {
  selectedPrayers: PrayerKey[];
}) => (
  <View style={styles.prayersContainer}>
    <Text className="text-white font-ibm-plex-arabic-semibold text-right text-lg mb-3">
      مرتبطة بصلاة
    </Text>
    <View style={styles.prayersRow}>
      {selectedPrayers.length > 0 ? (
        selectedPrayers.map((prayerKey) => {
          const prayer = PRAYERS.find((p) => p.key === prayerKey);
          return prayer ? (
            <View key={prayerKey} style={styles.prayerBadge}>
              <Text className="font-ibm-plex-arabic-medium text-text-primary text-sm text-center">
                {prayer.name}
              </Text>
            </View>
          ) : null;
        })
      ) : (
        <View style={styles.emptyPrayers}>
          <Text className="text-slate-400 font-ibm-plex-arabic text-center text-sm">
            غير مرتبطة بصلاة
          </Text>
        </View>
      )}
    </View>
  </View>
);

// Calendar Placeholder Component

// Main Component
export const HabitTrackingScreen: React.FC<HabitTrackingScreenProps> = ({
  habit,
}) => {
  const router = useRouter();
  console.log(habit);
  type CompletionRecord = { date: string; prayer?: string };

  const completedDatesForCalendar = useMemo(() => {
    const relatedPrayers = (habit.relatedSalat || []) as string[];

    // Normalize to array of { date, prayer }
    const records: CompletionRecord[] = Array.isArray(habit.completed)
      ? habit.completed.map((rec: any) =>
          typeof rec === "string"
            ? { date: rec, prayer: undefined }
            : { date: rec?.date, prayer: rec?.prayer }
        )
      : [];

    // Build map: date -> Set(prayersCompleted)
    const dateToPrayers = new Map<string, Set<string>>();
    for (const r of records) {
      if (!r?.date) continue;
      const key = r.date;
      if (!dateToPrayers.has(key)) dateToPrayers.set(key, new Set());
      if (r.prayer) dateToPrayers.get(key)!.add(r.prayer);
      // If no specific prayer provided, treat as whole-day completion
      if (!r.prayer) dateToPrayers.get(key)!.add("__any__");
    }

    const result: string[] = [];
    for (const [date, prayersSet] of dateToPrayers) {
      if (relatedPrayers.length === 0) {
        // Any completion counts
        result.push(date);
      } else {
        // Require completion for all related salat on that date
        const allDone = relatedPrayers.every((p) => prayersSet.has(p));
        if (allDone) result.push(date);
      }
    }

    // Sort for consistency
    return result.sort();
  }, [habit.completed, habit.relatedSalat]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalCompleted = habit.completed?.length || 0;
    const totalDays = habit.relatedDays?.length || 1;
    const completionPercentage = Math.min(
      (totalCompleted / totalDays) * 100,
      100
    );

    return {
      totalCompleted,
      completionPercentage,
    };
  }, [habit]);
  return (
    <SafeAreaView style={styles.safe}>
      <Header habit={habit} onBack={() => router.navigate("/(tabs)/time")} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Section */}
        <View style={styles.progressSection}>
          <ProgressCircle percentage={stats.completionPercentage} />
        </View>

        {/* Statistics Section */}
        <View style={styles.statsSection}>
          <Text className="text-white font-ibm-plex-arabic-semibold text-center text-lg mb-4">
            إحصائيات الإنجاز
          </Text>
          <View style={styles.statsGrid}>
            <StatCard
              icon="calendar-outline"
              title="إجمالي المكتمل"
              value={stats.totalCompleted}
            />
            <StatCard
              icon="flame"
              title="أفضل سلسلة"
              value={habit.bestStreak ?? 0}
              color="#F59E0B"
            />
            <StatCard
              icon="trending-up"
              title="السلسلة الحالية"
              value={habit.streak}
              color="#10B981"
            />
          </View>
        </View>

        {/* Details Section */}
        <View style={styles.detailsSection}>
          <DaysDisplay selectedDays={(habit.relatedDays || []) as HabitDay[]} />
          <View style={styles.separator} />
          <PrayersDisplay selectedPrayers={habit.relatedSalat || []} />
        </View>

        <View style={styles.calendarContainer}>
          {/* Using the new HabitCalendar with Zustand integration */}
          {habit.id && (
            <HabitCalendar
              variant="embedded"
              habitId={habit.id}
              completedDates={completedDatesForCalendar}
              shouldDoOnWeekdays={habit.relatedDays}
            />
          )}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  safe: { backgroundColor: "#00070A" },
  content: { paddingBottom: 40, paddingTop: 20 },

  // Header
  header: {
    backgroundColor: "#0F172A",
    paddingTop: 40,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    minHeight: 48,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "#1E293B",
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
  },

  // Progress Section
  progressSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  progressContainer: {
    alignItems: "center",
  },
  progressCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  progressBackground: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 100,
    borderWidth: 8,
    borderColor: "#334155",
  },
  progressFill: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 100,
    borderWidth: 8,
    borderColor: "transparent",
    borderTopColor: "#00AEEF",
    transform: [{ rotate: "0deg" }],
  },
  progressCenter: {
    alignItems: "center",
    justifyContent: "center",
  },

  // Stats Section
  statsSection: {
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#1E293B",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statContent: {
    alignItems: "center",
  },

  // Details Section
  detailsSection: {
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 10,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#334155",
  },
  separator: {
    height: 1,
    backgroundColor: "#334155",
    marginVertical: 20,
  },

  // Days Display
  daysContainer: {
    marginBottom: 20,
  },
  daysRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "space-between",
  },
  dayPill: {
    flex: 1,
    minWidth: 80,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "#334155",
    alignItems: "center",
  },
  dayPillActive: {
    backgroundColor: "#00AEEF",
    borderColor: "#00AEEF",
  },

  // Prayers Display
  prayersContainer: {
    marginTop: 20,
  },
  prayersRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: 8,
  },
  prayerBadge: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#00AEEF",
    borderWidth: 1,
    borderColor: "#00AEEF",
    minWidth: 80,
    alignItems: "center",
  },
  emptyPrayers: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#0F172A",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    borderStyle: "dashed",
    alignItems: "center",
  },

  // Calendar Section
  calendarContainer: {
    backgroundColor: "#1E293B",
    borderRadius: 16,
    marginHorizontal: 10,
    paddingHorizontal: 19,
    paddingVertical: 22,
    borderWidth: 1,
    borderColor: "#334155",
  },
  calendarPlaceholder: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: "#0F172A",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    borderStyle: "dashed",
  },
});

export default HabitTrackingScreen;
