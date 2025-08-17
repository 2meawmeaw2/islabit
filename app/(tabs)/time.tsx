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
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

/** Spacing */
const SP = {
  screenX: 24,
  sectionGap: 24,
  pillTop: 16,
  rowV: 12,
  hit: 44,
  bottomInset: 128,
  fieldGap: 12,
} as const;

/** Data */
type PrayerKey = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";
type Task = {
  id: string;
  title: string;
  notes?: string;
  prayer: PrayerKey;
  completed: boolean;
  createdAt: number;
};
type PrayerTime = { key: PrayerKey; name: string; time: string; emoji: string };

const PRAYERS: PrayerTime[] = [
  { key: "fajr", name: "الفجر", time: "05:00", emoji: "🌅" },
  { key: "dhuhr", name: "الظهر", time: "12:30", emoji: "☀️" },
  { key: "asr", name: "العصر", time: "16:00", emoji: "🌤️" },
  { key: "maghrib", name: "المغرب", time: "19:20", emoji: "🌇" },
  { key: "isha", name: "العشاء", time: "20:45", emoji: "🌙" },
];

const COLORS: Record<PrayerKey, string> = {
  fajr: "#4B9AB5",
  dhuhr: "#FACC15",
  asr: "#FB923C",
  maghrib: "#F87171",
  isha: "#7C3AED",
};

