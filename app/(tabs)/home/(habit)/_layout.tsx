import { SplashScreen, Stack } from "expo-router";

import { GestureHandlerRootView } from "react-native-gesture-handler";

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
        name="[id]"
        options={{
          headerShown: false,
          title: "العدّاد",
          animation: "slide_from_left",
        }}
      />
    </Stack>
  );
}
