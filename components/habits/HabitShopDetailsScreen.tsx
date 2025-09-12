/* eslint-disable react-native/no-inline-styles */
import React, { memo, useEffect, useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  AccessibilityInfo,
  NativeSyntheticEvent,
  TextLayoutEventData,
  LayoutChangeEvent,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInRight,
  interpolate,
  Extrapolate,
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  FadeInUp,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { HabitsShopHabit } from "@/types/habit";
import { PrayerKey } from "@/types/salat";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "@/utils/supabase";
import { CommentInput } from "@/components/CommentInput";
import { addHabitComment } from "@/lib/habits-api";
import { fetchHabitShopById } from "@/lib/habits-shop-api";
import { formatCommentTime } from "@/lib/bundle-comments";
import { addAlpha } from "@/lib/alpha";
/** ----- constants / helpers ----- */

const PRAYERS = [
  { key: "fajr", name: "الفجر", emoji: "🌅" },
  { key: "dhuhr", name: "الظهر", emoji: "☀️" },
  { key: "asr", name: "العصر", emoji: "🌤" },
  { key: "maghrib", name: "المغرب", emoji: "🌅" },
  { key: "isha", name: "العشاء", emoji: "🌙" },
] as const;

const dayName = (n: number) =>
  ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"][
    n
  ] ?? "غير محدد";

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

interface HabitShopDetailsScreenProps {
  habit: HabitsShopHabit;
  isLoading?: boolean;
  onAddToHabits?: (habit: HabitsShopHabit) => void;
  imageTitleAnimatedStyle?: any; // AnimatedStyle type from react-native-reanimated
  onLike?: () => void;
  isLiked?: boolean;
  isLiking?: boolean;
}

/** ----- sections ----- */
/** ----- sections (updated) ----- */

const Section = ({
  icon,
  title,
  children,
  delay = 0,
  accentColor = "#00AEEF",
  rotateY = false,
}: {
  icon: IconName;
  title: string;
  children: React.ReactNode;
  delay?: number;
  accentColor?: string;
  rotateY?: boolean;
}) => (
  <Animated.View
    entering={FadeInDown.duration(420).delay(delay)}
    className="px-4 pb-5"
  >
    <View
      // slightly higher contrast than bg + soft border for grouping
      className="bg-fore rounded-2xl px-4 py-4 border border-fore/60"
    >
      <View className="flex-row-reverse items-center mb-3">
        <View
          className="rounded-full p-2 ml-3"
          style={{ backgroundColor: addAlpha(accentColor, 0.1) }}
        >
          <MaterialCommunityIcons
            style={{
              transform: [
                { rotateY: rotateY ? "180deg" : "0deg" },
                { rotateZ: rotateY ? "-20deg" : "0deg" },
              ],
            }}
            name={icon}
            size={18}
            color={accentColor}
          />
        </View>
        {/* H2 scale -> smaller than hero title */}
        <Text className="text-text-primary font-ibm-plex-arabic-semibold text-lg">
          {title} :
        </Text>
      </View>
      <View>{children}</View>
    </View>
  </Animated.View>
);
const BenefitsList = ({
  benefits,
  accentColor = "#00AEEF",
}: {
  benefits: string[];
  accentColor?: string;
}) => {
  const [wrapMap, setWrapMap] = useState<Record<number, boolean>>({});
  const [containerW, setContainerW] = useState<number | null>(null);

  if (!benefits?.length)
    return (
      <View className="items-center py-4 px-5 bg-bg rounded-xl border border-fore border-dashed">
        <Text className="text-text-muted font-ibm-plex-arabic text-sm">
          لم تُضف فوائد بعد
        </Text>
      </View>
    );

  const onContainerLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w !== containerW) {
      setContainerW(w);
      // width changed → clear measurements so we re-detect wrapping at the new width
      setWrapMap({});
    }
  };

  // Build rows while preserving order:
  // - if item wraps → row with single full-width cell
  // - else try to pair with the next non-wrapping item
  const rows = useMemo(() => {
    const r: Array<Array<number | null>> = [];
    let i = 0;
    while (i < benefits.length) {
      const curWrap = !!wrapMap[i];
      const nextWrap = i + 1 < benefits.length ? !!wrapMap[i + 1] : false;

      if (curWrap) {
        r.push([i]); // span 2 cols
        i += 1;
        continue;
      }

      if (i + 1 >= benefits.length) {
        r.push([i, null]); // last short item, keep 2-col structure
        i += 1;
        continue;
      }

      // next exists
      if (nextWrap) {
        r.push([i, null]); // keep order; don't let this short one expand
        r.push([i + 1]); // next one spans two cols
        i += 2;
      } else {
        r.push([i, i + 1]); // pair two short ones
        i += 2;
      }
    }
    return r;
  }, [benefits.length, wrapMap]);

  let visibleIndex = 0; // for staggered animation

  return (
    <View className="gap-2" onLayout={onContainerLayout}>
      {rows.map((row, rIdx) => (
        <View key={`row-${rIdx}`} className="flex-row-reverse gap-2">
          {row.map((idx, cIdx) => {
            if (idx === null) {
              // spacer to keep 2 columns when needed
              return <View key={`spacer-${rIdx}-${cIdx}`} className="flex-1" />;
            }

            const i = idx;
            const isFull = row.length === 1; // this row is a single, spanning item
            const delay = visibleIndex++ * 70;

            return (
              <Animated.View
                key={`cell-${i}`}
                entering={FadeInRight.duration(240).delay(delay)}
                className="flex-1"
                // no need for basis classes; rows control width
              >
                <View
                  className={`flex-row-reverse items-center gap-2 rounded-lg px-3 py-2 ${
                    isFull ? "" : ""
                  }`}
                  style={{ backgroundColor: addAlpha(accentColor, 0.08) }}
                >
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={16}
                    color={accentColor}
                  />
                  <Text
                    className="text-text-secondary font-ibm-plex-arabic text-md text-right leading-6 flex-1"
                    onTextLayout={(
                      e: NativeSyntheticEvent<TextLayoutEventData>
                    ) => {
                      const wraps = e.nativeEvent.lines.length > 1;
                      setWrapMap((prev) =>
                        prev[i] === wraps ? prev : { ...prev, [i]: wraps }
                      );
                    }}
                  >
                    {benefits[i]}
                  </Text>
                </View>
              </Animated.View>
            );
          })}
        </View>
      ))}
    </View>
  );
};
const PrayerTimesDisplay = ({
  prayerKeys,
  accentColor = "#00AEEF",
}: {
  prayerKeys: PrayerKey[];
  accentColor?: string;
}) => {
  if (!prayerKeys?.length)
    return (
      <View className="items-center py-4 px-5 bg-bg rounded-xl border border-fore border-dashed">
        <Text className="text-text-muted font-ibm-plex-arabic text-sm">
          غير مرتبطة بصلاة محددة
        </Text>
      </View>
    );
  return (
    <View className="flex-row-reverse flex-wrap gap-2">
      {prayerKeys.map((key, i) => {
        if (!key) return null;
        return (
          <Animated.View
            key={key}
            entering={FadeInRight.duration(260).delay(i * 80)}
          >
            {/* consistent chip sizing */}
            <Text
              className="text-text-primary py-1.5 px-3 rounded-xl font-ibm-plex-arabic-medium text-xs"
              style={{ backgroundColor: addAlpha(accentColor, 0.6) }}
            >
              {`${key}`}
            </Text>
          </Animated.View>
        );
      })}
    </View>
  );
};

