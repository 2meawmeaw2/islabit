import { HabitDetailsScreen } from "@/components/time/habitDetailsScreen";
import { HabitProps } from "@/types/habit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";

function HabitDetails() {
  // Get parameters passed to this screen
  const params = useLocalSearchParams();
  // State to store the habit data
  const [habit, setHabit] = useState<HabitProps | undefined>(undefined);
  // State to track if data is still loading
  const [isLoading, setIsLoading] = useState(true);

  // This runs when the component first loads
  useEffect(() => {
    // Function to load the habit data
    const loadHabit = async () => {
      setIsLoading(true);

      // Try to get the habit from the navigation params
      if (typeof params?.habit === "string") {
        try {
          const parsedHabit = JSON.parse(params.habit as string);
          setHabit(parsedHabit);
          setIsLoading(false);
          return;
        } catch (e) {
          console.error("Error parsing habit from params:", e);
        }
      }

      // If that fails, try to get the habit from storage using habitId
      if (params?.habitId) {
        try {
          const habitsData = await AsyncStorage.getItem("habits");
          const habits = habitsData ? JSON.parse(habitsData) : [];
          const foundHabit = habits.find((h: any) => h.id === params.habitId);

          if (foundHabit) {
            setHabit(foundHabit);
          }
        } catch (error) {
          console.error("Error loading habit from storage:", error);
        }
      }

      // We're done loading either way
      setIsLoading(false);
    };

    loadHabit();
  }, []); // Run this effect when params changes

  // Show loading state while we get the data
  if (isLoading) {
    return <HabitDetailsScreen habit={undefined} />;
  }

  // Show the habit details once loaded
  return <HabitDetailsScreen habit={habit} />;
}

export default HabitDetails;
