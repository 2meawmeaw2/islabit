import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useAnimatedSensor,
  SensorType,
  withSpring,
} from "react-native-reanimated";

export default function App() {
  const gravity = useAnimatedSensor(SensorType.MAGNETIC_FIELD);
  useEffect(() => {
    console.log(gravity.sensor.value.y);
  }, [gravity]);
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: withSpring(gravity.sensor.value.y * 1) },
        { translateY: withSpring(-gravity.sensor.value.y * 0) },
      ],
    };
  });

  return (
    <Animated.View style={styles.container} sharedTransitionTag="sharedTag">
      <Animated.View
        sharedTransitionTag="sharedTag"
        style={{ width: 100, height: 100, backgroundColor: "green" }}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  box: {
    height: 120,
    width: 120,
    backgroundColor: "#b58df1",
    borderRadius: 20,
  },
});
