import { Stack } from "expo-router";
import React from "react";
export default function TabsLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: "#00070A" },
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
        name="languages"
        options={{
          headerShown: false,
          title: "اللغات",
          animation: "slide_from_right",
        }}
      />
    </Stack>
  );
}
