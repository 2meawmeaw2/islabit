import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated from "react-native-reanimated";

type Props = {};

const Reflection = (props: Props) => {
  return (
    <SafeAreaView className="flex-1 flex-col justify-center items-center">
      <Animated.View className=" h-full w-full">
        <Text className="text-white">reflection</Text>
        <Animated.View
          sharedTransitionTag="sharedTag"
          style={{ width: 100, height: 100, backgroundColor: "green" }}
        />
      </Animated.View>
    </SafeAreaView>
  );
};

export default Reflection;

const styles = StyleSheet.create({});
