import { Stack } from "expo-router";

export default function ThisLayout() {
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
        name="bundleConfirm"
        options={{
          headerShown: false,
          title: "رحلة",
          animation: "ios_from_right",
        }}
      />
    </Stack>
  );
}
