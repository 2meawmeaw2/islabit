// app/screens/OrganizeModes.tsx
import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

/** Types */
type Mode = "daily" | "weekly" | "monthly";
type PrayerKey = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";
type PrayerTime = {
  key: PrayerKey;
  name: string;
  time: string;
  emoji?: string;
};

/** Minimal prayer seeds (edit to your needs) */
const PRAYERS: PrayerTime[] = [
  { key: "fajr", name: "الفجر", time: "05:00", emoji: "🌅" },
  { key: "dhuhr", name: "الظهر", time: "12:30", emoji: "☀️" },
  { key: "asr", name: "العصر", time: "16:00", emoji: "🌤️" },
  { key: "maghrib", name: "المغرب", time: "19:20", emoji: "🌇" },
  { key: "isha", name: "العشاء", time: "20:45", emoji: "🌙" },
];

/** Date helpers (week starts Saturday = 6) */
const WEEK_START = 6;
const startOfWeek = (d: Date) => {
  const x = new Date(d);
  const delta = (x.getDay() - WEEK_START + 7) % 7;
  x.setDate(x.getDate() - delta);
  x.setHours(0, 0, 0, 0);
  return x;
};
const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
const firstOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const lastOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const fmtArabicDate = (d: Date) =>
  new Intl.DateTimeFormat("ar", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);

