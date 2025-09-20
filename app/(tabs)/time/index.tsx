import { PRAYERS } from "@/assets/constants/prayers";
import S from "@/assets/styles/shared";
import { FloatingActionMenu } from "@/components/FloatingActionMenu";
import BundleFilter from "@/components/time/BundleFilter";
import { SalatHabitsDisplay } from "@/components/time/SalatHabitsDisplay";
import DisplayDays from "@/components/time/displayDays";
import { useAuth } from "@/lib/auth";
import { fmtArabicDateMonthAndNumber } from "@/lib/dates";
import { loadUserById } from "@/lib/usersTable";
import { useBundlesStore } from "@/store/bundlesStore";
import { useHabitsStore } from "@/store/habitsStore";
import { AntDesign } from "@expo/vector-icons";
import { useRouter, router, Link } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Animated,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AddHabitScreen } from "@/components/time/addHabitScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { CompletionRecord } from "@/types/habit";
const OrganizeModes: React.FC = () => {
  // load user from user table in supabase
  loadUserById(useAuth().user?.id ?? "");

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedBundleId, setSelectedBundleId] = useState<string | null>(null);
  const router1 = useRouter();
  const [isModalVisible, setIsModalVisible] = useState(false);
  // Use Zustand store instead of local state
  const { habits, isHydrated, loadAllHabits, completeHabit, clearAllStorage } =
    useHabitsStore();

  const { bundles } = useBundlesStore();

  // Pre-filter habits when bundle selection changes
  const filteredHabits = useMemo(() => {
    if (!selectedBundleId) return habits;

    const selectedBundle = bundles.find((b) => b.id === selectedBundleId);
    if (!selectedBundle) return habits;

    return habits.filter(
      (habit) =>
        habit.source === "bundle" && habit.bundleTitle === selectedBundle.title
    );
  }, [habits, selectedBundleId, bundles]);

  // Function to get local date string in YYYY-MM-DD format (avoids UTC shift)
  const getDateStr = useCallback((date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  // Memoize the current date string to avoid recalculating on every render
  const currentDateStr = useMemo(
    () => getDateStr(selectedDate),
    [selectedDate, getDateStr]
  );

  useEffect(() => {
    router.prefetch("/(tabs)/time/salatTime");
  }, []);
  // Load habits when component mounts
  useEffect(() => {
    if (isHydrated) {
      loadAllHabits();
      useBundlesStore.getState().initialize();
    }
  }, [isHydrated, loadAllHabits]);
  const selectedDay = useMemo(() => selectedDate.getDay(), [selectedDate]);

  // Precompute per-prayer, per-day lists with completion flags and stable sorting
  const prayerHabitLists = useMemo(() => {
    const map: Record<string, any[]> = {};
    // Build once per date/day/filter change
    PRAYERS.forEach((p) => {
      const list = filteredHabits
        .filter(
          (habit: any) =>
            habit.relatedSalat.includes(p.key) &&
            habit.relatedDays.includes(selectedDay)
        )
        .map((habit) => {
          const completedArray = (habit.completed ?? []) as CompletionRecord[];
          const isCompletedForPrayer = completedArray.some(
            (record: CompletionRecord) =>
              record.date === currentDateStr && record.prayer === p.key
          );
          // Create a shallow copy only to attach the derived flag
          return {
            ...habit,
            completed: completedArray,
            isCompletedForSelectedDay: isCompletedForPrayer,
          };
        })
        .sort((a: any, b: any) => {
          const aCompleted = a.isCompletedForSelectedDay;
          const bCompleted = b.isCompletedForSelectedDay;
          if (aCompleted !== bCompleted) return aCompleted ? 1 : -1;
          if (a.source !== b.source) return a.source === "bundle" ? -1 : 1;
          return 0;
        });
      map[p.key] = list;
    });
    return map;
  }, [filteredHabits, selectedDay, currentDateStr]);

  const handleToggleHabit = useCallback(
    async (id: string, completed: boolean, prayerName?: string) => {
      const currentPrayer = prayerName || "unknown";

      // Use the store's completeHabit function with memoized date string
      completeHabit(id, currentDateStr, currentPrayer, completed);

      // Update bundle completion if this habit belongs to a bundle
      const { updateBundleCompletion } = useBundlesStore.getState();
      await updateBundleCompletion(id, currentDateStr, currentPrayer);
    },
    [currentDateStr, completeHabit]
  );

  const handleHabitPress = (habit: any) => {
    router1.push({
      pathname: "/(tabs)/time/habitDetails",
      params: {
        habit: JSON.stringify(habit),
        habitId: habit.id,
      },
    });
  };

  const handleAddHabit = () => {
    router1.push("/(tabs)/time/addNewHabit");
  };

  const handleGoToTracking = () => {
    router1.navigate("/(tabs)/time/tracking");
  };

  const handleClearAllStorage = async () => {
    try {
      await clearAllStorage();
      alert("Storage cleared successfully!");
    } catch (error) {
      console.error("Error clearing storage:", error);
      alert("Failed to clear storage");
    }
  };

  // Show loading while store is hydrating
  if (!isHydrated) {
    return (
      <SafeAreaView className="h-full bg-bg justify-center items-center">
        <ActivityIndicator size="large" color="#00AEEF" />
        <Text className="text-text-disabled font-ibm-plex-arabic mt-4">
          جاري تحميل العادات...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      <SafeAreaView className="h-full font-ibm-plex-arabic bg-bg">
        <Modal
          visible={isModalVisible}
          style={{ backgroundColor: "#00070A" }}
          transparent={true}
          animationType="none" // Use none since we're handling it ourselves
          statusBarTranslucent={true}
          navigationBarTranslucent={true}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <TouchableOpacity
            onPress={() => setIsModalVisible(false)}
            activeOpacity={1}
            className="flex-1 bg-black/50 absolute top-0 left-0 right-0 bottom-0"
          />
          <View
            style={{
              flex: 1,
              justifyContent: "flex-end",
            }}
          >
            <AddHabitScreen
              onClose={() => {
                (setIsModalVisible(false), console.log("closed"));
              }}
            />
          </View>
        </Modal>
        <View className="w-full relative h-[60px] gap-1 bg-bg px-5 flex-row-reverse justify-between items-center">
          <View>
            <View style={S.rowBetween}>
              <Text className="font-ibm-plex-arabic-bold text-text-brand text-2xl my-1">
                اليومss
              </Text>
            </View>
            <Link
              href="/(tabs)/time/salatTime"
              prefetch={true}
              className="text-text-disabled text-right font-ibm-plex-arabic-extralight"
            >
              {fmtArabicDateMonthAndNumber(new Date())}
            </Link>
          </View>
          <FloatingActionMenu
            onNavigate={handleGoToTracking}
            onClear={handleClearAllStorage}
            onAddHabit={() => setIsModalVisible(true)}
            onSalatTime={() => router1.navigate("/(tabs)/time/salatTime")}
            position="top-left"
          />
        </View>
        <ScrollView
          className=" relative h-[100%] rounded-t-3xl bg-fore"
          contentContainerStyle={{ paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="mt-4">
            <DisplayDays
              selectedDate={selectedDate}
              onChange={(date: Date) => setSelectedDate(date)}
            />
            <BundleFilter
              selectedBundleId={selectedBundleId}
              onSelectBundle={setSelectedBundleId}
            />
          </View>
          <View>
            {habits.length === 0 ? (
              <View className="mx-4 mt-8 items-center">
                <View className="bg-bg rounded-2xl p-8 items-center border border-text-brand">
                  <AntDesign name="heart" size={48} color="#6C7684" />
                  <Text className="text-text-primary font-ibm-plex-arabic-bold text-xl mt-4 text-center">
                    ابدأ رحلتك
                  </Text>
                  <Text className="text-text-disabled font-ibm-plex-arabic text-base mt-2 text-center">
                    أضف عاداتك اليومية لتتبع تقدمك
                  </Text>
                  <Pressable
                    onPress={handleAddHabit}
                    className="mt-6 bg-text-brand rounded-full px-6 py-3 flex-row-reverse items-center"
                  >
                    <AntDesign name="plus" size={20} color="white" />
                    <Text className="text-white font-ibm-plex-arabic-medium mr-2">
                      أضف عادة جديدة
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              PRAYERS.map((prayer, idx) => (
                <SalatHabitsDisplay
                  key={prayer.name}
                  prayerKey={prayer.key}
                  salatName={prayer.name}
                  salatTime={prayer.time}
                  habits={prayerHabitLists[prayer.key]}
                  onToggleHabit={(id, completed) =>
                    handleToggleHabit(id, completed, prayer.key)
                  }
                  onHabitPress={(habit) =>
                    handleHabitPress({ ...habit, currentPrayer: prayer.key })
                  }
                  onAddHabit={handleAddHabit}
                />
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default OrganizeModes;
