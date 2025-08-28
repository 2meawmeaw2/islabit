import S from "@/assets/styles/shared";
import DisplayDays from "@/components/time/displayDays";
import NextPrayerCard from "@/components/time/Prayers";
import { SalatHabitsDisplay } from "@/components/time/SalatHabitsDisplay";
import { fmtArabicDateMonthAndNumber } from "@/lib/dates";
import { PRAYERS } from "@/lib/prayers";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const OrganizeModes: React.FC = () => {
  const [habits, setHabits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const router = useRouter();

  // Function to get date string in YYYY-MM-DD format
  const getDateStr = useCallback((date: Date): string => {
    return date.toISOString().split("T")[0];
  }, []);

  // Type definition for completion record
  type CompletionRecord = {
    date: string;
    prayer: string;
  };

  // Load habits data
  const loadHabits = useCallback(async () => {
    try {
      setIsLoading(true);
      const habitsData = await AsyncStorage.getItem("habits");
      const loadedHabits = habitsData ? JSON.parse(habitsData) : [];

      // Add completion status for the current selected date
      const currentDateStr = getDateStr(selectedDate);
      const processedHabits = loadedHabits.map((habit: any) => {
        // Convert old format (string array) to new format (object array) if needed
        if (!habit.completed) {
          habit.completed = [];
        } else if (
          habit.completed.length > 0 &&
          typeof habit.completed[0] === "string"
        ) {
          // Convert from old format to new format
          habit.completed = habit.completed.map((dateStr: string) => ({
            date: dateStr,
            prayer: "unknown", // Default prayer value for existing records
          }));
        }

        // Check if this habit is completed for the selected date (any prayer)
        const isCompleted = habit.completed.some(
          (record: CompletionRecord) => record.date === currentDateStr
        );
        console.log(habit);
        return {
          ...habit,
          isCompletedForSelectedDay: isCompleted,
        };
      });

      setHabits(processedHabits);
    } catch (error) {
      console.error("Error loading habits:", error);
      setHabits([]);
    } finally {
      setIsLoading(false);
    }
  }, [getDateStr, selectedDate]);

  useEffect(() => {
    loadHabits();
  }, [loadHabits, selectedDate]);

  const selectedDay = useMemo(() => selectedDate.getDay(), [selectedDate]);

  // Memoize the filtering function
  const getHabitsForPrayer = useCallback(
    (prayerName: string) => {
      return habits
        .filter(
          (habit: any) =>
            habit.relatedSalat &&
            habit.relatedSalat.includes(prayerName) &&
            habit.relatedDays &&
            habit.relatedDays.includes(selectedDay)
        )
        .map((habit) => {
          // Check if habit is completed for this specific prayer on the selected date
          const currentDateStr = getDateStr(selectedDate);
          const isCompletedForPrayer =
            habit.completed &&
            habit.completed.some(
              (record: CompletionRecord) =>
                record.date === currentDateStr && record.prayer === prayerName
            );

          return {
            ...habit,
            isCompletedForSelectedDay: isCompletedForPrayer,
          };
        });
    },
    [habits, selectedDay]
  );

  const handleToggleHabit = useCallback(
    async (id: string, completed: boolean, prayerName?: string) => {
      try {
        const selectedDateStr = getDateStr(selectedDate);
        const currentPrayer = prayerName || "unknown";

        const updatedHabits = habits.map((habit: any) => {
          if (habit.id === id) {
            if (!habit.completed) {
              habit.completed = [];
            }

            let newCompleted: CompletionRecord[];
            if (completed) {
              // Check if we already have a record for this date and prayer
              const existingRecordIndex = habit.completed.findIndex(
                (record: CompletionRecord) =>
                  record.date === selectedDateStr &&
                  record.prayer === currentPrayer
              );

              if (existingRecordIndex >= 0) {
                // Already completed for this prayer, shouldn't happen normally
                newCompleted = [...habit.completed];
              } else {
                // Add a new completion record
                newCompleted = [
                  ...habit.completed,
                  { date: selectedDateStr, prayer: currentPrayer },
                ];
              }
            } else {
              // Remove the specific record for this date and prayer
              newCompleted = habit.completed.filter(
                (record: CompletionRecord) =>
                  !(
                    record.date === selectedDateStr &&
                    record.prayer === currentPrayer
                  )
              );
            }

            // Update streak
            const streak = completed
              ? (habit.streak || 0) + 1
              : Math.max(0, (habit.streak || 0) - 1);

            return {
              ...habit,
              completed: newCompleted,
              streak,
              isCompletedForSelectedDay: completed, // Directly update the flag for the current view
            };
          }
          return habit;
        });

        // Save to AsyncStorage without the computed properties
        await AsyncStorage.setItem(
          "habits",
          JSON.stringify(
            updatedHabits.map((h) => ({
              ...h,
              isCompletedForSelectedDay: undefined, // Don't store computed data
            }))
          )
        );

        setHabits(updatedHabits);
      } catch (error) {
        console.error("Error updating habit:", error);
      }
    },
    [habits, selectedDate, getDateStr]
  );

  const handleHabitPress = (habit: any) => {
    const habitData = {
      id: habit.id,
      title: habit.title,
      description: habit.description,
      streak: habit.streak,
      priority: habit.priority,
      relatedDays: habit.relatedDays || [],
      relatedSalat: habit.relatedSalat || [],
      completed: habit.completed || [],
      selectedDate: getDateStr(selectedDate), // Add current selected date
    };

    router.push({
      pathname: "/(tabs)/(time)/habitDetails",
      params: {
        habit: JSON.stringify(habitData),
        habitId: habit.id,
      },
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView className="h-full bg-bg justify-center items-center">
        <ActivityIndicator size="large" color="#00AEEF" />
        <Text className="text-text-disabled font-ibm-plex-arabic mt-4">
          جاري تحميل العادات...
        </Text>
      </SafeAreaView>
    );
  }

  const handleAddHabit = () => {
    router.navigate("/addNewHabit");
  };
  return (
    <>
      <SafeAreaView className="h-full font-ibm-plex-arabic bg-bg">
        <View className="w-full h-[60px] gap-1 bg-bg px-5 flex-row-reverse justify-between items-center">
          <View>
            <View style={S.rowBetween}>
              <Text className="font-ibm-plex-arabic-bold text-text-brand text-2xl my-1">
                اليوم
              </Text>
            </View>
            <Text className="text-text-disabled text-right font-ibm-plex-arabic-extralight">
              {fmtArabicDateMonthAndNumber(new Date())}
            </Text>
          </View>
          <Pressable
            onPress={handleAddHabit}
            className="bg-text-brand rounded-full justify-center items-center h-10 w-10"
          >
            <Ionicons name="add" size={30} color="white" />
          </Pressable>
        </View>

        <ScrollView
          className="bg-fore relative h-[100%] rounded-t-2xl"
          contentContainerStyle={{ paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
        >
          <DisplayDays
            selectedDate={selectedDate}
            onChange={(date: Date) => setSelectedDate(date)}
          />
          <View className="my-2 mx-4">
            <NextPrayerCard />
          </View>

          {habits.length === 0 ? (
            <View className="mx-4 mt-8 items-center">
              <View className="bg-bg rounded-2xl p-8 items-center border border-border-secondary">
                <Ionicons name="leaf-outline" size={48} color="#6C7684" />
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
                  <Ionicons name="add-circle" size={20} color="white" />
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
                salatName={prayer.name}
                salatTime={prayer.time}
                habits={getHabitsForPrayer(prayer.key)}
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
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default OrganizeModes;
