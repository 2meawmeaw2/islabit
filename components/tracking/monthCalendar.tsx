import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { View, Text, Pressable, useWindowDimensions } from "react-native";

const BG_COLOR = "#00070A";
const CALENDAR_BG = "#18181A";
const HEADER_TITLE_COLOR = "#fff";
const HEADER_SUB_COLOR = "#85DEFF";
const ARROW_BG = "#1A1E1F";
const ARROW_COLOR = "#85DEFF";
const DAY_HEADER_COLOR = "#BDBDBD";
const DAY_COLOR = "#BDBDBD";
const DAY_TODAY_BORDER = "#60bfc5";
const DAY_DISABLED_COLOR = "#454547";

const DAY_SIZE = 43; // px
const CALENDAR_MAX_WIDTH = 7 * DAY_SIZE + 12; // 7 days + some padding

// Arabic day names (Sunday to Saturday)
const arabicDayNames: string[] = ["أح", "اث", "ث", "ر", "خ", "ج", "س"];

// Arabic month names
const arabicMonthNames: string[] = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

// Convert English numbers to Arabic numerals
const toArabicNumerals = (num: number): string => {
  const arabicNumerals = "٠١٢٣٤٥٦٧٨٩";
  return num
    .toString()
    .replace(/[0-9]/g, (digit: string) => arabicNumerals[Number(digit)]);
};

