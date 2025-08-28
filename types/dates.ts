// Let's start by defining a TypeScript type for the days of the week.
// What do you think is the best way to represent the days? Should we use string literal types or an enum?

// First, let's define the English days as a union type:
export type WeekDayEn =
  | "saturday"
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday";

// Now, let's define the Arabic days as a union type as well:
export type WeekDayAr =
  | "السبت"
  | "الأحد"
  | "الاثنين"
  | "الثلاثاء"
  | "الأربعاء"
  | "الخميس"
  | "الجمعة";

// For convenience, we can also define a mapping between English and Arabic days:

export type ONE_DAY = { ar: WeekDayAr; num: number };
export type WEEK_DAYS = { ar: WeekDayAr; num: number }[];

// What questions do you have about these type definitions? Would you like to see how to use them in practice?
