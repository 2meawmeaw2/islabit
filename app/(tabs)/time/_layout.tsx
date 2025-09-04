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
          animation: "ios_from_left",
        }}
      />

      <Stack.Screen
        name="addNewHabit"
        options={{
          headerShown: false,
          title: "إضافة عادة",
          animation: "ios_from_left",
          contentStyle: { backgroundColor: "#000000" },
        }}
      />

      <Stack.Screen
        name="habitDetails"
        options={{
          headerShown: false,
          title: "تفاصيل العادة",
          animation: "ios_from_right",
        }}
      />

      <Stack.Screen
        name="tracking/index"
        options={{
          headerShown: false,
          title: "التتبع",
          animation: "ios_from_right",
        }}
      />
      <Stack.Screen
        name="tracking/habits"
        options={{
          headerShown: false,
          title: "تتبع العادات",
          animation: "ios_from_right",
        }}
      />
      <Stack.Screen
        name="tracking/bundle"
        options={{
          headerShown: false,
          title: "تتبع الحزمة",
          animation: "ios_from_right",
        }}
      />
    </Stack>
  );
}
