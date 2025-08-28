// screens/FreeCommit.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Keyboard,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOutUp,
  LinearTransition,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

type Preset = "15" | "30" | "60" | "90" | "custom";

const Chip = ({
  label,
  selected,
  onPress,
  testID,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  testID?: string;
}) => (
  <Pressable
    testID={testID}
    accessibilityRole="button"
    accessibilityState={{ selected: !!selected }}
    accessibilityLabel={label}
    onPress={onPress}
    android_ripple={{ color: "#F3F4F6", borderless: false }} // Replaced rgba(0,0,0,0.08) with solid light gray
    className={[
      "px-4 py-2 rounded-full border",
      selected
        ? "bg-text-brand border-text-brand"
        : "bg-fore/70 border-border-primary",
    ].join(" ")}
  >
    <Text
      className={[
        "font-ibm-plex-arabic-medium",
        selected ? "text-fore" : "text-text-primary",
      ].join(" ")}
      style={{ writingDirection: "rtl" }}
    >
      {label}
    </Text>
  </Pressable>
);

const AnimatedSafeAreaView = Animated.createAnimatedComponent(SafeAreaView);

const FreeCommit: React.FC = () => {
  const [selected, setSelected] = useState<Preset>("30");
  const [customMinutes, setCustomMinutes] = useState("");

  const parsedMinutes =
    selected === "custom"
      ? (() => {
          const n = parseInt(customMinutes.replace(/[^\d]/g, ""), 10);
          return Number.isFinite(n) && n > 0 ? n : undefined;
        })()
      : parseInt(selected, 10);

  const canStart = Boolean(parsedMinutes && parsedMinutes > 0);

  const onStart = () => {
    Keyboard.dismiss();
    // TODO: integrate with your feature logic.
    // You have `parsedMinutes` (number) and `selected` preset.
  };
  const router = useRouter();

  return (
    <AnimatedSafeAreaView entering={FadeIn} className="flex-1 bg-bg">
      <Pressable
        onPress={() => router.navigate("/(tabs)/home")}
        accessibilityRole="button"
        accessibilityLabel="رجوع"
        android_ripple={{ color: "white", borderless: true }}
        className="mt-3 ml-3 w-12 border-white border-[1px] p-2 rounded-full"
      >
        <Ionicons name="arrow-back" size={24} color="#ffffff" />
      </Pressable>
      <Animated.View
        layout={LinearTransition}
        className="flex-1 items-center justify-center px-6 gap-8"
      >
        <Animated.View
          layout={LinearTransition}
          className="w-full items-center"
        >
          <Text
            className="text-2xl font-ibm-plex-arabic-semibold text-text-primary mb-2"
            style={{ writingDirection: "rtl" }}
          >
            اختر المدّة
          </Text>
          <Text
            className="text-center text-text-secondary font-ibm-plex-arabic-medium"
            style={{ writingDirection: "rtl" }}
          >
            كم من الوقت تريد التفرّغ فيه؟
          </Text>
        </Animated.View>

        <Animated.View
          layout={LinearTransition}
          className="w-full items-center"
        >
          <View className="flex-row flex-wrap-reverse gap-2 justify-center">
            {(["15", "30", "60", "90"] as const).map((m) => (
              <Chip
                key={m}
                testID={`chip-${m}`}
                label={
                  m === "60" ? "ساعة" : m === "90" ? "ساعة ونصف" : `${m} دقيقة`
                }
                selected={selected === m}
                onPress={() => setSelected(m)}
              />
            ))}
            <Chip
              testID="chip-custom"
              label="مخصّص"
              selected={selected === "custom"}
              onPress={() => setSelected("custom")}
            />
          </View>

          {selected === "custom" && (
            <Animated.View
              entering={FadeIn.duration(800)}
              exiting={FadeOutUp}
              className="mt-3 w-11/12 self-center flex-row-reverse items-center gap-3"
            >
              <View className="flex-1 rounded-xl border border-border-primary bg-fore px-4 py-3">
                <TextInput
                  inputMode="numeric"
                  keyboardType={Platform.select({
                    ios: "number-pad",
                    android: "numeric",
                    default: "numeric",
                  })}
                  placeholder="اكتب الدقائق"
                  placeholderTextColor="#9AA0A6"
                  value={customMinutes}
                  onChangeText={setCustomMinutes}
                  className="text-right text-text-primary font-ibm-plex-arabic-medium"
                  style={{ writingDirection: "rtl" }}
                  accessibilityLabel="مدّة مخصّصة بالدقائق"
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                />
              </View>
              <Text
                className="text-text-secondary font-ibm-plex-arabic-medium"
                style={{ writingDirection: "rtl" }}
              >
                دقيقة
              </Text>
            </Animated.View>
          )}
        </Animated.View>

        <Animated.View
          layout={LinearTransition}
          className="w-full items-center gap-3"
        >
          <Pressable
            disabled={!canStart}
            onPress={onStart}
            accessibilityRole="button"
            accessibilityLabel="ابدأ وضع التحرر"
            accessibilityHint="سيتم تفعيل وضع التحرر للمدّة التي اخترتها"
            android_ripple={{ color: "#E5E7EB" }} // Replaced rgba(0,0,0,0.10) with solid light gray
            className={[
              "w-11/12 rounded-2xl py-5 shadow-lg flex-row-reverse items-center justify-center gap-2",
              canStart ? "bg-text-brand" : "bg-text-brand/40",
            ].join(" ")}
          >
            <Ionicons
              name="flash-outline"
              size={22}
              color={canStart ? "#ffffff" : "#ffffff"}
            />
            <Text className="text-center font-ibm-plex-arabic-bold text-2xl text-text-primary">
              تحرّر الآن
            </Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </AnimatedSafeAreaView>
  );
};

export default FreeCommit;
