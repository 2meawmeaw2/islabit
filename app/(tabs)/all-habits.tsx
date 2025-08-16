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
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { habits } from "@/data/habits";
import AntDesign from "@expo/vector-icons/AntDesign";

// ---- types
type LocalState = Record<number, { weeklyChecks: boolean[]; streak: number }>;
type FilterMode = "all" | "today" | "completed" | "missed";
type SortMode = "default" | "name" | "progress" | "time";

// ---- constants
const todayIdx = new Date().getDay();

// ---- helpers
const normalizeAr = (s: string) =>
  (s || "")
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, "")
    .toLowerCase()
    .trim();

const parseTargetDays = (s: string) => {
  const m = s?.match?.(/(\d+)/);
  const n = m ? parseInt(m[1], 10) : 5;
  return Math.min(7, Math.max(1, Number.isFinite(n) ? n : 5));
};

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

const useToast = () => {
  const y = useRef(new Animated.Value(100)).current;
  const [msg, setMsg] = useState<string | null>(null);
  const undoRef = useRef<null | (() => void)>(null);

  const show = (m: string, onUndo?: () => void) => {
    setMsg(m);
    undoRef.current = onUndo || null;
    Animated.timing(y, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };
  const hide = () => {
    Animated.timing(y, {
      toValue: 100,
      duration: 180,
      useNativeDriver: true,
    }).start(() => setMsg(null));
  };
  const ToastEl = msg ? (
    <Animated.View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        left: 12,
        right: 12,
        bottom: 16 + (Platform.OS === "ios" ? 8 : 0),
        transform: [{ translateY: y }],
      }}
    >
      <View className="rounded-2xl px-4 py-3 bg-fore border border-border-secondary flex-row-reverse items-center justify-between shadow-sm">
        <Text className="font-ibm-plex-arabic text-text-primary ml-3">
          {msg}
        </Text>
        {undoRef.current ? (
          <Pressable
            onPress={() => {
              vibrate("impact");
              undoRef.current?.();
              hide();
            }}
            hitSlop={8}
          >
            <Text className="font-ibm-plex-arabic-semibold text-text-brand">
              تراجع
            </Text>
          </Pressable>
        ) : (
          <Pressable onPress={hide} hitSlop={8}>
            <Text className="font-ibm-plex-arabic text-text-secondary">
              إغلاق
            </Text>
          </Pressable>
        )}
      </View>
    </Animated.View>
  ) : null;

  return { show, hide, ToastEl };
};

// ---- habit card
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