const ORDER: PrayerKey[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

/** Small helpers */
const todayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

const toDate = (hhmm: string, base = new Date()) => {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(base);
  d.setHours(h, m, 0, 0);
  return d;
};

const pad2 = (n: number) => String(n).padStart(2, "0");
const fmtCountdown = (s: number) =>
  `${pad2(Math.floor(s / 3600))}:${pad2(Math.floor((s % 3600) / 60))}:${pad2(
    s % 60
  )}`;

const rgba = (hex: string, a: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
};

const fmtArabicDate = (d: Date) =>
  new Intl.DateTimeFormat("ar", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(d);

const newId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/** Current/Next prayer */
function currentAndNext(prayers: PrayerTime[], now = new Date()) {
  const list = prayers.map((p) => ({ ...p, date: toDate(p.time, now) }));
  const nowMs = now.getTime();
  const nextToday = list.find((p) => p.date.getTime() > nowMs);
  const current =
    [...list].reverse().find((p) => p.date.getTime() <= nowMs) ||
    list[list.length - 1];
  if (!nextToday) {
    const t = new Date(now);
    t.setDate(t.getDate() + 1);
    const fajr = prayers.find((p) => p.key === "fajr")!;
    return { current, next: { ...fajr, date: toDate(fajr.time, t) } };
  }
  return { current, next: nextToday };
}

/** Sections */
type SectionBlock = {
  title: string;
  prayerKey: PrayerKey;
  time: string;
  emoji: string;
  data: Task[];
};

function makeSections(
  tasks: Task[],
  prayers: PrayerTime[],
  collapsed: Record<PrayerKey, boolean>
): SectionBlock[] {
  const groups: Record<PrayerKey, Task[]> = {
    fajr: [],
    dhuhr: [],
    asr: [],
    maghrib: [],
    isha: [],
  };
  for (const t of tasks) groups[t.prayer].push(t);
  ORDER.forEach((k) =>
    groups[k].sort(
      (a, b) =>
        Number(a.completed) - Number(b.completed) || a.createdAt - b.createdAt
    )
  );
  return ORDER.map((k) => {
    const p = prayers.find((x) => x.key === k)!;
    return {
      title: p.name,
      prayerKey: p.key,
      time: p.time,
      emoji: p.emoji,
      data: collapsed[k] ? [] : groups[k],
    };
  });
}

/** Main */
const SalatTasksMinimal: React.FC<{
  prayerTimes?: PrayerTime[];
  date?: Date;
}> = ({ prayerTimes = PRAYERS, date = new Date() }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState<Record<PrayerKey, boolean>>({
    fajr: true,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
  });

  // Quick add
  const [addingPrayer, setAddingPrayer] = useState<PrayerKey | null>(null);
  const [quickTitle, setQuickTitle] = useState("");

  // Modal add/edit
  const [modalVisible, setModalVisible] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftNotes, setDraftNotes] = useState("");
  const [draftPrayer, setDraftPrayer] = useState<PrayerKey>("dhuhr");
  const editingId = useRef<string | null>(null);

  // Countdown
  const [countdown, setCountdown] = useState("00:00:00");

  const { current, next } = useMemo(
    () => currentAndNext(prayerTimes, date),
    [prayerTimes, date]
  );

  const storageKey = `salatTasks:${todayKey(date)}`;

  /** Load/save */
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(storageKey);
        setTasks(raw ? JSON.parse(raw) : []);
      } finally {
        setLoading(false);
      }
    })();
  }, [storageKey]);

  useEffect(() => {
    if (!loading) AsyncStorage.setItem(storageKey, JSON.stringify(tasks));
  }, [tasks, loading, storageKey]);

  /** Tick countdown */
  useEffect(() => {
    const t = setInterval(() => {
      const now = new Date();
      const { next: n } = currentAndNext(prayerTimes, now);
      const secs = Math.max(
        0,
        Math.floor((n.date.getTime() - now.getTime()) / 1000)
      );
      setCountdown(fmtCountdown(secs));
    }, 1000);
    return () => clearInterval(t);
  }, [prayerTimes]);

  const sections = useMemo(
    () => makeSections(tasks, prayerTimes, collapsed),
    [tasks, prayerTimes, collapsed]
  );

  /** Actions */
  const toggleComplete = (id: string) =>
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );

  const removeTask = (id: string) =>
    setTasks((prev) => prev.filter((t) => t.id !== id));

  const startEdit = (task: Task) => {
    editingId.current = task.id;
    setDraftTitle(task.title);
    setDraftNotes(task.notes || "");
    setDraftPrayer(task.prayer);
    setModalVisible(true);
  };

  const submitDraft = () => {
    const title = draftTitle.trim();
    if (!title) return Alert.alert("تنبيه", "يرجى كتابة عنوان المهمة");
    if (editingId.current) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingId.current
            ? { ...t, title, notes: draftNotes.trim(), prayer: draftPrayer }
            : t
        )
      );
    } else {
      setTasks((prev) => [
        {
          id: newId(),
          title,
          notes: draftNotes.trim(),
          prayer: draftPrayer,
          completed: false,
          createdAt: Date.now(),
        },
        ...prev,
      ]);
      setCollapsed((c) => ({ ...c, [draftPrayer]: false }));
    }
    setModalVisible(false);
    editingId.current = null;
    setDraftTitle("");
    setDraftNotes("");
  };

  const submitQuickAdd = (key: PrayerKey) => {
    const title = quickTitle.trim();
    if (!title) return;
    setTasks((prev) => [
      {
        id: newId(),
        title,
        prayer: key,
        completed: false,
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
      <View style={{ paddingHorizontal: SP.screenX, paddingVertical: 8 }}>
        <View className="flex-row-reverse items-center justify-between">
          <Text className="font-ibm-plex-arabic-bold text-text-brand text-xl ml-2">
            تنظيم اليوم
          </Text>
        </View>
        <Text className="font-ibm-plex-arabic text-text-secondary text-xs text-right mt-1">
          {fmtArabicDate(date)}
        </Text>

        {/* Next prayer pill + timeline */}
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
                      ? COLORS[p.key]
                      : isNext(p.key)
                        ? "#00AEEF"
                        : rgba("#94A3B8", 0.4),
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

      {/* Sections */}
      <SectionList<Task, SectionBlock>
        sections={tasks.length ? sections : []}
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
          <TaskRow
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
                  color={COLORS[section.prayerKey]}
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

      {/* Add/Edit Modal */}
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
                {ORDER.map((k) => {
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
                        className={`font-ibm-plex-arabic text-xs ${active ? "text-bg" : "text-text-primary"}`}
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

/** Section Header (no animation; up/down icon to keep UI simple) */
const SectionHeader: React.FC<{
  section: SectionBlock;
  collapsed: boolean;
  onToggle: () => void;
  isCurrent: boolean;
  isNext: boolean;
  onAdd: () => void;
}> = ({ section, collapsed, onToggle, isCurrent, isNext, onAdd }) => {
  const dropIconRotation = useSharedValue<number>(0);
  const dropIconStyles = useAnimatedStyle(() => {
    return {
      transform: [{ rotateZ: `${dropIconRotation.value}deg` }],
    };
  });
  const handleHeaderPress = () => {
    if (collapsed) {
      dropIconRotation.value = withTiming(180, { duration: 250 });
    } else {
      dropIconRotation.value = withTiming(0, { duration: 250 });
    }
    onToggle();
  };
  return (
    <View className="bg-bg" style={{ paddingVertical: 6, zIndex: 2 }}>
      <View className="flex-row-reverse items-center justify-between">
        <TouchableOpacity
          onPress={handleHeaderPress}
          className="flex-row-reverse items-center flex-1 relative pr-10"
          activeOpacity={0.8}
        >
          <View
            className="w-8 h-8 rounded-xl items-center absolute top-0 justify-center ml-2"
            style={{ backgroundColor: rgba(COLORS[section.prayerKey], 0.16) }}
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
          <Animated.View style={[dropIconStyles, { marginLeft: 8 }]}>
            <Ionicons name={"chevron-down"} size={18} color="#94A3B8" />
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

/** Task Row */
const TaskRow: React.FC<{
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
        className="flex-row-reverse items-center flex-1 gap-2"
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

/** Empty state */
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
