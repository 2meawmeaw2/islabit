import React from "react";
import {
  View,
  Text,
  Pressable,
  Platform,
  FlatList,
  Touchable,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export type CardItem = {
  id: string;
  title: string;
  subtitle?: string;
  emoji?: string;
  tint?: string; // background color for the card
  onPress?: () => void; // fallback handled below
};

export type HorizontalCardsSectionProps = {
  title: string;
  items: CardItem[];
  ctaLabel?: string;
  onPressCTA?: () => void;
  cardWidth?: number;
};

const CARD_W_DEFAULT = 220;

const HorizontalCardsSection = ({
  title,
  items,
  ctaLabel = "المزيد",
  onPressCTA,
  cardWidth = CARD_W_DEFAULT,
}: HorizontalCardsSectionProps) => {
  const router = useRouter();

  const renderItem = ({ item }: { item: CardItem }) => (
    <Pressable
      onPress={item.onPress}
      android_ripple={{ color: "#06212A", foreground: true }}
      accessibilityRole="button"
      accessibilityLabel={item.title}
      style={({ pressed }) => [
        {
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        Platform.select({
          ios: {
            shadowColor: "#000",
            shadowOpacity: 0.12,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 8 },
          },
          android: { elevation: 4 },
        }),
      ]}
      className="
        my-2 w-full overflow-hidden rounded-3xl
        border border-border-secondary/30
        bg-fore px-4 py-4
      "
    >
      {/* subtle top highlight */}
      <View className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-border-active/40" />

      <View className="flex-row-reverse items-center justify-between">
        {/* left cluster (RTL): icon + texts */}
        <View className="flex-1 flex-row-reverse items-center gap-4">
          {/* icon pill */}
          <View
            className="
              h-12 w-12 items-center justify-center
              rounded-2xl border border-border-primary/40
              bg-bg/60
            "
          >
            <Ionicons name="apps" size={20} color="#00AEEF" />
          </View>

          {/* text block */}
          <View className="flex-1">
            <Text
              numberOfLines={1}
              className="
                text-right text-[18px]
                font-ibm-plex-arabic-bold
                text-text-primary
              "
            >
              {item.title}
            </Text>

            {!!item.subtitle && (
              <Text
                numberOfLines={1}
                className="
                  mt-0.5 text-right text-[12px]
                  font-ibm-plex-arabic
                  text-text-white/70
                "
              >
                {item.subtitle}
              </Text>
            )}
          </View>
        </View>

        {/* action chip */}
        <Pressable
          onPress={item.onPress}
          hitSlop={8}
          android_ripple={{ color: "#083542", foreground: true }}
          className="
            h-11 px-3 items-center justify-center
            rounded-2xl border border-border-primary/30
            bg-text-brand
          "
          style={({ pressed }) => [
            {
              transform: [{ scale: pressed ? 0.96 : 1 }],
            },
          ]}
        >
          <Ionicons name="arrow-back" size={18} color="#E5F8FF" />
        </Pressable>
      </View>

      {/* soft glow ring on focus/press (visual only) */}
      <View
        pointerEvents="none"
        className="
          absolute inset-0 rounded-3xl
          ring-1 ring-border-primary/10
        "
      />
    </Pressable>
  );

  return (
    <View className="w-full">
      {/* Header */}
      <View className="flex-row-reverse items-center justify-between my-5 mx-3">
        <Text className="font-ibm-plex-arabic-semibold text-text-brand text-right text-[1.7rem]">
          {title}
        </Text>

        <Pressable
          onPress={
            onPressCTA ??
            (() => router.navigate("/(tabs)/home/(habit)/all-habits"))
          }
          style={Platform.select({
            ios: {
              shadowColor: "#000",
              shadowOpacity: 0.06,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
            },
            android: { elevation: 1 },
          })}
          className="rounded-xl px-3 py-2"
        >
          <View className="flex-row-reverse items-center gap-5 bg-text-brand py-[0.6rem] px-3 rounded-xl">
            <Text className="font-ibm-plex-arabic-bold text-[0.8rem] text-text-primary">
              {ctaLabel}
            </Text>
            {/* RTL-friendly: left chevron reads as forward */}
            <Ionicons name="chevron-back" size={16} color="#E5F8FF" />
          </View>
        </Pressable>
      </View>

      {/* Cards rail */}
      <FlatList
        data={items}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 0 }}
        ListEmptyComponent={
          <View className=" my-4">
            <Text className="text-right text-text-brand/70">
              لا توجد عناصر للعرض حاليًا.
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default HorizontalCardsSection;