/** MAIN */
const OrganizeModes: React.FC<{
  onOpenDaily?: (date?: Date) => void;
  onOpenWeekly?: (startOfWeek?: Date) => void;
  onOpenMonthly?: (monthDate?: Date) => void;
}> = ({ onOpenDaily, onOpenWeekly, onOpenMonthly }) => {
  const [mode, setMode] = useState<Mode>("daily");
  const [today] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  /** Weekly memo */
  const weekStart = useMemo(() => startOfWeek(today), [today]);
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  /** Monthly memo */
  const [monthAnchor, setMonthAnchor] = useState(() => new Date(today));
  const first = useMemo(() => firstOfMonth(monthAnchor), [monthAnchor]);
  const last = useMemo(() => lastOfMonth(monthAnchor), [monthAnchor]);
  const leading = useMemo(() => (first.getDay() - WEEK_START + 7) % 7, [first]);
  const monthDates = useMemo(() => {
    const list: (Date | null)[] = [];
    for (let i = 0; i < leading; i++) list.push(null);
    for (let d = 1; d <= last.getDate(); d++) {
      list.push(new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), d));
    }
    while (list.length % 7 !== 0) list.push(null);
    return list;
  }, [monthAnchor, leading, last]);

  return (
    <View style={S.container}>
      <ScrollView contentContainerStyle={S.scroll}>
        {/* Header */}
        <View style={S.rowBetween}>
          <Text style={S.title}>طرق التنظيم</Text>
        </View>
        <Text style={S.subtleRight}>{fmtArabicDate(today)}</Text>

        {/* Mode selector */}
        <View style={[S.rowEnd, { marginTop: 16 }]}>
          {(["daily", "weekly", "monthly"] as Mode[]).map((m, i) => (
            <TouchableOpacity
              key={m}
              onPress={() => setMode(m)}
              style={[
                S.pill,
                mode === m ? S.pillActive : S.pillIdle,
                i > 0 && { marginRight: 8 },
              ]}
            >
              <Text style={[S.pillText, mode === m && { color: "#0B1623" }]}>
                {m === "daily" ? "يومي" : m === "weekly" ? "أسبوعي" : "شهري"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Body */}
        <View style={{ marginTop: 16 }}>
          {/* DAILY */}
          {mode === "daily" && (
            <View style={S.card}>
              <View style={S.rowBetween}>
                <Text style={S.cardTitle}>عرض اليوم</Text>
                <TouchableOpacity
                  onPress={() => (onOpenDaily ? onOpenDaily(today) : null)}
                  style={S.smallBtn}
                >
                  <Text style={S.smallBtnText}>فتح</Text>
                </TouchableOpacity>
              </View>

              {/* Minimal prayers strip */}
              <View style={[S.rowBetween, { marginTop: 12 }]}>
                {PRAYERS.map((p) => (
                  <View key={p.key} style={S.centerCol}>
                    <Text style={{ fontSize: 16 }}>{p.emoji}</Text>
                    <Text style={S.brandTiny}>{p.time}</Text>
                    <Text style={S.tinyMuted}>{p.name}</Text>
                  </View>
                ))}
              </View>

              {/* Minimal placeholder lists */}
              <Text style={[S.sectionHdr, { marginTop: 16 }]}>مهام اليوم</Text>
              <View style={S.boxRow}>
                <Text style={S.rightText}>لا توجد مهام حالياً</Text>
              </View>
            </View>
          )}

          {/* WEEKLY */}
          {mode === "weekly" && (
            <View style={S.card}>
              <View style={S.rowBetween}>
                <Text style={S.cardTitle}>نظرة أسبوعية</Text>
                <TouchableOpacity
                  onPress={() =>
                    onOpenWeekly ? onOpenWeekly(weekStart) : null
                  }
                  style={S.smallBtn}
                >
                  <Text style={S.smallBtnText}>فتح</Text>
                </TouchableOpacity>
              </View>

              <Text style={[S.subtleRight, { marginTop: 8 }]}>
                {fmtArabicDate(weekStart)} —{" "}
                {fmtArabicDate(addDays(weekStart, 6))}
              </Text>

              <View style={[S.rowBetween, { marginTop: 12 }]}>
                {weekDays.map((d) => {
                  const isToday = sameDay(d, today);
                  return (
                    <View
                      key={d.toISOString()}
                      style={[
                        S.dayCell,
                        isToday && {
                          borderColor: "#00AEEF",
                          backgroundColor: "#E0F2FE", // Replaced rgba(0,174,239,0.08) with solid light blue
                        },
                      ]}
                    >
                      <Text style={S.tinyMuted}>
                        {new Intl.DateTimeFormat("ar", {
                          weekday: "short",
                        }).format(d)}
                      </Text>
                      <Text style={S.bold}>{d.getDate()}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* MONTHLY */}
          {mode === "monthly" && (
            <View style={S.card}>
              <View style={S.rowBetween}>
                <TouchableOpacity
                  onPress={() =>
                    setMonthAnchor(
                      (p) => new Date(p.getFullYear(), p.getMonth() - 1, 1)
                    )
                  }
                >
                  <Text>›</Text>
                </TouchableOpacity>

                <Text style={S.cardTitle}>
                  نظرة شهرية •{" "}
                  {new Intl.DateTimeFormat("ar", {
                    month: "long",
                    year: "numeric",
                  }).format(monthAnchor)}
                </Text>

                <TouchableOpacity
                  onPress={() =>
                    setMonthAnchor(
                      (p) => new Date(p.getFullYear(), p.getMonth() + 1, 1)
                    )
                  }
                >
                  <Text>‹</Text>
                </TouchableOpacity>
              </View>

              {/* Weekday headings */}
              <View style={[S.rowBetween, { marginTop: 8, marginBottom: 4 }]}>
                {[...Array(7)].map((_, i) => {
                  const day = (WEEK_START + i) % 7;
                  const ref = new Date(2025, 0, day + 5); // stable labels
                  return (
                    <Text key={i} style={S.weekHdr}>
                      {new Intl.DateTimeFormat("ar", {
                        weekday: "short",
                      }).format(ref)}
                    </Text>
                  );
                })}
              </View>

              {/* Grid */}
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                }}
              >
                {monthDates.map((d, idx) =>
                  d ? (
                    <TouchableOpacity
                      key={d.toISOString()}
                      style={[
                        S.monthCell,
                        sameDay(d, today) && {
                          borderColor: "#00AEEF",
                          backgroundColor: "#E0F2FE", // Replaced rgba(0,174,239,0.08) with solid light blue
                        },
                      ]}
                      onPress={() => (onOpenDaily ? onOpenDaily(d) : null)}
                      activeOpacity={0.7}
                    >
                      <Text style={S.bold}>{d.getDate()}</Text>
                    </TouchableOpacity>
                  ) : (
                    <View key={`blank-${idx}`} style={S.monthCell} />
                  )
                )}
              </View>

              <TouchableOpacity
                onPress={() =>
                  onOpenMonthly ? onOpenMonthly(monthAnchor) : null
                }
                style={[
                  S.smallBtn,
                  { marginTop: 8, alignSelf: "stretch", height: 44 },
                ]}
              >
                <Text style={S.smallBtnText}>افتح عرض الشهر</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
};

const S = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  scroll: { paddingHorizontal: 16, paddingVertical: 12 },
  rowBetween: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowEnd: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  title: {
    fontSize: 20,
    color: "#0EA5E9",
    fontWeight: "700",
    textAlign: "right",
  },
  subtleRight: {
    color: "#64748B",
    fontSize: 12,
    textAlign: "right",
    marginTop: 2,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 88,
    alignItems: "center",
    borderWidth: 1,
  },
  pillActive: { backgroundColor: "#0EA5E9", borderColor: "#0EA5E9" },
  pillIdle: { backgroundColor: "#F8FAFC", borderColor: "#E5E7EB" },
  pillText: { color: "#0F172A", fontSize: 14 },
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "right",
  },
  sectionHdr: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "right",
  },
  boxRow: {
    marginTop: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  rightText: { textAlign: "right", color: "#475569" },
  centerCol: { alignItems: "center", width: "18%" },
  brandTiny: { fontSize: 10, color: "#0EA5E9", marginTop: 4 },
  tinyMuted: { fontSize: 10, color: "#94A3B8", marginTop: 2 },
  dayCell: {
    width: "13%",
    paddingVertical: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
  },
  bold: { fontWeight: "700", color: "#0F172A", marginTop: 2 },
  weekHdr: {
    width: "13%",
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 11,
  },
  monthCell: {
    width: "13%",
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  smallBtn: {
    backgroundColor: "#0EA5E9",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  smallBtnText: { color: "#0B1623", fontWeight: "700" },
});

export default OrganizeModes;
