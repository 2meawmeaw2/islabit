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
  const containerHeight = Math.max(80, Math.min(100, itemWidth * 1.3));
  const containerWidth = Math.max(45, Math.min(70, itemWidth * 0.9));
  const dateFont = Math.round(Math.max(18, Math.min(32, itemWidth * 0.45)));
  const dayFont = Math.round(Math.max(10, Math.min(14, itemWidth * 0.25)));
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
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.container,
                  {
                    width: containerWidth,
                    height: containerHeight,
                  },
                  selected && styles.containerSelected,
                ]}
                className="rounded-2xl "
              >
                <Text
                  style={[
                    styles.dayName,
                    { fontSize: dayFont },
                    isToday && styles.dayNameSelected,
                  ]}
                  className={`
                    font-ibm-plex-arabic
                    ${isToday ? "text-text-primary" : "text-text-secondary/80"}
                    ${isToday ? "font-ibm-plex-arabic-bold" : "font-ibm-plex-arabic-medium"}
                  `}
                >
                  {dayLabel}
                </Text>

                <Text
                  style={[styles.dateText]}
                  className={`
                    text-md
                    ${isToday ? "text-text-primary" : "text-text-muted"}
                    ${isToday ? "font-ibm-plex-arabic-bold" : "font-ibm-plex-arabic-medium"}
                    
                    
                    `}
                >
                  {d.getDate()}
                </Text>
              </View>
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
        style={styles.containerWrapper}
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
  textMuted: "#6B7280", // Darker muted text
  text: "#FFFFFF",
  selectedBg: "#00AEEF", // Blue highlight for selected background
  selectedText: "#FFFFFF",
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  containerWrapper: {
    paddingTop: 32,
    paddingHorizontal: 5,
  },

  row: {
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  item: {
    alignItems: "center",
    paddingVertical: 4,
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    backgroundColor: "transparent",
    overflow: "hidden", // Ensure rounded corners are maintained
  },
  containerSelected: {
    backgroundColor: COLORS.selectedBg,
  },
  dayName: {
    marginBottom: 6,
    textAlign: "center",
  },
  dayNameSelected: {
    color: COLORS.selectedText,
    fontWeight: "600",
  },
  dateText: {
    color: COLORS.text,
    textAlign: "center",
  },
  dateTextSelected: {
    color: COLORS.selectedText,
    fontWeight: "800",
  },
});
