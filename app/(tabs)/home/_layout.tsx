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
        name="[singlebundle]"
        options={{
          headerShown: false,
          title: "رحلة",
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="explore-bundles"
        options={{
          headerShown: false,
          title: "اكتشف الرحلات",
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="explore-habits"
        options={{
          headerShown: false,
          title: "اكتشف العادات",
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="FreeCommit"
        options={{ headerShown: false, animation: "slide_from_left" }}
      />

      <Stack.Screen
        name="prayer-tracker"
        options={{ headerShown: false, title: "العدّاد", animation: "fade" }}
      />
      <Stack.Screen
        name="reflection"
        options={{ headerShown: false, title: "العدّاد", animation: "fade" }}
      />

      <Stack.Screen
        name="(habit)"
        options={{ headerShown: false, title: "العدّاد", animation: "fade" }}
      />
    </Stack>
  );
}
