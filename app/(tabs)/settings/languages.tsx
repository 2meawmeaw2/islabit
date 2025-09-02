import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  I18nManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";

// Language options with Islamic context
const languages = [
  {
    id: "ar",
    name: "العربية",
    nativeName: "العربية",
    description: "اللغة العربية - لغة القرآن الكريم",
    flag: "🇸🇦",
    isSelected: true, // Arabic is default
  },
  {
    id: "en",
    name: "English",
    nativeName: "English",
    description: "English - International language",
    flag: "🇺🇸",
    isSelected: false,
  },
  {
    id: "ur",
    name: "اردو",
    nativeName: "اردو",
    description: "اردو - زبان اردو",
    flag: "🇵🇰",
    isSelected: false,
  },
  {
    id: "tr",
    name: "Türkçe",
    nativeName: "Türkçe",
    description: "Türkçe - Türk dili",
    flag: "🇹🇷",
    isSelected: false,
  },
  {
    id: "ms",
    name: "Bahasa Melayu",
    nativeName: "Bahasa Melayu",
    description: "Bahasa Melayu - Bahasa rasmi Malaysia",
    flag: "🇲🇾",
    isSelected: false,
  },
];

export default function LanguagesScreen() {
  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(30);
  const listOpacity = useSharedValue(0);
  const listTranslateY = useSharedValue(50);

  // Header animation
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  // List animation
  const listAnimatedStyle = useAnimatedStyle(() => ({
    opacity: listOpacity.value,
    transform: [{ translateY: listTranslateY.value }],
  }));

  // Start animations on mount
  useEffect(() => {
    // Header animation
    headerOpacity.value = withTiming(1, { duration: 600 });
    headerTranslateY.value = withSpring(0, {
      damping: 15,
      stiffness: 100,
    });

    // List animation with delay
    listOpacity.value = withDelay(200, withTiming(1, { duration: 800 }));
    listTranslateY.value = withDelay(
      200,
      withSpring(0, { damping: 15, stiffness: 100 })
    );
  }, []);

  const handleLanguageSelect = (languageId: string) => {
    // Here you would typically update the app's language setting
    console.log(`Selected language: ${languageId}`);

    // For now, just show a visual feedback
    // In a real app, you'd update the language context/state
  };

  const handleBackPress = () => {
    // Animate out before navigating back
    headerOpacity.value = withTiming(0, { duration: 300 });
    headerTranslateY.value = withTiming(30, { duration: 300 });
    listOpacity.value = withTiming(0, { duration: 300 });
    listTranslateY.value = withTiming(50, { duration: 300 });

    // Navigate back after animation
    setTimeout(() => {
      router.back();
    }, 300);
  };

  const renderLanguageItem = (language: any, index: number) => {
    const itemOpacity = useSharedValue(0);
    const itemScale = useSharedValue(0.8);

    useEffect(() => {
      // Stagger the items appearance
      itemOpacity.value = withDelay(
        300 + index * 100,
        withTiming(1, { duration: 500 })
      );
      itemScale.value = withDelay(
        300 + index * 100,
        withSpring(1, { damping: 15, stiffness: 100 })
      );
    }, []);

    const itemAnimatedStyle = useAnimatedStyle(() => ({
      opacity: itemOpacity.value,
      transform: [{ scale: itemScale.value }],
    }));

    return (
      <Animated.View key={language.id} style={itemAnimatedStyle}>
        <TouchableOpacity
          className="flex-row items-center justify-between py-4 px-4 mb-3 bg-fore rounded-2xl"
          activeOpacity={0.7}
          onPress={() => handleLanguageSelect(language.id)}
        >
          <View className="flex-row-reverse items-center flex-1">
            <View className="flex-1">
              <Text className="text-white text-lg font-ibm-plex-arabic-bold mb-1 text-right">
                {language.name}
              </Text>
              <Text className="text-text-brand/70 text-sm font-ibm-plex-arabic-medium text-right">
                {language.description}
              </Text>
            </View>
            <Text className="text-3xl ml-3">{language.flag}</Text>
          </View>

          <View className="flex-row items-center">
            {language.isSelected && (
              <View className="w-6 h-6 rounded-full bg-[#00AEEF] items-center justify-center mr-3">
                <Ionicons name="checkmark" size={16} color="white" />
              </View>
            )}
            <Ionicons name="chevron-forward" size={20} color="#4C6770" />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      {/* Animated Header */}
      <Animated.View
        style={headerAnimatedStyle}
        className="bg-[#282E2F] rounded-b-3xl pb-6 pt-4"
      >
        <View className="flex-row items-center justify-between px-4">
          <View className="w-10" /> {/* Spacer for centering */}
          <Text className="text-white text-2xl font-ibm-plex-arabic-bold text-center flex-1">
            خيارات اللغة
          </Text>
          <TouchableOpacity
            onPress={handleBackPress}
            className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <Text className="text-text-brand/70 text-center mt-2 font-ibm-plex-arabic-medium">
          اختر اللغة التي تفضلها لتطبيقك
        </Text>
      </Animated.View>

      {/* Animated Language List */}
      <Animated.View style={listAnimatedStyle} className="flex-1 px-4 pt-6">
        <ScrollView showsVerticalScrollIndicator={false}>
          {languages.map((language, index) =>
            renderLanguageItem(language, index)
          )}

          {/* Info section */}
          <View className="mt-6 p-4 bg-[#1A1E1F] rounded-2xl">
            <View className="flex-row items-start">
              <Ionicons
                name="information-circle"
                size={20}
                color="#00AEEF"
                style={{ marginTop: 2, marginRight: 8 }}
              />
              <View className="flex-1">
                <Text className="text-white font-ibm-plex-arabic-bold mb-2">
                  ملاحظة مهمة
                </Text>
                <Text className="text-text-brand/70 font-ibm-plex-arabic-medium text-sm leading-5">
                  تغيير اللغة سيؤثر على جميع النصوص في التطبيق. اللغة العربية هي
                  اللغة الافتراضية وتحتوي على أفضل دعم للقرآن والأذكار.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}