const SuggestedDaysDisplay = ({
  days,
  accentColor = "#00AEEF",
}: {
  days?: string[];
  accentColor?: string;
}) => {
  if (!days?.length)
    return (
      <View className="items-center py-4 px-5 bg-bg rounded-xl border border-fore border-dashed">
        <Text className="text-text-muted font-ibm-plex-arabic text-sm">
          أيام مرنة
        </Text>
      </View>
    );

  return (
    <View className="flex-row-reverse flex-wrap gap-2">
      {days.map((d, i) => {
        return (
          <Animated.View
            key={`${d}-${i}`}
            entering={FadeInRight.duration(260).delay(i * 80)}
          >
            <Text
              className="text-text-primary py-1.5 px-3 rounded-xl font-ibm-plex-arabic-medium text-xs"
              style={{ backgroundColor: addAlpha(accentColor, 0.6) }}
            >
              {d}
            </Text>
          </Animated.View>
        );
      })}
    </View>
  );
};

/** ----- bottom bar (bug fix + hierarchy) ----- */

export const SimpleBottomBar = ({
  label = "أضف إلى عاداتي",
  onPress,
  disabled,
  isLoading,
  color,
}: {
  label?: string;
  onPress: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  color?: string;
}) => {
  const insets = useSafeAreaInsets();

  return (
    <Animated.View
      entering={FadeInDown.delay(300).duration(600)}
      style={{
        position: "absolute",
        height: 65 + (insets?.bottom || 0),
        bottom: 0,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        zIndex: 50,
        elevation: 50,
        width: "100%",
        backgroundColor: color + "1",
      }}
      pointerEvents="box-none"
    >
      <View className="w-full">
        <Animated.View
          style={{
            height: 60,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            backgroundColor: color,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Pressable
            className="w-full h-full items-center justify-center active:opacity-90"
            onPress={onPress}
            disabled={disabled || isLoading}
          >
            {isLoading ? (
              <View className="flex-row items-center gap-2">
                <ActivityIndicator color="#fff" size="small" />
                <Text className="text-white font-ibm-plex-arabic text-base">
                  جاري التسجيل...
                </Text>
              </View>
            ) : (
              <View className="flex-row items-center gap-2">
                <Ionicons name="add-circle" size={18} color="#fff" />
                {/* CTA label one step below H2 */}
                <Text className="text-white font-ibm-plex-arabic-bold text-base">
                  {label}
                </Text>
              </View>
            )}
          </Pressable>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const Skeleton = () => (
  <View className="px-4">
    <View className="bg-fore rounded-2xl p-6 mb-6" />
    <View className="bg-fore rounded-2xl p-6 mb-6" />
    <View className="bg-fore rounded-2xl p-6 mb-6" />
  </View>
);
/** ----- main (hero + order + spacing updated) ----- */

export const HabitShopDetailsScreen: React.FC<HabitShopDetailsScreenProps> = ({
  habit: initialHabit,
  isLoading = false,
  onAddToHabits,
  imageTitleAnimatedStyle,
  onLike,
  isLiked = false,
  isLiking = false,
}) => {
  const [habit, setHabit] = useState(initialHabit);
  const categoryColor = habit?.color || "#00AEEF";
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUserId(user?.id);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!isLoading && habit?.title) {
      AccessibilityInfo.announceForAccessibility(
        `عرض تفاصيل العادة: ${habit.title}. اسحب للأسفل للمزيد من المعلومات.`
      );
    }
  }, [isLoading, habit?.title]);

  /** scroll-driven hero */
  const y = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      y.value = e.contentOffset.y;
    },
  });

  const heroStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      y.value,
      [-60, 0, 200],
      [1.08, 1, 0.96],
      Extrapolate.CLAMP
    );
    const radius = interpolate(y.value, [0, 120], [28, 20], Extrapolate.CLAMP);
    const opacity = interpolate(
      y.value,
      [0, 200],
      [1, 0.94],
      Extrapolate.CLAMP
    );
    return { transform: [{ scale }], borderRadius: radius, opacity };
  });

  const heroTitleStyle = useAnimatedStyle(() => {
    const tY = interpolate(y.value, [0, 120], [0, -6], Extrapolate.CLAMP);
    return { transform: [{ translateY: tY }] };
  });

  return (
    <SafeAreaView className="flex-1 bg-bg relative">
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 140 }}
      >
        {/* hero */}
        <Animated.View
          className="px-4 pt-2 pb-4"
          entering={FadeInDown.duration(420)}
        >
          <Animated.View style={[heroStyle, styles.heroCardShadow]}>
            <LinearGradient
              colors={[
                addAlpha(categoryColor, 0.24),
                addAlpha(categoryColor, 0.07),
              ]}
              start={{ x: 0.1, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <View
                className="w-24 h-24 rounded-2xl items-center justify-center mb-3"
                style={{ backgroundColor: addAlpha(categoryColor, 0.18) }}
              >
                <MaterialCommunityIcons
                  name="star-four-points"
                  size={40}
                  color={categoryColor}
                />
              </View>

              {/* Title and Like Button Row */}
              <View className="flex-row items-center justify-center gap-3 w-full px-4">
                {/* H1 */}
                <Animated.Text
                  style={[heroTitleStyle, imageTitleAnimatedStyle]}
                  className="font-ibm-plex-arabic-semibold text-2xl text-text-primary text-center pb-2 flex-1"
                  accessibilityRole="header"
                >
                  {habit?.title || "—"}
                </Animated.Text>

                {/* Like Button */}
                <Pressable
                  onPress={onLike}
                  disabled={isLiking}
                  className="flex-row items-center"
                  accessibilityLabel={isLiked ? "إلغاء الإعجاب" : "إعجاب"}
                  accessibilityHint="انقر للتفاعل مع العادة"
                >
                  <View className="flex-row items-center gap-1">
                    <MaterialCommunityIcons
                      name={isLiked ? "heart" : "heart-outline"}
                      size={24}
                      color={isLiked ? categoryColor : "#64748B"}
                    />
                    {habit?.likes && (
                      <Text
                        className="font-ibm-plex-arabic-medium text-sm"
                        style={{ color: isLiked ? categoryColor : "#64748B" }}
                      >
                        {habit.likes.length}
                      </Text>
                    )}
                  </View>
                </Pressable>
              </View>
            </LinearGradient>
          </Animated.View>
        </Animated.View>

        {isLoading ? (
          <Skeleton />
        ) : (
          <>
            {/* quote as a callout (secondary) */}
            {!!habit?.quote && (
              <Animated.View
                entering={FadeInDown.delay(200).duration(420)}
                className="px-4 pb-5 "
              >
                <View
                  className="rounded-2xl px-4 py-4 bg-fore"
                  style={{
                    borderLeftWidth: 3,
                    borderRightWidth: 3,
                    borderColor: habit.color,
                  }}
                >
                  <Text className="text-text-secondary font-ibm-plex-arabic text-[15px] text-right leading-7">
                    “{habit.quote}”
                  </Text>
                </View>
              </Animated.View>
            )}
            {/* description first (primary info) */}
            {!!habit?.description && (
              <Section
                icon="text-box"
                title="الوصف"
                delay={80}
                accentColor={categoryColor}
              >
                <Text className="text-text-secondary font-ibm-plex-arabic text-[15px] text-right leading-7">
                  {habit.description}
                </Text>
              </Section>
            )}

            {/* then benefits (key value) */}
            <Section
              icon="star"
              title="الفوائد"
              delay={140}
              accentColor={categoryColor}
            >
              <BenefitsList
                benefits={habit?.benefit || []}
                accentColor={categoryColor}
              />
            </Section>

            {/* prayers */}
            <Section
              icon="moon-waning-crescent"
              title="مرتبطة بصلاة"
              delay={240}
              accentColor={categoryColor}
              rotateY={true}
            >
              <PrayerTimesDisplay
                prayerKeys={habit?.suggestedRelatedSalat || []}
                accentColor={categoryColor}
              />
            </Section>

            {/* days */}
            <Section
              icon="calendar"
              title="أيام مقترحة"
              delay={300}
              accentColor={categoryColor}
            >
              <SuggestedDaysDisplay
                days={habit?.suggestedRelatedDays}
                accentColor={categoryColor}
              />
            </Section>

            {/* Social Section */}
            <Section
              icon="comment-text-multiple"
              title="التعليقات"
              delay={360}
              accentColor={categoryColor}
            >
              <CommentInput
                color={habit.color}
                onSubmit={async (text) => {
                  const result = await addHabitComment(habit.id, text);
                  return { error: result.error, success: !result.error };
                }}
                placeholder="اكتب تعليقاً مفيداً عن هذه العادة..."
                focusedPlaceholder="شاركنا تجربتك مع هذه العادة..."
                helpText="شارك تجربتك مع هذه العادة، كيف أثرت على حياتك، وما هي نصائحك للآخرين"
                onCommentAdded={async () => {
                  // Refresh habit data to get new comments
                  const updatedHabit = await fetchHabitShopById(habit.id);
                  if (updatedHabit) {
                    setHabit(updatedHabit);
                  }
                }}
                className="mb-4"
              />
              {/* Comments List */}
              <View className="space-y-3 gap-3">
                {habit.comments?.length === 0 ? (
                  <Text className="text-text-disabled font-ibm-plex-arabic text-center py-4">
                    لا توجد تعليقات بعد
                  </Text>
                ) : (
                  (habit.comments || []).map((comment, index) => (
                    <Animated.View
                      key={comment.id}
                      entering={FadeInUp.delay(1100 + index * 100).duration(
                        600
                      )}
                      className="bg-fore rounded-2xl p-4 border border-white/10 shadow-sm"
                    >
                      <View className="flex-row-reverse items-start gap-3">
                        <View
                          style={{
                            backgroundColor: addAlpha(categoryColor, 0.18),
                          }}
                          className="w-10 h-10  rounded-full items-center justify-center"
                        >
                          <Text className="text-white font-ibm-plex-arabic-bold text-lg">
                            {comment.userName.substring(0, 1)}
                          </Text>
                        </View>
                        <View className="flex-1">
                          <View className="flex-row-reverse items-center justify-between mb-2">
                            <Text className="text-text-primary font-ibm-plex-arabic-bold text-base">
                              {comment.userName}
                            </Text>
                            <Text className="text-text-secondary font-ibm-plex-arabic-medium text-sm">
                              {formatCommentTime(comment.createdAt)}
                            </Text>
                          </View>
                          <Text className="text-text-primary font-ibm-plex-arabic-medium text-sm text-right leading-5">
                            {comment.text}
                          </Text>
                        </View>
                      </View>
                    </Animated.View>
                  ))
                )}
              </View>
            </Section>
          </>
        )}
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

/** ----- styles (added shadow for hero) ----- */
const styles = StyleSheet.create({
  heroCard: {
    width: "100%",
    borderRadius: 24,
    paddingVertical: 30,
    paddingHorizontal: 16,
    backgroundColor: "transparent",
    alignItems: "center",
  },
  heroCardShadow: {
    // subtle elevation to make hero clearly “on top” of the page
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
});
