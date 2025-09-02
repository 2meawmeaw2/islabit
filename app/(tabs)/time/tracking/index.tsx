import React, { useCallback, useRef, useState, useEffect } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import HabitsTrackingPlaceholder from "./habits";
import BundleTrackingPlaceholder from "./bundle";
import { useUserStore } from "@/store/userStore";
export default function TrackingChoiceScreen() {
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const topScrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Animated segmented control shared values
  const segmentW = useSharedValue(0);
  const translateX = useSharedValue(0);

  const handlePress = useCallback(
    (index: number) => {
      setActiveIndex(index);
      // Defer scroll to the next frame to avoid jank alongside the pill animation
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ x: index * width, animated: true });
      });
      // In flex-row-reverse, index 0 is the right segment, index 1 is the left.
      // Pill is positioned from left, so right segment = segmentW, left segment = 0.
      translateX.value = withTiming((1 - index) * segmentW.value, {
        duration: 300,
        easing: Easing.out(Easing.quad),
      });
    },
    [width]
  );

  const onMomentumEnd = useCallback(
    (event: any) => {
      const xOffset = event.nativeEvent.contentOffset.x;
      const newIndex = Math.round(xOffset / width);
      if (newIndex !== activeIndex) setActiveIndex(newIndex);
    },
    [activeIndex, width]
  );

  // On mount, scroll the top horizontal ScrollView to the end
  useEffect(() => {
    requestAnimationFrame(() => {
      topScrollRef.current?.scrollToEnd({ animated: false });
    });
  }, []);

  // Keep pill in sync if activeIndex changes from scroll
  useEffect(() => {
    translateX.value = withTiming(activeIndex * segmentW.value, {
      duration: 300,
      easing: Easing.out(Easing.quad),
    });
  }, [activeIndex]);

  const pillStyle = useAnimatedStyle(() => ({
    width: segmentW.value,
    transform: [{ translateX: translateX.value }],
  }));
  console.log(useUserStore.getState().profile);
  return (
    <View className="flex-1 bg-bg">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-text-primary font-ibm-plex-arabic-bold text-2xl text-right mb-3">
          التتبع
        </Text>

        <ScrollView ref={topScrollRef} horizontal>
          <View
            style={{ width: 120, height: 120, backgroundColor: "#2563EB" }}
            className="justify-center items-center px-4 py-6 rounded-3xl mx-3"
          >
            <Text className="text-text-primary font-ibm-plex-arabic-bold text-4xl text-center mb-2">
              {useUserStore.getState().profile?.commited_habits.length}
            </Text>
            <Text className="text-text-primary font-ibm-plex-arabic-medium text-base text-center opacity-90">
              العادات
            </Text>
          </View>

          <View
            style={{ width: 120, height: 120, backgroundColor: "#D97706" }}
            className="justify-center items-center px-4 py-6 rounded-3xl mx-3"
          >
            <Text className="text-text-primary font-ibm-plex-arabic-bold text-4xl text-center mb-2">
              {useUserStore.getState().profile?.points}
            </Text>
            <Text className="text-text-primary font-ibm-plex-arabic-medium text-base text-center opacity-90">
              نقاطي
            </Text>
          </View>

          <View
            style={{ width: 120, height: 120, backgroundColor: "#059669" }}
            className="justify-center items-center px-4 py-6 rounded-3xl mx-3"
          >
            <Text className="text-text-primary font-ibm-plex-arabic-bold text-4xl text-center mb-2">
              {useUserStore.getState().profile?.best_days.length || 0}
            </Text>
            <Text className="text-text-primary font-ibm-plex-arabic-medium text-base text-center opacity-90">
              الأيام المثالية
            </Text>
          </View>
          <View
            style={{ width: 120, height: 120, backgroundColor: "#00AEEF" }}
            className="justify-center items-center px-4 py-6 rounded-3xl mx-3"
          >
            <Text className="text-text-primary font-ibm-plex-arabic-bold text-4xl text-center mb-2">
              {useUserStore.getState().profile?.commited_bundles.length}
            </Text>
            <Text className="text-text-primary font-ibm-plex-arabic-medium text-base text-center opacity-90">
              الحزم
            </Text>
          </View>
        </ScrollView>

        <View
          className="mt-10 flex-row-reverse bg-fore border border-border-secondary rounded-xl p-1 relative"
          onLayout={(e) => {
            const w = e.nativeEvent.layout.width;
            segmentW.value = Math.max(0, (w - 8) / 2);
            // Initialize pill position based on current index
            translateX.value = (1 - activeIndex) * segmentW.value;
          }}
        >
          <Animated.View
            pointerEvents="none"
            className="absolute top-1 bottom-1 left-1 rounded-lg bg-text-disabled/50"
            style={pillStyle}
          />

          <Pressable
            accessibilityRole="button"
            onPress={() => handlePress(1)}
            className="flex-1 items-center py-2 rounded-lg z-10"
          >
            <Text
              className={`font-ibm-plex-arabic-bold text-sm ${
                activeIndex === 1 ? "text-text-primary" : "text-text-disabled"
              }`}
            >
              العادات
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => handlePress(0)}
            className="flex-1 items-center py-2 rounded-lg z-10"
          >
            <Text
              className={`font-ibm-plex-arabic-bold text-sm ${
                activeIndex === 0 ? "text-text-primary" : "text-text-disabled"
              }`}
            >
              الحزم
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumEnd}
      >
        <View style={{ width }}>
          <BundleTrackingPlaceholder />
        </View>
        <View style={{ width }}>
          <HabitsTrackingPlaceholder />
        </View>
      </ScrollView>
    </View>
  );
}