// ---- main
const AllHabits = () => {
  const router = useRouter();

  // seed UI state
  const [local, setLocal] = useState<LocalState>(() =>
    Object.fromEntries(
      habits.map((h) => [
        h.id,
        {
          weeklyChecks: h.weeklyChecks ?? [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
          ],
          streak: typeof h.streak === "number" ? h.streak : 0, // kept internal only
        },
      ])
    )
  );

  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterMode>("all");
  const [sort, setSort] = useState<SortMode>("default");
  const { show: showToast, ToastEl } = useToast();

  // toggles with undo
  const toggleDay = useCallback(
    (id: number, dayIdx: number) => {
      setLocal((prev) => {
        const entry = prev[id];
        if (!entry) return prev;
        const wc = [...entry.weeklyChecks];
        const prevVal = wc[dayIdx];
        wc[dayIdx] = !prevVal;

        // schedule undo
        showToast("تم التعديل لليوم المحدد.", () => {
          setLocal((prev2) => {
            const e2 = prev2[id];
            if (!e2) return prev2;
            const wc2 = [...e2.weeklyChecks];
            wc2[dayIdx] = prevVal;
            return { ...prev2, [id]: { ...e2, weeklyChecks: wc2 } };
          });
        });

        return { ...prev, [id]: { ...entry, weeklyChecks: wc } };
      });
    },
    [showToast]
  );

  const toggleToday = useCallback(
    (id: number) => {
      toggleDay(id, todayIdx);
    },
    [toggleDay]
  );

  // filters & sorting
  const normalizedQuery = normalizeAr(query);
  const filteredBase = useMemo(() => {
    const arr = habits.filter((h) => {
      if (!normalizedQuery) return true;
      const hay = `${normalizeAr(h.habitName)} ${normalizeAr(h.why || "")}`;
      return hay.includes(normalizedQuery);
    });

    return arr.filter((h) => {
      const wc = local[h.id]?.weeklyChecks ?? [];
      const today = wc[todayIdx];
      const completed =
        wc.filter(Boolean).length >= parseTargetDays(h.targetPerWeek);
      if (filter === "today") return !today; // needs action today
      if (filter === "completed") return completed;
      if (filter === "missed") return !completed;
      return true;
    });
  }, [normalizedQuery, filter, local]);

  const sorted = useMemo(() => {
    const arr = [...filteredBase];
    if (sort === "name") {
      arr.sort((a, b) => a.habitName.localeCompare(b.habitName, "ar"));
    } else if (sort === "progress") {
      arr.sort((a, b) => {
        const aw = local[a.id]?.weeklyChecks ?? [];
        const bw = local[b.id]?.weeklyChecks ?? [];
        const at = parseTargetDays(a.targetPerWeek);
        const bt = parseTargetDays(b.targetPerWeek);
        const ap = aw.filter(Boolean).length / Math.max(1, at) || 0;
        const bp = bw.filter(Boolean).length / Math.max(1, bt) || 0;
        return bp - ap; // desc
      });
    } else if (sort === "time") {
      arr.sort((a, b) =>
        (a.bestTime || "").localeCompare(b.bestTime || "zz", "ar")
      );
    }
    return arr;
  }, [filteredBase, sort, local]);

  // totals (over visible list)
  const totals = useMemo(() => {
    let committedToday = 0;
    sorted.forEach((h) => {
      if (local[h.id]?.weeklyChecks?.[todayIdx]) committedToday += 1;
    });
    return { count: sorted.length, committedToday };
  }, [sorted, local]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  }, []);

  // bulk commit today

  const renderItem = useCallback(
    ({ item }: { item: (typeof habits)[number] }) => (
      <HabitCard
        item={item}
        weeklyChecks={
          local[item.id]?.weeklyChecks ?? [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
          ]
        }
        onToggleDay={toggleDay}
        onToggleToday={toggleToday}
        openDetails={(id) =>
          router.push({ pathname: "/[id]", params: { id: String(id) } })
        }
      />
    ),
    [local, toggleDay, toggleToday, router]
  );

  const keyExtractor = useCallback(
    (it: (typeof habits)[number]) => String(it.id),
    []
  );

  // header metrics

  return (
    <SafeAreaView className="bg-bg flex-1">
      {/* sticky header */}
      <View className="px-4 pb-2">
        <Text className="font-ibm-plex-arabic-bold text-text-brand text-2xl text-right py-6 ">
          عاداتي :
        </Text>

        {/* search + quick actions */}
        <View className="flex-row items-center  bg-fore border border-border-primary rounded-xl px-3 py-1 text-text-primary font-ibm-plex-arabic text-right">
          {query ? (
            <TouchableOpacity
              onPress={() => setQuery("")}
              className="ml-3"
              hitSlop={6}
            >
              <AntDesign name="closecircleo" size={24} color="#6C7684" />
            </TouchableOpacity>
          ) : null}
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="ابحث عن عادة…"
            placeholderTextColor="#94A3B8"
            className="flex-1 text-text-primary font-ibm-plex-arabic-light no-underline"
            textAlign="right"
            returnKeyType="search"
            underlineColorAndroid="transparent"
          />
        </View>
      </View>

      {/* list */}
      <FlatList
        data={sorted}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        className="px-4"
        contentContainerStyle={{ paddingBottom: 96, paddingTop: 8 }}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={Keyboard.dismiss}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={10}
        removeClippedSubviews
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#22C55E"
            colors={["#22C55E"]}
          />
        }
        ListEmptyComponent={
          <View className="items-center py-24">
            <Text className="font-ibm-plex-arabic text-text-secondary">
              لا توجد عادات مطابقة.
            </Text>
            {query ? (
              <Pressable
                onPress={() => setQuery("")}
                className="mt-3 px-4 py-2 rounded-lg border border-border-secondary bg-fore"
                android_ripple={{ borderless: false }}
              >
                <Text className="font-ibm-plex-arabic text-text-primary">
                  إظهار الكل
                </Text>
              </Pressable>
            ) : null}
          </View>
        }
        // sticky only the control block above the list
        ListHeaderComponent={<View />}
        stickyHeaderIndices={[0]}
      />

      {/* toast (undo) */}
      {ToastEl}
    </SafeAreaView>
  );
};

export default AllHabits;
