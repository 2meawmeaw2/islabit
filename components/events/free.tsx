// screens/FreeIntro.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const AnimatedSafeAreaView = Animated.createAnimatedComponent(SafeAreaView);

const FreeIntro: React.FC = ({}) => {
  const router = useRouter();
  return (
    <AnimatedSafeAreaView entering={FadeIn} className="flex-1 bg-bg">
      <View className="flex-1 items-center justify-center px-6">
        {/* Title */}
        <View className="w-full items-center mb-6">
          <View className=" justify-center items-center gap-2 w-full ">
            <Text
              className="font-ibm-plex-arabic-bold text-4xl  py-2 bg-bg  mx-auto px-2 rounded-md text-text-brand"
              style={{ writingDirection: "rtl" }}
              accessibilityRole="header"
            >
              تحرر
            </Text>
            <View className="absolute w-[200vw] left-0 -translate-x-[10%] translate-y-[4px]  h-[2px] top-1/2 -z-10 bg-text-brand/70" />
          </View>

          <Text
            className="mt-4 text-center text-text-secondary font-ibm-plex-arabic-medium"
            style={{ writingDirection: "rtl" }}
          >
            قلّل التشتّت بسرعة. أوقف التطبيقات المشتّتة لمدّة تختارها.
          </Text>
        </View>

        {/* Minimal bullets */}
        <View className="w-11/12 gap-3 mb-10">
          {[
            "تقييد التطبيقات المشتّتة التي تحددها مسبقًا.",
            "عدّ تنازلي واضح، مع إيقاف مؤقّت عند الحاجة.",
            "تجربة بسيطة وخفيفة بلا مفاجآت.",
          ].map((t, i) => (
            <View key={i} className="flex-row-reverse items-start gap-2">
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color="#7E57C2"
              />
              <Text
                className="flex-1 text-right text-text-primary font-ibm-plex-arabic-medium"
                style={{ writingDirection: "rtl" }}
              >
                {t}
              </Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <Pressable
          onPress={() => router.navigate("/(tabs)/home/FreeCommit")}
          accessibilityRole="button"
          accessibilityLabel="ابدأ"
          android_ripple={{ color: "#E5E7EB" }}
          className="w-11/12 rounded-2xl py-5 shadow-lg flex-row-reverse items-center justify-center gap-2 bg-text-brand"
        >
          <Ionicons name="flash-outline" size={22} color="#E5F8FF" />
          <Text className="text-center font-ibm-plex-arabic-bold text-2xl text-text-primary">
            ابدأ
          </Text>
        </Pressable>

        {/* Optional: Manage allowlist (kept minimal) */}
        <Pressable
          onPress={() => {
            // TODO: navigate to allowlist management
          }}
          className="w-11/12 mt-3 rounded-2xl border border-border-primary bg-fore py-4 flex-row-reverse items-center justify-center gap-2"
          accessibilityRole="button"
          accessibilityLabel="إدارة التطبيقات المسموح بها"
          accessibilityHint="اختيار التطبيقات التي لن تُقيَّد أثناء وضع التحرّر"
          android_ripple={{ color: "#F3F4F6" }} // Replaced rgba(0,0,0,0.06) with solid light gray
        >
          <Ionicons name="shield-checkmark-outline" size={20} color="#7A7A7A" />
          <Text className="font-ibm-plex-arabic-semibold text-text-primary">
            إدارة التطبيقات المسموح بها
          </Text>
        </Pressable>
      </View>
    </AnimatedSafeAreaView>
  );
};

export default FreeIntro;
