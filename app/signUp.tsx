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
import { Image, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const SignUp = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(true);
  const [showCPassword, setShowCPassword] = useState(true);

  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setPasswordStrength(checkPasswordStrength(text));
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return "#F87171"; // error
      case 2:
      case 3:
        return "#FACC15"; // warning
      case 4:
      case 5:
        return "#4ADE80"; // success
      default:
        return "#F5F5F5";
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return "ضعيفة";
      case 2:
      case 3:
        return "متوسطة";
      case 4:
      case 5:
        return "قوية";
      default:
        return "";
    }
  };

  const validateForm = () => {
    if (!fullName.trim()) {
      Alert.alert("خطأ", "يرجى إدخال الاسم الكامل");
      return false;
    }
    if (!email.trim()) {
      Alert.alert("خطأ", "يرجى إدخال البريد الإلكتروني");
      return false;
    }
    if (!email.includes("@")) {
      Alert.alert("خطأ", "يرجى إدخال بريد إلكتروني صحيح");
      return false;
    }
    if (password.length < 8) {
      Alert.alert("خطأ", "كلمة المرور يجب أن تكون 8 أحرف على الأقل");
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert("خطأ", "كلمات المرور غير متطابقة");
      return false;
    }
    if (!acceptTerms) {
      Alert.alert("خطأ", "يرجى الموافقة على الشروط والأحكام");
      return false;
    }
    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    // Simulate signup process
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert("نجح", "قم بتأكيد انشاء الحساب في البريد الالكتروني");
    }, 2000);
  };

  return (
    <SafeAreaView className="bg-bg flex-1 ">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 justify-center">
            {/* Header Section */}
            <View className="items-center my-6">
              <View className="w-20 h-20 rounded-full mb-4 items-center justify-center">
                <Image
                  source={require("@/assets/images/logo.png")}
                  className="relative w-full h-full rounded-full border-white justify-end items-center"
                  resizeMode="cover"
                />
              </View>
              <Text className="font-ibm-plex-arabic-bold text-2xl text-text-brand text-center mb-1">
                انضم إلينا
              </Text>
              <Text className="font-ibm-plex-arabic text-text-secondary text-center text-sm">
                ابدأ رحلتك في طلب العلم اليوم
              </Text>
            </View>

            {/* Form Section */}
            <View>
              {/* Full Name Input */}
              <View className="mb-3">
                <Text className="font-ibm-plex-arabic text-text-primary mb-1 text-right text-sm">
                  الاسم الكامل
                </Text>
                <View className="relative">
                  <TextInput
                    value={fullName}
                    onChangeText={setFullName}
                    className="bg-fore border border-border-secondary rounded-lg px-4 py-3 text-text-primary font-ibm-plex-arabic text-right"
                    autoCapitalize="words"
                    textAlign="right"
                  />
                  {fullName.length === 0 && (
                    <Text className="absolute right-4 top-1/2 -translate-y-[50%] text-text-secondary font-ibm-plex-arabic-extralight">
                      أدخل اسمك الكامل
                    </Text>
                  )}
                </View>
              </View>

              {/* Email Input */}
              <View className="mb-3">
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
                  />
                  {email.length === 0 && (
                    <Text className="absolute right-4 top-1/2 -translate-y-[50%] text-text-secondary font-ibm-plex-arabic-extralight">
                      أدخل بريدك الإلكتروني
                    </Text>
                  )}
                </View>
              </View>

              {/* Password Input */}
              <View className="mb-2">
                <Text className="font-ibm-plex-arabic-medium text-text-primary mb-1 text-right text-sm">
                  كلمة المرور
                </Text>
                <View className="flex-row items-center bg-fore border border-border-secondary rounded-lg">
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    className="px-3 "
                  >
                    <Ionicons
                      name={showPassword ? "eye-off" : "eye"}
                      size={20}
                      color="#00AEEF"
                    />
                  </TouchableOpacity>
                  <TextInput
                    value={password}
                    onChangeText={handlePasswordChange}
                    placeholder="أدخل كلمة المرور"
                    placeholderTextColor="#E2E8F0"
                    className="flex-1  px-4 py-3 text-text-primary font-ibm-plex-arabic-light text-right"
                    secureTextEntry={!showPassword}
                    textAlign="right"
                  />
                </View>

                {password.length > 0 && (
                  <View className="flex-row justify-end items-center mt-1">
                    <Text
                      className="font-ibm-plex-arabic-light text-xs ml-2"
                      style={{ color: getPasswordStrengthColor() }}
                    >
                      {getPasswordStrengthText()}
                    </Text>
                    <View className="flex-row">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <View
                          key={level}
                          className="w-4 h-1 rounded mx-0.5"
                          style={{
                            backgroundColor:
                              passwordStrength >= level
                                ? getPasswordStrengthColor()
                                : "#4B9AB5",
                          }}
                        />
                      ))}
                    </View>
                  </View>
                )}
              </View>

              {/* Confirm Password Input */}

              <View className="mb-3">
                <Text className="font-ibm-plex-arabic text-text-primary mb-1 text-right text-sm">
                  تأكيد كلمة المرور
                </Text>
                <View className="relative">
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="أعد إدخال كلمة المرور"
                    placeholderTextColor="#F5F5F5"
                    className={`bg-fore border rounded-lg px-4 py-3 text-text-primary font-ibm-plex-arabic-extralight text-right ${
                      confirmPassword && password !== confirmPassword
                        ? "border-feedback-error"
                        : "border-border-secondary"
                    }`}
                    secureTextEntry={!showCPassword}
                    textAlign="right"
                  />
                  <TouchableOpacity
                    onPress={() => setShowCPassword((prev) => !prev)}
                    className="absolute left-3 top-1/2 -translate-y-[50%]"
                  >
                    <Ionicons
                      name={showCPassword ? "eye-off" : "eye"}
                      size={20}
                      color="#00AEEF"
                    />
                  </TouchableOpacity>
                </View>
                {confirmPassword && password !== confirmPassword && (
                  <Text className="font-ibm-plex-arabic-light text-feedback-error text-xs mt-1 text-right">
                    كلمات المرور غير متطابقة
                  </Text>
                )}
              </View>

              {/* Terms and Conditions */}
              <TouchableOpacity
                onPress={() => setAcceptTerms(!acceptTerms)}
                className="flex-row-reverse items-center mb-4"
              >
                <View
                  className={`w-5 h-5 rounded border-2 ml-3 items-center justify-center ${
                    acceptTerms
                      ? "bg-text-brand border-text-brand"
                      : "border-border-secondary"
                  }`}
                >
                  {acceptTerms && (
                    <Text className="text-bg font-bold text-xs">✓</Text>
                  )}
                </View>
                <View className="flex-row-reverse flex-wrap flex-1">
                  <Text className="font-ibm-plex-arabic text-text-secondary text-sm">
                    أوافق على
                  </Text>
                  <TouchableOpacity>
                    <Text className="font-ibm-plex-arabic-medium mx-1 text-text-brand text-sm">
                      الشروط والأحكام
                    </Text>
                  </TouchableOpacity>
                  <Text className="font-ibm-plex-arabic text-text-secondary text-sm">
                    و
                  </Text>
                  <TouchableOpacity>
                    <Text className="font-ibm-plex-arabic-medium mx-1 text-text-brand text-sm">
                      سياسة الخصوصية
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>

              {/* Sign Up Button */}
              <TouchableOpacity
                onPress={handleSignUp}
                disabled={isLoading || !acceptTerms}
                className={`bg-text-brand rounded-lg py-3 mb-4 ${
                  isLoading || !acceptTerms ? "opacity-50" : ""
                }`}
              >
                <Text className="font-ibm-plex-arabic-bold text-text-primary text-center">
                  {isLoading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
                </Text>
              </TouchableOpacity>

              {/* Islamic Quote */}
              <View className="bg-text-primary border-r-4 border-text-brand rounded-xl p-3 mb-4">
                <Text className="font-ibm-plex-arabic text-bg text-center text-sm leading-5">
                  "إِنَّمَا يَخْشَى اللَّهَ مِنْ عِبَادِهِ الْعُلَمَاءُ"
                </Text>
                <Text className="font-ibm-plex-arabic-light text-bg text-center text-xs mt-1">
                  سورة فاطر - آية ٢٨
                </Text>
              </View>

              {/* Divider */}
              <View className="flex-row items-center my-4">
                <View className="flex-1 h-px bg-border-primary" />
                <Text className="font-ibm-plex-arabic text-text-disabled px-3 text-sm">
                  أو
                </Text>
                <View className="flex-1 h-px bg-border-primary" />
              </View>

              {/* Google Sign Up */}
              <TouchableOpacity className="bg-fore border-[1px] border-border-active rounded-lg py-2.5 mb-4 gap-3 flex-row-reverse items-center justify-center">
                <Text className="font-ibm-plex-arabic text-text-primary text-sm">
                  إنشاء حساب باستخدام
                </Text>
                <Image
                  source={require("@/assets/icons/google.png")}
                  className="w-6 h-6"
                  resizeMode="contain"
                />
              </TouchableOpacity>

              {/* Footer - Login Link */}
              <View className="flex-row justify-center mb-3 my-2">
                <TouchableOpacity>
                  <Text className="font-ibm-plex-arabic-medium text-text-brand text-sm">
                    تسجيل الدخول
                  </Text>
                </TouchableOpacity>
                <Text className="font-ibm-plex-arabic  text-text-secondary mx-2 text-sm">
                  لديك حساب بالفعل؟
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignUp;
