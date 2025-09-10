import {
  CalculationMethod,
  Madhab,
  HighLatitudeRule,
  CalculationParameters,
} from "adhan";

export interface PrayerCalcConfig {
  method: keyof typeof CalculationMethod; // e.g. 'MuslimWorldLeague'
  madhab: keyof typeof Madhab; // 'Hanafi' | 'Shafi'
  highLatitudeRule: keyof typeof HighLatitudeRule; // 'MiddleOfTheNight' | ...
  minutesAdjustments?: Partial<
    Record<"fajr" | "sunrise" | "dhuhr" | "asr" | "maghrib" | "isha", number>
  >;
}

export function buildParameters(cfg: PrayerCalcConfig): CalculationParameters {
  const params = CalculationMethod[cfg.method]();
  params.madhab = Madhab[cfg.madhab];
  params.highLatitudeRule = HighLatitudeRule[cfg.highLatitudeRule];
  if (cfg.minutesAdjustments)
    Object.assign(params.adjustments, cfg.minutesAdjustments);
  return params;
}

export const defaultPrayerCalcConfig: PrayerCalcConfig = {
  method: "MuslimWorldLeague",
  madhab: "Shafi",
  highLatitudeRule: "MiddleOfTheNight",
  minutesAdjustments: undefined,
};
