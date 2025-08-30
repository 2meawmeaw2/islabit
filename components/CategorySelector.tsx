import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Category, DEFAULT_CATEGORIES } from "@/types/habit";

interface CategorySelectorProps {
  selectedCategory: Category;
  onCategoryChange: (category: Category) => void;
  title?: string;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onCategoryChange,
  title = "اختر الفئة",
}) => {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customText, setCustomText] = useState("");
  const [customColor, setCustomColor] = useState("#8B5CF6");

  // Predefined colors for custom categories
  const colorOptions = [
    "#8B5CF6",
    "#10B981",
    "#3B82F6",
    "#F59E0B",
    "#EF4444",
    "#EC4899",
    "#6B7280",
    "#059669",
    "#7C3AED",
    "#059669",
    "#0EA5E9",
    "#F97316",
  ];

  const handleCategorySelect = (category: Category) => {
    onCategoryChange(category);
    setShowCustomInput(false);
  };

  const handleCustomCategorySave = () => {
    if (!customText.trim()) {
      Alert.alert("خطأ", "يرجى إدخال اسم الفئة");
      return;
    }

    const newCategory: Category = {
      text: customText.trim(),
      hexColor: customColor,
    };

    onCategoryChange(newCategory);
    setShowCustomInput(false);
    setCustomText("");
  };

  const renderCategoryChip = (category: Category, isSelected: boolean) => (
    <Pressable
      key={category.text}
      onPress={() => handleCategorySelect(category)}
      className={`px-4 py-2 rounded-full border-2 mr-2 mb-2 ${
        isSelected ? "border-white" : "border-gray-600"
      }`}
      style={{
        backgroundColor: isSelected ? category.hexColor : "transparent",
      }}
    >
      <Text
        className={`font-ibm-plex-arabic text-sm ${
          isSelected ? "text-white" : "text-gray-300"
        }`}
      >
        {category.text}
      </Text>
    </Pressable>
  );

  return (
    <View className="mb-4">
      <Text className="font-ibm-plex-arabic-bold text-base text-white mb-3">
        {title}
      </Text>

      {/* Selected Category Display */}
      <View className="mb-4">
        <Text className="font-ibm-plex-arabic text-sm text-gray-400 mb-2">
          الفئة المختارة:
        </Text>
        <View className="flex-row items-center">
          <View
            className="px-4 py-2 rounded-full"
            style={{ backgroundColor: selectedCategory.hexColor }}
          >
            <Text className="font-ibm-plex-arabic text-sm text-white">
              {selectedCategory.text}
            </Text>
          </View>
          <Pressable
            onPress={() => setShowCustomInput(true)}
            className="ml-3 p-2 rounded-full bg-gray-700"
          >
            <Ionicons name="create-outline" size={16} color="white" />
          </Pressable>
        </View>
      </View>

      {/* Default Categories */}
      <Text className="font-ibm-plex-arabic text-sm text-gray-400 mb-2">
        الفئات المتاحة:
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-4"
      >
        <View className="flex-row">
          {DEFAULT_CATEGORIES.map((category) =>
            renderCategoryChip(
              category,
              category.text === selectedCategory.text &&
                category.hexColor === selectedCategory.hexColor
            )
          )}
        </View>
      </ScrollView>

      {/* Custom Category Input */}
      {showCustomInput && (
        <View className="bg-gray-800 p-4 rounded-lg">
          <Text className="font-ibm-plex-arabic text-sm text-gray-300 mb-3">
            إنشاء فئة مخصصة:
          </Text>

          {/* Text Input */}
          <TextInput
            value={customText}
            onChangeText={setCustomText}
            placeholder="اسم الفئة"
            placeholderTextColor="#6B7280"
            className="bg-gray-700 text-white p-3 rounded-lg mb-3 font-ibm-plex-arabic"
          />

          {/* Color Selection */}
          <Text className="font-ibm-plex-arabic text-sm text-gray-300 mb-2">
            اختر اللون:
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-4"
          >
            <View className="flex-row">
              {colorOptions.map((color) => (
                <Pressable
                  key={color}
                  onPress={() => setCustomColor(color)}
                  className={`w-8 h-8 rounded-full mr-2 border-2 ${
                    customColor === color ? "border-white" : "border-gray-600"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View className="flex-row justify-end gap-2">
            <Pressable
              onPress={() => setShowCustomInput(false)}
              className="px-4 py-2 rounded-lg bg-gray-600"
            >
              <Text className="font-ibm-plex-arabic text-sm text-white">
                إلغاء
              </Text>
            </Pressable>
            <Pressable
              onPress={handleCustomCategorySave}
              className="px-4 py-2 rounded-lg"
              style={{ backgroundColor: customColor }}
            >
              <Text className="font-ibm-plex-arabic text-sm text-white">
                حفظ
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
};
