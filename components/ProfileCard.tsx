import React from "react";
import { View, Text, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useUserStore } from "@/store/userStore";

interface ProfileCardProps {}

export default function ProfileCard({}: ProfileCardProps) {
  const { profile } = useUserStore();
  return (
    <View className="rounded-2xl ">
      {/* Header Section with Name and Level */}
      <View
        style={{ marginTop: 90 }}
        className=" flex-row items-center justify-center mb-8"
      >
        <View style={{ width: "100%" }} className="  items-center relative">
          <View
            style={{
              transform: [{ translateX: "-50%" }, { translateY: "-50%" }],
              borderWidth: 3,
              borderColor: "#F5F5F590",
              padding: 16,
            }}
            className="absolute top-0  left-1/2 z-20 bg-fore rounded-full p-2 "
          >
            <Ionicons name="person" size={60} color="white" />
          </View>

          <View
            style={{ height: 170 }}
            className="items-center gap-4 justify-end bg-fore py-6  mx-4 my-2 rounded-2xl"
          >
            <Text className="text-white text-3xl font-ibm-plex-arabic-semibold text-center ">
              {profile?.name}
            </Text>
            <View
              style={{ width: "100%" }}
              className="flex-row  justify-center "
            >
              <View className="flex-1 gap-2">
                <Text className="text-text-muted text-center text-sm font-ibm-plex-arabic-medium">
                  عادات مجربة
                </Text>
                <Text className="text-white text-3xl font-ibm-plex-arabic-semibold text-center ">
                  {profile?.commited_habits.length}
                </Text>
              </View>
              <View className="flex-1 gap-2">
                <Text className="text-text-muted text-center text-sm font-ibm-plex-arabic-medium">
                  أيام مكتملة
                </Text>
                <Text className="text-white text-3xl font-ibm-plex-arabic-semibold text-center ">
                  {profile?.best_days.length}
                </Text>
              </View>
              <View className="flex-1 gap-2">
                <Text className="text-text-muted text-center text-sm font-ibm-plex-arabic-medium">
                  حزم مجربة
                </Text>
                <Text className="text-white text-3xl font-ibm-plex-arabic-semibold text-center ">
                  {profile?.commited_bundles.length}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
