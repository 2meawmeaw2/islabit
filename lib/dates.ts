/** Date helpers (week starts Saturday = 6) */
export const WEEK_START = 6;
// Let's define the days of the week in both English and Arabic, as well as a mapping between them.
// This will help us when we want to display or convert between day names in different languages.

// English day names, starting from Saturday (index 0 = Saturday)
export const WEEK_DAYS_EN = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

// Arabic day names, same order as above
export const WEEK_DAYS_AR = [
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
] as const;

// Now, let's create a mapping array that links each day in English to its Arabic equivalent and its numeric index (0 = Saturday)
export const WEEK_DAYS = WEEK_DAYS_EN.map((en, idx) => ({
  ar: WEEK_DAYS_AR[idx],
  num: idx,
}));

// Why do you think it's useful to have both the English and Arabic names, as well as the numeric index, in this mapping?

export const startOfWeek = (d: Date) => {
  const x = new Date(d);
  const delta = (x.getDay() - WEEK_START + 7) % 7;
  x.setDate(x.getDate() - delta);
  x.setHours(0, 0, 0, 0);
  return x;
};

export const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

export const firstOfMonth = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), 1);
export const lastOfMonth = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth() + 1, 0);

export const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const fmtArabicDate = (d: Date) =>
  new Intl.DateTimeFormat("ar", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);

export const fmtArabicDateMonthAndNumber = (d: Date) =>
  new Intl.DateTimeFormat("ar", {
    day: "numeric",
    month: "long",
  }).format(d);
// app/lib/dates.ts
export const todayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

export const toDate = (hhmm: string, base = new Date()) => {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(base);
  d.setHours(h, m, 0, 0);
  return d;
};

const pad2 = (n: number) => String(n).padStart(2, "0");

export const fmtCountdown = (s: number) =>
  `${pad2(Math.floor(s / 3600))}:${pad2(Math.floor((s % 3600) / 60))}:${pad2(
    s % 60
  )}`;
