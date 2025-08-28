import React, { memo, useCallback, useMemo, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Keyboard,
  Platform,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { habits } from "@/lib/habits";

// ---- functions unrelated to gestures
const todayIdx = new Date().getDay();
const vibrate = (type: "selection" | "success" | "impact" = "selection") => {
  import("expo-haptics")
    .then((H) => {
      if (type === "success")
        H.notificationAsync(H.NotificationFeedbackType.Success);
      else if (type === "impact") H.impactAsync(H.ImpactFeedbackStyle.Medium);
      else H.selectionAsync();
    })
    .catch(() => {});
};
const HabitCard = memo(
  ({
    item,
    weeklyChecks,
    onToggleDay,
    onToggleToday,
    openDetails,
  }: {
    item: (typeof habits)[number];
    weeklyChecks: boolean[];
    onToggleDay: (id: number, dayIdx: number) => void;
    onToggleToday: (id: number) => void;
    openDetails: (id: number) => void;
  }) => {
    const committedToday = weeklyChecks[todayIdx];

    return (
      <View className="bg-fore border border-border-secondary rounded-2xl p-4 mb-3">
        {/* header */}
        <View className="flex-row items-start  justify-between">
          <View className="w-12 h-12 rounded-full  translate-y-[10%] border border-border-primary items-center bg-bg justify-center ml-2">
            <Text className="text-2xl">{item.emoji}</Text>
          </View>

          <View className="flex-1 items-end ">
            <Pressable
              onPress={() => openDetails(item.id)}
              accessibilityRole="button"
              android_ripple={{ borderless: false }}
              hitSlop={8}
            >
              <Text className="my-2 font-ibm-plex-arabic-bold  text-text-primary text-lg text-right ">
                {item.habitName}
              </Text>
            </Pressable>

            <View className="flex-row-reverse  gap-2 mt-1 -mr-[2px]">
              <View className="px-3 py-1 rounded-full bg-bg border border-border-primary">
                <Text className="font-ibm-plex-arabic text-text-primary text-[10px]">
                  🎯 {item.targetPerWeek}
                </Text>
              </View>
              <View className="px-3 py-1 rounded-full bg-bg border border-border-primary">
                <Text className="font-ibm-plex-arabic text-text-primary text-[10px]">
                  ⏰ {item.bestTime}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* why */}
        {!!item.why && (
          <View className="flex flex-row-reverse gap-1">
            <Text
              numberOfLines={2}
              className="font-ibm-plex-arabic-light text-sm text-text-brand text-right mt-3"
            >
              فضلها :
            </Text>
            <Text
              numberOfLines={2}
              className="font-ibm-plex-arabic-extralight text-sm text-text-secondary/90 text-right mt-3"
            >
              {item.why}
            </Text>
          </View>
        )}

        {/* actions */}
        <View className="flex-row-reverse gap-8 items-center mt-4">
          <Pressable
            onPress={() => {
              vibrate(committedToday ? "impact" : "success");
              onToggleToday(item.id);
            }}
            className={`flex-1 rounded-lg py items-center justify-center h-[34px]  ${
              committedToday
                ? "bg-fore border border-text-brand"
                : "bg-text-brand"
            }`}
            android_ripple={{ borderless: false }}
          >
            <Text
              className={`font-ibm-plex-arabic text-md ${
                committedToday ? "text-text-brand" : "text-bg"
              }`}
            >
              {committedToday ? "تم الالتزام اليوم ✓" : "التزم اليوم"}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => openDetails(item.id)}
            className="px-4 justify-center items-center rounded-lg border border-border-secondary bg-fore h-[35px]"
            android_ripple={{ borderless: false }}
          >
            <Text className="font-ibm-plex-arabic-extralight text-md text-text-primary">
              تفاصيل
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }
);
export default HabitCard;
