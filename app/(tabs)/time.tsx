// app/screens/SalatTasksMinimal.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  SectionList,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  FadeInDown,
  FadeOutUp,
  Layout,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

// ===== Spacing scale (8pt) =====
const SP = {
  screenX: 24,
  headerY: 8,
  sectionGap: 24,
  pillTop: 16,
  rowV: 12,
  hit: 44,
  bottomInset: 128,
  fieldGap: 12,
};

type PrayerKey = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";
type Task = {
  id: string;
  title: string;
  notes?: string;
  prayer: PrayerKey;
  completed: boolean;
  pinned?: boolean;
  createdAt: number;
};
type PrayerTime = { key: PrayerKey; name: string; time: string; emoji: string };

const defaultPrayerTimes: PrayerTime[] = [
  { key: "fajr", name: "الفجر", time: "05:00", emoji: "🌅" },
  { key: "dhuhr", name: "الظهر", time: "12:30", emoji: "☀️" },
  { key: "asr", name: "العصر", time: "16:00", emoji: "🌤️" },
  { key: "maghrib", name: "المغرب", time: "19:20", emoji: "🌇" },
  { key: "isha", name: "العشاء", time: "20:45", emoji: "🌙" },
];

const orderedKeys: PrayerKey[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
const colorByPrayer: Record<PrayerKey, string> = {
  fajr: "#4B9AB5",
  dhuhr: "#FACC15",
  asr: "#FB923C",
  maghrib: "#F87171",
  isha: "#7C3AED",
};

const kTodayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
const timeToDate = (hhmm: string, base = new Date()) => {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(base);
  d.setHours(h, m, 0, 0);
  return d;
};
const secondsBetween = (a: Date, b: Date) =>
  Math.max(0, Math.floor((b.getTime() - a.getTime()) / 1000));
const pad2 = (n: number) => String(n).padStart(2, "0");
const fmtCountdown = (s: number) =>
  `${pad2(Math.floor(s / 3600))}:${pad2(Math.floor((s % 3600) / 60))}:${pad2(
    s % 60
  )}`;
const withAlpha = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};
const formatArabicDate = (d: Date) =>
  new Intl.DateTimeFormat("ar", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(d);
const id = () =>
  Math.random().toString(36).slice(2) + "-" + Date.now().toString(36);

function getCurrentAndNext(prayers: PrayerTime[], now = new Date()) {
  const list = prayers.map((p) => ({ ...p, date: timeToDate(p.time, now) }));
  const nowMs = now.getTime();
  const nextToday = list.find((p) => p.date.getTime() > nowMs);
  const current =
    [...list].reverse().find((p) => p.date.getTime() <= nowMs) ||
    list[list.length - 1];
  if (!nextToday) {
    const tmr = new Date(now);
    tmr.setDate(tmr.getDate() + 1);
    const fajr = prayers.find((p) => p.key === "fajr")!;
    return { current, next: { ...fajr, date: timeToDate(fajr.time, tmr) } };
  }
  return { current, next: nextToday };
}

type SectionBlock = {
  title: string;
  prayerKey: PrayerKey;
  time: string;
  emoji: string;
  data: Task[];
};

const SalatTasksMinimal: React.FC<{
  prayerTimes?: PrayerTime[];
  date?: Date;
}> = ({ prayerTimes = defaultPrayerTimes, date = new Date() }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showCompleted, setShowCompleted] = useState(true);
  const [loading, setLoading] = useState(true);

  const [collapsed, setCollapsed] = useState<Record<PrayerKey, boolean>>({
    fajr: true,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
  });

  // 🔹 NEW: quick-add state
  const [addingPrayer, setAddingPrayer] = useState<PrayerKey | null>(null);
  const [quickTitle, setQuickTitle] = useState("");

  // modal (advanced add/edit)
  const [modalVisible, setModalVisible] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftNotes, setDraftNotes] = useState("");
  const [draftPrayer, setDraftPrayer] = useState<PrayerKey>("dhuhr");
  const editingId = useRef<string | null>(null);

  const [countdown, setCountdown] = useState("00:00:00");
  const { current, next } = useMemo(
    () => getCurrentAndNext(prayerTimes, date),
    [prayerTimes, date]
  );

  const storageKey = `salatTasks:${kTodayKey(date)}`;

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(storageKey);
        if (raw) {
          setTasks(JSON.parse(raw));
        } else {
          setTasks([]);
          await AsyncStorage.setItem(storageKey, JSON.stringify([]));
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [storageKey]);

  useEffect(() => {
    const t = setInterval(() => {
      const now = new Date();
      const { next: n } = getCurrentAndNext(prayerTimes, now);
      setCountdown(fmtCountdown(secondsBetween(now, n.date as any)));
    }, 1000);
    return () => clearInterval(t);
  }, [prayerTimes]);

  useEffect(() => {
    if (!loading) AsyncStorage.setItem(storageKey, JSON.stringify(tasks));
  }, [tasks, loading, storageKey]);

  const sections: SectionBlock[] = useMemo(() => {
    const grouped: Record<PrayerKey, Task[]> = {
      fajr: [],
      dhuhr: [],
      asr: [],
      maghrib: [],
      isha: [],
    };
    for (const t of tasks) grouped[t.prayer].push(t);

    const mk = (p: PrayerTime): SectionBlock => {
      let list = grouped[p.key].sort((a, b) => {
        if ((a.pinned ? 0 : 1) !== (b.pinned ? 0 : 1))
          return (a.pinned ? 0 : 1) - (b.pinned ? 0 : 1);
        if ((a.completed ? 1 : 0) !== (b.completed ? 1 : 0))
          return (a.completed ? 1 : 0) - (b.completed ? 1 : 0);
        return a.createdAt - b.createdAt;
      });
      if (!showCompleted) list = list.filter((t) => !t.completed);
      const data = collapsed[p.key] ? [] : list;
      return {
        title: p.name,
        prayerKey: p.key,
        time: p.time,
        emoji: p.emoji,
        data,
      };
    };

    return orderedKeys.map((k) => mk(prayerTimes.find((p) => p.key === k)!));
  }, [tasks, showCompleted, prayerTimes, collapsed]);

  const hasAnyVisibleTasks = useMemo(() => {
    const visible = showCompleted ? tasks : tasks.filter((t) => !t.completed);
    return visible.length > 0;
  }, [tasks, showCompleted]);

  // actions
  const toggleComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };
  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const startEdit = (task: Task) => {
    editingId.current = task.id;
    setDraftTitle(task.title);
    setDraftNotes(task.notes || "");
    setDraftPrayer(task.prayer);
    setModalVisible(true);
  };
  const submitDraft = () => {
    if (!draftTitle.trim())
      return Alert.alert("تنبيه", "يرجى كتابة عنوان المهمة");
    if (editingId.current) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingId.current
            ? {
                ...t,
                title: draftTitle.trim(),
                notes: draftNotes.trim(),
                prayer: draftPrayer,
              }
            : t
        )
      );
    } else {
      setTasks((prev) => [
        {
          id: id(),
          title: draftTitle.trim(),
          notes: draftNotes.trim(),
          prayer: draftPrayer,
          completed: false,
          pinned: false,
          createdAt: Date.now(),
        },
        ...prev,
      ]);
      setCollapsed((c) => ({ ...c, [draftPrayer]: false }));
    }
    setModalVisible(false);
  };

  // NEW: quick add submit
  const submitQuickAdd = (key: PrayerKey) => {
    if (!quickTitle.trim()) return;
    setTasks((prev) => [
      {
        id: id(),
        title: quickTitle.trim(),
        prayer: key,
        completed: false,
        pinned: false,
        createdAt: Date.now(),
      },
      ...prev,
    ]);
    setQuickTitle("");
    setAddingPrayer(null);
    setCollapsed((c) => ({ ...c, [key]: false }));
  };

  const isCurrent = (k: PrayerKey) => current.key === k;
  const isNext = (k: PrayerKey) => next.key === k;

  const toggleSection = (k: PrayerKey) =>
    setCollapsed((c) => ({ ...c, [k]: !c[k] }));

  return (
    <SafeAreaView className="bg-bg flex-1">
      {/* App Bar */}
      <View
        style={{
          paddingHorizontal: SP.screenX,
          paddingTop: SP.headerY,
          paddingBottom: SP.headerY,
        }}
      >
        <View className="flex-row-reverse items-center justify-between">
          <Text className="font-ibm-plex-arabic-bold text-text-brand text-xl ml-2">
            تنظيم اليوم
          </Text>
          <TouchableOpacity
            onPress={() => setShowCompleted((s) => !s)}
            className="px-3 py-1.5 rounded-full bg-fore border border-border-secondary"
          >
            <Text className="font-ibm-plex-arabic text-text-primary text-xs">
              {showCompleted ? "إخفاء المنجزة" : "عرض المنجزة"}
            </Text>
          </TouchableOpacity>
        </View>
        <Text className="font-ibm-plex-arabic text-text-secondary text-xs text-right mt-1">
          {formatArabicDate(date)}
        </Text>

        {/* 🔹 Next prayer pill + timeline */}
        <View
          className="rounded-2xl px-4 py-3 bg-fore border border-border-primary"
          style={{ marginTop: SP.pillTop }}
        >
          <View className="flex-row-reverse items-center justify-between">
            <View className="flex-1 ml-3">
              <Text className="font-ibm-plex-arabic text-text-secondary text-[11px] text-right">
                الصلاة التالية
              </Text>
              <Text className="font-ibm-plex-arabic-medium text-text-primary text-right">
                {next.name} • {next.time} {next.emoji}
              </Text>
            </View>
            <View className="items-center">
              <Text className="font-ibm-plex-arabic text-text-secondary text-[10px]">
                العدّ التنازلي
              </Text>
              <Text className="font-ibm-plex-arabic-bold text-text-brand text-base">
                {countdown}
              </Text>
            </View>
          </View>
          <View className="flex-row-reverse items-center justify-between mt-3">
            {prayerTimes.map((p) => (
              <View
                key={p.key}
                className="items-center"
                style={{ width: "18%" }}
              >
                <View
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    backgroundColor: isCurrent(p.key)
                      ? colorByPrayer[p.key]
                      : isNext(p.key)
                        ? "#00AEEF"
                        : withAlpha("#94A3B8", 0.4),
                  }}
                />
                <Text className="font-ibm-plex-arabic text-[10px] text-text-secondary mt-1">
                  {p.time}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* List */}
      <SectionList<Task, SectionBlock>
        sections={hasAnyVisibleTasks ? sections : []}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled
        SectionSeparatorComponent={() => (
          <View style={{ height: SP.sectionGap }} />
        )}
        contentContainerStyle={{
          paddingHorizontal: SP.screenX,
          paddingBottom: SP.bottomInset,
          paddingTop: 4,
        }}
        renderSectionHeader={({ section }) => (
          <SectionHeader
            section={section}
            collapsed={collapsed[section.prayerKey]}
            onToggle={() => toggleSection(section.prayerKey)}
            isCurrent={isCurrent(section.prayerKey)}
            isNext={isNext(section.prayerKey)}
            onAdd={() =>
              setAddingPrayer(
                addingPrayer === section.prayerKey ? null : section.prayerKey
              )
            }
          />
        )}
        renderItem={({ item }) => (
          <Animated.View
            entering={FadeInDown.duration(180)}
            exiting={FadeOutUp.duration(140)}
            layout={Layout.springify().damping(16)}
          >
            <TaskRowMinimal
              task={item}
              onToggle={() => toggleComplete(item.id)}
              onEdit={() => startEdit(item)}
              onDelete={() =>
                Alert.alert("حذف", "هل تريد حذف هذه المهمة؟", [
                  { text: "إلغاء", style: "cancel" },
                  {
                    text: "حذف",
                    style: "destructive",
                    onPress: () => removeTask(item.id),
                  },
                ])
              }
            />
          </Animated.View>
        )}
        renderSectionFooter={({ section }) =>
          addingPrayer === section.prayerKey ? (
            <View className="flex-row-reverse items-center p-3 bg-fore rounded-lg mt-2">
              <TextInput
                value={quickTitle}
                onChangeText={setQuickTitle}
                placeholder="عنوان المهمة…"
                placeholderTextColor="#94A3B8"
                className="flex-1 text-right font-ibm-plex-arabic text-text-primary"
              />
              <TouchableOpacity
                onPress={() => submitQuickAdd(section.prayerKey)}
                style={{ marginLeft: 8 }}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={colorByPrayer[section.prayerKey]}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setAddingPrayer(null)}>
                <Ionicons name="close-circle" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          ) : null
        }
        ListEmptyComponent={
          !loading ? (
            <View style={{ marginTop: SP.sectionGap }}>
              <EmptyState onAdd={() => setModalVisible(true)} />
            </View>
          ) : null
        }
      />

      {/* Advanced modal (unchanged) */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1"
        >
          <View className="flex-1 bg-[rgba(0,0,0,0.45)] justify-end">
            <View
              className="bg-bg rounded-t-2xl border-t border-border-primary"
              style={{ padding: SP.screenX }}
            >
              <View
                className="flex-row-reverse items-center justify-between"
                style={{ marginBottom: SP.fieldGap }}
              >
                <Text className="font-ibm-plex-arabic-bold text-text-primary text-lg">
                  {editingId.current ? "تعديل مهمة" : "إضافة مهمة"}
                </Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={{
                    width: SP.hit,
                    height: SP.hit,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="close" size={22} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              <Text className="font-ibm-plex-arabic text-text-primary text-right mb-1">
                العنوان
              </Text>
              <TextInput
                value={draftTitle}
                onChangeText={setDraftTitle}
                placeholder="مثال: مراجعة حفظ اليوم"
                placeholderTextColor="#94A3B8"
                className="bg-fore border border-border-secondary rounded-xl px-4 py-3 text-text-primary font-ibm-plex-arabic text-right"
                textAlign="right"
                style={{ marginBottom: SP.fieldGap }}
              />

              <Text className="font-ibm-plex-arabic text-text-primary text-right mb-1">
                ملاحظات (اختياري)
              </Text>
              <TextInput
                value={draftNotes}
                onChangeText={setDraftNotes}
                placeholder="تفاصيل إضافية…"
                placeholderTextColor="#94A3B8"
                multiline
                className="bg-fore border border-border-secondary rounded-xl px-4 py-3 text-text-primary font-ibm-plex-arabic text-right"
                textAlign="right"
                style={{ marginBottom: SP.fieldGap }}
              />

              <Text className="font-ibm-plex-arabic text-text-primary text-right mb-2">
                اربط المهمة بـ
              </Text>
              <View
                className="flex-row-reverse flex-wrap"
                style={{ marginBottom: SP.fieldGap }}
              >
                {orderedKeys.map((k) => {
                  const p = prayerTimes.find((x) => x.key === k)!;
                  const active = draftPrayer === k;
                  return (
                    <TouchableOpacity
                      key={k}
                      onPress={() => setDraftPrayer(k)}
                      className={`px-3 py-1.5 rounded-lg mr-2 mb-2 border ${
                        active
                          ? "bg-text-brand border-text-brand"
                          : "bg-fore border-border-secondary"
                      }`}
                    >
                      <Text
                        className={`font-ibm-plex-arabic text-xs ${
                          active ? "text-bg" : "text-text-primary"
                        }`}
                      >
                        {p.emoji} {p.name} • {p.time}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View className="flex-row-reverse">
                <TouchableOpacity
                  onPress={submitDraft}
                  className="flex-1 bg-text-brand rounded-xl py-3 ml-2"
                >
                  <Text className="font-ibm-plex-arabic-bold text-center text-bg">
                    حفظ
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  className="flex-1 bg-fore border border-border-secondary rounded-xl py-3 mr-2"
                >
                  <Text className="font-ibm-plex-arabic-bold text-center text-text-primary">
                    إلغاء
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

// ---------- SectionHeader ----------
const SectionHeader: React.FC<{
  section: SectionBlock;
  collapsed: boolean;
  onToggle: () => void;
  isCurrent: boolean;
  isNext: boolean;
  onAdd: () => void;
}> = ({ section, collapsed, onToggle, isCurrent, isNext, onAdd }) => {
  const rot = useSharedValue(collapsed ? 0 : 1);
  useEffect(() => {
    rot.value = withTiming(collapsed ? 0 : 1, {
      duration: 180,
      easing: Easing.out(Easing.cubic),
    });
  }, [collapsed, rot]);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rot.value * 180}deg` }],
  }));

  return (
    <View className="bg-bg" style={{ paddingVertical: 6, zIndex: 2 }}>
      <View className="flex-row-reverse items-center justify-between">
        <TouchableOpacity
          onPress={onToggle}
          className="flex-row-reverse items-center flex-1 relative pr-10"
          activeOpacity={0.8}
        >
          <View
            className="w-8 h-8 rounded-xl items-center absolute top-0 justify-center ml-2"
            style={{
              backgroundColor: withAlpha(
                colorByPrayer[section.prayerKey],
                0.16
              ),
            }}
          >
            <Text className="text-text-primary text-sm">{section.emoji}</Text>
          </View>
          <View className="flex-1 gap-2">
            <Text
              className={`font-ibm-plex-arabic-bold text-[18px] ${
                isCurrent
                  ? "text-text-brand"
                  : isNext
                    ? "text-text-white"
                    : "text-text-primary"
              } text-base text-right`}
            >
              {section.title}
              {isCurrent ? " • الآن" : isNext ? " • التالية" : ""}
            </Text>
            <Text className="font-ibm-plex-arabic mr-1 text-text-secondary text-[11px] text-right">
              {section.time}
            </Text>
          </View>
          <Animated.View style={[{ marginLeft: 8 }, chevronStyle]}>
            <Ionicons name="chevron-down" size={18} color="#94A3B8" />
          </Animated.View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onAdd}
          className="rounded-lg bg-text-brand items-center justify-center"
          activeOpacity={0.9}
          style={{ width: SP.hit, height: SP.hit }}
        >
          <Ionicons name="add" size={18} color="#0B1623" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ---------- TaskRowMinimal ----------
const TaskRowMinimal: React.FC<{
  task: Task;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ task, onToggle, onEdit, onDelete }) => (
  <View>
    <View
      className="flex-row-reverse items-center justify-between"
      style={{ paddingVertical: SP.rowV }}
    >
      <TouchableOpacity
        onPress={onToggle}
        className="flex-row-reverse items-center flex-1"
        activeOpacity={0.7}
      >
        <View
          className={`w-5 h-5 rounded-md border mr-3 items-center justify-center ${
            task.completed
              ? "bg-text-brand border-text-brand"
              : "border-border-secondary bg-fore"
          }`}
        >
          {task.completed && (
            <Ionicons name="checkmark" size={14} color="#0B1623" />
          )}
        </View>
        <View className="flex-1">
          <Text
            className={`font-ibm-plex-arabic text-right ${
              task.completed
                ? "text-text-secondary line-through"
                : "text-text-primary"
            }`}
            numberOfLines={1}
          >
            {task.title}
          </Text>
          {!!task.notes && (
            <Text
              className="font-ibm-plex-arabic text-[11px] text-text-secondary text-right mt-0.5"
              numberOfLines={1}
            >
              {task.notes}
            </Text>
          )}
        </View>
      </TouchableOpacity>
      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={onEdit}
          style={{
            paddingHorizontal: 8,
            height: SP.hit,
            justifyContent: "center",
          }}
        >
          <Ionicons name="create-outline" size={18} color="#94A3B8" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onDelete}
          style={{
            paddingHorizontal: 8,
            height: SP.hit,
            justifyContent: "center",
          }}
        >
          <Ionicons name="trash-outline" size={18} color="#F87171" />
        </TouchableOpacity>
      </View>
    </View>
    <View className="h-[1px] bg-border-primary" />
  </View>
);

const EmptyState: React.FC<{ onAdd: () => void }> = ({ onAdd }) => (
  <View className="bg-fore border border-border-primary rounded-2xl p-5 items-center">
    <Text className="font-ibm-plex-arabic text-text-primary text-right mb-1">
      لا مهام لليوم
    </Text>
    <Text className="font-ibm-plex-arabic text-text-secondary text-xs text-right mb-3">
      أضف مهمة لكل صلاة لتنظيم سهل.
    </Text>
    <TouchableOpacity
      onPress={onAdd}
      className="px-4 py-2.5 rounded-lg bg-text-brand"
      activeOpacity={0.9}
    >
      <Text className="font-ibm-plex-arabic-bold text-bg text-sm">
        مهمة جديدة
      </Text>
    </TouchableOpacity>
  </View>
);

export default SalatTasksMinimal;
