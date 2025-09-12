import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import Animated, {
  FadeInRight,
  FadeInUp,
  FadeOutLeft,
} from "react-native-reanimated";
import { router } from "expo-router";
import { Bundle } from "@/lib/bundles";

interface HabitBundlesSectionProps {
  onBundlePress: (bundle: Bundle) => void;
  bundles?: Bundle[];
  isLoading?: boolean;
  error?: string | null;
}

const HabitBundlesSection: React.FC<HabitBundlesSectionProps> = ({
  onBundlePress,
  bundles = [],
  isLoading = false,
  error = null,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const windowWidth = Dimensions.get("window").width;
  const cardWidth = windowWidth - 80; // Better spacing
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / (cardWidth + 16)); // 16 is the margin between cards
    setCurrentIndex(index);
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <View className="w-full">
      <View className="flex-row-reverse items-center justify-between mb-6 px-5">
        <View className="h-6 w-24 bg-slate-800 rounded-lg" />
        <View className="h-4 w-16 bg-slate-800 rounded-lg" />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {[1, 2, 3].map((item) => (
          <View
            key={item}
            className="mx-2 first:ml-5 last:mr-5 bg-slate-800 rounded-2xl overflow-hidden"
            style={{ width: cardWidth, height: 280 }}
          >
            <View className="h-44 bg-slate-700" />
            <View className="p-4 space-y-3">
              <View className="h-4 w-3/4 bg-slate-700 rounded" />
              <View className="h-3 w-full bg-slate-700 rounded" />
              <View className="flex-row-reverse justify-between items-center">
                <View className="h-3 w-16 bg-slate-700 rounded" />
                <View className="h-3 w-12 bg-slate-700 rounded" />
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
  const SectionHeader: React.FC<{
    title: string;
    onViewAll: () => void;
    withIcon?: boolean;
  }> = ({ title, onViewAll, withIcon = true }) => {
    return (
      <View className="flex-row-reverse items-center justify-between mb-6 px-5">
        {/* Right side: icon + title, anchored to the right in RTL */}
        <View className="flex-row-reverse items-center gap-2">
          <Text className="font-ibm-plex-arabic-semibold text-xl text-text-primary text-right">
            {title}
          </Text>
          {withIcon && (
            <View className="bg-text-brand/10 p-2 rounded-lg">
              <Ionicons
                name="trending-up"
                style={{ transform: [{ rotateY: "180deg" }] }}
                size={20}
                color="#ffffff"
              />
            </View>
          )}
        </View>

        {/* Left side: View all */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onViewAll}
          className="flex-row-reverse items-center gap-2 bg-fore px-3 py-2 rounded-xl"
        >
          <Text className="font-ibm-plex-arabic text-sm text-text-secondary">
            عرض الكل
          </Text>
          <Ionicons name={"chevron-back"} size={14} color="#F5F5F5" />
        </TouchableOpacity>
      </View>
    );
  };
  // Show loading state
  if (isLoading) {
    return (
      <Animated.View
        entering={FadeInRight.delay(200)}
        exiting={FadeOutLeft.delay(200)}
        className="w-full mt-6"
      >
        <LoadingSkeleton />
      </Animated.View>
    );
  }

  // Show error state
  if (error) {
    return (
      <Animated.View entering={FadeInUp.delay(200)} className="w-full mt-6">
        <View className="flex-row-reverse items-center justify-between mb-6 px-5">
          <Text className="font-ibm-plex-arabic-semibold text-xl text-text-primary">
            حزم العادات الرائجة
          </Text>
          <Pressable
            onPress={() => router.push("/home/explore-bundles")}
            className="flex-row-reverse items-center gap-2"
          >
            <Text className="font-ibm-plex-arabic text-sm text-text-secondary">
              عرض الكل
            </Text>
            <Ionicons name="chevron-back" size={16} color="#F5F5F5" />
          </Pressable>
        </View>
        <View className="flex-1 justify-center items-center py-16 mx-5">
          <View className="bg-fore rounded-2xl p-8 items-center w-full">
            <View className="bg-red-900/20 p-4 rounded-full mb-4">
              <Ionicons name="alert-circle-outline" size={48} color="#DC2626" />
            </View>
            <Text className="font-ibm-plex-arabic-semibold text-lg text-text-primary text-center mb-2">
              حدث خطأ في التحميل
            </Text>
            <Text className="font-ibm-plex-arabic text-text-muted text-center mb-4">
              {error}
            </Text>
            <TouchableOpacity
              className="bg-text-brand px-6 py-3 rounded-xl"
              onPress={() => {
                /* Add retry logic */
              }}
            >
              <Text className="font-ibm-plex-arabic text-pure-white">
                إعادة المحاولة
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  }

  // Show empty state
  if (bundles.length === 0) {
    return (
      <Animated.View entering={FadeInUp.delay(200)} className="w-full mt-6">
        <View className="flex-row-reverse items-center justify-between mb-6 px-5">
          <Text className="font-ibm-plex-arabic-semibold text-xl text-text-primary">
            حزم العادات الرائجة
          </Text>
          <Pressable
            onPress={() => router.push("/home/explore-bundles")}
            className="flex-row-reverse items-center gap-2"
          >
            <Text className="font-ibm-plex-arabic text-sm text-text-secondary">
              عرض الكل
            </Text>
            <Ionicons name="chevron-back" size={16} color="#F5F5F5" />
          </Pressable>
        </View>
        <View className="flex-1 justify-center items-center py-16 mx-5">
          <View className="bg-fore rounded-2xl p-8 items-center w-full">
            <View className="bg-slate-800 p-4 rounded-full mb-4">
              <Ionicons name="library-outline" size={48} color="#9CA3AF" />
            </View>
            <Text className="font-ibm-plex-arabic-semibold text-lg text-text-primary text-center mb-2">
              لا توجد حزم متاحة
            </Text>
            <Text className="font-ibm-plex-arabic text-text-muted text-center mb-4">
              لا توجد حزم عادات متاحة حالياً
            </Text>
            <TouchableOpacity
              className="bg-text-brand px-6 py-3 rounded-xl"
              onPress={() => router.push("/home/explore-bundles")}
            >
              <Text className="font-ibm-plex-arabic text-pure-white">
                استكشاف الحزم
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeInRight.delay(200)} className="w-full mt-6">
      {/* Header */}
      <SectionHeader
        title="حزم العادات الرائجة"
        onViewAll={() => router.push("/home/explore-bundles")}
        withIcon={true}
      />

      {/* Bundles ScrollView */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 10 }}
        className="flex-1"
        snapToInterval={cardWidth} // Card width + margin
        pagingEnabled={false}
        onScroll={handleScroll}
        snapToAlignment="start"
        decelerationRate="fast"
      >
        {/* Add More Button - First Item */}
        <Animated.View
          entering={FadeInRight.delay(300)}
          className="mr-4"
          style={{ width: cardWidth }}
        >
          <Pressable
            onPress={() => router.push("/home/explore-bundles")}
            className="bg-fore border-2 border-dashed border-slate-700 rounded-2xl overflow-hidden"
            style={{ height: 280 }}
          >
            <View className="flex-1 items-center justify-center p-6">
              <View className="bg-text-brand/10 p-6 rounded-full mb-4">
                <Ionicons name="add" size={40} color="#00AEEF" />
              </View>
              <Text className="font-ibm-plex-arabic-semibold text-lg text-text-primary mb-2">
                استكشف المزيد
              </Text>
              <Text className="font-ibm-plex-arabic text-sm text-text-muted text-center">
                اكتشف حزم عادات جديدة ومفيدة
              </Text>
            </View>
          </Pressable>
        </Animated.View>

        {/* Bundle Cards */}
        {bundles.map((bundle, index) => (
          <Animated.View
            key={bundle.id}
            entering={FadeInRight.delay(400 + index * 100)}
            className="mr-4"
            style={{ width: cardWidth }}
          >
            <Pressable
              onPress={() => onBundlePress(bundle)}
              className="bg-fore rounded-2xl overflow-hidden "
              style={{ height: 260, borderWidth: 1, borderColor: "#1A1E1F" }}
            >
              {/* Bundle Image */}
              <View className="h-44 relative">
                <Image
                  source={{ uri: bundle.image_url }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.8)"]}
                  className="absolute bottom-0 left-0 right-0 h-24"
                />

                {/* Category Badge */}
                <View className="absolute top-3 right-3">
                  <View
                    className="px-3 py-1 rounded-full border border-white/20"
                    style={{ backgroundColor: `${bundle.category.hexColor}CC` }}
                  >
                    <Text className="font-ibm-plex-arabic text-xs text-white font-medium">
                      {bundle.category.text}
                    </Text>
                  </View>
                </View>

                {/* Trending Badge */}
                <View className="absolute top-3 left-3">
                  <View className="bg-amber-500/90 px-2 py-1 rounded-full border border-amber-300/30">
                    <View className="flex-row items-center gap-1">
                      <Ionicons name="trending-up" size={12} color="#FFFFFF" />
                      <Text className="font-ibm-plex-arabic text-xs text-white font-medium">
                        رائج
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Title Overlay */}
                <View className="absolute bottom-3 right-3 left-3">
                  <Text className="font-ibm-plex-arabic-bold text-right text-lg text-white mb-1">
                    {bundle.title}
                  </Text>
                  <Text className="font-ibm-plex-arabic text-sm text-right text-white/80">
                    {bundle.subtitle}
                  </Text>
                </View>
              </View>

              {/* Bundle Content */}
              <View className="p-4 flex-1">
                <Text className="font-ibm-plex-arabic text-sm text-right text-text-muted mb-4 line-clamp-2">
                  {bundle.description}
                </Text>

                {/* Bundle Stats */}
                <View className="flex-row-reverse items-center justify-between">
                  <View className="flex-row-reverse items-center gap-4">
                    <View className="flex-row-reverse items-center gap-1">
                      <View className="bg-red-500/10 p-1 rounded-full">
                        <Ionicons name="heart" size={14} color="#DC2626" />
                      </View>
                      <Text className="font-ibm-plex-arabic text-xs text-text-muted">
                        {bundle.likes?.length || 0}
                      </Text>
                    </View>

                    <View className="flex-row-reverse items-center gap-1">
                      <View className="bg-green-500/10 p-1 rounded-full">
                        <Ionicons name="people" size={14} color="#22C55E" />
                      </View>
                      <Text className="font-ibm-plex-arabic text-xs text-text-muted">
                        {bundle.enrolled_users?.length || 0}
                      </Text>
                    </View>
                  </View>

                  <View className="bg-text-brand/10 px-3 py-1.5 rounded-full">
                    <View className="flex-row-reverse items-center gap-1">
                      <Text className="font-ibm-plex-arabic-medium text-xs text-text-brand">
                        {bundle.habits?.length || 0} عادة
                      </Text>
                      <Ionicons name="flash" size={12} color="#00AEEF" />
                    </View>
                  </View>
                </View>
              </View>
            </Pressable>
          </Animated.View>
        ))}
      </ScrollView>

      {/* Bottom indicator dots (optional) */}
      {bundles.length > 0 && (
        <View className="flex-row justify-center mt-4 gap-2">
          {Array.from({ length: Math.min(bundles.length + 1, 4) }).map(
            (_, index) => (
              <View
                key={index}
                className={`h-1.5 rounded-full ${
                  index === currentIndex
                    ? "w-6 bg-text-brand"
                    : "w-1.5 bg-slate-700"
                }`}
              />
            )
          )}
        </View>
      )}
    </Animated.View>
  );
};

export default HabitBundlesSection;
