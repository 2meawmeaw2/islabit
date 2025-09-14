import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";

// Current available language
const currentLanguage = {
  id: "ar",
  name: "العربية",
  nativeName: "العربية",
  description: "لغة القرآن الكريم والسنة النبوية",
  isSelected: true,
};

export default function LanguagesScreen({
  setIsModalVisible,
}: {
  setIsModalVisible: (isModalVisible: boolean) => void;
}) {
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
      setIsModalVisible(false);
    }, 300);
  };

  const renderLanguageItem = (language: any, index: number) => {
    const itemOpacity = useSharedValue(0);
    const itemScale = useSharedValue(0.95);

    useEffect(() => {
      // Subtle stagger animation
      itemOpacity.value = withDelay(
        200 + index * 100,
        withTiming(1, { duration: 400 })
      );
      itemScale.value = withDelay(
        200 + index * 100,
        withSpring(1, { damping: 12, stiffness: 90 })
      );
    }, []);

    const itemAnimatedStyle = useAnimatedStyle(() => ({
      opacity: itemOpacity.value,
      transform: [{ scale: itemScale.value }],
    }));

    return (
      <Animated.View key={language.id} style={itemAnimatedStyle}>
        <TouchableOpacity
          className="mb-3 overflow-hidden"
          activeOpacity={0.85}
          onPress={() => handleLanguageSelect(language.id)}
        >
          <View className="bg-fore rounded-2xl">
            {/* Top Section with Flag and Name */}
            <View className="flex-row-reverse text-right items-center justify-between p-4 border-b border-text-brand/10">
              <View className="flex-row items-center gap-3">
                <Text className="text-3xl">{language.flag}</Text>
                <View>
                  <Text className="text-white text-xl font-ibm-plex-arabic-bold">
                    {language.name}
                  </Text>
                </View>
              </View>

              {language.isSelected ? (
                <View className="bg-[#00AEEF]/20 px-2 py-2 rounded-full flex-row items-center">
                  <Ionicons name="checkmark-circle" size={16} color="#00AEEF" />
                </View>
              ) : (
                <View className="bg-text-brand/10 w-8 h-8 rounded-full items-center justify-center">
                  <Ionicons name="chevron-forward" size={20} color="#4C6770" />
                </View>
              )}
            </View>
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
        <View className="flex-row-reverse items-center justify-between px-4">
          <View className="w-10" /> {/* Spacer for centering */}
          <Text className="text-white text-2xl font-ibm-plex-arabic-bold text-center flex-1">
            خيارات اللغة
          </Text>
          <TouchableOpacity
            onPress={handleBackPress}
            className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Animated Language List */}
      <Animated.View style={listAnimatedStyle} className="flex-1 px-4 pt-6">
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Current Language Section */}
          <View className="mb-8">
            <Text className="text-text-brand/90 font-ibm-plex-arabic-medium mb-4 text-right text-lg">
              اللغة الحالية
            </Text>
            {renderLanguageItem(currentLanguage, 0)}
          </View>

          {/* Info section */}
          <View className="mt-6 p-4 bg-fore/50 rounded-2xl">
            <View className="flex-row items-start">
              <Ionicons
                name="information-circle"
                size={24}
                color="#00AEEF"
                style={{ marginTop: 2, marginRight: 8 }}
              />
              <View className="flex-1">
                <Text className="text-white font-ibm-plex-arabic-bold mb-2 text-right">
                  تطوير مستمر
                </Text>
                <Text className="text-text-brand/70 font-ibm-plex-arabic-medium text-sm leading-6 text-right">
                  نحن نعمل على إضافة المزيد من اللغات لتسهيل استخدام التطبيق
                  لجميع المسلمين حول العالم. حالياً، التطبيق متوفر باللغة
                  العربية فقط.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}
