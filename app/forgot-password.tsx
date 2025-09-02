import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "react-native";
import { shadowStyle } from "@/lib/shadow";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeOut, Layout } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth, getErrorMessage } from "@/lib/auth";
import { router } from "expo-router";

const HERO_HEIGHT = 220;

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const { resetPassword } = useAuth();

  const validateEmail = () => {
    if (!email.trim()) {
      Alert.alert("خطأ", "يرجى إدخال البريد الإلكتروني");
      return false;
    }
    if (!email.includes("@")) {
      Alert.alert("خطأ", "يرجى إدخال بريد إلكتروني صحيح");
      return false;
    }
    return true;
  };

  const handleResetPassword = async () => {
    if (!validateEmail()) return;

    setIsLoading(true);
    const { error } = await resetPassword(email);
    setIsLoading(false);

    if (error) {
      Alert.alert("خطأ", getErrorMessage(error));
    } else {
      setIsEmailSent(true);
      Alert.alert(
        "تم الإرسال",
        "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني"
      );
    }
  };

  const handleBackToSignIn = () => {
    router.back();
  };

  return (
    <SafeAreaView className="bg-bg flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <Animated.ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: 24,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* ======= HERO / BG IMAGE ======= */}
          <View className="w-full bg-bg">
            <View
              style={{ height: HERO_HEIGHT }}
              className="w-full overflow-hidden items-center justify-center px-6"
            >
              {/* gradient overlay */}
              <LinearGradient
                colors={["#00070A", "#00AEEF"]}
                start={{ x: 0.5, y: 1.2 }}
                end={{ x: 0.5, y: -1 }}
                className="absolute inset-0 -bottom-6 left-0 "
              />

              {/* Content Container */}
              <Animated.View
                entering={FadeIn.delay(100).duration(800)}
                className="items-center justify-center flex-1 gap-4"
              >
                {/* App Logo */}
                <Animated.View
                  entering={FadeIn.delay(200).duration(800)}
                  className="items-center"
                >
                  <Image
                    source={require("@/assets/images/logo.png")}
                    className="w-20 h-20"
                    resizeMode="contain"
                    style={shadowStyle({
                      color: "#000",
                      offset: { width: 0, height: 4 },
                      opacity: 0.3,
                      radius: 8,
                    })}
                  />
                </Animated.View>

                {/* Headings */}
                <Animated.Text
                  entering={FadeIn.delay(300).duration(800)}
                  className="font-ibm-plex-arabic-bold text-3xl text-text-brand text-center"
                >
                  نسيت كلمة المرور؟
                </Animated.Text>
                <Animated.Text
                  entering={FadeIn.delay(400).duration(800)}
                  className="font-ibm-plex-arabic-light text-text-secondary text-center text-md px-4"
                >
                  أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة
                  المرور
                </Animated.Text>
              </Animated.View>
            </View>
          </View>

          {/* ======= FORM CARD ======= */}
          <Animated.View
            className="px-6 -mt-6 bg-bg pt-5 rounded-3xl"
            layout={Layout.springify().damping(15)}
          >
            <Animated.View layout={Layout.springify().damping(15)}>
              {/* Email Input */}
              <Animated.View
                layout={Layout.springify().damping(15)}
                className="mb-6"
              >
                <Text className="font-ibm-plex-arabic text-text-primary mb-1 text-right text-sm">
                  البريد الإلكتروني
                </Text>
                <View className="relative">
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholderTextColor="#F5F5F5"
                    className="bg-fore border border-border-secondary rounded-lg px-4 py-3 text-text-primary font-ibm-plex-arabic text-right"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    textAlign="right"
                    editable={!isEmailSent}
                  />
                  {email.length === 0 && !isEmailSent && (
                    <Text className="absolute right-4 top-1/2 -translate-y-[50%] text-text-secondary font-ibm-plex-arabic-extralight">
                      أدخل بريدك الإلكتروني
                    </Text>
                  )}
                </View>
              </Animated.View>

              {/* Submit Button */}
              <Animated.View layout={Layout.springify().damping(15)}>
                <TouchableOpacity
                  onPress={handleResetPassword}
                  disabled={isLoading || isEmailSent}
                  className={`bg-text-brand rounded-lg py-3 mb-4 ${
                    isLoading || isEmailSent ? "opacity-50" : ""
                  }`}
                >
                  <Animated.Text
                    entering={FadeIn.duration(150)}
                    exiting={FadeOut.duration(100)}
                    className="font-ibm-plex-arabic-bold text-text-primary text-center"
                  >
                    {isLoading
                      ? "جاري الإرسال..."
                      : isEmailSent
                        ? "تم الإرسال"
                        : "إرسال رابط إعادة التعيين"}
                  </Animated.Text>
                </TouchableOpacity>

                {/* Back to Sign In */}
                <TouchableOpacity
                  onPress={handleBackToSignIn}
                  className="mb-4 self-end"
                >
                  <Text className="font-ibm-plex-arabic-medium text-text-brand text-sm">
                    العودة لتسجيل الدخول
                  </Text>
                </TouchableOpacity>

                {/* Islamic Quote */}
                <Animated.View layout={Layout.springify().damping(15)}>
                  <View className="bg-text-primary border-r-4 border-text-brand rounded-xl p-3 mb-4">
                    <Text className="font-ibm-plex-arabic text-bg text-center text-sm leading-5">
                      "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ"
                    </Text>
                    <Text className="font-ibm-plex-arabic-light text-bg text-center text-xs mt-1">
                      سورة البقرة - آية ١٥٣
                    </Text>
                  </View>
                </Animated.View>
              </Animated.View>
            </Animated.View>
          </Animated.View>
        </Animated.ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;
