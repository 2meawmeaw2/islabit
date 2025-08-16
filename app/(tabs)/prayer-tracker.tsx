import { StyleSheet, Text } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {};

const PrayerTracker = (props: Props) => {
  return (
    <SafeAreaView className="flex-1 flex-col justify-center items-center">
      <Text className="text-white">PrayerTracker</Text>
    </SafeAreaView>
  );
};

export default PrayerTracker;

const styles = StyleSheet.create({});
