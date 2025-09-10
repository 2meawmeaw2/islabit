import { HabitTrackingScreen } from "@/components/time/HabitTrackingScreen";
import { HabitProps } from "@/types/habit";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { View } from "react-native";

function HabitTracking() {
  // Get parameters passed to this screen
  const params = useLocalSearchParams();
  // State to store the habit data
  const [habit, setHabit] = useState<HabitProps | undefined>(undefined);
  // State to track if data is still loading
  const [isLoading, setIsLoading] = useState(false);
  // Get habits from the centralized store
  // This runs when the component first loads
  useEffect(() => {
    // Function to load the habit data
    const loadHabit = async () => {
      // Try to get the habit from the navigation params
      if (typeof params?.habit === "string") {
        try {
          setIsLoading(true);
          const parsedHabit = JSON.parse(params.habit as string);
          setHabit(parsedHabit);
          setIsLoading(false);
          return;
        } catch (e) {
          console.error("Error parsing habit from params:", e);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadHabit();
  }, []); // Run this effect when params or habits change

  // Show loading state while we get the data
  if (isLoading || !habit) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#020617",
          justifyContent: "center",
          alignItems: "center",
        }}
      ></View>
    );
  }

  return <HabitTrackingScreen habit={habit} />;
}

export default HabitTracking;
