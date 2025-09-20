// app/(tabs)/_layout.tsx
import React, { useMemo, useRef, useEffect } from "react";
import {
  View,
  Pressable,
  I18nManager,
  Animated,
  Dimensions,
} from "react-native";
import { Tabs, router, usePathname } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { AuthGuard } from "@/components/AuthGuard";

// Brand colors
const ACCENT = "#00AEEF";
const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  const isDark = true;

  // Only show the bar on top-level tab routes
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

  // Color tokens
  const SURFACE = isDark ? "#0E1116" : "#FFFFFF";
  const TEXT_MUTED = isDark ? "#8B9198" : "#6B6B6B";
  const TEXT = isDark ? "#E6EAF0" : "#101317";
  const BORDER = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";

  return (
    <AuthGuard requireAuth={true}>
      <Tabs
        initialRouteName="time"
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarHideOnKeyboard: true,
          tabBarStyle: { display: "none" },
        }}
        tabBar={(props) => {
          if (!shouldShowTabBar) return null;

          const { state, descriptors, navigation } = props;

          return (
            <AnimatedTabBar
              state={state}
              descriptors={descriptors}
              navigation={navigation}
              insets={insets}
              colors={{
                SURFACE,
                TEXT,
                TEXT_MUTED,
                ACCENT,
                BORDER,
              }}
            />
          );
        }}
      >
        <Tabs.Screen
          name="settings"
          options={{
            title: "حسابي",
            tabBarAccessibilityLabel: "حسابي",
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

function AnimatedTabBar({
  state,
  descriptors,
  navigation,
  insets,
  colors,
}: any) {
  const slideUpAnim = useRef(new Animated.Value(100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideUpAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        transform: [{ translateY: slideUpAnim }],
        opacity: fadeAnim,
      }}
    >
      <View
        accessible
        accessibilityRole="tablist"
        style={{
          position: "absolute",
          width: "100%",
          left: 0,
          bottom: 0,
          paddingTop: 2,
          paddingBottom: insets.bottom / 1.5,
          backgroundColor: colors.SURFACE,

          borderTopWidth: 2,
          borderColor: colors.BORDER,
        }}
      >
        <TabRow
          state={state}
          descriptors={descriptors}
          navigation={navigation}
          colors={colors}
        />
      </View>
    </Animated.View>
  );
}

function TabRow({ state, descriptors, navigation, colors }: any) {
  const indicatorAnim = useRef(new Animated.Value(0)).current;
  const tabWidth = SCREEN_WIDTH; // Account for padding and margins

  useEffect(() => {
    Animated.timing(indicatorAnim, {
      toValue: state.index,
      useNativeDriver: true,
      duration: 300,
    }).start();
  }, [state.index]);

  return (
    <View style={{ position: "relative" }}>
      {/* Animated indicator */}
      <Animated.View
        style={{
          position: "absolute",
          left: 0,
          bottom: 4,
          height: 65,
          backgroundColor: `${colors.ACCENT}15`,
          borderRadius: 20,
          transform: [
            {
              translateX: indicatorAnim.interpolate({
                inputRange: [0, 1, 2],
                outputRange: [0, tabWidth / 3, (tabWidth / 3) * 2],
              }),
            },
          ],
          width: tabWidth / 3,
        }}
      />

      <View
        style={{
          flexDirection: "row",
          height: 70,
        }}
      >
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label = options.title ?? route.name;
          const isFocused = state.index === index;

          return (
            <AnimatedTabButton
              key={route.key}
              route={route}
              index={index}
              isFocused={isFocused}
              label={label}
              options={options}
              navigation={navigation}
              colors={colors}
              tabWidth={tabWidth}
            />
          );
        })}
      </View>
    </View>
  );
}

function AnimatedTabButton({
  route,
  isFocused,
  label,
  options,
  navigation,
  colors,
}: any) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const iconScaleAnim = useRef(new Animated.Value(1)).current;
  const textOpacityAnim = useRef(
    new Animated.Value(isFocused ? 1 : 0.7)
  ).current;

  // Map route to icon
  const iconName =
    route.name === "time" ? "clock" : route.name === "home" ? "search" : "user";

  useEffect(() => {
    Animated.parallel([
      Animated.spring(iconScaleAnim, {
        toValue: isFocused ? 1.1 : 1,
        useNativeDriver: true,
        tension: 150,
        friction: 4,
      }),
      Animated.timing(textOpacityAnim, {
        toValue: isFocused ? 1 : 0.7,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isFocused]);

  const onPress = () => {
    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      // Press animation
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 0.95,
          useNativeDriver: true,
          tension: 300,
          friction: 4,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 300,
          friction: 4,
        }),
      ]).start();

      navigation.navigate(route.name);
    } else if (isFocused) {
      // Focused tap feedback
      Haptics.selectionAsync();
      Animated.sequence([
        Animated.spring(iconScaleAnim, {
          toValue: 1.2,
          useNativeDriver: true,
          tension: 300,
          friction: 4,
        }),
        Animated.spring(iconScaleAnim, {
          toValue: 1.1,
          useNativeDriver: true,
          tension: 300,
          friction: 4,
        }),
      ]).start();
    }
  };

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
      testID={options.tabBarTestID}
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 20,
        minHeight: 64,
      }}
      hitSlop={8}
    >
      <Animated.View
        style={{
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          transform: [{ scale: scaleAnim }],
        }}
      >
        <Animated.View
          style={{
            transform: [{ scale: iconScaleAnim }],
          }}
        >
          <Feather
            name={iconName as any}
            size={20}
            color={isFocused ? colors.ACCENT : colors.TEXT_MUTED}
            style={
              iconName === "search" && I18nManager.isRTL
                ? { transform: [{ rotateY: "180deg" }] }
                : undefined
            }
          />
        </Animated.View>
        <Animated.Text
          style={{
            color: isFocused ? colors.ACCENT : colors.TEXT_MUTED,
            opacity: textOpacityAnim,
          }}
          className={`font-ibm-plex-arabic text-sm pb-2 ${
            isFocused ? "font-ibm-plex-arabic-medium" : "font-ibm-plex-arabic"
          }`}
        >
          {label}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
}
