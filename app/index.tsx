import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
} from "react-native-reanimated";
import { useRouter } from "expo-router";

const WelcomeMinimalUI: React.FC = ({}) => {
  const router = useRouter();

  const a = useSharedValue(0);
  const s = useAnimatedStyle(() => ({
    opacity: a.value,
    transform: [{ translateY: (1 - a.value) * 10 }],
  }));
  useEffect(() => {
    a.value = withTiming(1, {
      duration: 420,
      easing: Easing.out(Easing.cubic),
    });
  }, []);
  const morePress = () => {
    router.navigate("/moreInfo");
  };
  const startPress = () => {
    router.navigate("/signUp");
  };

  return (
    <SafeAreaView className="bg-bg flex-1 ">
      <StatusBar barStyle="light-content" backgroundColor="#00070A" />

      {/* Top bar (skip) */}
      <View className=" flex-row-reverse items-center justify-between px-6 pt-2">
        <TouchableOpacity hitSlop={8}>
          <Text className="font-ibm-plex-arabic-medium text-text-secondary">
            تخطي
          </Text>
        </TouchableOpacity>
      </View>

      {/* Center hero */}
      <View className="  flex-1 items-center justify-center px-8">
        <Animated.View style={s} className="items-center">
          <View
            className=" w-16 h-16 rounded-2xl items-center justify-center mb-5"
            style={{
              backgroundColor: "rgba(0,174,239,0.12)",
              borderWidth: 1,
              borderColor: "#00AEEF",
            }}
          >
            <Ionicons name="sparkles-outline" size={22} color="#00AEEF" />
          </View>

          <Text className="w-full font-ibm-plex-arabic-bold text-text-brand text-[24px] text-center">
            تنظيم اليوم
          </Text>
          <Text className="font-ibm-plex-arabic text-text-secondary text-[13px] text-center mt-2 leading-5">
            رتّب مهامك ببساطة حول مواقيت الصلاة.
          </Text>

          {/* Primary CTA */}
          <TouchableOpacity
            className="bg-text-brand rounded-2xl py-3 px-6 mt-6"
            activeOpacity={0.9}
            accessibilityRole="button"
            accessibilityLabel="ابدأ الآن"
          >
            <Text className="font-ibm-plex-arabic-bold text-center w-full text-bg text-base">
              ابدأ الآن
            </Text>
          </TouchableOpacity>

          {/* Secondary link */}
          <TouchableOpacity
            onPress={morePress}
            className="mt-3 w-full "
            accessibilityRole="button"
            accessibilityLabel="المزيد من المعلومات"
          >
            <View className="flex-row items-center w-full gap-1 pl-1 ">
              <Text className="font-ibm-plex-arabic-medium  text-text-white">
                المزيد من المعلومات
              </Text>
              <Ionicons
                name="chevron-back"
                size={16}
                color="#85DEFF"
                style={{ marginRight: 4, transform: [{ scaleX: -1 }] }}
              />
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Tiny footer (optional) */}
      <View className="px-8 pb-8">
        <Text className="font-ibm-plex-arabic text-text-disabled text-[11px] text-center">
          باستخدامك للتطبيق، أنت توافق على الشروط وسياسة الخصوصية.
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default WelcomeMinimalUI;
