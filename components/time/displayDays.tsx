// App.tsx
import React, { useCallback, useMemo, useState } from "react";
import {
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

type WeekStripProps = {
  selectedDate?: Date;
  weekStartsOn?: 0 | 1; // 0 = Sunday, 1 = Monday
  onChange?: (d: Date) => void;
};

const DAY_NAMES_FULL = [
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];

// compact labels when space is tight
const DAY_NAMES_SHORT = ["أح", "اث", "ثل", "أر", "خم", "جم", "سب"];

function startOfWeek(d: Date, weekStartsOn: 0 | 1 = 0) {
  const copy = new Date(d);
  const day = copy.getDay();
  const diff = (day - weekStartsOn + 7) % 7;
  copy.setHours(0, 0, 0, 0);
  copy.setDate(copy.getDate() - diff);
  return copy;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const WeekStrip: React.FC<WeekStripProps> = ({
  selectedDate = new Date(),
  weekStartsOn = 0,
  onChange,
}) => {
  const [internalSelected, setInternalSelected] = useState<Date>(selectedDate);
  const { width: windowWidth } = useWindowDimensions();

  // measure actual row width to be layout-accurate (handles container padding, insets, etc.)
  const [rowWidth, setRowWidth] = useState<number>(windowWidth);
  const onRowLayout = useCallback((e: LayoutChangeEvent) => {
    setRowWidth(e.nativeEvent.layout.width);
  }, []);

  // per-item width
  const itemWidth = Math.max(40, rowWidth / 7); // keep a sensible minimum

  // responsive sizes derived from item width
  const circleSize = Math.max(40, Math.min(64, itemWidth * 0.8));
  const dateFont = Math.round(Math.max(16, Math.min(28, circleSize * 0.42)));
  const dayFont = Math.round(Math.max(12, Math.min(16, itemWidth * 0.28)));
  const underlineWidth = Math.max(24, Math.min(40, itemWidth * 0.62));
  const underlineHeight = Math.max(6, Math.min(8, circleSize * 0.14));
  const isCompact = itemWidth < 56;

  const week = useMemo(() => {
    const s = startOfWeek(internalSelected, weekStartsOn);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(s);
      d.setDate(s.getDate() + i);
      return d;
    });
  }, [internalSelected, weekStartsOn]);

  const handleSelect = (d: Date) => {
    setInternalSelected(d);
    onChange?.(d);
  };

  const rowDirection = "row-reverse";

  return (
    <View className="rounded-2xl bg-fore">
      <View
        style={[styles.row, { flexDirection: rowDirection }]}
        onLayout={onRowLayout}
      >
        {week.map((d) => {
          const selected = isSameDay(d, internalSelected);
          const isToday = isSameDay(d, new Date());
          const dayLabel = (isCompact ? DAY_NAMES_SHORT : DAY_NAMES_FULL)[
            d.getDay()
          ];
          return (
            <TouchableOpacity
              key={d.toISOString()}
              onPress={() => handleSelect(d)}
              style={[styles.item, { width: itemWidth }]}
              className="rounded-full"
              activeOpacity={0.9}
            >
              <Text
                style={[
                  styles.dayName,
                  { fontSize: dayFont },
                  isToday && styles.dayNameActive,
                ]}
                className="font-ibm-plex-arabic"
              >
                {dayLabel}
              </Text>

              <View
                style={[
                  styles.circle,
                  {
                    width: circleSize,
                    height: circleSize,
                    borderRadius: circleSize / 2,
                  },
                  isToday && styles.circleActive,
                ]}
              >
                <Text
                  style={[
                    styles.dateText,
                    { fontSize: dateFont },
                    (isToday || selected) && styles.dateTextActive,
                  ]}
                >
                  {d.getDate()}
                </Text>
              </View>

              <View
                style={[
                  styles.underline,
                  { width: underlineWidth, height: underlineHeight },
                  selected && styles.underlineActive,
                ]}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

interface DisplayDaysProps {
  selectedDate?: Date;
  onChange?: (date: Date) => void;
}

export default function DisplayDays({
  selectedDate,
  onChange,
}: DisplayDaysProps) {
  return (
    <View
      style={styles.safe}
      className=" fixed top-0 mx-2 rounded-bl-2xl rounded-br-sm"
    >
      <View
        style={styles.container}
        className="bg-fore rounded-bl-2xl rounded-br-2xl"
      >
        <WeekStrip
          selectedDate={selectedDate}
          weekStartsOn={0}
          onChange={onChange}
        />
      </View>
    </View>
  );
}

const COLORS = {
  bg: "#1A1E1F",
  textMuted: "#9CA3AF", // Replaced rgba(255,255,255,0.55)
  text: "#FFFFFF",
  circle: "#3B3F46",
  accent: "#00AEEF",
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  container: {
    paddingTop: 32,
    paddingHorizontal: 20,
  },

  row: {
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  item: {
    alignItems: "center",
    paddingVertical: 4, // extra tap area without affecting layout much
  },
  dayName: {
    letterSpacing: 2,
    marginBottom: 12,
    color: COLORS.textMuted,
    fontWeight: "600",
  },
  dayNameActive: {
    color: COLORS.accent, // highlight selected day label
  },
  // styles
  circle: {
    width: 64,
    height: 64,
    borderRadius: 32, // ← keep it round
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1A1E1F", // Replaced transparent with solid light gray
  },
  circleActive: {
    backgroundColor: "#00AEEF",
  },

  dateText: {
    fontWeight: "800",
    color: COLORS.textMuted,
  },
  dateTextActive: {
    color: "#FFFFFF",
  },
  underline: {
    borderRadius: 8,
    marginTop: 8,
    opacity: 0,
  },
  underlineActive: {
    backgroundColor: COLORS.accent,
    opacity: 1,
  },
});
