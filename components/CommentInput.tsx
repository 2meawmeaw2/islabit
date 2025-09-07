import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  Keyboard,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  FadeInUp,
  FadeOutDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  withSequence,
  LinearTransition,
  FadeInLeft,
  FadeOutLeft,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/lib/auth";
import { addBundleComment } from "@/lib/bundle-comments";
import { scrollTo } from "react-native-reanimated";

interface CommentInputProps {
  bundleId: string;
  onCommentAdded: () => void;
}

export function CommentInput({ bundleId, onCommentAdded }: CommentInputProps) {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [inputHeight, setInputHeight] = useState(60);
  const inputRef = useRef<TextInput>(null);

  // Animation values
  const containerHeight = useSharedValue(60);
  const submitButtonScale = useSharedValue(0);
  const submitButtonOpacity = useSharedValue(0);
  const borderOpacity = useSharedValue(0.1);
  const shadowOpacity = useSharedValue(0);
  const backgroundScale = useSharedValue(1);
  const headerOpacity = useSharedValue(1);
  const charCountOpacity = useSharedValue(0);

  // Enhanced haptic feedback
  const triggerHaptic = (
    type: "light" | "medium" | "heavy" | "success" | "warning"
  ) => {
    if (Platform.OS === "ios") {
      switch (type) {
        case "light":
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case "medium":
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case "heavy":
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case "success":
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case "warning":
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
      }
    }
  };

  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(backgroundScale.value, { damping: 20 }) }],
    shadowOpacity: withTiming(shadowOpacity.value, { duration: 300 }),
    elevation: withTiming(shadowOpacity.value * 10, { duration: 300 }),
  }));

  const inputContainerAnimatedStyle = useAnimatedStyle(() => ({
    height: withSpring(containerHeight.value, { damping: 15, stiffness: 150 }),
    borderColor: `rgba(255, 255, 255, ${withTiming(borderOpacity.value, { duration: 300 })})`,
  }));

  const submitButtonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(submitButtonOpacity.value, { duration: 250 }),
    transform: [
      {
        scale: withSpring(submitButtonScale.value, {
          damping: 12,
          stiffness: 200,
        }),
      },
    ],
  }));

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: withTiming(headerOpacity.value === 1 ? 0 : -10, {
          duration: 200,
        }),
      },
    ],
  }));

  const charCountAnimatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(charCountOpacity.value, { duration: 200 }),
  }));

  // Handle content size change for dynamic height
  const handleContentSizeChange = (event: any) => {
    const { height } = event.nativeEvent.contentSize;
    const newHeight = Math.max(
      isExpanded ? Math.max(height + 80, 120) : 60, // 80px for padding and controls
      Math.min(height + 80, 250) // Max height 250px
    );

    setInputHeight(newHeight);
    containerHeight.value = newHeight;
  };

  // Handle input focus with enhanced animations
  const handleInputFocus = () => {
    triggerHaptic("light");
    setIsFocused(true);
    setIsExpanded(true);

    // Calculate initial height based on current content
    const baseHeight = Math.max(120, inputHeight);
    containerHeight.value = baseHeight;

    submitButtonScale.value = 1;
    submitButtonOpacity.value = 1;
    borderOpacity.value = 0.3;
    shadowOpacity.value = 0.15;
    backgroundScale.value = 1.02;
    headerOpacity.value = 0.7;
    charCountOpacity.value = 1;
  };

  // Handle input blur with smooth collapse
  const handleInputBlur = () => {
    setIsFocused(false);

    if (!commentText.trim()) {
      setIsExpanded(false);
      setInputHeight(60);
      containerHeight.value = 60;
      submitButtonScale.value = 0;
      submitButtonOpacity.value = 0;
      borderOpacity.value = 0.1;
      shadowOpacity.value = 0;
      backgroundScale.value = 1;
      headerOpacity.value = 1;
      charCountOpacity.value = 0;
    }
  };

  // Enhanced text change handler
  const handleTextChange = (text: string) => {
    setCommentText(text);

    // Subtle haptic for typing (throttled)
    if (text.length % 15 === 0 && text.length > 0) {
      triggerHaptic("light");
    }
  };

  // Enhanced submit with better UX
  const handleSubmitComment = async () => {
    if (!user) {
      triggerHaptic("warning");
      return Alert.alert("خطأ", "يجب تسجيل الدخول أولاً");
    }

    if (!commentText.trim()) {
      triggerHaptic("warning");
      return Alert.alert("تنبيه", "يرجى كتابة تعليق مفيد");
    }

    triggerHaptic("medium");
    setIsSubmitting(true);

    // Button press animation
    submitButtonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );

    try {
      const result = await addBundleComment(bundleId, commentText.trim());

      if (result.error) {
        triggerHaptic("warning");
        Alert.alert("خطأ", result.error);
      } else {
        triggerHaptic("success");

        // Success animation sequence
        backgroundScale.value = withSequence(
          withTiming(1.05, { duration: 150 }),
          withTiming(1, { duration: 200 })
        );

        // Reset form with animation
        setCommentText("");
        setIsExpanded(false);
        setIsFocused(false);
        setInputHeight(60);
        containerHeight.value = 60;
        submitButtonScale.value = 0;
        submitButtonOpacity.value = 0;
        borderOpacity.value = 0.1;
        shadowOpacity.value = 0;
        backgroundScale.value = 1;
        headerOpacity.value = 1;
        charCountOpacity.value = 0;

        // Dismiss keyboard
        Keyboard.dismiss();
        inputRef.current?.blur();

        onCommentAdded();
        Alert.alert("تم", "تم إضافة تعليقك بنجاح ✨");
      }
    } catch (err) {
      console.error("Error submitting comment:", err);
      triggerHaptic("warning");
      Alert.alert("خطأ", "حدث خطأ غير متوقع");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick action for clearing text
  const handleClearText = () => {
    triggerHaptic("light");
    setCommentText("");
    setInputHeight(120);
    containerHeight.value = 120;
    inputRef.current?.focus();
  };

  // Don't show if user is not authenticated
  if (!user) {
    return null;
  }

  const isButtonDisabled = isSubmitting || !commentText.trim();
  const characterCount = commentText.length;
  const characterProgress = characterCount / 500;
  const isNearLimit = characterProgress > 0.8;

  return (
    <Animated.View
      entering={FadeInUp.delay(1200).duration(800).springify()}
      exiting={FadeOutDown.duration(400)}
      className="px-6 mb-6"
    >
      {/* Header with subtle animation */}
      <Animated.View style={headerAnimatedStyle}>
        <View className="flex-row-reverse items-center justify-between mb-4">
          <Text className="text-text-brand font-ibm-plex-arabic-bold text-lg text-right">
            شارك تجربتك
          </Text>
        </View>
      </Animated.View>

      {/* Main Input Container */}
      <Animated.View
        style={[containerAnimatedStyle]}
        className="bg-fore rounded-2xl border overflow-hidden"
      >
        <Animated.View
          style={inputContainerAnimatedStyle}
          className="border-2 rounded-2xl"
        >
          {/* Input Field */}
          <View className="px-5 mt-1  flex-1">
            <TextInput
              ref={inputRef}
              value={commentText}
              onChangeText={handleTextChange}
              onContentSizeChange={handleContentSizeChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder={
                isFocused
                  ? "شاركنا رأيك الصادق..."
                  : "اكتب تعليقاً مفيداً عن هذه الرحلة..."
              }
              placeholderTextColor={isFocused ? "#6B7280" : "#9CA3AF"}
              multiline={true}
              textAlign="right"
              maxLength={500}
              scrollEnabled={false}
              className="text-text-primary font-ibm-plex-arabic text-base leading-6 flex-1"
              style={{
                textAlignVertical: "top",
                minHeight: 20,
              }}
              returnKeyType="default"
              blurOnSubmit={false}
            />
          </View>

          {/* Bottom Bar */}
          {isExpanded && (
            <Animated.View
              entering={FadeInUp.duration(300)}
              className="px-5 justify-center  py-3 border-t border-white/5"
            >
              <View className="flex-row-reverse justify-between items-center">
                {/* Character Count with Progress */}
                <Animated.View
                  style={charCountAnimatedStyle}
                  className="flex-row-reverse items-center gap-2"
                >
                  <Text
                    className={`font-ibm-plex-arabic-light text-xs ${
                      isNearLimit ? "text-orange-400" : "text-text-disabled"
                    }`}
                  >
                    {characterCount}/500
                  </Text>

                  {/* Progress indicator */}
                  <View className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                    <Animated.View
                      className={`h-full rounded-full ${
                        isNearLimit ? "bg-orange-400" : "bg-sky-500"
                      }`}
                      style={{
                        width: `${Math.min(characterProgress * 100, 100)}%`,
                      }}
                    />
                  </View>
                </Animated.View>

                {/* Action Buttons */}
                <View className="flex-row items-center gap-2">
                  {/* Clear Button */}
                  {commentText.length > 0 && (
                    <Animated.View
                      entering={FadeInLeft.duration(300)}
                      exiting={FadeOutLeft.duration(200)}
                    >
                      <Pressable
                        onPress={handleClearText}
                        className="p-2 rounded-full bg-white/10"
                        style={({ pressed }) => ({
                          opacity: pressed ? 0.7 : 1,
                        })}
                      >
                        <Ionicons name="close" size={14} color="#9CA3AF" />
                      </Pressable>
                    </Animated.View>
                  )}

                  {/* Submit Button */}
                  <Animated.View
                    layout={LinearTransition}
                    style={submitButtonAnimatedStyle}
                  >
                    <Pressable
                      onPress={handleSubmitComment}
                      disabled={isButtonDisabled}
                      className={`px-5 py-3 rounded-full flex-row items-center gap-2 ${
                        isButtonDisabled ? "bg-white/10" : "bg-sky-500"
                      }`}
                      style={({ pressed }) => ({
                        opacity: pressed && !isButtonDisabled ? 0.9 : 1,
                        transform:
                          pressed && !isButtonDisabled
                            ? [{ scale: 0.98 }]
                            : [{ scale: 1 }],
                      })}
                    >
                      {isSubmitting ? (
                        <>
                          <ActivityIndicator size="small" color="#fff" />
                          <Text className="text-white font-ibm-plex-arabic-medium text-sm">
                            جاري الإرسال...
                          </Text>
                        </>
                      ) : (
                        <>
                          <Ionicons
                            name="send"
                            size={16}
                            color={isButtonDisabled ? "#6B7280" : "#fff"}
                          />
                          <Text
                            className={`font-ibm-plex-arabic-medium text-sm ${
                              isButtonDisabled ? "text-gray-400" : "text-white"
                            }`}
                          >
                            إرسال
                          </Text>
                        </>
                      )}
                    </Pressable>
                  </Animated.View>
                </View>
              </View>
            </Animated.View>
          )}
        </Animated.View>
      </Animated.View>

      {/* Helpful Tips (shown when focused for first time) */}
      {isExpanded && (
        <Animated.View
          entering={FadeInUp.delay(500).duration(400)}
          exiting={FadeOutDown.duration(200)}
          className="mt-3 px-4"
        >
          <Text className="text-text-disabled font-ibm-plex-arabic-light text-xs text-right leading-5">
            اذكر ما أعجبك، ما يمكن تحسينه، أو أي معلومات مفيدة للمسافرين الآخرين
          </Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}
