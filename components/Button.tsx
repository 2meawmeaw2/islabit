import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  GestureResponderEvent,
  Pressable,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { useColorScheme } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface ButtonProps {
  label: string;
  onPress?: (event: GestureResponderEvent) => void | Promise<void>;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  isDisabled?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  loadingText?: string;
  errorText?: string;
  completedText?: string;
  statusDurationMs?: number; // how long to show error before resetting
  onStatusChange?: (status: ButtonStatus) => void;
  className?: string; // allow extra tailwind classes
  textClassName?: string; // allow extra tailwind classes for text
  persistCompleted?: boolean; // keep completed text after success
  style?: StyleProp<ViewStyle>;
  // Per-state styles (merged after base style)
  styleIdle?: StyleProp<ViewStyle>;
  styleLoading?: StyleProp<ViewStyle>;
  styleSuccess?: StyleProp<ViewStyle>;
  styleError?: StyleProp<ViewStyle>;
  // Per-state icons (shown on the left, fallback to iconLeft)
  iconIdle?: React.ReactNode;
  iconLoading?: React.ReactNode;
  iconSuccess?: React.ReactNode;
  iconError?: React.ReactNode;
}

type ButtonStatus = "idle" | "loading" | "success" | "error";

function getSizeClasses(size: NonNullable<ButtonProps["size"]>) {
  if (size === "sm") {
    return { container: "px-4 py-2 rounded-lg", text: "text-sm" };
  }
  if (size === "lg") {
    return { container: "px-6 py-3.5 rounded-xl", text: "text-lg" };
  }
  return { container: "px-5 py-3 rounded-xl", text: "text-base" };
}

function getVariantClasses(
  variant: NonNullable<ButtonProps["variant"]>,
  isDark: boolean,
  status: ButtonStatus,
  disabled: boolean
) {
  const base = "flex-row items-center justify-center gap-2";

  if (variant === "ghost") {
    const text = disabled
      ? isDark
        ? "text-zinc-500"
        : "text-zinc-400"
      : isDark
        ? "text-zinc-100"
        : "text-zinc-900";
    const pressedBg = isDark ? "bg-zinc-800/60" : "bg-zinc-100";
    const border = "border border-transparent";
    return { container: `${base} ${border}`, text, pressedBg };
  }

  if (variant === "secondary") {
    const container = disabled
      ? isDark
        ? "bg-zinc-800"
        : "bg-zinc-200"
      : isDark
        ? "bg-zinc-800"
        : "bg-zinc-100";
    const border = isDark ? "border border-zinc-700" : "border border-zinc-200";
    const text = disabled
      ? isDark
        ? "text-zinc-500"
        : "text-zinc-400"
      : isDark
        ? "text-zinc-100"
        : "text-zinc-900";
    const pressedBg = isDark ? "bg-zinc-700" : "bg-zinc-200";
    return { container: `${base} ${container} ${border}`, text, pressedBg };
  }

  // primary
  const isSuccess = status === "success";
  const isError = status === "error";
  const bg = disabled
    ? isDark
      ? "bg-zinc-700"
      : "bg-zinc-300"
    : isError
      ? "bg-red-600"
      : isSuccess
        ? "bg-emerald-600"
        : "bg-indigo-600";
  const pressedBg = disabled
    ? bg
    : isError
      ? "bg-red-700"
      : isSuccess
        ? "bg-emerald-700"
        : "bg-indigo-700";
  const text = "text-white";
  return { container: `${base} ${bg}`, text, pressedBg };
}

