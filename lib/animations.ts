import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

// Animation configuration constants
export const ANIMATION_CONFIG = {
  // Timing constants
  QUICK: 120,
  MEDIUM: 200,
  SLOW: 300,

  // Spring configuration
  SPRING_CONFIG: {
    damping: 15,
    stiffness: 100,
    mass: 1,
  },

  // Easing
  EASING: {
    default: Easing.bezier(0.25, 0.1, 0.25, 1),
    smooth: Easing.bezier(0.4, 0, 0.2, 1),
    bounce: Easing.bezier(0.68, -0.55, 0.265, 1.55),
  },
};

// Global reduced motion state
let globalReducedMotion = false;
let globalReducedMotionListeners: Array<(value: boolean) => void> = [];

// Initialize global reduced motion state
AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
  globalReducedMotion = enabled || false;
  globalReducedMotionListeners.forEach((listener) =>
    listener(globalReducedMotion)
  );
});

// Set up global listener
AccessibilityInfo.addEventListener("reduceMotionChanged", (enabled) => {
  globalReducedMotion = enabled;
  globalReducedMotionListeners.forEach((listener) =>
    listener(globalReducedMotion)
  );
});

// Hook to check for reduced motion preference
export const useReducedMotion = () => {
  const [reducedMotion, setReducedMotion] = useState(globalReducedMotion);

  useEffect(() => {
    // Add listener to global list
    globalReducedMotionListeners.push(setReducedMotion);

    return () => {
      // Remove listener from global list
      const index = globalReducedMotionListeners.indexOf(setReducedMotion);
      if (index > -1) {
        globalReducedMotionListeners.splice(index, 1);
      }
    };
  }, []);

  return reducedMotion;
};

// Hover/Press animation hook
export const usePressAnimation = () => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const reducedMotion = useReducedMotion();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const onPressIn = () => {
    if (reducedMotion) {
      scale.value = 0.98;
      opacity.value = 0.8;
    } else {
      scale.value = withSpring(0.95, ANIMATION_CONFIG.SPRING_CONFIG);
      opacity.value = withTiming(0.8, { duration: ANIMATION_CONFIG.QUICK });
    }
  };

  const onPressOut = () => {
    if (reducedMotion) {
      scale.value = 1;
      opacity.value = 1;
    } else {
      scale.value = withSpring(1, ANIMATION_CONFIG.SPRING_CONFIG);
      opacity.value = withTiming(1, { duration: ANIMATION_CONFIG.QUICK });
    }
  };

  return { animatedStyle, onPressIn, onPressOut };
};

// Success animation hook
export const useSuccessAnimation = () => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotation = useSharedValue(0);
  const reducedMotion = useReducedMotion();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
    opacity: opacity.value,
  }));

  const triggerSuccess = () => {
    if (reducedMotion) {
      scale.value = 1;
      opacity.value = 1;
    } else {
      scale.value = withSequence(
        withTiming(0, { duration: 0 }),
        withSpring(1.2, ANIMATION_CONFIG.SPRING_CONFIG),
        withSpring(1, ANIMATION_CONFIG.SPRING_CONFIG)
      );
      opacity.value = withTiming(1, { duration: ANIMATION_CONFIG.MEDIUM });
      rotation.value = withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(360, {
          duration: ANIMATION_CONFIG.SLOW,
          easing: ANIMATION_CONFIG.EASING.smooth,
        })
      );
    }
  };

  const reset = () => {
    scale.value = 0;
    opacity.value = 0;
    rotation.value = 0;
  };

  return { animatedStyle, triggerSuccess, reset };
};

// Loading spinner animation hook
export const useLoadingAnimation = () => {
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(1);
  const reducedMotion = useReducedMotion();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
    opacity: opacity.value,
  }));

  const startLoading = () => {
    if (reducedMotion) {
      opacity.value = withSequence(
        withTiming(0.5, { duration: 500 }),
        withTiming(1, { duration: 500 })
      );
    } else {
      rotation.value = withTiming(360, {
        duration: 1000,
        easing: Easing.linear,
      });

      // Set up continuous rotation
      const rotate = () => {
        rotation.value = withTiming(
          rotation.value + 360,
          {
            duration: 1000,
            easing: Easing.linear,
          },
          () => {
            if (!reducedMotion) {
              rotate();
            }
          }
        );
      };
      rotate();
    }
  };

  const stopLoading = () => {
    rotation.value = withTiming(0, { duration: ANIMATION_CONFIG.QUICK });
    opacity.value = withTiming(0, { duration: ANIMATION_CONFIG.QUICK });
  };

  return { animatedStyle, startLoading, stopLoading };
};

// Error shake animation hook
export const useErrorAnimation = () => {
  const translateX = useSharedValue(0);
  const borderColor = useSharedValue("#6C7684"); // Replaced transparent with solid gray
  const reducedMotion = useReducedMotion();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    borderColor: borderColor.value,
  }));

  const triggerError = () => {
    if (reducedMotion) {
      borderColor.value = "#9a1223";
      setTimeout(() => {
        borderColor.value = "#6C7684";
      }, 1000);
    } else {
      translateX.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 100 }),
        withTiming(-10, { duration: 100 }),
        withTiming(10, { duration: 100 }),
        withTiming(0, { duration: 50 })
      );
      borderColor.value = withSequence(
        withTiming("#9a1223", { duration: 100 }),
        withDelay(300, withTiming("#6C7684", { duration: 200 }))
      );
    }
  };

  return { animatedStyle, triggerError };
};

// Scale-in animation hook for list items
export const useScaleInAnimation = (
  index: number = 0,
  enabled: boolean = true
) => {
  const scale = useSharedValue(enabled ? 0 : 1);
  const opacity = useSharedValue(enabled ? 0 : 1);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!enabled) return;

    if (reducedMotion) {
      scale.value = 1;
      opacity.value = 1;
    } else {
      scale.value = withDelay(
        index * 50,
        withSpring(1, ANIMATION_CONFIG.SPRING_CONFIG)
      );
      opacity.value = withDelay(
        index * 50,
        withTiming(1, { duration: ANIMATION_CONFIG.MEDIUM })
      );
    }
  }, [enabled, reducedMotion, scale, opacity, index]); // Added index back but with stable reference

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return animatedStyle;
};

// Progress animation hook
export const useProgressAnimation = (targetProgress: number) => {
  const progress = useSharedValue(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      progress.value = targetProgress;
    } else {
      progress.value = withTiming(targetProgress, {
        duration: ANIMATION_CONFIG.SLOW,
        easing: ANIMATION_CONFIG.EASING.smooth,
      });
    }
  }, [targetProgress, reducedMotion, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  return { animatedStyle, progress };
};

// Badge pop animation
export const useBadgeAnimation = () => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const reducedMotion = useReducedMotion();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const show = () => {
    if (reducedMotion) {
      scale.value = 1;
      opacity.value = 1;
    } else {
      scale.value = withSpring(1, {
        ...ANIMATION_CONFIG.SPRING_CONFIG,
        stiffness: 200,
      });
      opacity.value = withTiming(1, { duration: ANIMATION_CONFIG.QUICK });
    }
  };

  const hide = () => {
    scale.value = withTiming(0, { duration: ANIMATION_CONFIG.QUICK });
    opacity.value = withTiming(0, { duration: ANIMATION_CONFIG.QUICK });
  };

  return { animatedStyle, show, hide };
};
