import { addDays, format, getDaysInMonth } from "date-fns";

export type OccurrenceRule = {
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  interval: number;
  dayOfMonth: number | null;
  weekday: number | null;
  startsOn: string;
  endsOn: string | null;
  nextRunOn: string;
};

// noon, so timezone offsets can't move the date
const parse = (value: string) => new Date(`${value}T12:00:00`);
const iso = (date: Date) => format(date, "yyyy-MM-dd");

// safety cap in case of a bad row
const MAX_OCCURRENCES = 5000;

// Dates a rule is due from nextRunOn up to `until` (inclusive).
//
// Each occurrence is computed from the anchor day, not from the previous one,
// otherwise a rule on the 31st would get stuck on the 28th after February.
export function computeOccurrences(
  rule: OccurrenceRule,
  until: string,
): string[] {
  if (!Number.isInteger(rule.interval) || rule.interval < 1) {
    throw new Error(`Recurring rule has a non-positive interval: ${rule.interval}`);
  }

  const start = parse(rule.nextRunOn);
  const end = parse(until);
  const ends = rule.endsOn ? parse(rule.endsOn) : null;

  if (ends && ends < start) return [];

  const limit = ends && ends < end ? ends : end;
  if (start > limit) return [];

  const occurrences: string[] = [];

  if (rule.frequency === "daily" || rule.frequency === "weekly") {
    const step = rule.interval * (rule.frequency === "weekly" ? 7 : 1);

    for (let index = 0; index < MAX_OCCURRENCES; index++) {
      const date = addDays(start, index * step);
      if (date > limit) break;
      occurrences.push(iso(date));
    }

    return occurrences;
  }

  const anchorDay = rule.dayOfMonth ?? start.getDate();
  const monthStep = rule.frequency === "yearly" ? 12 : rule.interval;
  const anchorMonth = start.getMonth();
  const anchorYear = start.getFullYear();

  for (let index = 0; index < MAX_OCCURRENCES; index++) {
    const monthsAhead = index * monthStep * (rule.frequency === "yearly" ? rule.interval : 1);
    const year = anchorYear + Math.floor((anchorMonth + monthsAhead) / 12);
    const month = (anchorMonth + monthsAhead) % 12;

    // short months use their last day
    const day = Math.min(anchorDay, getDaysInMonth(new Date(year, month, 1)));
    const date = new Date(year, month, day, 12);

    if (date > limit) break;
    if (date >= start) occurrences.push(iso(date));
  }

  return occurrences;
}

// Next due date after `from`, or null when the rule has ended.
export function nextRunAfter(
  rule: OccurrenceRule,
  from: string,
): string | null {
  const horizon = parse(from);
  horizon.setFullYear(horizon.getFullYear() + 1);

  const upcoming = computeOccurrences(rule, iso(horizon)).filter(
    (date) => date > from,
  );

  return upcoming[0] ?? null;
}
