import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ProfileCard from "../../../components/ProfileCard";
import LanguagesScreen from "./languages";

export default function SettingsScreen() {
  // Simple settings data organized into two groups
  const firstGroup = [
    {
      key: "notifications",
      label: "الإشعار",
      icon: "notifications-outline",
      iconColor: "#4285F4",
    },

    {
      key: "language",
      label: "خيارات اللغة",
      icon: "language-outline",
      iconColor: "#F44336",
    },
  ];

  const secondGroup = [
    {
      key: "share",
      label: "المشاركة مع الأصدقاء",
      icon: "share-social-outline",
      iconColor: "#03DAC6",
    },
    {
      key: "rate",
      label: "قيمنا",
      icon: "star-outline",
      iconColor: "#00BCD4",
    },
  ];

  const renderSettingItem = (item: any, isLast: boolean) => (
    <TouchableOpacity
      key={item.key}
      className="flex-row items-center justify-between py-4 px-4 gap-3"
      activeOpacity={0.7}
      onPress={() => {
        if (item.key === "language") {
          setIsModalVisible(true);
        } else {
          console.log(`${item.label} pressed`);
        }
      }}
    >
      <Text className="text-white text-lg font-ibm-plex-arabic-medium text-right flex-1">
        {item.label}
      </Text>
      <View
        className="w-10 h-10 rounded-lg items-center justify-center"
        style={{ backgroundColor: item.iconColor }}
      >
        <Ionicons name={item.icon as any} size={20} color="white" />
      </View>
      {!isLast && (
        <View className="absolute bottom-0 left-4 right-4 h-[1px] bg-text-brand/70" />
      )}
    </TouchableOpacity>
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView contentContainerClassName="pb-32 ">
        <Modal
          presentationStyle="formSheet"
          visible={isModalVisible}
          animationType="slide"
        >
          <LanguagesScreen setIsModalVisible={setIsModalVisible} />
        </Modal>
        <View
          style={{ borderBottomRightRadius: 20, borderBottomLeftRadius: 20 }}
          className="bg-[#282E2F] rounded-b-3xl pb-6 pt-4"
        >
          <Text className="text-white text-2xl font-ibm-plex-arabic-bold text-center">
            أنا
          </Text>
        </View>
        {/* Profile Card */}
        <ProfileCard />
        <View className="px-4 py-2">
          {/* First Settings Card */}
          <View className="bg-fore rounded-2xl mb-4 overflow-hidden">
            {firstGroup.map((item, index) =>
              renderSettingItem(item, index === firstGroup.length - 1)
            )}
          </View>

          {/* Second Settings Card */}
          <View className="bg-fore rounded-2xl mb-6 overflow-hidden">
            {secondGroup.map((item, index) =>
              renderSettingItem(item, index === secondGroup.length - 1)
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
