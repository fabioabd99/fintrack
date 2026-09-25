import { addMonths, format, getDaysInMonth } from "date-fns";

// Next date after `today` that falls on `day` of the month (clamped to the
// month's last day). Used as the first run of a new salary rule.
export function firstPayday(day: number, today: string): string {
  const now = new Date(`${today}T12:00:00`);

  for (const month of [now, addMonths(now, 1)]) {
    const date = new Date(
      month.getFullYear(),
      month.getMonth(),
      Math.min(day, getDaysInMonth(month)),
      12,
    );
    if (date > now) return format(date, "yyyy-MM-dd");
  }

  // unreachable: next month always has a matching day
  throw new Error(`No payday found for day ${day}`);
}
