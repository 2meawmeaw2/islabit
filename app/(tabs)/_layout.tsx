// app/(tabs)/_layout.tsx
import React from "react";
import { Tabs } from "expo-router";
import { Text, View, Image, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { icons } from "@/assets/constants/icons";
type TIProps = {
  focused: boolean;
  title: string;
  icon: any; // ImageSourcePropType
};

const TabIcon = ({ focused, title, icon }: TIProps) => {
  return (
    <View
      // ✅ no absolute / translate for a non-floating bar
      className={`w-16 h-14 absolute top-1/2  -translate-y-[19%]  rounded-2xl flex flex-col items-center justify-center `}
      style={{
        shadowColor: "#000",
      }}
      accessible
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
    >
      <Image
        source={icon || icons.person}
        resizeMode="contain"
        className="size-6"
        style={{ tintColor: !focused ? "#E5F8FF" : "#00AEEF" }}
      />
      <Text
        className={`mt-1 text-[11px] font-ibm-plex-arabic ${
          !focused ? "text-text-primary" : "text-text-brand/80"
        }`}
      >
        {title}
      </Text>
      <View
        className={`mt-1 h-1 w-6 rounded-full ${
          focused ? "bg-text-brand" : "bg-transparent"
        }`}
      />
    </View>
  );
};

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const height = Platform.select({ ios: 78, android: 72, default: 72 });

  return (
    // ✅ ensure the root behind everything is dark
    <View
      style={{
        overflow: "hidden",
        height,
        flex: 1,
        backgroundColor: "#ffffff",
      }}
    >
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarHideOnKeyboard: true,

          // ✅ new name in v7
          sceneStyle: { backgroundColor: "#00070A" },

          tabBarStyle: {
            height,
            maxHeight: height,
            paddingHorizontal: 8,
            paddingTop: 6,
            paddingBottom: Math.max(insets.bottom, 6),
            backgroundColor: "#00070A",
            borderTopWidth: 1,
            borderColor: "#00AEEF",
          },

          tabBarItemStyle: { alignItems: "center", justifyContent: "center" },
        }}
      >
        <Tabs.Screen
          name="all-habits"
          options={{
            title: "العادات",
            tabBarIcon: ({ focused }) => (
              <TabIcon
                focused={focused}
                title="عاداتي"
                icon={icons.home || icons.person}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="reflection"
          options={{
            title: "قول",
            tabBarIcon: ({ focused }) => (
              <TabIcon
                focused={focused}
                title="قول"
                icon={icons.home || icons.person}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="challenges"
          options={{
            title: "تحدياتي",
            tabBarIcon: ({ focused }) => (
              <TabIcon
                focused={focused}
                title="تحدياتي"
                icon={icons.home || icons.person}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="prayer-tracker"
          options={{
            title: "الصلاة",
            tabBarIcon: ({ focused }) => (
              <TabIcon
                focused={focused}
                title="الصلاة"
                icon={icons.home || icons.person}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="time"
          options={{
            title: "وقتي",
            tabBarIcon: ({ focused }) => (
              <TabIcon
                focused={focused}
                title="وقتي"
                icon={icons.home || icons.person}
              />
            ),
          }}
        />
        <Tabs.Screen name="(habit)/[id]" options={{ href: null }} />
      </Tabs>
    </View>
  );
}
