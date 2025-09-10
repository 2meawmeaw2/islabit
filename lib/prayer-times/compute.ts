import {
  Coordinates,
  PrayerTimes,
  SunnahTimes,
  Qibla,
  CalculationParameters,
} from "adhan";
import * as Localization from "expo-localization";
import { dayjs } from "../daysjs";

// Derive the correct types from adhan's methods
type CurrentPrayer = ReturnType<PrayerTimes["currentPrayer"]>; // 'fajr' | ... | 'none'
type NextPrayer = ReturnType<PrayerTimes["nextPrayer"]>; // 'fajr' | ... | null (some versions may include 'none')

// Your existing interfaces
export interface RawPrayerTimes {
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
}

// (unchanged)
export interface FormattedPrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  timezone: string;
}

// Use the derived types here
export interface NextPrayerInfo {
  current: CurrentPrayer; // includes 'none'
  next: NextPrayer; // may be null (and in some builds might be 'none')
  nextTime: Date | null;
}

export function computePrayerTimes(
  latitude: number,
  longitude: number,
  date: Date,
  params: CalculationParameters
): {
  raw: RawPrayerTimes;
  formatted: FormattedPrayerTimes;
  next: NextPrayerInfo;
} {
  const coordinates = new Coordinates(latitude, longitude);
  const pt = new PrayerTimes(coordinates, date, params);

  const tz =
    Localization.getCalendars?.()[0]?.timeZone ||
    Intl.DateTimeFormat().resolvedOptions().timeZone ||
    dayjs.tz.guess();
  console.log(tz);
  const raw: RawPrayerTimes = {
    fajr: pt.fajr,
    sunrise: pt.sunrise,
    dhuhr: pt.dhuhr,
    asr: pt.asr,
    maghrib: pt.maghrib,
    isha: pt.isha,
  };
  const fmt = (d: Date) => dayjs(d).format("HH:mm");

  const formatted: FormattedPrayerTimes = {
    fajr: fmt(pt.fajr),
    sunrise: fmt(pt.sunrise),
    dhuhr: fmt(pt.dhuhr),
    asr: fmt(pt.asr),
    maghrib: fmt(pt.maghrib),
    isha: fmt(pt.isha),
    timezone: tz,
  };
  const current = pt.currentPrayer(); // type CurrentPrayer
  const next = pt.nextPrayer(); // type NextPrayer

  // Guard against null (and 'none' if your version returns it for nextPrayer)
  const nextTime = !next || next === "none" ? null : pt.timeForPrayer(next);

  return { raw, formatted, next: { current, next, nextTime } };
}

export function computeQibla(lat: number, lng: number): number {
  return Qibla(new Coordinates(lat, lng)); // function call form
}

export function computeSunnahTimes(pt: PrayerTimes) {
  return new SunnahTimes(pt);
}
