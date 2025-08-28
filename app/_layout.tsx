import {
  // Thin (100)
  IBMPlexSansArabic_100Thin,

  // ExtraLight (200)
  IBMPlexSansArabic_200ExtraLight,

  // Light (300)
  IBMPlexSansArabic_300Light,

  // Regular (400)
  IBMPlexSansArabic_400Regular,

  // Medium (500)
  IBMPlexSansArabic_500Medium,

  // SemiBold (600)
  IBMPlexSansArabic_600SemiBold,

  // Bold (700)
  IBMPlexSansArabic_700Bold,
  useFonts,
} from "@expo-google-fonts/ibm-plex-sans-arabic";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import "./globals.css";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    // Thin (100)
    IBMPlexSansArabic_100Thin,

    // ExtraLight (200)
    IBMPlexSansArabic_200ExtraLight,

    // Light (300)
    IBMPlexSansArabic_300Light,

    // Regular (400)
    IBMPlexSansArabic_400Regular,

    // Medium (500)
    IBMPlexSansArabic_500Medium,

    // SemiBold (600)
    IBMPlexSansArabic_600SemiBold,

    // Bold (700)
    IBMPlexSansArabic_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade", // ← make pushes slide, not fade
        gestureEnabled: true,

        contentStyle: {
          backgroundColor: "#00070A",
        },
      }}
    >
      <Stack.Screen name="index" />

      <Stack.Screen name="(time)" />
      <Stack.Screen name="testing" />
      <Stack.Screen
        name="languages"
        options={{ animation: "slide_from_right" }}
      />

      <Stack.Screen name="sign" />
      <Stack.Screen name="moreInfo" />
    </Stack>
  );
}
