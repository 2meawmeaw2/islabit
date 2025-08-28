import {
  ANIMATION_CONFIG,
  usePressAnimation,
  useReducedMotion,
} from "@/lib/animations";
import * as Haptics from "expo-haptics";
import React, { ReactNode } from "react";
import {
  AccessibilityRole,
  ActivityIndicator,
  Pressable,
  PressableProps,
  Text,
  TextStyle,
  ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface AnimatedButtonProps extends Omit<PressableProps, "style"> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "small" | "medium" | "large";
  loading?: boolean;
  disabled?: boolean;
  haptic?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel: string;
  accessibilityRole?: AccessibilityRole;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  variant = "primary",
  size = "medium",
  loading = false,
  disabled = false,
  haptic = true,
  style,
  textStyle,
  onPress,
  onPressIn,
  onPressOut,
  accessibilityLabel,
  accessibilityRole = "button",
  ...props
}) => {
  const {
    animatedStyle,
    onPressIn: animPressIn,
    onPressOut: animPressOut,
  } = usePressAnimation();
  const reducedMotion = useReducedMotion();
  const loadingOpacity = useSharedValue(loading ? 1 : 0);

  React.useEffect(() => {
    loadingOpacity.value = withTiming(loading ? 1 : 0, {
      duration: ANIMATION_CONFIG.QUICK,
    });
  }, [loading]);

  const loadingAnimatedStyle = useAnimatedStyle(() => ({
    opacity: loadingOpacity.value,
  }));

  const handlePress = (event: any) => {
    if (!disabled && !loading) {
      if (haptic) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onPress?.(event);
    }
  };

  const handlePressIn = (event: any) => {
    animPressIn();
    onPressIn?.(event);
  };

  const handlePressOut = (event: any) => {
    animPressOut();
    onPressOut?.(event);
  };

  // Variant styles
  const variantStyles = {
    primary: {
      backgroundColor: "#00AEEF",
      borderColor: "#00AEEF",
    },
    secondary: {
      backgroundColor: "#F3F4F6", // Replaced transparent with light gray
      borderColor: "#4B9AB5",
    },
    danger: {
      backgroundColor: "#9a1223",
      borderColor: "#9a1223",
    },
    ghost: {
      backgroundColor: "#F9FAFB", // Replaced transparent with very light gray
      borderColor: "#E5E7EB", // Replaced transparent with light gray border
    },
  };

  // Size styles
  const sizeStyles = {
    small: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },
    medium: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
    },
    large: {
      paddingHorizontal: 24,
      paddingVertical: 14,
      borderRadius: 16,
    },
  };

  const textSizeStyles = {
    small: {
      fontSize: 14,
    },
    medium: {
      fontSize: 16,
    },
    large: {
      fontSize: 18,
    },
  };

  const textColorStyles = {
    primary: "#FFFFFF",
    secondary: "#00AEEF",
    danger: "#FFFFFF",
    ghost: "#00AEEF",
  };

  return (
    <AnimatedPressable
      {...props}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        variantStyles[variant],
        sizeStyles[size],
        {
          borderWidth: variant === "secondary" ? 1 : 0,
          opacity: disabled ? 0.5 : 1,
          overflow: "hidden",
          position: "relative",
        },
        animatedStyle,
        style,
      ]}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <Animated.View
          style={[
            {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: "center",
              alignItems: "center",
            },
            loadingAnimatedStyle,
          ]}
        >
          <ActivityIndicator
            size="small"
            color={
              variant === "secondary" || variant === "ghost"
                ? "#00AEEF"
                : "#FFFFFF"
            }
          />
        </Animated.View>
      ) : null}

      {typeof children === "string" ? (
        <Text
          className="font-ibm-plex-arabic-medium text-center"
          style={[
            textSizeStyles[size],
            { color: textColorStyles[variant], opacity: loading ? 0 : 1 },
            textStyle,
          ]}
        >
          {children}
        </Text>
      ) : (
        <Animated.View style={{ opacity: loading ? 0 : 1 }}>
          {children}
        </Animated.View>
      )}
    </AnimatedPressable>
  );
};
