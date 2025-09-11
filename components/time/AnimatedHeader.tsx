import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type AnimatedHeaderProps = {
  label: string;
  completionPercent: number;
  initialExpanded?: boolean;
};

const AnimatedHeader: React.FC<AnimatedHeaderProps> = ({
  label,
  initialExpanded = false,
}) => {
  const AnimatedLinearGradient =
    Animated.createAnimatedComponent(LinearGradient);
  const [expanded, setExpanded] = useState(initialExpanded);
  const backgroundContainerColor = useSharedValue("#00070A"); // Replaced transparent with solid dark
  const borderContainerColor = useSharedValue("#6C7684"); // Replaced transparent with solid gray
  const HPaddingContainer = useSharedValue(126);
  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: backgroundContainerColor.value,
      paddingHorizontal: HPaddingContainer.value,
    };
  });

  // Animate the gradient chip from transparent (opacity 0) to colored (opacity 1)
  const gradientOpacity = useSharedValue(1);
  const gradientAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: gradientOpacity.value,
    };
  });
  // circle
  const circleOpacity = useSharedValue(0);

  const circleAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: circleOpacity.value,
    };
  });
  function toggleExpand() {
    setExpanded((prev) => !prev);
    if (expanded) {
      backgroundContainerColor.value = withTiming("#00070A", {
        duration: 300,
      });
      gradientOpacity.value = withTiming(0, { duration: 300 });

      borderContainerColor.value = withTiming("#6C7684", { duration: 300 });
      HPaddingContainer.value = withTiming(16, { duration: 300 });
      circleOpacity.value = withTiming(1, { duration: 300 });
    } else {
      backgroundContainerColor.value = withTiming("#00070A", {
        duration: 300,
      });
      gradientOpacity.value = withTiming(1, { duration: 300 });

      borderContainerColor.value = withTiming("#6C7684", { duration: 300 });
      HPaddingContainer.value = withTiming(0, { duration: 300 });
      circleOpacity.value = withTiming(0, { duration: 300 });
    }
  }

  return (
    <Animated.View className="w-full  ">
      <Animated.View
        className="w-full mb-3"
        key="expanded"
        entering={FadeIn}
        exiting={FadeOut}
      >
        <Pressable
          onPress={() => {
            toggleExpand();
          }}
          className="w-full mb-3"
        >
          <Animated.View
            style={containerAnimatedStyle}
            className="flex-row-reverse justify-between  items-center  rounded-2xl"
          >
            <View style={styles.labelChip} className="my-4 ">
              <Animated.View
                style={[
                  StyleSheet.absoluteFillObject,
                  styles.labelChipOverlay,
                  gradientAnimatedStyle,
                ]}
                pointerEvents="none"
              >
                <AnimatedLinearGradient
                  colors={["#1A1E1F", "#00AEEF"]}
                  start={{ x: 1, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={StyleSheet.absoluteFillObject}
                />
              </Animated.View>
              <Text
                className="text-lg text-text-primary font-ibm-plex-arabic-bold "
                numberOfLines={1}
              >
                {label}
              </Text>
            </View>

            <View
              style={{ width: "30%" }}
              className="flex-row-reverse  justify-end gap-2 items-center"
            >
              <Animated.View
                style={circleAnimatedStyle}
                className="items-center "
              ></Animated.View>
              <Ionicons name="chevron-down" color="white" size={15} />
            </View>
            <Animated.View
              style={[
                gradientAnimatedStyle,
                { width: "71%", transform: [{ translateX: "-52%" }] },
              ]}
              className="  absolute left-1/2  top-1/2 -z-10 "
            ></Animated.View>
          </Animated.View>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  labelChip: {
    borderRadius: 9999,
    paddingVertical: 7,
    paddingHorizontal: 16,
    overflow: "hidden",
  },
  labelChipOverlay: {
    borderRadius: 9999,
  },
  brandHairline: {
    height: 2,
    borderRadius: 2,
  },
});

export default AnimatedHeader;
