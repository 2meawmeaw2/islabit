import { View, Text, TouchableOpacity, Alert } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "react-native";
import Animated, { FadeIn, FadeOut, Layout } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth, getErrorMessage } from "@/lib/auth";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/utils/supabase";

const HERO_HEIGHT = 220;

const EmailConfirmationScreen = () => {
  const [isResending, setIsResending] = useState(false);
  const { user, checkEmailConfirmation } = useAuth();

  const handleResendEmail = async () => {
    if (!user?.email) {
      Alert.alert("خطأ", "لم يتم العثور على البريد الإلكتروني");
      return;
    }

    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: user.email,
      });

      if (error) {
        Alert.alert("خطأ", getErrorMessage(error));
      } else {
        Alert.alert(
          "تم الإرسال",
          "تم إرسال رابط التأكيد مرة أخرى إلى بريدك الإلكتروني"
        );
      }
    } catch (error) {
      Alert.alert("خطأ", "حدث خطأ في إرسال رابط التأكيد");
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToSignIn = () => {
    router.replace("/sign");
  };

  const handleCheckEmail = () => {
    Alert.alert(
      "تحقق من بريدك الإلكتروني",
      "يرجى فتح بريدك الإلكتروني والضغط على رابط التأكيد"
    );
  };

  return (
    <SafeAreaView className="bg-bg flex-1">
      <Animated.ScrollView
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
              {/* Email Icon */}
              <Animated.View
                entering={FadeIn.delay(200).duration(800)}
                className="items-center"
              >
                <View className="w-20 h-20 bg-text-brand rounded-full items-center justify-center">
                  <Ionicons name="mail" size={40} color="#00070A" />
                </View>
              </Animated.View>

              {/* Headings */}
              <Animated.Text
                entering={FadeIn.delay(300).duration(800)}
                className="font-ibm-plex-arabic-bold text-3xl text-text-brand text-center"
              >
                تحقق من بريدك الإلكتروني
              </Animated.Text>
              <Animated.Text
                entering={FadeIn.delay(400).duration(800)}
                className="font-ibm-plex-arabic-light text-text-secondary text-center text-md px-4"
              >
                لقد أرسلنا رابط تأكيد إلى بريدك الإلكتروني. يرجى فتح البريد
                والضغط على الرابط لتأكيد حسابك
              </Animated.Text>
              <Animated.Text
                entering={FadeIn.delay(500).duration(800)}
                className="font-ibm-plex-arabic-light text-text-secondary text-center text-xs px-4 mt-2"
              >
                ملاحظة: إذا كنت تستخدم Expo Go، قد تحتاج إلى تعطيل تأكيد البريد
                مؤقتاً في إعدادات Supabase
              </Animated.Text>
            </Animated.View>
          </View>
        </View>

        {/* ======= CONTENT CARD ======= */}
        <Animated.View
          className="px-6 -mt-6 bg-bg pt-5 rounded-3xl"
          layout={Layout.springify().damping(15)}
        >
          <Animated.View layout={Layout.springify().damping(15)}>
            {/* Check Email Button */}
            <Animated.View layout={Layout.springify().damping(15)}>
              <TouchableOpacity
                onPress={handleCheckEmail}
                className="bg-text-brand rounded-lg py-3 mb-4"
              >
                <Text className="font-ibm-plex-arabic-bold text-text-primary text-center">
                  فتح البريد الإلكتروني
                </Text>
              </TouchableOpacity>

              {/* Check Email Status Button */}
              <TouchableOpacity
                onPress={async () => {
                  try {
                    const { confirmed, error } = await checkEmailConfirmation();
                    if (error) {
                      Alert.alert("خطأ", getErrorMessage(error));
                      return;
                    }

                    if (confirmed) {
                      Alert.alert(
                        "تم التأكيد",
                        "تم تأكيد بريدك الإلكتروني بنجاح! يمكنك الآن تسجيل الدخول.",
                        [
                          {
                            text: "تسجيل الدخول",
                            onPress: () => router.replace("/sign"),
                          },
                        ]
                      );
                    } else {
                      Alert.alert(
                        "لم يتم التأكيد بعد",
                        "لم يتم تأكيد بريدك الإلكتروني بعد. يرجى التحقق من بريدك والضغط على رابط التأكيد."
                      );
                    }
                  } catch (error) {
                    Alert.alert(
                      "خطأ",
                      "حدث خطأ في التحقق من حالة البريد الإلكتروني"
                    );
                  }
                }}
                className="bg-fore border border-border-secondary rounded-lg py-3 mb-4"
              >
                <Text className="font-ibm-plex-arabic-medium text-text-primary text-center">
                  التحقق من حالة التأكيد
                </Text>
              </TouchableOpacity>

              {/* Resend Email Button */}
              <TouchableOpacity
                onPress={handleResendEmail}
                disabled={isResending}
                className={`bg-fore border border-border-secondary rounded-lg py-3 mb-4 ${
                  isResending ? "opacity-50" : ""
                }`}
              >
                <Text className="font-ibm-plex-arabic-medium text-text-primary text-center">
                  {isResending ? "جاري الإرسال..." : "إعادة إرسال رابط التأكيد"}
                </Text>
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
                    "إِنَّ اللَّهَ لَا يُضِيعُ أَجْرَ الْمُحْسِنِينَ"
                  </Text>
                  <Text className="font-ibm-plex-arabic-light text-bg text-center text-xs mt-1">
                    سورة التوبة - آية ١٢٠
                  </Text>
                </View>
              </Animated.View>
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

export default EmailConfirmationScreen;
