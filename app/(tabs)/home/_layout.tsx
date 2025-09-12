import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          title: "العدّاد",
          animation: "slide_from_left",
        }}
      />
      <Stack.Screen
        name="bundleCommit"
        options={{
          headerShown: false,
          title: "العدّاد",
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="explore-bundles"
        options={{
          headerShown: false,
          title: "اكتشف الرحلات",
          animation: "fade_from_bottom",
        }}
      />

      <Stack.Screen
        name="(habit)"
        options={{
          headerShown: false,
          title: "العدّاد",
          presentation: "fullScreenModal",
          animation: "slide_from_bottom",
        }}
      />
    </Stack>
  );
}
