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
  addBundleComment,
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
  console.log(bundle);
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
            <Text className="text-text-brand  font-ibm-plex-arabic-semibold text-xl pb-6 text-right">
              العادات في هذه الرحلة
            </Text>

            <View className="gap-4">
              {safeBundle.habits.map((habit, index) => (
                <Animated.View
                  key={index}
                  entering={FadeInUp.delay(500 + index * 100).duration(600)}
                  layout={Layout.springify().damping(20).stiffness(200)}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-3xl border border-gray-700/50 overflow-hidden shadow-lg"
                >
                  {/* Habit Header */}
                  <Pressable
                    onPress={() => toggleHabitDropdown(index)}
                    className="px-6 py-5 active:opacity-80"
                  >
                    <View className="flex-row-reverse items-center gap-4">
                      {/* Habit Icon */}
                      <View className="w-14 h-14 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-2xl items-center justify-center border border-cyan-500/30">
                        <Text className="text-3xl ">{habit.emoji}</Text>
                      </View>

                      {/* Habit Content */}
                      <View className="flex-1">
                        <Text className="text-white font-ibm-plex-arabic-light text-lg text-right mb-1">
                          {habit.title}
                        </Text>
                        <Text className="text-gray-400 font-ibm-plex-arabic-light text-sm text-right">
                          {habit.subtitle || "تفكر ومطمئنة"}
                        </Text>
                      </View>

                      {/* Expand Arrow */}
                      <Animated.View>
                        <View className="w-8 h-8 bg-gray-700/50 rounded-full items-center justify-center">
                          <Ionicons
                            name="chevron-down"
                            size={18}
                            color="#9CA3AF"
                          />
                        </View>
                      </Animated.View>
                    </View>
                  </Pressable>

                  {/* Expanded Content */}
                  {expandedHabits.has(index) && (
                    <Animated.View
                      entering={FadeInUp.duration(300)}
                      exiting={FadeOutUp.duration(300)}
                      layout={Layout.springify().damping(15).stiffness(300)}
                      className="px-6 pb-6 border-t border-gray-700/30"
                    >
                      <View className="pt-5">
                        {/* Description */}
                        <Text className="text-gray-300 font-ibm-plex-arabic text-base leading-6 text-right mb-6">
                          {habit.description || "لا يوجد وصف متاح لهذه العادة."}
                        </Text>

                        {/* Schedule Section */}
                        <View className="space-y-5">
                          {/* Days */}
                          <View>
                            <Text className="text-gray-400 font-ibm-plex-arabic-semibold text-sm mb-3 text-right">
                              أيام التطبيق:
                            </Text>
                            <View className="flex-row-reverse flex-wrap gap-2">
                              {dayNames.map((day, dayIndex) => {
                                const isRelated =
                                  habit.relatedDays?.includes(dayIndex);
                                return isRelated ? (
                                  <View
                                    key={dayIndex}
                                    className="bg-cyan-500/20 border border-cyan-500/40 px-3 py-2 rounded-xl"
                                  >
                                    <Text className="text-cyan-300 text-xs font-ibm-plex-arabic">
                                      {day}
                                    </Text>
                                  </View>
                                ) : null;
                              })}
                            </View>
                          </View>

                          {/* Prayer Times */}
                          <View>
                            <Text className="text-gray-400 font-ibm-plex-arabic-semibold text-sm my-3 text-right">
                              الأوقات المرتبطة:
                            </Text>
                            <View className="flex-row-reverse flex-wrap gap-2">
                              {PRAYERS.map((prayer, prayerIndex) => {
                                const isRelated = habit.relatedSalat?.includes(
                                  prayer.key
                                );
                                return isRelated ? (
                                  <View
                                    key={prayerIndex}
                                    className="bg-blue-500/20 border border-blue-500/40 px-3 py-2 rounded-xl"
                                  >
                                    <Text className="text-blue-300 text-xs font-ibm-plex-arabic">
                                      {prayer.name}
                                    </Text>
                                  </View>
                                ) : null;
                              })}
                            </View>

                            {/* Fallback */}
                            {!habit.relatedSalat ||
                            habit.relatedSalat.length === 0 ? (
                              <Text className="text-gray-500 font-medium text-sm text-right mt-2">
                                يمكن تطبيق هذه العادة في أي وقت
                              </Text>
                            ) : null}
                          </View>
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
              <Text className="text-text-brand font-ibm-plex-arabic-semibold text-xl mb-4 text-right">
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
            onSubmit={async (text) => {
              const result = await addBundleComment(safeBundle.id, text);
              return { error: result.error, success: !result.error };
            }}
            title="شارك تجربتك"
            placeholder="اكتب تعليقاً مفيداً عن هذه الرحلة..."
            focusedPlaceholder="شاركنا رأيك الصادق..."
            helpText="اذكر ما أعجبك، ما يمكن تحسينه، أو أي معلومات مفيدة للمسافرين الآخرين"
            onCommentAdded={handleCommentAdded}
          />

          {/* Comments Section */}
          <Animated.View
            entering={FadeInUp.delay(1000).duration(600)}
            className="px-6 mb-8"
          >
            <Text className="text-text-brand font-ibm-plex-arabic-semibold text-xl mb-4 text-right">
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
