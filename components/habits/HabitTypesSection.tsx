// components/habits/HabitTypesSection.tsx
import React, { memo, useCallback, useMemo } from "react";
import {
  Pressable,
  Text,
  View,
  TouchableOpacity,
  Platform,
} from "react-native";
import Animated, { FadeInRight, FadeInUp } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { DEFAULT_CATEGORIES, Category } from "@/types/habit";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

export interface CategoryItem {
  id: string;
  title: string;
  iconName?: IconName;
  hexColor?: string; // e.g. "#00AEEF"
  subtitle?: string;
}

// Map DEFAULT_CATEGORIES to CategoryItem with Islamic-appropriate icons and subtitles
const CATEGORY_MAPPING: Record<
  string,
  { iconName: IconName; subtitle: string }
> = {
  روحاني: { iconName: "sparkles-outline", subtitle: "العبادة والذكر" },
  صحي: { iconName: "heart-outline", subtitle: "العناية بالجسد" },
  تعليمي: { iconName: "book-outline", subtitle: "طلب العلم والمعرفة" },
  اجتماعي: { iconName: "people-outline", subtitle: "العلاقات والتفاعل" },
  مالي: { iconName: "wallet-outline", subtitle: "إدارة المال" },
  عائلي: { iconName: "home-outline", subtitle: "الأسرة والبيت" },
  عمل: { iconName: "briefcase-outline", subtitle: "المهنة والإنجاز" },
  رياضة: { iconName: "fitness-outline", subtitle: "النشاط البدني" },
};

// Convert Category to CategoryItem
function mapCategoryToItem(category: Category, index: number): CategoryItem {
  const mapping = CATEGORY_MAPPING[category.text] || {
    iconName: "pricetag-outline" as IconName,
    subtitle: "تصنيف عام",
  };

  return {
    id: category.text, // Use the Arabic text as ID for proper filtering
    title: category.text,
    iconName: mapping.iconName,
    hexColor: category.hexColor,
    subtitle: mapping.subtitle,
  };
}

interface CategorySectionProps {
  title?: string;
  categories?: CategoryItem[]; // Will render the first 4, defaults to mapped DEFAULT_CATEGORIES
  isLoading?: boolean;
  error?: string | null;
  onCategoryPress?: (categoryId: string) => void;
  onExploreMore?: () => void;
  maxItems?: number; // How many categories to show (default: 4)
}

// Small header that matches your SectionHeader vibe
const SectionHeaderMini: React.FC<{ title: string }> = ({ title }) => (
  <View className="flex-row-reverse items-center justify-between mb-6 px-1">
    <View className="flex-row-reverse items-center gap-2">
      <Text className="font-ibm-plex-arabic-semibold text-xl text-text-primary text-right">
        {title}
      </Text>
      <View className="bg-fore/90 p-2 rounded-lg">
        <Ionicons
          name="grid-outline"
          style={{ transform: [{ rotateY: "180deg" }] }}
          size={20}
          color="#ffffff"
        />
      </View>
    </View>
  </View>
);

type Props = {
  item: CategoryItem;
  index: number;
  onPress?: (id: string) => void;
};

const DEFAULT_COLOR = "#00AEEF";

