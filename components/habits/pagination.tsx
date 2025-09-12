// Pagination.tsx
import React, { useEffect, memo } from "react";
import { View, Pressable } from "react-native";
import Animated, {
  Extrapolation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
  StretchInX,
  StretchOutX,
  LinearTransition,
} from "react-native-reanimated";

type PaginationProps = {
  count: number;
  index?: number;
  progress?: SharedValue<number>;
  onPressDot?: (i: number) => void;
  dotSize?: number;
  activeMaxWidth?: number;
  gap?: number;
};

const ACTIVE_CLASS = "bg-text-brand";
const INACTIVE_CLASS = "bg-slate-700";

// Separate component for individual dots to isolate hooks
const PaginationDot = memo(
  ({
    dotIndex,
    progress,
    onPress,
    dotSize,
    activeMaxWidth,
    currentIndex,
  }: {
    dotIndex: number;
    progress: SharedValue<number>;
    onPress: () => void;
    dotSize: number;
    activeMaxWidth: number;
    currentIndex: number;
  }) => {
    const animatedStyle = useAnimatedStyle(() => {
      const distance = Math.abs(progress.value - dotIndex);

      const width = interpolate(
        distance,
        [0, 0.3, 0.6, 1, 1.5, 2],
        [
          activeMaxWidth,
          activeMaxWidth * 0.85,
          activeMaxWidth * 0.6,
          dotSize + 2,
          dotSize,
          dotSize,
        ],
        Extrapolation.CLAMP
      );

      const scale = interpolate(
        distance,
        [0, 0.5, 1.5],
        [1, 0.96, 0.88],
        Extrapolation.CLAMP
      );

      const opacity = interpolate(
        distance,
        [0, 0.8, 1.8],
        [1, 0.8, 0.4],
        Extrapolation.CLAMP
      );

      return {
        width,
        transform: [{ scale }],
        opacity,
      };
    });

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Go to slide ${dotIndex + 1}`}
        accessibilityState={{ selected: Math.round(currentIndex) === dotIndex }}
        onPress={onPress}
        hitSlop={12}
      >
        <Animated.View
          entering={StretchInX.delay(50 + dotIndex * 40).duration(400)}
          exiting={StretchOutX.delay(50 + dotIndex * 40).duration(300)}
          layout={LinearTransition.duration(300).easing(
            Easing.out(Easing.cubic)
          )}
          className={`rounded-full `}
          style={[
            {
              minWidth: dotSize,
              height: dotSize,
            },
          ]}
        >
          <Animated.View
            className={`h-full rounded-full ${ACTIVE_CLASS}`}
            style={[
              animatedStyle,
              {
                height: dotSize,
              },
            ]}
          />
        </Animated.View>
      </Pressable>
    );
  }
);

const Pagination = memo(
  ({
    count,
    index = 0,
    progress,
    onPressDot,
    dotSize = 8,
    activeMaxWidth = 28,
    gap = 10,
  }: PaginationProps) => {
    // Always initialize hooks regardless of count
    const internal = useSharedValue(index);

    useEffect(() => {
      internal.value = withTiming(index, {
        duration: 350,
        easing: Easing.out(Easing.cubic),
      });
    }, [index]);

    // Early return AFTER all hooks are called
    if (!count || count <= 1) {
      return null;
    }

    const p = progress ?? internal;

    return (
      <View
        className="flex-row items-center justify-center mt-4"
        style={{ columnGap: gap }}
      >
        {Array.from({ length: count }, (_, i) => (
          <PaginationDot
            key={i}
            dotIndex={i}
            progress={p}
            onPress={() => onPressDot?.(i)}
            dotSize={dotSize}
            activeMaxWidth={activeMaxWidth}
            currentIndex={index}
          />
        ))}
      </View>
    );
  }
);

PaginationDot.displayName = "PaginationDot";
Pagination.displayName = "Pagination";

export default Pagination;
