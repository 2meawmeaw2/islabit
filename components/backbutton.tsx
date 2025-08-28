import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
const BackButton = ({
  className,
  size,
}: {
  className?: string;
  size?: number;
}) => {
  const router = useRouter();
  return (
    <TouchableOpacity
      onPress={() => router.back()}
      className={`rounded-xl bg-text-brand  justify-center items-center`}
      style={{ width: 44, height: 44 }}
    >
      <Ionicons name="arrow-back" size={size} color="#0B1623" />
    </TouchableOpacity>
  );
};

export default BackButton;
