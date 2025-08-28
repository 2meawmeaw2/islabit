import { LinearGradient } from "expo-linear-gradient";
import React, { memo, useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Extrapolate,
  FadeInDown,
} from "react-native-reanimated";
import type { ColorValue } from "react-native";
import { useRouter } from "expo-router";

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  id: string;

  title: string;
  description?: string;
  streak?: number;
  dueLabel?: string;
  completed?: boolean;
  onPress?: () => void;
  onMore?: () => void;
  onToggle?: (next: boolean) => void;
};
const router = useRouter();

export const ActionCard: React.FC<Props> = memo(
  ({
    id,
    title,
    description,
    streak = 0,
    dueLabel,
    completed = false,
    onMore,
    onToggle,
  }) => {
    // --- Shared values
    const onPressNavigate = () => {
      router.navigate({
        pathname: "/(tabs)/(time)/habitDetails",
        params: {
          habit: JSON.stringify({
            id: id,
            title: title,
            description: description,
            days: [1, 2, 3, 5],
            salat: "fajr" as const,
            streak: streak,
          }),
        },
      });
    };

    const pressSV = useSharedValue(0); // 0 idle, 1 pressed
    const doneSV = useSharedValue(completed ? 1 : 0); // 0 not done, 1 done
    const knobSV = useSharedValue(0); // micro interaction on toggle
    const pulseSV = useSharedValue(0); // success pulse when completing

    useEffect(() => {
      // animate completion changes
      doneSV.value = withTiming(completed ? 1 : 0, { duration: 300 });
      // kick a little wobble on the knob when toggled
      knobSV.value = 0;
      knobSV.value = withSpring(1, { mass: 0.6, damping: 12, stiffness: 200 });
      // success pulse when marked completed
      if (completed) {
        pulseSV.value = 0;
        pulseSV.value = withTiming(1, { duration: 650 });
      }
    }, [completed]);

    // --- Card press scale
    const cardStyle = useAnimatedStyle(() => {
      const scale = withSpring(pressSV.value ? 0.98 : 1, {
        mass: 0.8,
        damping: 14,
        stiffness: 180,
      });
      return { transform: [{ scale }] };
    });

    // --- Cross-fade background gradients
    const doneOpacityStyle = useAnimatedStyle(() => ({
      opacity: doneSV.value,
    }));
    const todoOpacityStyle = useAnimatedStyle(() => ({
      opacity: 1 - doneSV.value,
    }));

    // --- Knob animations (scale + slight rotate)
    const knobStyle = useAnimatedStyle(() => {
      const scale =
        1 +
        interpolate(knobSV.value, [0, 1], [0, 0.06], Extrapolate.CLAMP) +
        interpolate(pressSV.value, [0, 1], [0, -0.02], Extrapolate.CLAMP);
      const rotate = `${interpolate(doneSV.value, [0, 1], [0, 10])}deg`;
      return {
        transform: [{ scale }, { rotate }],
      };
    });

    // --- Icon cross-fade
    const checkOpacity = useAnimatedStyle(() => ({
      opacity: doneSV.value,
    }));
    const circleOpacity = useAnimatedStyle(() => ({
      opacity: 1 - doneSV.value,
    }));

    // --- Completion pulse ring around the knob
    const pulseStyle = useAnimatedStyle(() => {
      const scale = interpolate(
        pulseSV.value,
        [0, 1],
        [0.6, 1.4],
        Extrapolate.CLAMP
      );
      const opacity = interpolate(
        pulseSV.value,
        [0, 1],
        [0.25, 0],
        Extrapolate.CLAMP
      );
      return {
        transform: [{ scale }],
        opacity,
      };
    });

    // inside ActionCard
    const mainDone: readonly [ColorValue, ColorValue] = ["#6B7280", "#4B5563"]; // gray background when done
    const mainTodo: readonly [ColorValue, ColorValue] = ["#00AEEF", "#1A1E1F"]; // blue → dark when todo
    const knobDone: readonly [ColorValue, ColorValue] = ["#9CA3AF", "#9CA3AF"]; // gray knob when done
    const knobTodo: readonly [ColorValue, ColorValue] = ["#38BDF8", "#0EA5E9"]; // blue knob when todo

    return (
      <Animated.View entering={FadeInDown.duration(250).springify()}>
        <AnimatedPressable
          onPressIn={() => (pressSV.value = 1)}
          onPressOut={() => (pressSV.value = 0)}
          onPress={onPressNavigate}
          style={[styles.container, cardStyle]}
          className="relative"
        >
          <View className="w-full h-[70px] mt-3 flex-row-reverse items-stretch">
            {/* Toggle */}
            <View className="w-[20%] h-full justify-center items-center">
              <Pressable
                onPress={() => onToggle?.(!completed)}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={
                  completed ? "Mark as not completed" : "Mark as completed"
                }
              >
                {/* Success pulse ring */}
                <Animated.View
                  style={[
                    {
                      position: "absolute",
                      width: 52,
                      height: 52,
                      borderRadius: 26,
                      backgroundColor: "#22C55E",
                    },
                    pulseStyle,
                  ]}
                />
                <AnimatedLinearGradient
                  colors={completed ? knobDone : knobTodo}
                  start={{ x: 1, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={[styles.knobGrad, knobStyle]}
                >
                  <View style={styles.knobInner}>
                    <Animated.View
                      style={[
                        StyleSheet.absoluteFillObject,
                        { alignItems: "center", justifyContent: "center" },
                        checkOpacity,
                      ]}
                    >
                      <Ionicons name="checkmark" size={22} color="#0B1220" />
                    </Animated.View>

                    <Animated.View
                      style={[
                        StyleSheet.absoluteFillObject,
                        { alignItems: "center", justifyContent: "center" },
                        circleOpacity,
                      ]}
                    >
                      <Ionicons
                        name="ellipse-outline"
                        size={22}
                        color="#E5E7EB"
                      />
                    </Animated.View>
                  </View>
                </AnimatedLinearGradient>
              </Pressable>
            </View>

            {/* Background gradient with cross-fade layers */}
            <View className="w-[80%] h-full mx-2 rounded-2xl overflow-hidden">
              {/* TODO state */}
              <AnimatedLinearGradient
                colors={mainTodo}
                start={{ x: 1, y: 0 }}
                end={{ x: -0.3, y: 0 }}
                style={[StyleSheet.absoluteFill, todoOpacityStyle]}
                className="justify-between items-center flex-row-reverse"
              >
                <Animated.View style={[{ flex: 1 }, todoOpacityStyle]} />
              </AnimatedLinearGradient>

              {/* DONE state */}
              <AnimatedLinearGradient
                colors={mainDone}
                start={{ x: 1, y: 0 }}
                end={{ x: -0.3, y: 0 }}
                style={[StyleSheet.absoluteFill, doneOpacityStyle]}
                className="justify-between items-center flex-row-reverse"
              >
                <Animated.View style={[{ flex: 1 }, doneOpacityStyle]} />
              </AnimatedLinearGradient>

              {/* Foreground content sitting above both gradients */}
              <View className="w-full h-full py-0 px-0 absolute inset-0 justify-between items-center flex-row-reverse">
                <View className="px-3 justify-center items-end">
                  <Text
                    className={`${completed ? "text-white/60" : "text-white"} text-white font-ibm-plex-arabic-medium text-lg text-right`}
                    numberOfLines={1}
                    style={{
                      textDecorationLine: completed ? "line-through" : "none",
                      opacity: completed ? 0.75 : 1,
                    }}
                  >
                    {title}
                  </Text>

                  <View className="flex-row-reverse">
                    {streak > 0 && (
                      <View className="bg-white/12 rounded-full ml-2 flex-row-reverse items-center px-2 py-[2px]">
                        <MaterialCommunityIcons
                          name="fire"
                          size={14}
                          color="#fb923c"
                        />
                        <Text className="text-border-highlight text-[12px] mr-1 font-ibm-plex-arabic-light">
                          {streak} يوم
                        </Text>
                      </View>
                    )}
                    {completed && (
                      <View className="bg-[#22C55E]/20 border border-[#22C55E]/40 rounded-full ml-2 flex-row-reverse items-center px-2 py-[2px]">
                        <Ionicons
                          name="checkmark-circle"
                          size={14}
                          color="#22C55E"
                        />
                        <Text className="text-[#22C55E] text-[12px] mr-1 font-ibm-plex-arabic-medium">
                          تم
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <Pressable
                  onPress={onMore}
                  className="w-[18%] h-full justify-center items-center pt-2"
                >
                  <Ionicons
                    name="ellipsis-horizontal"
                    color="white"
                    size={22}
                  />
                </Pressable>
              </View>
            </View>
          </View>
        </AnimatedPressable>
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
  container: { width: "100%", paddingHorizontal: 8 },
  knobGrad: { padding: 3, borderRadius: 999 },
  knobInner: {
    backgroundColor: "white",
    borderRadius: 999,
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
});
