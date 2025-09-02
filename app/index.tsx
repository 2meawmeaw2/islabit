import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Pressable, Text, TouchableOpacity, View, Alert } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/lib/auth";

const WelcomeMinimalUI: React.FC = ({}) => {
  const router = useRouter();
  const { user, signOut, loading } = useAuth();

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
  const press = (path: string) => {
    router.navigate(`./${path}`);
  };
  const save = async () => {
    try {
      await AsyncStorage.setItem("habit1", "this is habit one ");
      console.log("saved ig ");
    } catch (err) {
      alert(err);
    }
  };

  const load = async () => {
    try {
      let name = await AsyncStorage.getItem("habit1");
      console.log("here's your habit ", name);
    } catch (err) {
      alert(err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      Alert.alert("تم تسجيل الخروج", "تم تسجيل الخروج بنجاح");
    } catch (error) {
      Alert.alert("خطأ", "حدث خطأ أثناء تسجيل الخروج");
    }
  };
  return (
    <SafeAreaView className="bg-bg flex-1 ">
      {/* Debug Info - User Status */}
      <View className="absolute top-4 left-4 right-4 z-10">
        <View className="bg-fore border border-border-secondary rounded-lg p-3">
          <Text className="font-ibm-plex-arabic text-text-primary text-sm text-center">
            {loading
              ? "جاري التحميل..."
              : user
                ? `مرحباً ${user.email}`
                : "غير مسجل الدخول"}
          </Text>
        </View>
      </View>

      <View className="  flex-1 items-center justify-center px-8">
        <Animated.View style={s} className="items-center">
          <View
            className=" w-16 h-16 rounded-2xl items-center justify-center mb-5"
            style={{
              backgroundColor: "#E0F2FE", // Replaced rgba(0,174,239,0.12) with solid light blue
              borderWidth: 1,
              borderColor: "#00AEEF",
            }}
          >
            <Ionicons name="sparkles-outline" size={22} color="#00AEEF" />
          </View>

          <Pressable
            onPress={save}
            className="w-full font-ibm-plex-arabic-bold text-text-brand text-[24px] text-center"
          >
            <Text className="w-full font-ibm-plex-arabic-bold text-text-brand text-[24px] text-center">
              {" "}
              تنظيم اليوم
            </Text>
          </Pressable>
          <Pressable
            onPress={load}
            className="font-ibm-plex-arabic text-text-secondary text-[13px] text-center mt-2 leading-5"
          >
            <Text className="font-ibm-plex-arabic text-text-secondary text-[13px] text-center mt-2 leading-5">
              {" "}
              رتّب مهامك ببساطة حول مواقيت الصلاة.
            </Text>
          </Pressable>

          {/* Primary CTA */}
          <TouchableOpacity
            className="bg-text-brand rounded-2xl py-3 px-6 mt-6"
            activeOpacity={0.9}
            accessibilityRole="button"
            accessibilityLabel="ابدأ الآن"
          >
            <Text
              onPress={() => press("testing")}
              className="font-ibm-plex-arabic-bold text-center w-full text-bg text-base"
            >
              ابدأ الآن
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-text-brand rounded-2xl py-3 px-6 mt-6"
            activeOpacity={0.9}
            accessibilityRole="button"
            accessibilityLabel="ابدأ الآن"
          >
            <Text
              onPress={() => press("time")}
              className="font-ibm-plex-arabic-bold text-center w-full text-bg text-base"
            >
              temo for u nigga
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-text-brand rounded-2xl py-3 px-6 mt-6"
            activeOpacity={0.9}
            accessibilityRole="button"
            accessibilityLabel="ابدأ الآن"
          >
            <Text
              onPress={() => press("sign")}
              className="font-ibm-plex-arabic-bold text-center w-full text-bg text-base"
            >
              login here sign up above the one above me
            </Text>
          </TouchableOpacity>

          {/* Logout Button - Only show if user is logged in */}
          {user && (
            <TouchableOpacity
              onPress={handleLogout}
              className="bg-red-600 rounded-2xl py-3 px-6 mt-4"
              activeOpacity={0.9}
              accessibilityRole="button"
              accessibilityLabel="تسجيل الخروج"
            >
              <Text className="font-ibm-plex-arabic-bold text-center w-full text-white text-base">
                تسجيل الخروج
              </Text>
            </TouchableOpacity>
          )}

          {/* Secondary link */}
          <TouchableOpacity
            onPress={() => press("moreInfo")}
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
    </SafeAreaView>
  );
};

export default WelcomeMinimalUI;