/** Convert #RRGGBB to rgba(r,g,b,a) */
function hexWithAlpha(hex: string, alpha: number): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex) || [];
  const safe = m[1] || "00AEEF";
  const r = parseInt(safe.slice(0, 2), 16);
  const g = parseInt(safe.slice(2, 4), 16);
  const b = parseInt(safe.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
const CategoryCard: React.FC<Props> = memo(({ item, index, onPress }) => {
  const baseColor = /^#([0-9a-f]{6})$/i.test(item.hexColor || "")
    ? (item.hexColor as string)
    : DEFAULT_COLOR;

  const tintBg = useMemo(() => hexWithAlpha(baseColor, 0.1), [baseColor]); // soft background
  const ripple = useMemo(() => hexWithAlpha(baseColor, 0.16), [baseColor]); // android ripple

  const handlePress = useCallback(() => {
    onPress?.(item.id);
  }, [item.id, onPress]);

  const a11yLabel = useMemo(
    () => `${item.title}${item.subtitle ? `, ${item.subtitle}` : ""} category`,
    [item.title, item.subtitle]
  );

  return (
    <Animated.View
      entering={FadeInRight.delay(200 + index * 80)}
      className="basis-[48%]"
      testID={`category-card-${item.id}`}
    >
      <Pressable
        onPress={handlePress}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={a11yLabel}
        android_ripple={{ color: ripple, borderless: false }}
        style={({ pressed }) => [
          {
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
        className="rounded-2xl overflow-hidden "
      >
        <View className=" rounded-2xl p-4 border items-end border-border-primary/20 bg-white/5">
          <View className="flex-1 justify-between w-full gap-2">
            {/* Icon bubble */}
            <View
              className=" h-11 rounded-xl items-center justify-center"
              style={{ backgroundColor: tintBg, width: "100%" }}
            >
              <Ionicons
                name={(item.iconName as any) || "pricetag-outline"}
                size={20}
                color={baseColor}
              />
            </View>

            {/* Text */}
            <View className="w-full gap-2">
              <Text
                numberOfLines={1}
                className="font-ibm-plex-arabic-medium text-lg text-text-primary text-center"
              >
                {item.title}
              </Text>

              {!!item.subtitle && (
                <Text
                  numberOfLines={1}
                  className="font-ibm-plex-arabic text-xs text-text-disabled text-center"
                >
                  {item.subtitle}
                </Text>
              )}
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
});

const CategorySection: React.FC<CategorySectionProps> = ({
  title = "التصنيفات",
  categories,
  isLoading = false,
  error = null,
  onCategoryPress,
  onExploreMore,
  maxItems = 4,
}) => {
  // Use provided categories or map from DEFAULT_CATEGORIES
  const mappedCategories = useMemo(() => {
    if (categories) return categories;
    return DEFAULT_CATEGORIES.map(mapCategoryToItem);
  }, [categories]);

  const displayCategories = mappedCategories.slice(0, maxItems);

  const handleExplore = useCallback(() => {
    if (onExploreMore) return onExploreMore();
    router.push("/home/explore-categories");
  }, [onExploreMore]);

  return (
    <Animated.View entering={FadeInUp.delay(150)} className="w-full px-4">
      <SectionHeaderMini title={title} />

      {/* Error */}
      {error && (
        <View className="flex-1 justify-center items-center py-12">
          <Text className="font-ibm-plex-arabic text-red-500 text-center">
            {error}
          </Text>
        </View>
      )}

      {/* Loading skeleton */}
      {isLoading && !error && (
        <View className="flex-row-reverse flex-wrap justify-between gap-3">
          {Array.from({ length: maxItems }, (_, i) => (
            <View
              key={i}
              className="basis-[48%] h-28 rounded-2xl bg-white/5 border border-border-primary/20"
            />
          ))}
        </View>
      )}

      {/* Grid */}
      {!isLoading && !error && (
        <>
          <View className="flex-row-reverse flex-wrap justify-between gap-3">
            {displayCategories.map((item, idx) => (
              <CategoryCard
                key={item.id}
                item={item}
                index={idx}
                onPress={onCategoryPress}
              />
            ))}
          </View>

          {/* Explore more button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleExplore}
            className="mt-6 bg-fore px-4 py-3 rounded-xl flex-row-reverse items-center justify-center gap-2"
          >
            <Text className="font-ibm-plex-arabic text-sm text-text-secondary">
              استكشف المزيد
            </Text>
            <Ionicons name="chevron-back" size={16} color="#F5F5F5" />
          </TouchableOpacity>
        </>
      )}
    </Animated.View>
  );
};

export default CategorySection;

// Export the mapping function for external use if needed
export { mapCategoryToItem, CATEGORY_MAPPING };
