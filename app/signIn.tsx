import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image, ScrollView } from "react-native";

const LogIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    // Simulate login process
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  return (
    <SafeAreaView className="bg-bg flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView keyboardShouldPersistTaps="handled">
          <View className="flex-1 px-6 justify-center">
            {/* Header Section */}
            <View className="items-center my-8">
              <View className="w-20 h-20  rounded-full mb-4 items-center justify-center">
                <Image
                  source={require("@/assets/images/logo.png")}
                  className=" relative w-full h-full rounded-full  border-white justify-end items-center"
                  resizeMode="cover"
                />
              </View>
              <Text className="font-ibm-plex-arabic-bold text-2xl text-text-brand text-center mb-1">
                أهلاً بعودتك
              </Text>
              <Text className="font-ibm-plex-arabic text-text-secondary text-center text-sm">
                واصل رحلتك في طلب العلم
              </Text>
            </View>

            {/* Form Section */}
            <View>
              {/* Email Input */}
              <View className="mb-3">
                <Text className="font-ibm-plex-arabic-medium text-text-primary mb-1 text-right text-sm">
                  البريد الإلكتروني
                </Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="أدخل بريدك الإلكتروني"
                  placeholderTextColor="#E2E8F0"
                  className="bg-fore border border-border-primary rounded-lg px-4 py-3 text-text-primary font-ibm-plex-arabic-light text-right"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  textAlign="right"
                />
              </View>

              {/* Password Input */}
              <View className="mb-4">
                <Text className="font-ibm-plex-arabic-medium text-text-primary mb-1 text-right text-sm">
                  كلمة المرور
                </Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="أدخل كلمة المرور"
                  placeholderTextColor="#E2E8F0"
                  className="bg-fore border border-border-primary rounded-lg px-4 py-3 text-text-primary font-ibm-plex-arabic-light text-right"
                  secureTextEntry
                  textAlign="right"
                />
              </View>

              {/* Forgot Password */}
              <TouchableOpacity className="mb-4">
                <Text className="font-ibm-plex-arabic text-text-brand text-right text-sm">
                  نسيت كلمة المرور؟
                </Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={isLoading}
                className={`bg-text-brand rounded-lg py-3 mb-4 ${isLoading ? "opacity-70" : ""}`}
              >
                <Text className="font-ibm-plex-arabic-semibold text-bg text-center">
                  {isLoading ? "جاري الدخول..." : "دخول"}
                </Text>
              </TouchableOpacity>

              {/* Islamic Quote */}
              <View className="bg-fore border-r-4 border-text-brand rounded-lg p-3 mb-4">
                <Text className="font-ibm-plex-arabic text-text-secondary text-center text-sm leading-5">
                  "وَقُل رَّبِّ زِدْنِي عِلْمًا"
                </Text>
                <Text className="font-ibm-plex-arabic-light text-text-disabled text-center text-xs mt-1">
                  سورة طه - آية ١١٤
                </Text>
              </View>

              {/* Divider */}
              <View className="flex-row items-center my-4">
                <View className="flex-1 h-px bg-border-secondary" />
                <Text className="font-ibm-plex-arabic text-text-disabled px-3 text-sm">
                  أو
                </Text>
                <View className="flex-1 h-px bg-border-secondary" />
              </View>

              {/* Quick Access */}
              <TouchableOpacity className="bg-fore border border-border-secondary rounded-lg py-2.5 mb-2  gap-5 flex-row-reverse items-center justify-center">
                <Text className="font-ibm-plex-arabic text-text-primary text-sm ">
                  تسجيل الدخول باستخدام
                </Text>
                <Image
                  source={require("@/assets/icons/google.png")}
                  className="w-7 h-7 ml-2"
                  resizeMode="contain"
                />
              </TouchableOpacity>

              {/* Footer */}
              <View className="flex-row justify-center mt-4">
                <TouchableOpacity>
                  <Text className="font-ibm-plex-arabic-medium text-text-brand text-sm">
                    إنشاء حساب جديد
                  </Text>
                </TouchableOpacity>
                <Text className="font-ibm-plex-arabic text-text-secondary mx-2 text-sm">
                  ليس لديك حساب؟
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LogIn;
