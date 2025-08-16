import { View, Text } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";

const settings = () => {
  return (
    <SafeAreaView className="flex-1 flex-col justify-center items-center">
      <Text className="text-white">challenges</Text>
      <Text> Link</Text>
    </SafeAreaView>
  );
};

export default settings;
//
