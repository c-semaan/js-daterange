import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import weekday from "dayjs/plugin/weekday";
import { DateFormat, DateRange } from "./types/enums";
dayjs.extend(weekday);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("UTC");

class Period {
  timezone: string;
  tzoffset: number;
  dateformat: string;

  constructor(tz: string, dateformat: DateFormat) {
    this.timezone = tz;
    this.tzoffset = this.getOffset(tz);
    this.dateformat = dateformat;
  }

  // format('DD/MM/YYYY')
  getOffset(timeZone: string): number {
    const timeZoneName = Intl.DateTimeFormat("ia", {
      timeZoneName: "short",
      timeZone,
    })
      .formatToParts()
      .find((i) => i.type === "timeZoneName")?.value;
    const offset = timeZoneName?.slice(3);
    if (!offset) return 0;

    const matchData = offset.match(/([+-])(\d+)(?::(\d+))?/);
    if (!matchData) throw `cannot parse timezone name: ${timeZoneName}`;

    const [, sign, hour, minute] = matchData;
    let result = parseFloat(sign + hour) * 60;
    // if (sign === "+") result *= -1;
    // if (minute) result += parseInt(minute);

    return result;
  }

  getToday(): string[] {
    const today = dayjs()
      .utcOffset(this.tzoffset)
      .startOf("day")
      .format(this.dateformat);

    const endOfToday = dayjs()
      .utcOffset(this.tzoffset)
      .endOf("day")
      .format(this.dateformat);
    return [today, endOfToday];
  }
  getYesterday(): string[] {
    const yesterday = dayjs()
      .utcOffset(this.tzoffset)
      .subtract(1, "day")
      .format(this.dateformat);
    return [yesterday, yesterday];
  }

  getLastWeek(): string[] {
    const lastMonday = dayjs()
      .utcOffset(this.tzoffset)
      .weekday(-6)
      .format(this.dateformat);
    const lastSunday = dayjs()
      .utcOffset(this.tzoffset)
      .weekday(0)
      .format(this.dateformat);

    return [lastMonday, lastSunday];
  }
  getThisWeek(): string[] {
    const currMonday = dayjs()
      .utcOffset(this.tzoffset)
      .day(1)
      .format(this.dateformat);

    const currSunday = dayjs()
      .utcOffset(this.tzoffset)
      .day(7)
      .format(this.dateformat);

    return [currMonday, currSunday];
  }
  getThisMonth(): string[] {
    const FirstDayOfThisMonth = dayjs()
      .utcOffset(this.tzoffset)
      .startOf("month")
      .format(this.dateformat);

    const lastDayOfThisMonth = dayjs()
      .utcOffset(this.tzoffset)
      .endOf("month")
      .format(this.dateformat);

    return [FirstDayOfThisMonth, lastDayOfThisMonth];
  }

  getLastMonth(): string[] {
    const FirstDayOfLastMonth = dayjs()
      .utcOffset(this.tzoffset)
      .subtract(1, "month")
      .startOf("month")
      .format(this.dateformat);

    const lastDayOfLastMonth = dayjs()
      .utcOffset(this.tzoffset)
      .subtract(1, "month")
      .endOf("month")
      .format(this.dateformat);

    dayjs.tz.guess;

    return [FirstDayOfLastMonth, lastDayOfLastMonth];
  }

  createDefinedRange(daterange: DateRange): string[] {
    const computedDateRange = () => {
      switch (daterange) {
        case DateRange.LAST_MONTH:
          return this.getLastMonth();
        case DateRange.LAST_WEEK:
          return this.getLastWeek();
        case DateRange.THIS_MONTH:
          return this.getThisMonth();
        case DateRange.THIS_WEEK:
          return this.getThisWeek();
        case DateRange.TODAY:
          return this.getToday();
        case DateRange.YESTERDAY:
          return this.getYesterday();
        default:
          throw new Error(`Unsupported DateRange: ${daterange}`);
      }
    };
    return computedDateRange();
  }
  createCustomRange(prevDays: number, includingToday: boolean): string[] {
    const endDate = includingToday
      ? dayjs().utcOffset(this.tzoffset)
      : dayjs().utcOffset(this.tzoffset).subtract(1, "day");

    const startDate = endDate.subtract(prevDays, "day");
    return [startDate.format(this.dateformat), endDate.format(this.dateformat)];
  }
}

export { Period };
