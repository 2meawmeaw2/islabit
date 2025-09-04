import { useHabitsStore } from "@/store/habitsStore";
import type { HabitProps } from "@/types/habit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { Button, ScrollView, StyleSheet, Text, View } from "react-native";

/**
 * A test component to verify the Zustand persistence is working correctly
 * This component allows you to:
 * 1. View current store data
 * 2. Add test habits
 * 3. Mark habits as completed
 * 4. View the raw AsyncStorage data
 *
 * You can mount this component temporarily in your app to test persistence
 */
export default function TestPersistence() {
  const habits = useHabitsStore((state) => state.habits);
  const setHabits = useHabitsStore((state) => state.setHabits);
  const completeHabit = useHabitsStore((state) => state.completeHabit);
  const isHydrated = useHabitsStore((state) => state.isHydrated);

  const [storageData, setStorageData] = useState<string | null>(null);

  // Function to read raw AsyncStorage data
  const readStorageData = async () => {
    try {
      const data = await AsyncStorage.getItem("habits-storage");
      setStorageData(data);
    } catch (err) {
      console.error("Failed to read storage:", err);
    }
  };

  // Add a test habit
  const addTestHabit = () => {
    const newHabit: HabitProps = {
      id: `test-habit-${Date.now()}`,
      title: `Test Habit ${new Date().toLocaleTimeString()}`,
      description: "This is a test habit created to verify persistence",
      streak: 0,
      bestStreak: 0,
      completedDates: [],
      relatedSalat: [],
      relatedDays: [],
    };

    setHabits([...habits, newHabit]);
  };

  // Complete a habit for today
  const completeHabitToday = (id: string) => {
    const today = new Date();
    const dateString = today.toISOString().split("T")[0]; // YYYY-MM-DD
    completeHabit(id, dateString, true);
  };

  // Run on mount to get storage data
  useEffect(() => {
    readStorageData();
  }, [habits]); // Re-read whenever habits change

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.heading}>Persistence Test</Text>
        <Text style={styles.status}>
          Store Hydrated: {isHydrated ? "Yes" : "No"}
        </Text>
        <Text style={styles.status}>Habits Count: {habits.length}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subheading}>Actions</Text>
        <View style={styles.buttonRow}>
          <Button title="Add Test Habit" onPress={addTestHabit} />
          <Button title="Refresh Storage" onPress={readStorageData} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.subheading}>Current Habits</Text>
        {habits.map((habit) => (
          <View key={habit.id} style={styles.habitItem}>
            <Text style={styles.habitTitle}>{habit.title}</Text>
            <Text style={styles.habitInfo}>ID: {habit.id}</Text>
            <Text style={styles.habitInfo}>
              Completed Dates:{" "}
              {(habit.completedDates || []).join(", ") || "None"}
            </Text>
            <Button
              title="Mark Complete Today"
              onPress={() => completeHabitToday(habit.id)}
            />
          </View>
        ))}
        {habits.length === 0 && (
          <Text style={styles.emptyText}>No habits found</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.subheading}>Raw Storage Data</Text>
        <ScrollView style={styles.storageContainer}>
          <Text style={styles.storageText}>{storageData || "No data"}</Text>
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  section: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subheading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  status: {
    fontSize: 16,
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  habitItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    marginBottom: 8,
  },
  habitTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  habitInfo: {
    fontSize: 14,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#888",
  },
  storageContainer: {
    maxHeight: 200,
    padding: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
  },
  storageText: {
    fontFamily: "monospace",
    fontSize: 12,
  },
});
