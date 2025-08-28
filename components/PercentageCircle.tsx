import React, { useEffect } from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { interpolateColor } from "react-native-reanimated";

type PercentageCircleProps = {
  size?: number;
  strokeWidth?: number;
  percentage: number; // 0-100
  durationMs?: number;
  trackColor?: string;
  progressColor?: string;
  backgroundColor?: string;
  roundedCaps?: boolean;
  showLabel?: boolean;
  labelFormatter?: (value: number) => string;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  startAt?: number; // degrees to rotate start point, default -90 (12 o'clock)
  colors?: string[]; // gradient-like animated colors across progress (overrides progressColor)
  colorStops?: number[]; // values from 0..1 mapping to colors
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function PercentageCircle({
  size = 120,
  strokeWidth = 12,
  percentage,
  durationMs = 900,
  trackColor = "#E5E7EB",
  progressColor = "#22C55E",
  backgroundColor = "#ffffff",
  roundedCaps = true,
  showLabel = true,
  labelFormatter,
  containerStyle,
  labelStyle,
  startAt = -90,
  colors,
  colorStops,
}: PercentageCircleProps) {
  const clamped = Math.max(
    0,
    Math.min(100, Number.isFinite(percentage) ? percentage : 0)
  );
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(clamped / 100, {
      duration: durationMs,
      easing: Easing.out(Easing.cubic),
    });
  }, [clamped, durationMs, progress]);

  const stops =
    colors && colors.length >= 2
      ? colorStops && colorStops.length === colors.length
        ? colorStops
        : colors.map((_, idx) => idx / (colors.length - 1))
      : null;

  const animatedProps = useAnimatedProps(() => {
    let stroke = progressColor;
    if (stops) {
      stroke = interpolateColor(progress.value, stops, colors!);
    }
    return {
      strokeDashoffset: circumference * (1 - progress.value),
      stroke,
    } as any;
  });

  // Tiny-size tuning
  const isTiny = size <= 24;
  const isSmall = size <= 28;
  const effectiveShowLabel = showLabel && !isSmall;
  const effectiveCap = isTiny ? "butt" : roundedCaps ? "round" : "butt";
  const effectiveStrokeWidth = Math.min(strokeWidth, Math.max(2, size * 0.28));

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          backgroundColor,
        },
        containerStyle,
      ]}
      accessibilityRole="progressbar"
      accessibilityValue={{ now: clamped, min: 0, max: 100 }}
    >
      <Svg width={size} height={size}>
        <Circle
          stroke={trackColor}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={effectiveStrokeWidth}
        />

        <AnimatedCircle
          stroke={progressColor}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={effectiveStrokeWidth}
          strokeLinecap={effectiveCap}
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={animatedProps}
          // Start at top (12 o'clock)
          transform={`rotate(${startAt} ${size / 2} ${size / 2})`}
        />
      </Svg>

      {effectiveShowLabel && (
        <View style={styles.centerLabel} pointerEvents="none">
          <Text style={[styles.label, labelStyle]}>
            {labelFormatter
              ? labelFormatter(clamped)
              : `${Math.round(clamped)}%`}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9999,
  },
  centerLabel: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    inset: 0,
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
});
