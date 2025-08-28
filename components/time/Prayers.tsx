// NextPrayerCard.tsx
import { fmtCountdown } from "@/lib/dates";
import { currentAndNext, PRAYERS } from "@/lib/prayers";
import { PrayerKey } from "@/types/salat";
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
type PrayerTime = { key: PrayerKey; name: string; time: string; emoji: string };
type NextPrayer = { name: string; time: string; emoji?: string };
type Props = {
  prayerTimes?: PrayerTime[];
  isCurrent?: (k: PrayerKey) => boolean;
  isNext?: (k: PrayerKey) => boolean;
  sinceCurrentSec?: number;
  RED_AFTER_MIN?: number;
  style?: ViewStyle; // e.g. { marginTop: SP.pillTop }
};

const COLORS = {
  bg: "#1A1E1F",
  textMuted: "#9CA3AF", // Replaced rgba(255,255,255,0.55)
  text: "#FFFFFF",
  accent: "#00AEEF",
  border: "#374151", // Replaced rgba(255,255,255,0.08)
};

function rgba(hex: string, a: number) {
  const h = hex.replace("#", "");
  const bigint = parseInt(
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h,
    16
  );
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
const { current, next } = useMemo(
  () => currentAndNext(PRAYERS, new Date()),
  [PRAYERS, new Date()]
);
const isCurrentf = (k: PrayerKey) => current.key === k;
const isNextf = (k: PrayerKey) => next.key === k;
const NextPrayerCard: React.FC<Props> = ({
  prayerTimes = PRAYERS,
  isCurrent = (k: PrayerKey) => isCurrentf(k),
  isNext = (k: PrayerKey) => isNextf(k),
  RED_AFTER_MIN = 30,
}) => {
  // countdown +  since
  const [countdown, setCountdown] = useState("00:00:00");
  const [sinceCurrentSec, setSinceCurrentSec] = useState(0);
  useEffect(() => {
    const t = setInterval(() => {
      const now = new Date();
      const { current, next } = currentAndNext(prayerTimes, now);

      const untilNextSec = Math.max(
        0,
        Math.floor((next.date.getTime() - now.getTime()) / 1000)
      );
      setCountdown(fmtCountdown(untilNextSec));

      const sinceCurrent = Math.max(
        0,
        Math.floor((now.getTime() - current.date.getTime()) / 1000)
      );
      setSinceCurrentSec(sinceCurrent);
    }, 1000);
    return () => clearInterval(t);
  }, [prayerTimes]);

  return (
    <View style={[styles.card, { marginTop: 16 }]}>
      {/* Top row */}
      <View style={styles.topRow}>
        {/* Right block (RTL): labels + next prayer */}
        <View style={styles.nextBlock}>
          <Text
            className="font-ibm-plex-arabic"
            style={[styles.muted, styles.small, styles.right]}
          >
            الصلاة التالية
          </Text>
          <Text
            style={[styles.title, styles.right]}
            className="font-ibm-plex-arabic-semibold"
          >
            {next.name} • {next.time} {next.emoji ?? ""}
          </Text>
        </View>

        {/* Countdown */}
        <View style={styles.countdownBlock}>
          <Text
            style={[styles.muted, styles.xsmall]}
            className="font-ibm-plex-arabic"
          >
            باقي على الآذان
          </Text>
          <Text style={styles.countdown}>{countdown}</Text>
        </View>
      </View>

      {/* Pills row */}
      <View style={styles.pillsRow}>
        {prayerTimes.map((p) => {
          const current = isCurrent(p.key);
          const upcoming = isNext(p.key);
          const dotColor = current
            ? sinceCurrentSec >= RED_AFTER_MIN * 60
              ? "#EF4444" // red after threshold
              : COLORS.accent // blue while current
            : upcoming
              ? "#FFFFFF" // subtle for "next"
              : "#6C7684"; // slate-ish for others

          return (
            <View key={p.key} style={styles.pillItem}>
              <View style={[styles.dot, { backgroundColor: dotColor }]} />
              <Text style={styles.pillTime}>{p.time}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default NextPrayerCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bg,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  // layout
  topRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  nextBlock: {
    flex: 1,
    marginLeft: 12, // works with row-reverse (pushes away from countdown)
  },
  countdownBlock: {
    alignItems: "center",
    minWidth: 88,
  },

  // text
  right: { textAlign: "right" },
  title: {
    color: COLORS.text,
  },
  muted: {
    color: COLORS.textMuted,
    fontWeight: "500",
  },
  small: { fontSize: 11 },
  xsmall: { fontSize: 10 },
  countdown: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: "800",
    marginTop: 2,
  },

  // pills row
  pillsRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  pillItem: {
    width: "18%",
    alignItems: "center",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  pillTime: {
    marginTop: 6,
    fontSize: 10,
    color: COLORS.accent, // same “brand” blue as WeekStrip
    fontWeight: "600",
  },
});
