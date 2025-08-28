import { Stack } from "expo-router";
import React from "react";
export default function TabsLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: "#000000" },
      }}
      initialRouteName="index" // Set the default screen here
    >
      <Stack.Screen
        name="index"
        options={{
          title: "الكل",
          headerShown: false,
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="day"
        options={{
          headerShown: false,
          title: "اليوم",
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="addNewHabit"
        options={{
          headerShown: false,
          title: "إضافة عادة",
          animation: "slide_from_left",
          contentStyle: { backgroundColor: "#000000" },
        }}
      />

      <Stack.Screen
        name="habitDetails"
        options={{
          headerShown: false,
          title: "تفاصيل العادة",
          animation: "slide_from_right",
        }}
      />
    </Stack>
  );
}
