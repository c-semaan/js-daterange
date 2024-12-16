# Date Range Utils

A utility package for handling date ranges across different timezones.

## Installation

```bash
npm install @yourusername/date-range-utils
```

## Usage

```typescript
import { Period, DateFormat, DateRange } from '@yourusername/date-range-utils';

// Create a Period instance with a specific timezone and date format
const period = new Period('America/New_York', DateFormat.YYYY_MM_DD);

// Get date range for last month
const lastMonthRange = period.createDefinedRange(DateRange.LAST_MONTH);

// Create a custom date range (e.g., last 7 days including today)
const customRange = period.createCustomRange(7, true);
```

## Methods

- `createDefinedRange(dateRange: DateRange)`: Get predefined date ranges
- `createCustomRange(prevDays: number, includingToday: boolean)`: Create custom date ranges
- `getOffset(timeZone: string)`: Get timezone offset

## License

MIT