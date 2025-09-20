import React, {
  useCallback,
  useMemo,
  useState,
  useRef,
  useEffect,
} from "react";
import {
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  FlatList,
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

function generateWeeksForYear(year: number, weekStartsOn: 0 | 1 = 0): Date[][] {
  const weeks: Date[][] = [];
  const firstDayOfYear = new Date(year, 0, 1);
  const lastDayOfYear = new Date(year, 11, 31);

  let currentWeekStart = startOfWeek(firstDayOfYear, weekStartsOn);

  while (currentWeekStart <= lastDayOfYear) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(currentWeekStart);
      day.setDate(currentWeekStart.getDate() + i);
      week.push(day);
    }
    weeks.push(week);
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
  }

  return weeks;
}

const WeekStrip: React.FC<WeekStripProps> = ({
  selectedDate = new Date(),
  weekStartsOn = 0,
  onChange,
}) => {
  const { width: windowWidth } = useWindowDimensions();
  const flatListRef = useRef<FlatList>(null);
  const [rowWidth, setRowWidth] = useState<number>(windowWidth);
  const [initialScrollDone, setInitialScrollDone] = useState(false);

  const onRowLayout = useCallback((e: LayoutChangeEvent) => {
    setRowWidth(e.nativeEvent.layout.width);
  }, []);

  const currentYear = new Date().getFullYear();
  const weeks = useMemo(
    () => generateWeeksForYear(currentYear, weekStartsOn),
    [currentYear, weekStartsOn]
  );

  const itemWidth = Math.max(40, rowWidth / 7);
  const containerHeight = Math.max(65, Math.min(100, itemWidth * 1.3));
  const containerWidth = Math.max(45, Math.min(70, itemWidth * 0.9));
  const dayFont = Math.round(Math.max(10, Math.min(14, itemWidth * 0.25)));
  const isCompact = itemWidth < 56;

  const handleSelect = (d: Date) => {
    console.log("d", d);
    onChange?.(d);
  };

  // Find the initial week index to scroll to
  const initialWeekIndex = useMemo(() => {
    return weeks.findIndex((week) =>
      week.some((day) => isSameDay(day, selectedDate))
    );
  }, [weeks, selectedDate]);

  // Scroll to the initial week after layout
  useEffect(() => {
    if (initialWeekIndex >= 0 && !initialScrollDone && rowWidth > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: initialWeekIndex,
          animated: false,
          viewPosition: 0.5,
        });
        setInitialScrollDone(true);
      }, 100);
    }
  }, [initialWeekIndex, rowWidth, initialScrollDone]);

  const renderWeek = useCallback(
    ({ item: week }: { item: Date[] }) => {
      return (
        <View
          style={[
            styles.row,
            { flexDirection: "row-reverse", width: rowWidth },
          ]}
          onLayout={onRowLayout}
        >
          {week.map((d) => {
            const selected = isSameDay(d, selectedDate);
            const isToday = isSameDay(d, new Date());
            const dayLabel = (isCompact ? DAY_NAMES_SHORT : DAY_NAMES_FULL)[
              d.getDay()
            ];
            return (
              <TouchableOpacity
                key={d.toISOString()}
                onPress={() => handleSelect(d)}
                style={[
                  styles.item,
                  {
                    width: itemWidth - 6,
                    height: containerHeight - 10,
                  },
                ]}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.container,
                    {
                      width: "100%",
                      height: "100%",
                      borderColor:
                        isToday && !selected ? COLORS.accent : undefined,
                    },
                    selected && styles.containerSelected,
                  ]}
                  className="rounded-2xl "
                >
                  <Text
                    style={[
                      styles.dayName,
                      {
                        fontSize: dayFont,
                        width: containerWidth,
                        height: "35%",
                      },
                      isToday && styles.dayNameSelected,
                      selected && { color: COLORS.selectedText },
                    ]}
                    className={`
                    font-ibm-plex-arabic
                    ${isToday ? "text-text-primary" : "text-text-secondary/80"}
                    ${isToday ? "font-ibm-plex-arabic-bold" : "font-ibm-plex-arabic-medium"}
                  `}
                  >
                    {dayLabel}
                  </Text>
                  <View
                    style={{
                      backgroundColor: selected
                        ? COLORS.accentBg
                        : COLORS.cardLower,
                      borderRadius: 6,
                      width: "100%",
                      height: "65%",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={[
                        styles.dateText,
                        selected && styles.dateTextSelected,
                      ]}
                      className={`
                    text-md
                    ${isToday ? "text-text-primary" : "text-text-muted"}
                    ${isToday ? "font-ibm-plex-arabic-bold" : "font-ibm-plex-arabic-medium"}
                  `}
                    >
                      {d.getDate()}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      );
    },
    [
      rowWidth,
      itemWidth,
      containerWidth,
      containerHeight,
      dayFont,
      isCompact,
      selectedDate,
    ]
  );

  return (
    <View className="rounded-2xl  ">
      <FlatList
        ref={flatListRef}
        data={weeks}
        renderItem={renderWeek}
        keyExtractor={(week, index) => index.toString()}
        horizontal
        pagingEnabled
        inverted={true}
        showsHorizontalScrollIndicator={false}
        getItemLayout={(data, index) => ({
          length: rowWidth,
          offset: rowWidth * index,
          index,
        })}
        initialScrollIndex={initialWeekIndex}
        onScrollToIndexFailed={(info) => {
          // Fallback in case initial scroll fails
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({
              index: info.index,
              animated: false,
            });
          }, 100);
        }}
      />
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
      className=" fixed top-0  rounded-bl-2xl rounded-br-sm "
    >
      <WeekStrip
        selectedDate={selectedDate}
        weekStartsOn={0}
        onChange={onChange}
      />
    </View>
  );
}

const COLORS = {
  bg: "#0F1112",
  card: "#1A1E1F",
  cardLower: "#121212",
  borderMuted: "#2A2F31",
  textMuted: "#6B7280",
  text: "#FFFFFF",
  accent: "#22D3EE",
  accentBg: "#22D3EE33",
  accentBgStrong: "#22D3EE66",
  selectedText: "#FFFFFF",
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    marginTop: 10,
  },
  row: {
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  item: {
    alignItems: "center",
  },
  container: {
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.borderMuted,
    overflow: "hidden",
  },
  containerSelected: {
    backgroundColor: COLORS.accentBgStrong,
    borderColor: COLORS.accent,
  },
  dayName: {
    marginBottom: 6,
    textAlign: "center",
    justifyContent: "center",
  },
  dayNameSelected: {
    color: COLORS.selectedText,
    fontWeight: "600",
  },
  dateText: {
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 6,
  },
  dateTextSelected: {
    color: COLORS.selectedText,
    fontWeight: "800",
  },
});
