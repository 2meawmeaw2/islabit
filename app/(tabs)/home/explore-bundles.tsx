import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
  Image,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { DEFAULT_CATEGORIES } from "@/types/habit";
import { useExploreStore } from "@/store/exploreStore";

const ExploreBundles = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const {
    bundles,
    isLoading,
    error,
    hasMore,
    fetchMoreBundles,
    fetchByCategory,
    clearFilters,
    setError,
  } = useExploreStore();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Initial load
  useEffect(() => {
    loadInitialBundles();
  }, []);

  const loadInitialBundles = async () => {
    try {
      await fetchMoreBundles();
    } catch (err) {
      console.error("Error loading bundles:", err);
      setError("حدث خطأ في تحميل الحزم");
    }
  };

  // Handle category selection
  const handleCategorySelect = async (category: string | null) => {
    setSelectedCategory(category);
    try {
      if (category === null) {
        await clearFilters();
      } else {
        await fetchByCategory(category);
      }
    } catch (err) {
      console.error("Error filtering by category:", err);
      setError("حدث خطأ في تصفية العناصر");
    }
  };

  // Handle infinite scroll
  const handleLoadMore = async () => {
    if (!isLoading && hasMore) {
      if (selectedCategory) {
        await fetchByCategory(selectedCategory);
      } else {
        await fetchMoreBundles();
      }
    }
  };

  const handleBundlePress = (bundle: any) => {
    router.push({
      pathname: "/(tabs)/home/bundleCommit",
      params: { bundleData: JSON.stringify(bundle) },
    });
  };

  const handleBackPress = () => {
    router.navigate("/home");
  };

  // Filter bundles based on search
  const filteredBundles = bundles.filter(
    (bundle: any) =>
      searchQuery === "" ||
      bundle.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bundle.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bundle.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <StatusBar style="light" />
      {/* Header */}
      <View className="bg-fore px-4 py-2 border-b border-bg">
        <View className="flex-row items-center justify-between mb-4">
          <Pressable
            onPress={handleBackPress}
            className="w-10 h-10 items-center justify-center bg-bg/50 rounded-full"
          >
            <Ionicons name="arrow-back" size={20} color="#F5F5F5" />
          </Pressable>
          <Text className="font-ibm-plex-arabic-bold text-xl text-text-primary">
            اكتشف الرحلات
          </Text>
        </View>
      </View>
      <ScrollView>
        {/* Search Bar */}
        <View className="bg-fore mx-4 my-4 rounded-2xl flex-row-reverse items-center px-4 py-3 mt-2">
          <View className="bg-fore/30 p-2 rounded-full">
            <Ionicons name="search" size={18} color="#6C7684" />
          </View>
          <TextInput
            placeholder="ابحث عن رحلة..."
            placeholderTextColor="#6C7684"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 text-right font-ibm-plex-arabic text-text-primary mr-3"
          />
        </View>
        {/* Categories */}
        <View className="mb-6">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            style={{ transform: [{ scaleX: -1 }] }}
          >
            <Pressable
              onPress={() => handleCategorySelect(null)}
              style={{ transform: [{ scaleX: -1 }] }}
              className={`mr-3 px-4 py-2 rounded-full ${
                selectedCategory === null
                  ? "bg-text-brand border-2 border-text-brand"
                  : "bg-fore border-2 border-bg"
              }`}
            >
              <Text
                className={`font-ibm-plex-arabic-medium text-sm ${
                  selectedCategory === null ? "text-white" : "text-text-primary"
                }`}
              >
                الكل
              </Text>
            </Pressable>

            {DEFAULT_CATEGORIES.map((category) => (
              <Pressable
                key={category.text}
                onPress={() => handleCategorySelect(category.text)}
                style={{ transform: [{ scaleX: -1 }] }}
                className={`mr-3 px-4 py-2 rounded-full ${
                  selectedCategory === category.text
                    ? "bg-text-brand border-2 border-text-brand"
                    : "bg-fore border-2 border-bg"
                }`}
              >
                <Text
                  className={`font-ibm-plex-arabic-medium text-sm ${
                    selectedCategory === category.text
                      ? "text-white"
                      : "text-text-primary"
                  }`}
                >
                  {category.text}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
        {error ? (
          <View className="flex-1 justify-center items-center py-20 px-6">
            <Text className="font-ibm-plex-arabic text-red-500 text-center mb-4">
              {error}
            </Text>
            <Pressable
              onPress={loadInitialBundles}
              className="bg-fore px-6 py-3 rounded-full"
            >
              <Text className="font-ibm-plex-arabic text-text-primary">
                إعادة المحاولة
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
            {/* Results Count */}
            <View className="px-4 mb-4">
              <Text className="font-ibm-plex-arabic text-sm text-text-muted text-right">
                {filteredBundles.length} رحلة متاحة
              </Text>
            </View>

            <View>
              {filteredBundles.map((bundle: any) => (
                <Pressable
                  key={bundle.id}
                  onPress={() => handleBundlePress(bundle)}
                  className="w-[92%] mx-auto mb-4 rounded-2xl overflow-hidden bg-fore"
                  style={{ height: 200 }}
                >
                  {/* Background Image */}
                  <Image
                    source={require("../../../assets/images/logo.png")}
                    className="absolute inset-0 w-full h-full"
                    style={{ opacity: 0.6 }}
                    resizeMode="cover"
                  />

                  {/* Gradient Overlay */}
                  <LinearGradient
                    colors={[
                      "rgba(0,0,0,0.85)",
                      "rgba(0,0,0,0.2)",
                      "rgba(0,0,0,0.9)",
                    ]}
                    start={{ x: 1, y: 1 }}
                    end={{ x: 0, y: 0 }}
                    className="absolute inset-0 z-10"
                  />

                  {/* Content Container */}
                  <View className="relative z-20 h-full p-4 flex-col justify-between">
                    {/* Top Section */}
                    <View className="flex-row-reverse items-center justify-between">
                      {/* Category Badge */}
                      <View className="bg-black/30 px-3 py-1 rounded-full">
                        <Text
                          style={{ color: bundle.category.hexColor }}
                          className="font-ibm-plex-arabic-medium text-xs"
                        >
                          {bundle.category.text}
                        </Text>
                      </View>

                      {/* Habits Count Badge */}
                      <View className="bg-black/30 rounded-full px-3 py-1">
                        <Text className="font-ibm-plex-arabic-medium text-xs text-white">
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
                        className="font-ibm-plex-arabic text-xs text-white/80 text-right"
                        numberOfLines={1}
                      >
                        {bundle.description.substring(0, 60)}...
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))}

              {/* Loading Footer */}
              {isLoading && (
                <View className="py-4">
                  <ActivityIndicator size="large" color="#22C55E" />
                </View>
              )}

              {/* Empty State */}
              {!isLoading && filteredBundles.length === 0 && (
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
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ExploreBundles;
