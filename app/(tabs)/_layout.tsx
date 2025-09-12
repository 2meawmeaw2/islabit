// app/(tabs)/_layout.tsx
import React, { useMemo } from "react";
import {
  Platform,
  Text,
  View,
  Pressable,
  useColorScheme,
  I18nManager,
} from "react-native";
import { Tabs, router, usePathname } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { AuthGuard } from "@/components/AuthGuard";

// Brand colors (keep your accent)
const ACCENT = "#00AEEF";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const scheme = useColorScheme();

  // iOS uses blur ("glass"); Android uses opaque elevated surface per platform guidelines
  const isDark = true;

  // Only show the bar on top-level tab routes (exact matches + index)
  const shouldShowTabBar = useMemo(() => {
    return (
      pathname === "/home" ||
      pathname === "/time" ||
      pathname === "/settings" ||
      pathname === "/home/index" ||
      pathname === "/time/index" ||
      pathname === "/settings/index"
    );
  }, [pathname]);

  // Shared tokens (dark theme surfaces that aren’t pure black for better elevation/contrast)
  const SURFACE = isDark ? "#0E1116" : "#FFFFFF";
  const SURFACE_ALT = isDark ? "#0B0F12" : "#F7F7F7";
  const TEXT_MUTED = isDark ? "#8B9198" : "#6B6B6B";
  const TEXT = isDark ? "#E6EAF0" : "#101317";

  const height = Platform.select({ ios: 72, android: 72, default: 68 });

  return (
    <AuthGuard requireAuth={true}>
      <Tabs
        initialRouteName="time"
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false, // we’ll render labels ourselves
          tabBarHideOnKeyboard: true,
          // We’re using a fully custom bar component below:
          tabBarStyle: { display: "none" },
        }}
        // Provide a custom floating tab bar that respects safe areas, dark mode & RTL
        tabBar={(props) => {
          if (!shouldShowTabBar) return null;

          const { state, descriptors, navigation } = props;

          const Content = (
            <View
              accessible
              accessibilityRole="tablist"
              style={{
                // Floating container
                position: "absolute",
                left: 16,
                right: 16,
                bottom: Math.max(insets.bottom, 8) + 8,
                borderRadius: 24,
                overflow: "hidden",
                paddingHorizontal: 16,
                // Elevation / shadow (Android uses elevation; iOS uses shadow)
                backgroundColor:
                  Platform.OS === "android" ? SURFACE : "transparent",
                ...Platform.select({
                  ios: {
                    shadowColor: "#000",
                    shadowOpacity: 0.2,
                    shadowRadius: 16,
                    shadowOffset: { width: 0, height: 8 },
                  },
                  android: {
                    elevation: 12,
                    borderWidth: 1,
                    borderColor: isDark
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.06)",
                  },
                }),
              }}
            >
              {Platform.OS === "ios" ? (
                <BlurView
                  tint={isDark ? "dark" : "light"}
                  intensity={30}
                  style={{
                    paddingTop: 8,
                    paddingBottom: 6,
                    paddingHorizontal: 6,
                    height,
                    backgroundColor: isDark
                      ? "rgba(12,15,20,0.35)"
                      : "rgba(255,255,255,0.35)",
                  }}
                >
                  <Row
                    {...{
                      state,
                      descriptors,
                      navigation,
                      TEXT,
                      TEXT_MUTED,
                      ACCENT,
                    }}
                  />
                </BlurView>
              ) : (
                <View
                  style={{
                    paddingTop: 8,
                    paddingBottom: 6,
                    paddingHorizontal: 6,
                    height,
                    backgroundColor: SURFACE,
                  }}
                >
                  <Row
                    {...{
                      state,
                      descriptors,
                      navigation,
                      TEXT,
                      TEXT_MUTED,
                      ACCENT,
                    }}
                  />
                </View>
              )}
            </View>
          );

          // Wrap with an outer container to avoid layout jumps
          return (
            <View
              pointerEvents="box-none"
              style={{ paddingBottom: insets.bottom }}
            >
              {Content}
            </View>
          );
        }}
      >
        <Tabs.Screen
          name="settings"
          options={{
            title: "حسابي",
            tabBarAccessibilityLabel: "حسابي",
            animation: "shift", // or fade will see
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
            title: "وقتي",
            animation: "shift", // or fade will see
            tabBarAccessibilityLabel: "وقتي",
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
            title: "اكتشف",
            animation: "shift", // or fade will see
            tabBarAccessibilityLabel: "اكتشف",
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

function Row({
  state,
  descriptors,
  navigation,
  TEXT,
  TEXT_MUTED,
  ACCENT,
}: any) {
  return (
    <View
      style={{ flexDirection: "row", justifyContent: "space-between", gap: 4 }}
    >
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label = options.title ?? route.name;
        const isFocused = state.index === index;

        // map route->icon
        const iconName =
          route.name === "time"
            ? "clock"
            : route.name === "home"
              ? "search"
              : "user";

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            // Subtle haptic tap for better affordance
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate(route.name);
          } else if (isFocused) {
            // Optional: scroll-to-top or refresh logic could go here
            Haptics.selectionAsync();
          }
        };

        const onLongPress = () => {
          navigation.emit({ type: "tabLongPress", target: route.key });
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            onLongPress={onLongPress}
            accessibilityRole="tab"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
            testID={options.tabBarTestID}
            android_ripple={{ borderless: true }}
            style={({ pressed }) => ({
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 6,
              paddingHorizontal: 8,
              borderRadius: 16,
              transform: [{ translateY: isFocused ? -2 : 0 }],
              opacity: pressed ? 0.8 : 1,
            })}
            hitSlop={10}
          >
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                paddingVertical: 4,
                paddingHorizontal: 6,
                borderRadius: 12,
                backgroundColor: isFocused
                  ? "rgba(0,174,239,0.12)"
                  : "transparent",
              }}
            >
              <Feather
                name={iconName as any}
                size={24}
                color={isFocused ? ACCENT : TEXT_MUTED}
                // Mirror search icon in RTL so it points inward
                style={
                  iconName === "search" && I18nManager.isRTL
                    ? { transform: [{ rotateY: "180deg" }] }
                    : undefined
                }
              />
              <Text
                style={{
                  color: isFocused ? ACCENT : TEXT_MUTED,
                  fontSize: 12,
                  // Match your existing Arabic font if present
                  fontFamily: "ibm-plex-arabic-medium",
                }}
              >
                {label}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
