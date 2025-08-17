import React from "react";
import { Button, View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  withDecay,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
  PanGestureHandlerEventPayload,
} from "react-native-gesture-handler";

type context = {
  translateX: number;
};

const settings = () => {
  const pressed = useSharedValue<boolean>(false);
  const offset = useSharedValue<number>(0);

  const animatedStyles = useAnimatedStyle(() => ({
    backgroundColor: pressed.value ? "#FFE04B" : "#B58DF1",
    transform: [
      { scale: withTiming(pressed.value ? 1.2 : 1) },
      { translateX: offset.value },
    ],
  }));

  const tap = Gesture.Pan()
    .onBegin(() => {
      pressed.value = true;
    })
    .onUpdate((event) => {
      offset.value = event.translationX;
    })
    .onFinalize((event) => {
      offset.value = withTiming(0, { duration: 250 });

      pressed.value = false;
    });
  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.container}>
        <GestureDetector gesture={tap}>
          <Animated.View style={[styles.circle, animatedStyles]} />
        </GestureDetector>
      </View>
    </GestureHandlerRootView>
  );
};

export default settings;
//
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  circle: {
    height: 120,
    width: 120,
    borderRadius: 500,
  },
});
