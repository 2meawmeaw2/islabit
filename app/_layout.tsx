import { SplashScreen, Stack } from "expo-router";
import "./globals.css";
import {
  useFonts,
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
} from "@expo-google-fonts/ibm-plex-sans-arabic";
import { useEffect } from "react";
import { I18nManager } from "react-native";

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
  const slide = I18nManager.isRTL ? "slide_from_left" : "slide_from_right";

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: slide, // ← make pushes slide, not fade
        gestureEnabled: true,
      }}
    />
  );
}
