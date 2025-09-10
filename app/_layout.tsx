import { AuthProvider } from "@/lib/auth";
import { usePrayerInitialization } from "@/hooks/usePrayerInitialization";
import { useHabitInitialization } from "@/lib/useHabitInitialization";
import "react-native-reanimated";
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
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import "./globals.css";
import { useFocusEffect } from "@react-navigation/native";
import * as NavigationBar from "expo-navigation-bar";
import { useCallback } from "react";
import { Platform } from "react-native";
export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    // SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
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

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === "android") {
        NavigationBar.setBackgroundColorAsync("#00070A");
        NavigationBar.setButtonStyleAsync("light"); // "light" or "dark"
        // Optional: draw behind for edge-to-edge looks
        // await NavigationBar.setPositionAsync("absolute");
      }
    }, [])
  );
  // Initialize our habit store from AsyncStorage
  const { isLoading: isHabitLoading, isHydrated } = useHabitInitialization();
  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded && isHydrated) {
      SplashScreen.hideAsync();
    }
  }, [loaded, isHydrated]);

  if (!loaded || !isHydrated) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#020617",
        }}
      >
        <ActivityIndicator size="large" color="#00AEEF" />
      </View>
    );
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  // Initialize prayer times
  usePrayerInitialization();

  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="sign" options={{ headerShown: false }} />
        <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
        <Stack.Screen name="moreInfo" options={{ headerShown: false }} />
        <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
        <Stack.Screen
          name="auth/reset-password"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}