// Helper to format date to "YYYY-MM-DD"
const toDateString = (year: number, month: number, day: number) =>
  `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

type CalendarVariant = "standalone" | "embedded";

type ArabicHabitCalendarProps = {
  variant?: CalendarVariant;
  completedDates?: string[]; // ISO strings YYYY-MM-DD considered completed for the month view
  // Weekday schedule: Sunday = 0 … Saturday = 6 (Sunday-first calendar)
  shouldDoOnWeekdays?: number[];
};

const ArabicHabitCalendar: React.FC<ArabicHabitCalendarProps> = ({
  variant = "standalone",
  completedDates = [],
  shouldDoOnWeekdays,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2025, 8, 2)); // Sep 2025 for demo

  // Accept completion from parent; keep no local demo state in production
  const [completedDayStrings] = useState<string[]>(completedDates);

  // Responsive width
  const { width: windowWidth } = useWindowDimensions();
  // For max 7 days, limit the calendar width to a max value or 100% of the parent minus padding
  const calendarWidth = Math.min(
    windowWidth - (variant === "embedded" ? 0 : 32),
    CALENDAR_MAX_WIDTH
  );

  // Get calendar data
  const getCalendarData = (): Array<number | null> => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();

    // Calendar starts with Sunday (0 = Sunday)
    const firstDayWeekday = firstDayOfMonth.getDay();

    const days: Array<number | null> = [];

    // Empty cells before the first day
    for (let i = 0; i < firstDayWeekday; i++) {
      days.push(null);
    }

    // Days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    // Fill up to 6 rows
    while (days.length % 7 !== 0) {
      days.push(null);
    }

    return days;
  };

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const calendarDays = getCalendarData();

  // Header: Arabic month and year (e.g. "سبتمبر ٢٠٢٥")
  const headerMonthYear = `${arabicMonthNames[currentDate.getMonth()]} ${toArabicNumerals(currentDate.getFullYear())}`;

  // Today logic for blue ring
  const today = new Date();
  const isToday = (day: number | null) =>
    day &&
    day === today.getDate() &&
    today.getMonth() === currentDate.getMonth() &&
    today.getFullYear() === currentDate.getFullYear();

  // For marking completed days
  const isCompleted = (day: number | null) => {
    if (!day) return false;
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const dateStr = toDateString(year, month, day);
    return completedDayStrings.includes(dateStr);
  };

  // Compute Sunday-first weekday index for a specific date (0 = Sunday … 6 = Saturday)
  const getSundayFirstWeekday = (year: number, month: number, day: number) => {
    return new Date(year, month, day).getDay();
  };

  // Calendar styles
  const isEmbedded = variant === "embedded";

  const arrowSize = isEmbedded ? 40 : 64;
  const titleFont = isEmbedded ? 20 : 32;
  const subTitleFont = isEmbedded ? 14 : 24;

  return (
    <View
      style={{
        flex: isEmbedded ? undefined : 1,
        backgroundColor: isEmbedded ? "transparent" : BG_COLOR,
        paddingTop: isEmbedded ? 0 : 16,
      }}
    >
      {/* Month Switcher Header */}
      <View
        style={{
          flexDirection: "row-reverse",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
        }}
      >
        {/* Left Arrow */}
        <Pressable
          onPress={() => navigateMonth(-1)}
          style={{
            width: arrowSize,
            height: arrowSize,
            borderRadius: arrowSize / 2,
            backgroundColor: ARROW_BG,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="arrow-forward" size={16} color={ARROW_COLOR} />
        </Pressable>

        {/* Title and Date */}
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <Text
            style={{
              color: HEADER_TITLE_COLOR,
              fontSize: titleFont,
              marginBottom: 2,
              textAlign: "center",
            }}
            className="font-ibm-plex-arabic-semibold text-md"
          >
            التاريخ
          </Text>
          <Text
            style={{
              color: HEADER_SUB_COLOR,
              fontSize: subTitleFont,
              letterSpacing: 1,
              textAlign: "center",
            }}
            className="font-ibm-plex-arabic text-sm"
          >
            {headerMonthYear}
          </Text>
        </View>

        {/* Right Arrow */}
        <Pressable
          onPress={() => navigateMonth(1)}
          style={{
            width: arrowSize,
            height: arrowSize,
            borderRadius: arrowSize / 2,
            backgroundColor: ARROW_BG,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="arrow-back" size={16} color={ARROW_COLOR} />
        </Pressable>
      </View>

      {/* Calendar Box */}
      <View
        style={{
          marginHorizontal: 8,
          backgroundColor: CALENDAR_BG,
          paddingVertical: 18,
          borderRadius: 32,
          alignSelf: "center",
          width: calendarWidth,
          maxWidth: CALENDAR_MAX_WIDTH,
        }}
      >
        {/* Day Names Header */}
        <View
          style={{
            flexDirection: "row-reverse",
            marginBottom: 10,
            width: "100%",
          }}
        >
          {arabicDayNames.map((dayName, idx) => (
            <View
              key={idx}
              style={{
                width: DAY_SIZE,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: DAY_HEADER_COLOR,
                  fontSize: 15,
                  fontWeight: "500",
                  letterSpacing: 1,
                }}
                className="font-ibm-plex-arabic-medium  text-md"
              >
                {dayName}
              </Text>
            </View>
          ))}
        </View>

        {/* Calendar Days */}
        <View
          style={{
            flexDirection: "row-reverse",
            flexWrap: "wrap",
            width: "100%",
          }}
        >
          {calendarDays.map((day, idx) => {
            const completed = isCompleted(day);
            const todayRing = isToday(day);

            // Determine if the habit should be done on this day (default to true if no schedule provided)
            let shouldDo = true;
            if (day) {
              const year = currentDate.getFullYear();
              const month = currentDate.getMonth();
              const weekday = getSundayFirstWeekday(year, month, day);
              if (
                Array.isArray(shouldDoOnWeekdays) &&
                shouldDoOnWeekdays.length > 0
              ) {
                shouldDo = shouldDoOnWeekdays.includes(weekday);
              }
            }

            // Color logic
            const textColor =
              day == null
                ? DAY_DISABLED_COLOR
                : completed
                  ? "#fff"
                  : todayRing
                    ? DAY_TODAY_BORDER
                    : DAY_COLOR;

            return (
              <View
                key={idx}
                style={{
                  width: DAY_SIZE,
                  height: DAY_SIZE,
                  alignItems: "center",
                  justifyContent: "center",
                  marginVertical: 2,
                }}
              >
                {day ? (
                  <Pressable
                    disabled
                    style={{
                      width: DAY_SIZE - 4,
                      height: DAY_SIZE - 4,
                      borderRadius: (DAY_SIZE - 4) / 2,
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: completed ? "#60bfc5" : "transparent",
                      borderWidth: todayRing ? 2 : 0,
                      borderColor: todayRing ? DAY_TODAY_BORDER : "transparent",
                      opacity: shouldDo ? 1 : 0.35,
                    }}
                  >
                    <Text
                      style={{
                        color: textColor,
                      }}
                      className={`font-ibm-plex-arabic text-md ${
                        completed ? "text-white" : textColor
                      }`}
                    >
                      {toArabicNumerals(day)}
                    </Text>
                  </Pressable>
                ) : (
                  <View
                    style={{
                      width: DAY_SIZE - 4,
                      height: DAY_SIZE - 4,
                      borderRadius: (DAY_SIZE - 4) / 2,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: DAY_DISABLED_COLOR,
                        fontSize: 18,
                        opacity: 0.3,
                      }}
                    ></Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

export default ArabicHabitCalendar;
