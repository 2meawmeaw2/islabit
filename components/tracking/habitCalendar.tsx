import { useHabitsStore } from "@/store/habitsStore";
import type { HabitProps } from "@/types/habit";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, Text, View, useWindowDimensions } from "react-native";

const BG_COLOR = "#00070A";
const CALENDAR_BG = "#18181A";
const HEADER_TITLE_COLOR = "#fff";
const HEADER_SUB_COLOR = "#85DEFF";
const ARROW_BG = "#1A1E1F";
const ARROW_COLOR = "#85DEFF";
const DAY_HEADER_COLOR = "#BDBDBD";
const DAY_COLOR = "#BDBDBD";
const DAY_TODAY_BORDER = "#60bfc5";

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
const toDateString = (year: number, month: number, day: number): string =>
  `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

type CalendarVariant = "standalone" | "embedded";

type HabitCalendarProps = {
  variant?: CalendarVariant;
  habitId: string; // The ID of the habit to track
  completedDates?: string[]; // Optional initial completed dates
  // Weekday schedule: Sunday = 0 … Saturday = 6 (Sunday-first calendar)
  shouldDoOnWeekdays?: number[];
  color?: string;
  readonly?: boolean; // If true, the user can't toggle dates
};

const HabitCalendar: React.FC<HabitCalendarProps> = ({
  variant = "standalone",
  habitId,
  completedDates = [],
  shouldDoOnWeekdays,
  color = "#00AEEF",
  readonly = false,
}) => {
  // Get today's date for default current view
  const todayDate = new Date();

  // Current date for calendar navigation
  const [currentDate, setCurrentDate] = useState<Date>(todayDate);

  // Connect to habit store
  const completeHabit = useHabitsStore((state) => state.completeHabit);
  const habits = useHabitsStore((state) => state.habits);
  const habit: HabitProps | undefined = habits.find((h) => h.id === habitId);

  // Get completed dates from the store or props
  const storedCompletedDates: string[] = habit?.completedDates || [];
  const allCompletedDates: string[] = [
    ...new Set([...completedDates, ...storedCompletedDates]),
  ];

  // Responsive width
  const { width: windowWidth } = useWindowDimensions();
  // For max 7 days, limit the calendar width to a max value or 100% of the parent minus padding
  const calendarWidth = Math.min(
    windowWidth - (variant === "embedded" ? 0 : 32),
    CALENDAR_MAX_WIDTH
  );

  // Get calendar data
  const getCalendarData = (): Array<{
    day: number;
    isCurrentMonth: boolean;
  }> => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();

    // Calendar starts with Sunday (0 = Sunday)
    const firstDayWeekday = firstDayOfMonth.getDay();

    const days: Array<{ day: number; isCurrentMonth: boolean }> = [];

    // Get last month's days that should appear
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayWeekday - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
      });
    }

    // Days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
      });
    }

    // Calculate how many days we need to add to reach 42 days (6 rows × 7 days)
    const remainingDays = 42 - days.length;

    // Fill up with next month's days to complete 6 rows
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
      });
    }

    return days;
  };

  // Handle toggling completion for a specific day
  const toggleCompletion = (day: number): void => {
    if (readonly || !day) return;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const dateStr = toDateString(year, month, day);

    // Check if the day is already completed
    const isCompleted = allCompletedDates.includes(dateStr);

    // Toggle completion by updating the store
    completeHabit(habitId, dateStr, "unknown", !isCompleted);
  };

  const navigateMonth = (direction: number): void => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const calendarDays = getCalendarData();

  // Header: Arabic month and year (e.g. "سبتمبر ٢٠٢٥")
  const headerMonthYear = `${arabicMonthNames[currentDate.getMonth()]} ${toArabicNumerals(currentDate.getFullYear())}`;

  // Today logic for blue ring
  const today = new Date();
  const isToday = (day: number): boolean =>
    !!(
      day === today.getDate() &&
      today.getMonth() === currentDate.getMonth() &&
      today.getFullYear() === currentDate.getFullYear()
    );

  // For marking completed days
  const isCompleted = (day: number): boolean => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const dateStr = toDateString(year, month, day);
    return allCompletedDates.includes(dateStr);
  };

  // Compute Sunday-first weekday index for a specific date (0 = Sunday … 6 = Saturday)
  const getSundayFirstWeekday = (
    year: number,
    month: number,
    day: number
  ): number => {
    return new Date(year, month, day).getDay();
  };

  // Calendar styles
  const isEmbedded = variant === "embedded";

  const arrowSize = 40;

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
              marginBottom: 2,
              textAlign: "center",
            }}
            className="font-ibm-plex-arabic-semibold text-lg"
          >
            التاريخ
          </Text>
          <Text
            style={{
              color: color + "90",
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
                className="font-ibm-plex-arabic-medium text-md"
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
          {calendarDays.map((dayData, idx) => {
            const { day, isCurrentMonth } = dayData;
            const completed = isCurrentMonth && isCompleted(day);
            const todayRing = isCurrentMonth && isToday(day);

            // Determine if the habit should be done on this day (default to true if no schedule provided)
            let shouldDo = isCurrentMonth;
            if (isCurrentMonth) {
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
            const textColor = isCurrentMonth
              ? completed
                ? "#fff"
                : todayRing
                  ? DAY_TODAY_BORDER
                  : DAY_COLOR
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
                <Pressable
                  onPress={() =>
                    isCurrentMonth && !readonly && toggleCompletion(day)
                  }
                  disabled={!isCurrentMonth || readonly}
                  style={{
                    width: DAY_SIZE - 7,
                    height: DAY_SIZE - 7,
                    borderRadius: (DAY_SIZE - 4) / 2,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: completed ? color : "transparent",
                    borderWidth: todayRing ? 2 : 0,
                    borderColor: todayRing ? DAY_TODAY_BORDER : "transparent",
                    opacity: shouldDo ? 1 : 0.3,
                  }}
                >
                  <Text
                    style={{
                      color: textColor,
                    }}
                    className={`font-ibm-plex-arabic text-md ${
                      completed ? "text-white" : ""
                    }`}
                  >
                    {toArabicNumerals(day)}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

export default HabitCalendar;
