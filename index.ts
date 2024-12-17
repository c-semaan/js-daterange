import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import weekday from "dayjs/plugin/weekday";
import { DateFormat, PresetDateRange } from "./types/enums";
import { DateRange } from "./types/types";
dayjs.extend(weekday);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("UTC");

class Period {
  timezone?: string;
  utcOffset?: number;
  dateformat: DateFormat;

  /**
   * Creates an instance of the Period class to handle date ranges and time zone offsets.
   * 
   * @param {DateFormat} dateformat - The format used for date formatting.
   * @param {string} [timezone] - The IANA time zone string, e.g., "Europe/Paris". If not provided, UTC is used.
   */
  constructor(dateformat: DateFormat, timezone?: string) {
    this.timezone = timezone;
    if (timezone != null) this.utcOffset = this.calculateUtcOffset(timezone);
    this.dateformat = dateformat;
  }

  /**
   * Calculates the UTC offset based on the given time zone.
   * 
   * @param {string} timezone - The IANA time zone string (e.g., "Europe/Paris").
   * @returns {number} The offset in minutes between the provided time zone and UTC.
   *                   Returns 0 if the time zone is invalid.
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

  /**
   * Returns the date range for today, from the start of the day (00:00:00) to the end of the day (23:59:59).
   * 
   * @returns {DateRange} The start and end dates for today in the specified format.
   */
  getToday(): DateRange {
    const today = dayjs()
      .utcOffset(this.utcOffset ?? 0)
      .startOf("day")
      .format(this.dateformat);

    const endOfToday = dayjs()
      .utcOffset(this.utcOffset ?? 0)
      .endOf("day")
      .format(this.dateformat);
    return { start: today, end: endOfToday };
  }

  /**
   * Returns the date range for yesterday, from the start of the day (00:00:00) to the end of the day (23:59:59).
   * 
   * @returns {DateRange} The start and end dates for yesterday in the specified format.
   */
  getYesterday(): DateRange {
    const yesterday = dayjs()
      .utcOffset(this.utcOffset ?? 0)
      .subtract(1, "day")
      .format(this.dateformat);
    return { start: yesterday, end: yesterday };
  }

  /**
   * Returns the date range for last week, from the previous Monday to the previous Sunday.
   * 
   * @returns {DateRange} The start and end dates for the previous week in the specified format.
   */
  getLastWeek(): DateRange {
    const lastMonday = dayjs()
      .utcOffset(this.utcOffset ?? 0)
      .weekday(-6)
      .format(this.dateformat);
    const lastSunday = dayjs()
      .utcOffset(this.utcOffset ?? 0)
      .weekday(0)
      .format(this.dateformat);

    return { start: lastMonday, end: lastSunday };
  }

  /**
   * Returns the date range for this week, from the current Monday to the current Sunday.
   * 
   * @returns {DateRange} The start and end dates for the current week in the specified format.
   */
  getThisWeek(): DateRange {
    const currMonday = dayjs()
      .utcOffset(this.utcOffset ?? 0)
      .day(1)
      .format(this.dateformat);

    const currSunday = dayjs()
      .utcOffset(this.utcOffset ?? 0)
      .day(7)
      .format(this.dateformat);

    return { start: currMonday, end: currSunday };
  }

  /**
   * Returns the date range for this month, from the first day of the month to the last day of the month.
   * 
   * @returns {DateRange} The start and end dates for the current month in the specified format.
   */
  getThisMonth(): DateRange {
    const FirstDayOfThisMonth = dayjs()
      .utcOffset(this.utcOffset ?? 0)
      .startOf("month")
      .format(this.dateformat);

    const lastDayOfThisMonth = dayjs()
      .utcOffset(this.utcOffset ?? 0)
      .endOf("month")
      .format(this.dateformat);

    return { start: FirstDayOfThisMonth, end: lastDayOfThisMonth };
  }

  /**
   * Returns the date range for last month, from the first day of the previous month to the last day of the previous month.
   * 
   * @returns {DateRange} The start and end dates for the previous month in the specified format.
   */
  getLastMonth(): DateRange {
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

    return { start: FirstDayOfLastMonth, end: lastDayOfLastMonth };
  }

  /**
   * Returns a date range for a predefined period based on the provided date range.
   * 
   * @param {PresetDateRange} daterange - The predefined date range (e.g., LAST_MONTH, THIS_WEEK).
   * @returns {DateRange} The corresponding start and end dates for the specified period.
   */
  createDefinedRange(daterange: PresetDateRange): DateRange {
    const computedDateRange = () => {
      switch (daterange) {
        case PresetDateRange.LAST_MONTH:
          return this.getLastMonth();
        case PresetDateRange.LAST_WEEK:
          return this.getLastWeek();
        case PresetDateRange.THIS_MONTH:
          return this.getThisMonth();
        case PresetDateRange.THIS_WEEK:
          return this.getThisWeek();
        case PresetDateRange.TODAY:
          return this.getToday();
        case PresetDateRange.YESTERDAY:
          return this.getYesterday();
        default:
          throw new Error(`Unsupported DateRange: ${daterange}`);
      }
    };
    return computedDateRange();
  }

  /**
   * Generates a date range from the past based on a number of days.
   * The range can optionally include the current day as the end date.
   * 
   * @param {number} prevDays - The number of previous days to calculate the range.
   * @param {boolean} includingToday - If true, the current day will be included as the end date.
   * @returns {DateRange} An object containing the formatted start and end dates.
   * 
   * @example
   * const dateRange = createPastDateRange(7, true);
   * console.log(dateRange); // { start: "2024-12-10", end: "2024-12-17" }
   */
  createPastDateRange(prevDays: number, includingToday: boolean): DateRange {
    const endDate = includingToday
      ? dayjs().utcOffset(this.utcOffset ?? 0)
      : dayjs()
        .utcOffset(this.utcOffset ?? 0)
        .subtract(1, "day");

    const startDate = endDate.subtract(prevDays, "day");
    return {
      start: startDate.format(this.dateformat),
      end: endDate.format(this.dateformat),
    };
  }
}

export { Period };
