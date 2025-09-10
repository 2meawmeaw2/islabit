import { Feather } from "@expo/vector-icons";
import { Tabs, router, usePathname } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthGuard } from "@/components/AuthGuard";

export default function TabsLayout() {
  const height = Platform.select({ ios: 78, android: 64, default: 72 });
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  // Define paths where you want to hide the tab bar

  // Check if current path should show tab bar (exact match)
  const shouldShowTabBar = (() => {
    // Show tab bar on exact index routes
    if (
      pathname === "/home" ||
      pathname === "/time" ||
      pathname === "/settings"
    ) {
      return true;
    }

    // Show tab bar on index sub-routes
    if (
      pathname === "/home/index" ||
      pathname === "/time/index" ||
      pathname === "/settings/index"
    ) {
      return true;
    }

    // Hide tab bar on all other sub-routes
    return false;
  })();

  return (
    <AuthGuard requireAuth={true}>
      <Tabs
        initialRouteName="time"
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarHideOnKeyboard: true,
          tabBarStyle: shouldShowTabBar
            ? {
                overflow: "hidden",
                height: height,
                maxHeight: height + insets.bottom,
                backgroundColor: "#00070A",
                width: "100%",
                borderTopLeftRadius: 25,
                borderTopRightRadius: 25,
                position: "absolute",
                paddingTop: 10,
                paddingBottom: 30 + insets.bottom,
              }
            : { display: "none" },
        }}
      >
        <Tabs.Screen
          name="settings"
          options={{
            animation: "none",
            title: "حسابي",
            tabBarIcon: ({ focused }) => (
              <Feather
                focused={focused}
                title="حسابي"
                name="user"
                size={24}
                color={focused ? "#E0FFFF" : "#4C6770"}
              />
            ),
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              router.replace("/(tabs)/settings");
            },
          }}
        />
        <Tabs.Screen
          name="time"
          options={{
            animation: "none",
            title: "وقتي",
            tabBarIcon: ({ focused }) => (
              <Feather
                focused={focused}
                title="وقتي"
                name="clock"
                size={24}
                color={focused ? "#E0FFFF" : "#4C6770"}
              />
            ),
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              router.replace("/(tabs)/time");
            },
          }}
        />
        <Tabs.Screen
          name="home"
          options={{
            animation: "none",
            title: "فعاليات",
            tabBarIcon: ({ focused }) => (
              <Feather
                focused={focused}
                title="فعاليات"
                name="search"
                style={{ transform: [{ rotateY: "180deg" }] }}
                size={24}
                color={focused ? "#E0FFFF" : "#4C6770"}
              />
            ),
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              router.replace("/(tabs)/home");
            },
          }}
        />
      </Tabs>
    </AuthGuard>
  );
}
