import { Feather } from "@expo/vector-icons";
import { Tabs, router, usePathname } from "expo-router";
import React from "react";
import { Platform, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthGuard } from "@/components/AuthGuard";
export default function TabsLayout() {
  const height = Platform.select({ ios: 78, android: 80, default: 72 });
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  // Check if current path should show tab bar (exact match + indexes)
  const shouldShowTabBar = (() => {
    if (
      pathname === "/home" ||
      pathname === "/time" ||
      pathname === "/settings" ||
      pathname === "/home/index" ||
      pathname === "/time/index" ||
      pathname === "/settings/index"
    ) {
      return true;
    }
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
              <View className="flex flex-col items-center gap-2 my-2">
                <Feather
                  focused={focused}
                  title="حسابي"
                  name="user"
                  size={24}
                  color={focused ? "#00AEEF" : "#6b6468"}
                />
                <Text
                  style={{ color: focused ? "#00AEEF" : "#6b6468" }}
                  className="text-white text-xs font-ibm-plex-arabic-medium pb-2"
                >
                  حسابي
                </Text>
              </View>
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
              <View className="flex flex-col items-center gap-2 my-2">
                <Feather
                  focused={focused}
                  title="وقتي"
                  name="clock"
                  size={24}
                  color={focused ? "#00AEEF" : "#6b6468"}
                />
                <Text
                  style={{ color: focused ? "#00AEEF" : "#6b6468" }}
                  className="text-white text-xs font-ibm-plex-arabic-medium pb-2"
                >
                  وقتي
                </Text>
              </View>
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
              <View className="flex flex-col items-center gap-2 my-2">
                <Feather
                  focused={focused}
                  title="فعاليات"
                  name="search"
                  style={{ transform: [{ rotateY: "180deg" }] }}
                  size={24}
                  color={focused ? "#00AEEF" : "#6b6468"}
                />
                <Text
                  style={{ color: focused ? "#00AEEF" : "#6b6468" }}
                  className="text-white text-xs  font-ibm-plex-arabic-medium pb-2"
                >
                  اكتشف
                </Text>
              </View>
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
