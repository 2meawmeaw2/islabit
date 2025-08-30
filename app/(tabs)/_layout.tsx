import { Feather } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/build/MaterialIcons";
import { Tabs, router, usePathname } from "expo-router";
import React, { useEffect } from "react";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
  const height = Platform.select({ ios: 78, android: 64, default: 72 });
  const insets = useSafeAreaInsets();
  // Hide the tab bar when on the addNewHabit screen

  return (
    // ✅ ensure the root behind everything is dark
    <Tabs
      initialRouteName="(time)"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,

        tabBarStyle: {
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
        },
      }}
    >
      <Tabs.Screen
        name="(settings)"
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
            router.replace("/(tabs)/(settings)");
          },
        }}
      />
      <Tabs.Screen
        name="(time)"
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
            router.replace("/(tabs)/(time)");
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
  );
}
