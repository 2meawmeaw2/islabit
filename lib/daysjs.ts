// daysjs.ts (ensure plugins are on)
import dayjs_ from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs_.extend(utc);
dayjs_.extend(timezone);

export const dayjs = dayjs_;
