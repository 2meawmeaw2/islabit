import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { habitBundles } from "@/components/habits/HabitBundlesSection";
import { Category, DEFAULT_CATEGORIES } from "@/types/habit";

const ExploreBundles = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filter bundles based on search and category
  const filteredBundles = useMemo(() => {
    let filtered = habitBundles;

    if (searchQuery) {
      filtered = filtered.filter(
        (bundle) =>
          bundle.title.includes(searchQuery) ||
          bundle.subtitle.includes(searchQuery) ||
          bundle.description.includes(searchQuery)
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(
        (bundle) => bundle.category.id === selectedCategory
      );
    }

    return filtered;
  }, [searchQuery, selectedCategory]);

  const handleBundlePress = (bundleId: string) => {
    router.push({
      pathname: "/(tabs)/home/[singlebundle]",
      params: { singlebundle: String(bundleId) },
    });
  };

  const handleBackPress = () => {
    router.navigate("/home");
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <StatusBar style="light" />

      {/* Simple Header */}
      <View className="bg-fore px-4 py-4">
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={handleBackPress}
            className="w-8 h-8 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={20} color="#00AEEF" />
          </Pressable>
          <Text className="font-ibm-plex-arabic-bold text-xl text-text-primary">
            اكتشف الرحلات
          </Text>
        </View>
      </View>

      {/* Simple Search Bar */}

      {/* Bundles Grid */}
      <ScrollView
        className="flex-1 "
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="px-4 py-4">
          <View className="bg-fore rounded-full flex-row-reverse items-center px-5 py-2">
            <Ionicons name="search" size={18} color="#6C7684" />
            <TextInput
              placeholder="ابحث عن رحلة..."
              placeholderTextColor="#6C7684"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 text-right font-ibm-plex-arabic text-text-primary mr-3"
            />
          </View>
        </View>
        {/* Simple Category Filter */}

        <View className=" mb-4">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            style={{ transform: [{ scaleX: -1 }] }} // Flip the entire ScrollView
          >
            <Pressable
              onPress={() => setSelectedCategory(null)}
              style={{ transform: [{ scaleX: -1 }] }} // Flip back individual items
              className={`mr-3 px-3 py-2 rounded-full ${
                selectedCategory === null ? "bg-text-brand" : "bg-fore"
              }`}
            >
              <Text
                className={`font-ibm-plex-arabic-medium text-sm ${
                  selectedCategory === null
                    ? "text-text-primary"
                    : "text-text-primary"
                }`}
              >
                الكل
              </Text>
            </Pressable>

            {DEFAULT_CATEGORIES.map((category) => (
              <Pressable
                key={category.id}
                onPress={() => setSelectedCategory(category.id)}
                style={{ transform: [{ scaleX: -1 }] }} // Flip back individual items
                className={`mr-3 px-3 border  rounded-full ${
                  selectedCategory === category.id
                    ? "bg-text-brand"
                    : "bg-fore  "
                }`}
              >
                <Text
                  className={`font-ibm-plex-arabic  py-2 text-sm ${
                    selectedCategory === category.id
                      ? "text-text-primary"
                      : "text-text-primary"
                  }`}
                >
                  {category.text}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
        {/* Results Count */}
        <View className="px-4 mb-4">
          <Text className="font-ibm-plex-arabic text-sm text-text-muted text-right">
            {filteredBundles.length} رحلة متاحة
          </Text>
        </View>
        <View className="w-full px-7">
          {filteredBundles.map((bundle) => (
            <Pressable
              key={bundle.id}
              onPress={() => handleBundlePress(bundle.id)}
              className="w-full mb-4 rounded-2xl overflow-hidden"
              style={{ height: 200 }}
            >
              {/* Background Image */}
              <Image
                source={require("../../../assets/images/logo.png")}
                className="absolute inset-0 -left-1/2 translate-x-[25%] w-full h-full"
                style={{ opacity: 0.6 }}
              />

              {/* Gradient Overlay */}
              <LinearGradient
                colors={[
                  "rgba(0,0,0,0.85)",
                  "rgba(0,0,0,0.2)",
                  "rgba(0,0,0,0.9)",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                className="absolute inset-0 z-10"
              />

              {/* Content Container */}
              <View className="relative z-20 h-full p-4 flex-col justify-between">
                {/* Top Section */}
                <View className="flex-row-reverse items-start justify-between">
                  {/* Category Badge */}
                  <View className="px-3 ">
                    <Text
                      style={{ color: bundle.category.hexColor }}
                      className="font-ibm-plex-arabic-semibold pb-2 text-xs"
                    >
                      {bundle.category.text}
                    </Text>
                  </View>

                  {/* Habits Count Badge */}
                  <View className=" rounded-full px-3 py-1">
                    <Text className="font-ibm-plex-arabic-semibold text-xs text-text-brand">
                      {bundle.habits.length} عادة
                    </Text>
                  </View>
                </View>

                {/* Middle Section */}
                <View className="flex-1 justify-center">
                  {/* Title */}
                  <Text className="font-ibm-plex-arabic-bold text-lg text-white text-right mb-2">
                    {bundle.title}
                  </Text>

                  {/* Subtitle */}
                  <Text
                    className="font-ibm-plex-arabic text-sm text-white/90 text-right mb-3"
                    numberOfLines={2}
                  >
                    {bundle.subtitle}
                  </Text>
                </View>

                {/* Bottom Section */}
                <View className="flex-row-reverse items-center justify-between">
                  {/* Description Preview */}
                  <Text
                    className="font-ibm-plex-arabic text-xs text-white/80 text-left"
                    numberOfLines={1}
                  >
                    {bundle.description.substring(0, 40)}...
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
        {/* Empty State */}
        {filteredBundles.length === 0 && (
          <View className="items-center justify-center py-20">
            <View className="w-16 h-16 bg-fore rounded-full items-center justify-center mb-4">
              <Ionicons name="search-outline" size={30} color="#6C7684" />
            </View>
            <Text className="font-ibm-plex-arabic-semibold text-base text-text-primary text-center mb-2">
              لم نجد رحلات
            </Text>
            <Text className="font-ibm-plex-arabic text-sm text-text-muted text-center">
              جرب البحث بكلمات مختلفة أو اختر فئة أخرى
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ExploreBundles;
