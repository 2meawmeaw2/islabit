import { View, Text } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";

const settings = () => {
  return (
    <SafeAreaView>
      <Text>settings</Text>
      <Text
        onPress={() => {
          router.replace("/index");
        }}
      >
        {" "}
        Link
      </Text>
    </SafeAreaView>
  );
};

export default settings;
//
