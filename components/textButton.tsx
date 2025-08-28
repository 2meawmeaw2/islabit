import * as React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  Text,
  TextStyle,
  ViewStyle,
} from "react-native";

type ButtonProps = {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  /** Optional inline RN styles (still supported) */
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  /** NativeWind utility classes */
  className?: string;
  textClassName?: string;
  accessibilityLabel?: string;
  fullWidth?: boolean;
};

export function Button({
  children,
  onPress,
  disabled = false,
  loading = false,
  style,
  textStyle,
  className,
  textClassName,
  accessibilityLabel,
  fullWidth = false,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const baseClasses =
    "min-h-[44px] px-4   rounded-xl items-center justify-center bg-border-primary";
  const widthClass = fullWidth ? " self-stretch" : "";
  const disabledClass = isDisabled ? " opacity-50" : "";

  const textClasses = "text-text-primary text-[16px]  tracking-[0.2px]";

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={
        accessibilityLabel ??
        (typeof children === "string" ? children : undefined)
      }
      android_ripple={{ color: "#E0F2FE", borderless: false }} // border.active (#62D4FF) @ 20% - replaced with solid light blue
      hitSlop={8}
      // pressed opacity via RN style to avoid magic Tailwind value
      style={({ pressed }) => [
        pressed && !isDisabled ? { opacity: 0.85 } : null,
        style,
      ]}
      className={
        baseClasses +
        widthClass +
        disabledClass +
        (className ? ` ${className}` : "")
      }
    >
      {loading ? (
        // uses text.primary (#E5F8FF) to match theme on dark bg
        <ActivityIndicator color="#E5F8FF" />
      ) : (
        <Text
          numberOfLines={1}
          className={textClasses + (textClassName ? ` ${textClassName}` : "")}
          style={textStyle}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
}
