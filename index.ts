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
  timezone?: string;
  utcOffset?: number;
  dateformat: string;

  /**
   *
   * @param dateformat
   * @param timezone expects IANA time zone such as "Europe/Paris"
   */
  constructor(dateformat: DateFormat, timezone?: string) {
    this.timezone = timezone;
    if (timezone != null) this.utcOffset = this.calculateUtcOffset(timezone);
    this.dateformat = dateformat;
  }

  /**
   *
   * @param timezone expects IANA time zone such as "Europe/Paris"
   * @returns {number} the difference in minutes between a specific timezone and Coordinated Universal Time (UTC). Returns 0 if the timezone is invalid.
   */
  calculateUtcOffset(timeZone: string): number {
    let result = 0;
    if (timeZone) {
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

      const [, sign, hour] = matchData;
      result = parseFloat(sign + hour) * 60;
    }
    return result;
  }

  getToday(): string[] {
    const today = dayjs()
      .utcOffset(this.utcOffset ?? 0)
      .startOf("day")
      .format(this.dateformat);

    const endOfToday = dayjs()
      .utcOffset(this.utcOffset ?? 0)
      .endOf("day")
      .format(this.dateformat);
    return [today, endOfToday];
  }
  getYesterday(): string[] {
    const yesterday = dayjs()
      .utcOffset(this.utcOffset ?? 0)
      .subtract(1, "day")
      .format(this.dateformat);
    return [yesterday, yesterday];
  }

  getLastWeek(): string[] {
    const lastMonday = dayjs()
      .utcOffset(this.utcOffset ?? 0)
      .weekday(-6)
      .format(this.dateformat);
    const lastSunday = dayjs()
      .utcOffset(this.utcOffset ?? 0)
      .weekday(0)
      .format(this.dateformat);

    return [lastMonday, lastSunday];
  }
  getThisWeek(): string[] {
    const currMonday = dayjs()
      .utcOffset(this.utcOffset ?? 0)
      .day(1)
      .format(this.dateformat);

    const currSunday = dayjs()
      .utcOffset(this.utcOffset ?? 0)
      .day(7)
      .format(this.dateformat);

    return [currMonday, currSunday];
  }
  getThisMonth(): string[] {
    const FirstDayOfThisMonth = dayjs()
      .utcOffset(this.utcOffset ?? 0)
      .startOf("month")
      .format(this.dateformat);

    const lastDayOfThisMonth = dayjs()
      .utcOffset(this.utcOffset ?? 0)
      .endOf("month")
      .format(this.dateformat);

    return [FirstDayOfThisMonth, lastDayOfThisMonth];
  }

  getLastMonth(): string[] {
    const FirstDayOfLastMonth = dayjs()
      .utcOffset(this.utcOffset ?? 0)
      .subtract(1, "month")
      .startOf("month")
      .format(this.dateformat);

    const lastDayOfLastMonth = dayjs()
      .utcOffset(this.utcOffset ?? 0)
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
      ? dayjs().utcOffset(this.utcOffset ?? 0)
      : dayjs()
          .utcOffset(this.utcOffset ?? 0)
          .subtract(1, "day");

    const startDate = endDate.subtract(prevDays, "day");
    return [startDate.format(this.dateformat), endDate.format(this.dateformat)];
  }
}

export { Period };
