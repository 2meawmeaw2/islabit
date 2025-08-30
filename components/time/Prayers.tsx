// NextPrayerCard.tsx
import { fmtCountdown } from "@/lib/dates";
import { currentAndNext, PRAYERS } from "@/lib/prayers";
import { PrayerKey } from "@/types/salat";
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
type PrayerTime = { key: PrayerKey; name: string; time: string; emoji: string };
type Props = {
  prayerTimes?: PrayerTime[];
  isCurrent?: (k: PrayerKey) => boolean;
  isNext?: (k: PrayerKey) => boolean;
  sinceCurrentSec?: number;
  RED_AFTER_MIN?: number;
  style?: ViewStyle; // e.g. { marginTop: SP.pillTop }
};

const COLORS = {
  bg: "#1A1A1A",
  textMuted: "#6B7280",
  text: "#F9FAFB",
  accent: "#4B9AB5",
  border: "transparent",
};

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
            {next.name} • {next.time}
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
              ? COLORS.text // subtle for "next"
              : COLORS.textMuted; // muted for others

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
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  // layout
  topRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  nextBlock: {
    flex: 1,
    marginLeft: 16,
  },
  countdownBlock: {
    alignItems: "center",
    minWidth: 96,
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
    marginTop: 16,
  },
  pillItem: {
    width: "16%",
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  pillTime: {
    marginTop: 8,
    fontSize: 11,
    color: COLORS.accent, // same “brand” blue as WeekStrip
    fontWeight: "500",
  },
});