export function Button(props: ButtonProps) {
  const {
    label,
    onPress,
    variant = "primary",
    size = "md",
    fullWidth,
    isDisabled,
    iconLeft,
    iconRight,
    loadingText = "Loading…",
    errorText = "Something went wrong",
    completedText = "Completed",
    statusDurationMs = 1200,
    onStatusChange,
    className,
    textClassName,
    persistCompleted = true,
    style,
    styleIdle,
    styleLoading,
    styleSuccess,
    styleError,
    iconIdle,
    iconLoading,
    iconSuccess,
    iconError,
  } = props;

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [status, setStatus] = useState<ButtonStatus>("idle");
  const isBusy = status === "loading";
  const isSuccess = status === "success";
  const isError = status === "error";

  const scale = useSharedValue(1);
  const pressedBgRef = useRef<string>("");

  const sizeClasses = useMemo(() => getSizeClasses(size), [size]);
  const variantClasses = useMemo(
    () =>
      getVariantClasses(variant, isDark, status, Boolean(isDisabled || isBusy)),
    [variant, isDark, status, isDisabled, isBusy]
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    if (isDisabled || isBusy) return;
    scale.value = withTiming(0.98, { duration: 80 });
  }, [isDisabled, isBusy, scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, { duration: 120 });
  }, [scale]);

  const handlePress = useCallback(
    async (e: GestureResponderEvent) => {
      if (!onPress || isDisabled || isBusy) return;
      try {
        setStatus("loading");
        onStatusChange && onStatusChange("loading");
        await Promise.resolve(onPress(e));
        setStatus("success");
        onStatusChange && onStatusChange("success");
      } catch (err) {
        setStatus("error");
        onStatusChange && onStatusChange("error");
      }
    },
    [
      onPress,
      isDisabled,
      isBusy,
      onStatusChange,
      statusDurationMs,
      persistCompleted,
    ]
  );

  const containerClasses = [
    variantClasses.container,
    sizeClasses.container,
    fullWidth ? "w-full" : "self-auto",
    isDisabled || isBusy ? "opacity-70" : "opacity-100",
    "active:opacity-95",
    className || "",
  ].join(" ");

  const textClasses = [
    variantClasses.text,
    sizeClasses.text,
    "font-semibold",
    textClassName || "",
  ].join(" ");

  const currentLabel = isBusy
    ? loadingText
    : isError
      ? errorText
      : isSuccess
        ? completedText
        : label;

  const spinnerColor = useMemo(() => {
    if (variant === "primary") return "#ffffff";
    return isDark ? "#e5e7eb" : "#111827";
  }, [variant, isDark]);

  const stateStyle: StyleProp<ViewStyle> = useMemo(() => {
    if (isBusy) return styleLoading;
    if (isError) return styleError;
    if (isSuccess) return styleSuccess;
    return styleIdle;
  }, [
    isBusy,
    isError,
    isSuccess,
    styleLoading,
    styleError,
    styleSuccess,
    styleIdle,
  ]);

  const stateIcon: React.ReactNode = useMemo(() => {
    if (isBusy) return iconLoading;
    if (isError) return iconError;
    if (isSuccess) return iconSuccess;
    return iconIdle;
  }, [
    isBusy,
    isError,
    isSuccess,
    iconLoading,
    iconError,
    iconSuccess,
    iconIdle,
  ]);

  return (
    <Animated.View style={animatedStyle} className={fullWidth ? "w-full" : ""}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{
          disabled: Boolean(isDisabled || isBusy),
          busy: isBusy,
        }}
        className={containerClasses}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={Boolean(isDisabled || isBusy)}
        style={[style, stateStyle]}
      >
        <View className="flex-row items-center justify-center gap-2">
          {stateIcon ? (
            <View className="opacity-90">{stateIcon}</View>
          ) : iconLeft ? (
            <View className="opacity-90">{iconLeft}</View>
          ) : null}
          {isBusy ? (
            <View className="flex-row items-center gap-2">
              <ActivityIndicator size="small" color={spinnerColor} />
              <Text className={textClasses}>{currentLabel}</Text>
            </View>
          ) : (
            <Text className={textClasses}>{currentLabel}</Text>
          )}
          {iconRight ? <View className="opacity-90">{iconRight}</View> : null}
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default Button;
