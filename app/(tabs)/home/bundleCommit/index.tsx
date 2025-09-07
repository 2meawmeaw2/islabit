import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  View,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  FadeInUp,
  FadeInRight,
  Layout,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  FadeOutDown,
  FadeOutUp,
  LinearTransition,
} from "react-native-reanimated";
import { PRAYERS } from "@/assets/constants/prayers";
import { shadowStyle } from "@/lib/shadow";
import { CommentInput } from "@/components/CommentInput";
import {
  getBundleComments,
  BundleComment,
  formatCommentTime,
} from "@/lib/bundle-comments";

import { Bundle, toggleBundleLike } from "@/lib/bundles";
import { supabase } from "@/utils/supabase";

const SingleBundleScreen = () => {
  const { bundleData } = useLocalSearchParams<{
    bundleData?: string;
    singlebundle?: string;
  }>();
  const router = useRouter();
  const [expandedHabits, setExpandedHabits] = useState<Set<number>>(new Set());
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<BundleComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef(null);
  // Parse bundle data from params
  useEffect(() => {
    if (bundleData) {
      try {
        const parsedBundle = JSON.parse(bundleData) as Bundle;
        setBundle(parsedBundle);
        // Initialize likes count from the likes array length
        setLikesCount(parsedBundle.likes?.length || 0);

        // Check if current user has already liked this bundle
        const checkIfLiked = async () => {
          try {
            const { data: user } = await supabase.auth.getUser();
            const userId = user.user?.id;
            if (userId && parsedBundle.likes) {
              setIsLiked(parsedBundle.likes.includes(userId));
            } else {
              setIsLiked(false);
            }
          } catch (error) {
            console.error("Error checking like status:", error);
            setIsLiked(false);
          }
        };

        checkIfLiked();
      } catch (parseError) {
        console.error("Error parsing bundle data:", parseError);
        setError("خطأ في تحليل بيانات الحزمة");
      }
    } else {
      setError("لم يتم العثور على بيانات الحزمة");
    }
  }, [bundleData]);

  // Safety check - if no bundle found at all, redirect to home

  // Ensure bundle has required properties
  const safeBundle = bundle
    ? {
        id: bundle.id || "unknown",
        title: bundle.title || "عنوان غير محدد",
        subtitle: bundle.subtitle || "وصف فرعي غير محدد",
        description: bundle.description || "وصف غير محدد",
        category: bundle.category || { text: "عام", hexColor: "#8B5CF6" },
        habits: Array.isArray(bundle.habits) ? bundle.habits : [],
        benefits: Array.isArray(bundle.benefits) ? bundle.benefits : [],
        comments: Array.isArray(bundle.comments) ? bundle.comments : [],
        likes: bundle.likes || [],
        enrolled_users: bundle.enrolled_users,
        user_has_liked: bundle.user_has_liked || isLiked,
      }
    : null;

  const fetchComments = async () => {
    if (!safeBundle?.id) return;
    setCommentsLoading(true);
    const comments = await getBundleComments(safeBundle.id);
    setComments(comments);
    setCommentsLoading(false);
  };

  // Function to refresh comments after new comment is added
  const handleCommentAdded = () => {
    fetchComments();
  };

  // Function to handle likes
  const handleToggleLike = async () => {
    if (!safeBundle?.id) return;

    try {
      // Optimistic update
      const newLikedState = !isLiked;
      const newLikesCount = newLikedState
        ? likesCount + 1
        : Math.max(0, likesCount - 1);

      setIsLiked(newLikedState);
      setLikesCount(newLikesCount);

      // Update in Supabase
      await toggleBundleLike(safeBundle.id, newLikedState);
    } catch (error) {
      console.error("Error toggling like:", error);
      // Revert on error
      setIsLiked(!isLiked);
      setLikesCount(isLiked ? likesCount + 1 : Math.max(0, likesCount - 1));
      Alert.alert("خطأ", "حدث خطأ أثناء تحديث الإعجاب، يرجى المحاولة مرة أخرى");
    }
  };

  // Fetch comments when bundle is loaded
  useEffect(() => {
    if (safeBundle?.id) {
      fetchComments();
    }
  }, [safeBundle?.id]);

  // Animated values for arrow rotations
  const arrowRotations = useSharedValue<{ [key: number]: number }>({});

  // track scroll to reveal the header title after some offset
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const titleAnimatedStyle = useAnimatedStyle(() => {
    const visible = scrollY.value > 150;
    return {
      opacity: withTiming(visible ? 1 : 0, { duration: 200 }),
      transform: [
        { translateY: withTiming(visible ? 0 : 6, { duration: 200 }) },
      ],
    };
  });

  const imageTitleAnimatedStyle = useAnimatedStyle(() => {
    const visible = scrollY.value <= 150;
    return {
      opacity: withTiming(visible ? 1 : 0, { duration: 200 }),
      transform: [
        { translateY: withTiming(visible ? 0 : -6, { duration: 200 }) },
      ],
    };
  });

  const benefits: string[] = safeBundle?.benefits ?? [];

  // Arabic day names for the week
  const dayNames = [
    "الأحد", // Sunday
    "الإثنين", // Monday
    "الثلاثاء", // Tuesday
    "الأربعاء", // Wednesday
    "الخميس", // Thursday
    "الجمعة", // Friday
    "السبت", // Saturday
  ];

  // Comments are now fetched from Supabase and stored in state

  // Function to toggle habit dropdown
  const toggleHabitDropdown = (index: number) => {
    const newExpandedHabits = new Set(expandedHabits);
    if (newExpandedHabits.has(index)) {
      newExpandedHabits.delete(index);
      // Animate arrow back to 0 degrees
      arrowRotations.value[index] = withTiming(0, { duration: 300 });
    } else {
      newExpandedHabits.add(index);
      // Animate arrow to 180 degrees
      arrowRotations.value[index] = withTiming(180, { duration: 300 });
    }
    setExpandedHabits(newExpandedHabits);
  };

  // Create animated styles for arrow rotations at the top level
  const arrowAnimatedStyles = Array.from({ length: 10 }, (_, index) =>
    useAnimatedStyle(() => {
      const rotation = arrowRotations.value[index] || 0;
      return {
        transform: [{ rotate: `${rotation}deg` }],
      };
    })
  );

  // Function to handle enrolling in bundle
  const handleEnroll = async () => {
    if (!safeBundle) return;

    router.push({
      pathname: "/home/bundleCommit/bundleConfirm",
      params: {
        bundleData: JSON.stringify(bundle),
      },
    });
  };

  // Show loading state

  // Show error state
  if (error || !safeBundle) {
    return (
      <SafeAreaView className="flex-1 bg-bg">
        <View className="flex-1 justify-center items-center px-6">
          <Text className="font-ibm-plex-arabic text-red-500 text-center mb-4">
            {error || "لم يتم العثور على الحزمة"}
          </Text>
          <Pressable
            onPress={() => router.navigate("/(tabs)/home")}
            className="bg-fore px-6 py-3 rounded-full"
          >
            <Text className="font-ibm-plex-arabic text-text-primary">
              العودة للرئيسية
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView ref={scrollViewRef} className="flex-1 bg-bg">
      {/* Modern Header */}
      <View className="flex-row-reverse items-center justify-between px-6 py-4 bg-fore border-b border-white/10">
        <Animated.Text
          style={titleAnimatedStyle as any}
          className="font-ibm-plex-arabic-bold text-xl text-text-brand"
        >
          {safeBundle.title}
        </Animated.Text>
        <Pressable
          onPress={() => router.navigate("/(tabs)/home")}
          className="w-8 h-8 bg-white/10 rounded-full items-center justify-center"
        >
          <Ionicons name="close" size={20} color="#fff" />
        </Pressable>
      </View>

      <Animated.ScrollView
        contentContainerClassName="pb-32"
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        className="flex-1"
      >
        {/* Hero Section */}
        <View className="relative h-80 mb-8">
          <Image
            source={{ uri: bundle?.image_url || "" }}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              width: "100%",
              height: "100%",
              borderBottomLeftRadius: 40,
              borderBottomRightRadius: 40,
            }}
            resizeMode="cover"
          />

          {/* Dark overlay for better text readability */}
          <View className="absolute inset-0 bg-black/40" />

          {/* Content overlay */}
          <View className="flex-1 justify-end items-end p-6">
            <Animated.View style={imageTitleAnimatedStyle as any}>
              <View className="self-end  rounded-full mb-3">
                <Text
                  style={{
                    color: safeBundle.category.hexColor,
                  }}
                  className="font-ibm-plex-arabic pb-2 text-sm text-white"
                >
                  {safeBundle.category.text}
                </Text>
              </View>
              <Text className="font-ibm-plex-arabic-bold text-3xl text-white mb-3 leading-tight">
                {safeBundle.title}
              </Text>
              {/* Category Tag */}

              <Animated.View
                entering={FadeInRight.delay(200).duration(600)}
                className="flex-row items-end justify-end mr-1 gap-4"
              >
                <Animated.View
                  entering={FadeInRight.delay(200).duration(600)}
                  className="flex-row items-center gap-1"
                >
                  <Pressable
                    onPress={handleToggleLike}
                    hitSlop={10}
                    style={{ opacity: 1 }}
                  >
                    <Ionicons
                      name={isLiked ? "heart" : "heart-outline"}
                      size={18}
                      color={isLiked ? "#DC2626" : "#fff"}
                    />
                  </Pressable>
                  <Text className="text-white font-ibm-plex-arabic-semibold text-sm">
                    {likesCount}
                  </Text>
                </Animated.View>
                <Animated.View
                  entering={FadeInRight.delay(200).duration(600)}
                  className="flex-row items-center gap-1"
                >
                  <Ionicons name="download" size={16} color="#9CA3AF" />
                  <Text className="text-gray-300 font-ibm-plex-arabic-medium text-sm">
                    {safeBundle.enrolled_users.length}
                  </Text>
                </Animated.View>
              </Animated.View>
            </Animated.View>
          </View>
        </View>

        {/* Description Section */}
        <Animated.View
          entering={FadeInUp.delay(200).duration(600)}
          className="px-6 mb-8"
        >
          <Text className="text-text-primary font-ibm-plex-arabic text-base leading-6 text-right">
            {safeBundle.description}
          </Text>
        </Animated.View>

        {/* Habits Section */}
        {safeBundle.habits.length > 0 && (
          <Animated.View
            entering={FadeInUp.delay(400).duration(600)}
            className="px-6 mb-8"
          >
            <Text className="text-text-brand font-ibm-plex-arabic-bold text-xl pb-4 text-right">
              العادات في هذه الرحلة
            </Text>
            <View className="gap-3">
              {safeBundle.habits.map((h: any, i: number) => (
                <Animated.View
                  key={i}
                  entering={FadeInUp.delay(500 + i * 100).duration(600)}
                  layout={Layout.springify().damping(20).stiffness(200)}
                  className="bg-fore rounded-2xl border border-white/10 shadow-sm overflow-hidden"
                >
                  {/* Habit Header - Clickable */}
                  <Pressable
                    onPress={() => toggleHabitDropdown(i)}
                    className="px-4 py-3 active:opacity-80"
                  >
                    <View className="flex-row-reverse items-center gap-3">
                      {/* Habit emoji - only show if emoji exists */}
                      {typeof h !== "string" && h.emoji && (
                        <View className="w-10 h-10 bg-white/10 rounded-xl items-center justify-center">
                          <Text className="text-2xl">{h.emoji}</Text>
                        </View>
                      )}

                      {/* Habit content */}
                      <View className="flex-1">
                        <Text
                          style={{ paddingBottom: 6 }}
                          className="text-text-primary  font-ibm-plex-arabic  text-2sm text-right "
                        >
                          {typeof h === "string" ? h : h.title}
                        </Text>
                        <Text className="text-text-disabled font-ibm-plex-arabic-light text-xs text-right pb-2">
                          {typeof h === "string"
                            ? "عادة مهمة لتحسين حياتك اليومية"
                            : h.subtitle || "عادة مهمة لتحسين حياتك اليومية"}
                        </Text>
                      </View>

                      {/* Expandable Arrow */}
                      <Animated.View style={arrowAnimatedStyles[i] || {}}>
                        <Ionicons
                          name="chevron-down"
                          size={20}
                          color="#9CA3AF"
                        />
                      </Animated.View>
                    </View>
                  </Pressable>

                  {/* Dropdown Content */}
                  {expandedHabits.has(i) && (
                    <Animated.View
                      entering={FadeInUp.duration(300)}
                      exiting={FadeOutUp.duration(300)}
                      layout={Layout.springify().damping(15).stiffness(300)}
                      className="px-4 pb-4 border-t border-white/10"
                    >
                      <View className="pt-4">
                        <Text className="text-text-primary font-ibm-plex-arabic text-sm leading-6 text-right mb-3">
                          {typeof h === "string"
                            ? "عادة مهمة لتحسين حياتك اليومية"
                            : h.description || "لا يوجد وصف متاح لهذه العادة."}
                        </Text>

                        {/* Habit Schedule - Days */}
                        <View className="mb-3">
                          <Text className="text-text-secondary font-ibm-plex-arabic-medium text-xs mb-2 text-right">
                            أيام التطبيق:
                          </Text>
                          <View className="flex-row-reverse flex-wrap gap-1">
                            {dayNames.map((day, index) => {
                              const isRelated =
                                typeof h !== "string" &&
                                Array.isArray(h.relatedDays) &&
                                h.relatedDays.includes(index);

                              return (
                                <>
                                  {isRelated && (
                                    <View
                                      key={index}
                                      className={`px-2 py-1 rounded-full items-center justify-center `}
                                    >
                                      <Text
                                        className={`text-xs font-ibm-plex-arabic-medium text-text-brand`}
                                        numberOfLines={1}
                                      >
                                        {day}
                                      </Text>
                                    </View>
                                  )}
                                </>
                              );
                            })}
                          </View>
                        </View>

                        {/* Habit Schedule - Salats */}
                        <View>
                          <Text className="text-text-secondary font-ibm-plex-arabic-medium text-xs mb-2 text-right">
                            الأوقات المرتبطة:
                          </Text>
                          <View className="flex-row-reverse flex-wrap gap-2">
                            {PRAYERS.map((prayer, index) => {
                              const isRelated =
                                typeof h !== "string" &&
                                Array.isArray(h.relatedSalat) &&
                                h.relatedSalat.includes(prayer.key);

                              return (
                                <>
                                  {isRelated && (
                                    <View
                                      key={index}
                                      className={`px-2 py-1 rounded-full`}
                                    >
                                      <Text
                                        className={`text-xs font-ibm-plex-arabic-medium text-text-brand`}
                                      >
                                        {prayer.name}
                                      </Text>
                                    </View>
                                  )}
                                </>
                              );
                            })}
                          </View>

                          {/* Fallback for habits without specific salat info */}
                          {typeof h !== "string" &&
                            (!Array.isArray(h.relatedSalat) ||
                              h.relatedSalat.length === 0) && (
                              <Text className="text-text-disabled font-ibm-plex-arabic text-xs text-right mt-2">
                                يمكن تطبيق هذه العادة في أي وقت
                              </Text>
                            )}
                        </View>
                      </View>
                    </Animated.View>
                  )}
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        )}

        <Animated.View layout={LinearTransition}>
          {benefits.length > 0 && (
            <Animated.View
              entering={FadeInUp.delay(600).duration(600)}
              className="px-6 mb-8"
            >
              <Text className="text-text-brand font-ibm-plex-arabic-bold text-xl mb-4 text-right">
                الفوائد الرئيسية
              </Text>
              <View className="gap-3">
                {benefits.map((b, idx) => (
                  <Animated.View
                    key={idx}
                    entering={FadeInUp.delay(700 + idx * 100).duration(600)}
                    className="flex-row-reverse items-start gap-3"
                  >
                    <View className="w-6 h-6 bg-text-brand rounded-full items-center justify-center mt-0.5">
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    </View>
                    <Text className="text-text-primary font-ibm-plex-arabic text-base text-right flex-1 leading-6">
                      {b}
                    </Text>
                  </Animated.View>
                ))}
              </View>
            </Animated.View>
          )}

          {/* Comment Input Section */}
          <CommentInput
            bundleId={safeBundle.id}
            onCommentAdded={handleCommentAdded}
          />

          {/* Comments Section */}
          <Animated.View
            entering={FadeInUp.delay(1000).duration(600)}
            className="px-6 mb-8"
          >
            <Text className="text-text-brand font-ibm-plex-arabic-bold text-xl mb-4 text-right">
              التعليقات ({comments.length})
            </Text>

            {commentsLoading ? (
              <View className="items-center py-8">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="text-text-secondary font-ibm-plex-arabic text-sm mt-2">
                  جاري تحميل التعليقات...
                </Text>
              </View>
            ) : comments.length > 0 ? (
              <View className="gap-3">
                {comments.map((comment, idx) => (
                  <Animated.View
                    key={comment.id}
                    entering={FadeInUp.delay(1100 + idx * 100).duration(600)}
                    className="bg-fore rounded-2xl p-4 border border-white/10 shadow-sm"
                  >
                    <View className="flex-row-reverse items-start gap-3">
                      <View className="w-10 h-10 bg-sky-500 rounded-full items-center justify-center">
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
                ))}
              </View>
            ) : (
              <View className="items-center py-8">
                <Ionicons name="chatbubble-outline" size={48} color="#9CA3AF" />
                <Text className="text-text-secondary font-ibm-plex-arabic text-base mt-3 text-center">
                  لا توجد تعليقات بعد
                </Text>
                <Text className="text-text-disabled font-ibm-plex-arabic-light text-sm mt-1 text-center">
                  كن أول من يشارك تجربته مع هذه الرحلة
                </Text>
              </View>
            )}
          </Animated.View>
        </Animated.View>
      </Animated.ScrollView>

      {/* Modern Call-to-Action Button */}
      <View
        className="absolute left-6 right-6"
        style={{
          bottom: (insets?.bottom || 0) + 20,
          zIndex: 50,
          elevation: 50,
        }}
        pointerEvents="box-none"
      >
        <Pressable
          className="bg-sky-500 rounded-2xl py-5 items-center shadow-lg"
          onPress={handleEnroll}
          style={shadowStyle({
            color: "#000",
            offset: { width: 0, height: 4 },
            opacity: 0.1,
            radius: 12,
          })}
        >
          <Text className="text-white font-ibm-plex-arabic-bold text-lg">
            ابدأ رحلتي
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default SingleBundleScreen;
