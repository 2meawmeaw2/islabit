import React, { useCallback, useEffect, useRef } from "react";
import { View, Pressable, Dimensions, Text } from "react-native";
import * as Haptics from "expo-haptics";
import { Feather, MaterialIcons, Octicons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  interpolate,
  Easing,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface MenuItem {
  icon: string;
  label: string;
  onPress: () => void;
  color: string;
  gradient: [string, string];
  haptic?: "light" | "medium" | "heavy";
}

interface FloatingActionMenuProps {
  onNavigate: () => void;
  onClear: () => void;
  onAddHabit: () => void;
  onSalatTime: () => void;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  theme?: "light" | "dark" | "auto";
}

export function FloatingActionMenu({
  onNavigate,
  onClear,
  onAddHabit,
  onSalatTime,
  position = "bottom-right",
  theme = "auto",
}: FloatingActionMenuProps) {
  const isOpen = useSharedValue(false);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const backdropOpacity = useSharedValue(0);

  // Auto-close timer ref
  const autoCloseTimer = useRef<NodeJS.Timeout | null>(null);

  // Animation values for each button
  const menuItemsAnimation = Array(4)
    .fill(0)
    .map(() => ({
      translateY: useSharedValue(0),
      opacity: useSharedValue(0),
      scale: useSharedValue(0.8),
    }));

  const menuItems: MenuItem[] = [
    {
      icon: "add-circle",
      label: "اضف عادة",
      onPress: onAddHabit,
      color: "#FFFFFF",
      gradient: ["#667eea", "#764ba2"],
      haptic: "light",
    },
    {
      icon: "notifications",
      label: "صلاتك",
      onPress: onSalatTime,
      color: "#FFFFFF",
      gradient: ["#f093fb", "#f5576c"],
      haptic: "medium",
    },
    {
      icon: "compass",
      label: "تتبع",
      onPress: onNavigate,
      color: "#FFFFFF",
      gradient: ["#4facfe", "#00f2fe"],
      haptic: "light",
    },
    {
      icon: "delete-forever",
      label: "مسح الكل",
      onPress: onClear,
      color: "#FFFFFF",
      gradient: ["#ff6b6b", "#ff4757"],
      haptic: "heavy",
    },
  ];

  const clearAutoCloseTimer = useCallback(() => {
    if (autoCloseTimer.current) {
      clearTimeout(autoCloseTimer.current);
      autoCloseTimer.current = null;
    }
  }, []);

  const setAutoCloseTimer = useCallback(() => {
    clearAutoCloseTimer();
    autoCloseTimer.current = setTimeout(() => {
      if (isOpen.value) {
        toggleMenu();
      }
    }, 8000); // Auto-close after 8 seconds
  }, []);

  const toggleMenu = useCallback(() => {
    const newValue = !isOpen.value;
    isOpen.value = newValue;

    // Haptic feedback
    Haptics.impactAsync(
      newValue
        ? Haptics.ImpactFeedbackStyle.Medium
        : Haptics.ImpactFeedbackStyle.Light
    );

    if (newValue) {
      setAutoCloseTimer();
    } else {
      clearAutoCloseTimer();
    }

    // Main button rotation
    rotation.value = withSpring(newValue ? 45 : 0, {
      damping: 15,
      stiffness: 200,
    });

    // Main button scale
    scale.value = withSequence(
      withTiming(newValue ? 0.95 : 0.95, { duration: 50 }),
      withSpring(1, { damping: 12 })
    );

    // Backdrop fade
    backdropOpacity.value = withTiming(newValue ? 1 : 0, {
      duration: 200,
      easing: Easing.out(Easing.quad),
    });

    // Staggered menu item animations
    menuItemsAnimation.forEach((anim, index) => {
      const delay = newValue ? index * 50 : (3 - index) * 30;

      // Vertical slide animation
      anim.translateY.value = withDelay(
        delay,
        withSpring(newValue ? 0 : 20, {
          damping: 20,
          stiffness: 300,
        })
      );

      // Fade animation
      anim.opacity.value = withDelay(
        delay,
        withTiming(newValue ? 1 : 0, {
          duration: 200,
          easing: newValue ? Easing.out(Easing.quad) : Easing.in(Easing.quad),
        })
      );

      // Scale animation
      anim.scale.value = withDelay(
        delay,
        withSpring(newValue ? 1 : 0.8, {
          damping: 20,
          stiffness: 300,
        })
      );
    });
  }, [setAutoCloseTimer, clearAutoCloseTimer]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      clearAutoCloseTimer();
    };
  }, [clearAutoCloseTimer]);

  const handleMenuItemPress = useCallback(
    (item: MenuItem, index: number) => {
      // Haptic feedback
      if (item.haptic) {
        const hapticMap = {
          light: Haptics.ImpactFeedbackStyle.Light,
          medium: Haptics.ImpactFeedbackStyle.Medium,
          heavy: Haptics.ImpactFeedbackStyle.Heavy,
        };
        Haptics.impactAsync(hapticMap[item.haptic]);
      }

      // Button press animation
      menuItemsAnimation[index].scale.value = withSequence(
        withTiming(0.95, { duration: 50 }),
        withSpring(1, { damping: 15 })
      );

      // Execute action and close menu
      item.onPress();
      setTimeout(() => toggleMenu(), 100);
    },
    [toggleMenu]
  );

  // Backdrop style
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value * 0.4,
    pointerEvents: backdropOpacity.value > 0 ? "auto" : "none",
  }));

  // Main button style
  const mainButtonStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }, { scale: scale.value }],
  }));

  // Menu item styles
  const getMenuItemStyle = (index: number) =>
    useAnimatedStyle(() => {
      const anim = menuItemsAnimation[index];
      return {
        opacity: anim.opacity.value,
        transform: [
          { translateY: anim.translateY.value },
          { scale: anim.scale.value },
        ],
        pointerEvents: anim.opacity.value > 0 ? "auto" : "none",
      };
    });

  // Position styles
  const getPositionStyles = () => {
    const base = {
      position: "absolute" as const,
      zIndex: 999,
    };

    switch (position) {
      case "bottom-right":
        return { ...base, bottom: 20, right: 20 };
      case "bottom-left":
        return { ...base, bottom: 20, left: 20 };
      case "top-right":
        return { ...base, top: 60, right: 20 };
      case "top-left":
        return { ...base, top: 0, left: 10 };
      default:
        return { ...base, bottom: 20, right: 20 };
    }
  };

  return (
    <>
      {/* Backdrop */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            width: screenWidth,
            height: screenHeight,
            backgroundColor: "#000000",
            zIndex: 998,
          },
          backdropStyle,
        ]}
        pointerEvents={isOpen.value ? "auto" : "none"}
      >
        <Pressable
          style={{
            width: screenWidth,
            height: screenHeight,
          }}
          onPress={toggleMenu}
        />
      </Animated.View>
      {/* Menu Container */}
      <View style={getPositionStyles()}>
        {/* Menu Items */}
        <View
          style={{
            position: "absolute",
            top: 70,
            alignItems: "center",
            gap: 12,
          }}
        >
          {menuItems.map((item, index) => (
            <AnimatedPressable
              key={item.icon}
              onPress={() => handleMenuItemPress(item, index)}
              style={[
                {
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#1A1E1F",
                  borderRadius: 25,
                  paddingVertical: 12,
                  paddingHorizontal: 20,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                  elevation: 5,
                  minWidth: 160,
                  gap: 12,
                },
                getMenuItemStyle(index),
              ]}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  overflow: "hidden",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <LinearGradient
                  colors={item.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                  }}
                />

                {item.icon === "notifications" && (
                  <MaterialIcons name="notifications" size={20} color="white" />
                )}
                {item.icon === "add-circle" && (
                  <MaterialIcons name="add-circle" size={20} color="white" />
                )}
                {item.icon === "compass" && (
                  <Octicons name="graph" size={20} color="white" />
                )}
                {item.icon === "delete-forever" && (
                  <Octicons name="repo-deleted" size={20} color="white" />
                )}
              </View>
              <Text
                className="text-text-primary text-center font-ibm-plex-arabic-semibold"
                style={{
                  flex: 1,
                }}
              >
                {item.label}
              </Text>
            </AnimatedPressable>
          ))}
        </View>

        {/* Main FAB Button */}
        <AnimatedPressable
          onPress={toggleMenu}
          style={[
            {
              width: 50,
              height: 50,
              borderRadius: 28,
              justifyContent: "center",
              alignItems: "center",
            },
            mainButtonStyle,
          ]}
        >
          <Feather name="align-left" size={24} color="white" />
        </AnimatedPressable>
      </View>
    </>
  );
}
