import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  Easing,
  withTiming,
  Layout,
} from "react-native-reanimated";

type Mode = "signIn" | "signUp";
import { LinearGradient } from "expo-linear-gradient";

const HERO_HEIGHT = 220;
// Replace with your own image (local or remote)

// Or: const heroImage = require("@/assets/images/auth-hero.png");

const AuthScreen = () => {
  const [mode, setMode] = useState<Mode>("signUp");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(true);
  const [showCPassword, setShowCPassword] = useState(true);

  const checkPasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
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
        return "#F87171";
      case 2:
      case 3:
        return "#FACC15";
      case 4:
      case 5:
        return "#4ADE80";
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

  const validateSignIn = () => {
    if (!email.trim()) {
      Alert.alert("خطأ", "يرجى إدخال البريد الإلكتروني");
      return false;
    }
    if (!email.includes("@")) {
      Alert.alert("خطأ", "يرجى إدخال بريد إلكتروني صحيح");
      return false;
    }
    if (!password) {
      Alert.alert("خطأ", "يرجى إدخال كلمة المرور");
      return false;
    }
    return true;
  };
  const validateSignUp = () => {
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

  const handleSubmit = async () => {
    const ok = mode === "signIn" ? validateSignIn() : validateSignUp();
    if (!ok) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (mode === "signIn") {
        Alert.alert("مرحباً", "تم تسجيل الدخول بنجاح");
      } else {
        Alert.alert("نجح", "قم بتأكيد انشاء الحساب في البريد الالكتروني");
      }
    }, 2000);
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    if (next === "signIn") {
      setAcceptTerms(false);
      setConfirmPassword("");
    }
  };

  const isSignIn = mode === "signIn";

  // ANIMATIONS
  const progress = useSharedValue(isSignIn ? 0 : 1);
  const segmentW = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(isSignIn ? 0 : 1, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
  }, [isSignIn]);
  const pillStyle = useAnimatedStyle(() => ({
    width: segmentW.value,
    transform: [{ translateX: progress.value * segmentW.value }],
  }));

  const label = isLoading
    ? isSignIn
      ? "جاري تسجيل الدخول..."
      : "جاري إنشاء الحساب..."
    : isSignIn
      ? "تسجيل الدخول"
      : "إنشاء حساب";
  const labelKey = `${isLoading ? "loading" : "idle"}-${isSignIn ? "signin" : "signup"}`;

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
            paddingBottom: 24, // no vertical centering; let hero sit at the top
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
                colors={["#00070A", "#00AEEF"]} // bottom → top
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
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                    }}
                  />
                </Animated.View>

                {/* Headings */}
                {isSignIn ? (
                  <Animated.Text
                    key={"hi"}
                    entering={FadeIn}
                    exiting={FadeOut}
                    className="font-ibm-plex-arabic-bold text-3xl text-text-brand text-center "
                  >
                    مرحبًا بعودتك
                  </Animated.Text>
                ) : (
                  <Animated.Text
                    key={"join"}
                    entering={FadeIn}
                    exiting={FadeOut}
                    className="font-ibm-plex-arabic-bold text-3xl text-text-brand text-center "
                  >
                    انظم إلينا
                  </Animated.Text>
                )}
                {isSignIn ? (
                  <Animated.Text
                    key={"hi again"}
                    entering={FadeIn}
                    exiting={FadeOut}
                    className="font-ibm-plex-arabic-light text-text-secondary text-center text-md "
                  >
                    سُررنا رجوعك، تابع رحلتك
                  </Animated.Text>
                ) : (
                  <Animated.Text
                    key={"start"}
                    entering={FadeIn}
                    exiting={FadeOut}
                    className="font-ibm-plex-arabic-light text-text-secondary text-center text-md "
                  >
                    ابدأ رحلتك في طلب العلم اليوم
                  </Animated.Text>
                )}
              </Animated.View>
            </View>
          </View>

          {/* ======= FORM CARD ======= */}
          <Animated.View
            className="px-6 -mt-6 bg-bg pt-5 rounded-3xl " // small overlap onto the hero
            layout={Layout.springify().damping(15)}
          >
            {/* Tabs */}
            <View
              className="flex-row-reverse bg-fore border border-border-secondary rounded-xl p-1 mb-4 relative"
              onLayout={(e) => {
                const w = e.nativeEvent.layout.width;
                segmentW.value = Math.max(0, (w - 8) / 2);
              }}
            >
              <Animated.View
                pointerEvents="none"
                className="absolute top-1 bottom-1 left-1 rounded-lg bg-text-brand"
                style={pillStyle}
              />
              <TouchableOpacity
                onPress={() => switchMode("signUp")}
                className="flex-1 py-2 rounded-lg items-center justify-center z-10"
              >
                <Text
                  className={`font-ibm-plex-arabic-medium text-sm ${
                    !isSignIn ? "text-text-primary" : "text-text-disabled"
                  }`}
                >
                  إنشاء حساب
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => switchMode("signIn")}
                className="flex-1 py-2 rounded-lg items-center justify-center z-10"
              >
                <Text
                  className={`font-ibm-plex-arabic-medium text-sm ${
                    !isSignIn ? "text-text-disabled" : "text-text-primary"
                  }`}
                >
                  تسجيل الدخول
                </Text>
              </TouchableOpacity>
            </View>

            {/* ===== existing form stays the same from here down ===== */}
            <Animated.View layout={Layout.springify().damping(15)}>
              <Animated.View layout={Layout.springify().damping(15)}>
                {!isSignIn && (
                  <Animated.View
                    entering={FadeIn}
                    exiting={FadeOut}
                    layout={Layout.springify().damping(15)}
                    className="mb-3"
                  >
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
                  </Animated.View>
                )}

                {/* Email */}
                <Animated.View
                  layout={Layout.springify().damping(15)}
                  className="mb-3"
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
                    />
                    {email.length === 0 && (
                      <Text className="absolute right-4 top-1/2 -translate-y-[50%] text-text-secondary font-ibm-plex-arabic-extralight">
                        أدخل بريدك الإلكتروني
                      </Text>
                    )}
                  </View>
                </Animated.View>

                {/* Password */}
                <Animated.View
                  layout={Layout.springify().damping(15)}
                  className="mb-2"
                >
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
                      onChangeText={
                        isSignIn ? setPassword : handlePasswordChange
                      }
                      placeholder="أدخل كلمة المرور"
                      placeholderTextColor="#E2E8F0"
                      className="flex-1 px-4 py-3 text-text-primary font-ibm-plex-arabic-light text-right"
                      secureTextEntry={!showPassword}
                      textAlign="right"
                    />
                  </View>

                  {!isSignIn && password.length > 0 && (
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
                </Animated.View>

                {/* Confirm Password (sign up only) */}
                {!isSignIn && (
                  <Animated.View
                    entering={FadeIn}
                    exiting={FadeOut}
                    layout={Layout.springify().damping(15)}
                    className="mb-3"
                  >
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
                  </Animated.View>
                )}

                <Animated.View layout={Layout.springify().damping(15)}>
                  <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={isLoading || (!isSignIn && !acceptTerms)}
                    className={`bg-text-brand rounded-lg py-3 mb-4 ${
                      isLoading || (!isSignIn && !acceptTerms)
                        ? "opacity-50"
                        : ""
                    }`}
                  >
                    <Animated.Text
                      key={labelKey}
                      entering={FadeIn.duration(150)}
                      exiting={FadeOut.duration(100)}
                      className="font-ibm-plex-arabic-bold text-text-primary text-center"
                    >
                      {label}
                    </Animated.Text>
                  </TouchableOpacity>

                  {isSignIn && (
                    <Animated.View
                      entering={FadeIn.duration(100)}
                      exiting={FadeOut.duration(100)}
                    >
                      <TouchableOpacity className="mb-4 self-end">
                        <Text className="font-ibm-plex-arabic-medium text-text-brand text-sm">
                          نسيت كلمة المرور؟
                        </Text>
                      </TouchableOpacity>
                    </Animated.View>
                  )}
                  <Animated.View layout={Layout.springify().damping(15)}>
                    <View className="bg-text-primary border-r-4 border-text-brand rounded-xl p-3 mb-4">
                      <Text className="font-ibm-plex-arabic text-bg text-center text-sm leading-5">
                        "إِنَّمَا يَخْشَى اللَّهَ مِنْ عِبَادِهِ الْعُلَمَاءُ"
                      </Text>
                      <Text className="font-ibm-plex-arabic-light text-bg text-center text-xs mt-1">
                        سورة فاطر - آية ٢٨
                      </Text>
                    </View>
                  </Animated.View>
                  <Animated.View layout={Layout.springify().damping(15)}>
                    <View className="flex-row items-center my-4">
                      <View className="flex-1 h-px bg-border-primary" />
                      <Text className="font-ibm-plex-arabic text-text-disabled px-3 text-sm">
                        أو
                      </Text>
                      <View className="flex-1 h-px bg-border-primary" />
                    </View>
                    <TouchableOpacity className="bg-fore border-[1px] border-border-active rounded-lg py-2.5 mb-4 gap-3 flex-row-reverse items-center justify-center">
                      {isSignIn ? (
                        <Animated.Text
                          entering={FadeIn}
                          exiting={FadeOut}
                          className="font-ibm-plex-arabic text-text-primary text-sm"
                        >
                          إنشاء حساب باستخدام
                        </Animated.Text>
                      ) : (
                        <Animated.Text
                          entering={FadeIn}
                          exiting={FadeOut}
                          className="font-ibm-plex-arabic text-text-primary text-sm"
                        >
                          تسجيل الدخول باستخدام
                        </Animated.Text>
                      )}
                      <Image
                        source={require("@/assets/icons/google.png")}
                        className="w-6 h-6"
                        resizeMode="contain"
                      />
                    </TouchableOpacity>

                    <View className="flex-row justify-center mb-3 my-2">
                      <TouchableOpacity
                        onPress={() =>
                          switchMode(isSignIn ? "signUp" : "signIn")
                        }
                      >
                        <Text className="font-ibm-plex-arabic-medium text-text-brand text-sm">
                          {isSignIn ? "إنشاء حساب" : "تسجيل الدخول"}
                        </Text>
                      </TouchableOpacity>
                      <Text className="font-ibm-plex-arabic text-text-secondary mx-2 text-sm">
                        {isSignIn ? "ليس لديك حساب؟" : "لديك حساب بالفعل؟"}
                      </Text>
                    </View>
                  </Animated.View>
                </Animated.View>
              </Animated.View>
            </Animated.View>
            {isSignIn ? <View className="w-full h-[120px]" /> : null}
          </Animated.View>
        </Animated.ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AuthScreen;
