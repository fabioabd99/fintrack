import { describe, expect, test } from "vitest";

import { computeOccurrences, type OccurrenceRule } from "./recurring";

function rule(overrides: Partial<OccurrenceRule>): OccurrenceRule {
  return {
    frequency: "monthly",
    interval: 1,
    dayOfMonth: null,
    weekday: null,
    startsOn: "2026-01-01",
    endsOn: null,
    nextRunOn: "2026-01-01",
    ...overrides,
  };
}

describe("computeOccurrences", () => {
  test("returns nothing when the next run is after the window", () => {
    expect(
      computeOccurrences(rule({ nextRunOn: "2026-06-01" }), "2026-05-31"),
    ).toEqual([]);
  });

  test("includes the next run when it falls on the last day of the window", () => {
    expect(
      computeOccurrences(rule({ nextRunOn: "2026-05-31" }), "2026-05-31"),
    ).toEqual(["2026-05-31"]);
  });

  test("walks daily", () => {
    expect(
      computeOccurrences(
        rule({ frequency: "daily", nextRunOn: "2026-03-01" }),
        "2026-03-04",
      ),
    ).toEqual(["2026-03-01", "2026-03-02", "2026-03-03", "2026-03-04"]);
  });

  test("honours a daily interval", () => {
    expect(
      computeOccurrences(
        rule({ frequency: "daily", interval: 3, nextRunOn: "2026-03-01" }),
        "2026-03-10",
      ),
    ).toEqual(["2026-03-01", "2026-03-04", "2026-03-07", "2026-03-10"]);
  });

  test("walks weekly", () => {
    expect(
      computeOccurrences(
        rule({ frequency: "weekly", nextRunOn: "2026-03-02" }),
        "2026-03-23",
      ),
    ).toEqual(["2026-03-02", "2026-03-09", "2026-03-16", "2026-03-23"]);
  });

  test("honours a fortnightly interval", () => {
    expect(
      computeOccurrences(
        rule({ frequency: "weekly", interval: 2, nextRunOn: "2026-03-02" }),
        "2026-03-30",
      ),
    ).toEqual(["2026-03-02", "2026-03-16", "2026-03-30"]);
  });

  test("walks monthly on a day that exists in every month", () => {
    expect(
      computeOccurrences(
        rule({ dayOfMonth: 15, nextRunOn: "2026-01-15" }),
        "2026-04-15",
      ),
    ).toEqual(["2026-01-15", "2026-02-15", "2026-03-15", "2026-04-15"]);
  });

  test("clamps day 31 to the end of a short month, then returns to 31", () => {
    // must not get stuck on the 28th after February
    expect(
      computeOccurrences(
        rule({ dayOfMonth: 31, nextRunOn: "2026-01-31" }),
        "2026-05-31",
      ),
    ).toEqual([
      "2026-01-31",
      "2026-02-28",
      "2026-03-31",
      "2026-04-30",
      "2026-05-31",
    ]);
  });

  test("clamps day 31 to 29 February in a leap year", () => {
    expect(
      computeOccurrences(
        rule({ dayOfMonth: 31, nextRunOn: "2028-01-31" }),
        "2028-03-31",
      ),
    ).toEqual(["2028-01-31", "2028-02-29", "2028-03-31"]);
  });

  test("honours a quarterly interval", () => {
    expect(
      computeOccurrences(
        rule({ interval: 3, dayOfMonth: 10, nextRunOn: "2026-01-10" }),
        "2026-10-10",
      ),
    ).toEqual(["2026-01-10", "2026-04-10", "2026-07-10", "2026-10-10"]);
  });

  test("walks yearly", () => {
    expect(
      computeOccurrences(
        rule({ frequency: "yearly", nextRunOn: "2026-06-05" }),
        "2029-01-01",
      ),
    ).toEqual(["2026-06-05", "2027-06-05", "2028-06-05"]);
  });

  test("clamps a 29 February yearly rule in non-leap years", () => {
    expect(
      computeOccurrences(
        rule({ frequency: "yearly", nextRunOn: "2028-02-29" }),
        "2031-12-31",
      ),
    ).toEqual(["2028-02-29", "2029-02-28", "2030-02-28", "2031-02-28"]);
  });

  test("stops at the rule's end date", () => {
    expect(
      computeOccurrences(
        rule({
          frequency: "daily",
          nextRunOn: "2026-03-01",
          endsOn: "2026-03-03",
        }),
        "2026-03-10",
      ),
    ).toEqual(["2026-03-01", "2026-03-02", "2026-03-03"]);
  });

  test("returns nothing when the rule ended before it was due", () => {
    expect(
      computeOccurrences(
        rule({ nextRunOn: "2026-03-01", endsOn: "2026-02-01" }),
        "2026-12-31",
      ),
    ).toEqual([]);
  });

  test("falls back to the day in nextRunOn when no anchor day is set", () => {
    expect(
      computeOccurrences(
        rule({ dayOfMonth: null, nextRunOn: "2026-01-20" }),
        "2026-03-20",
      ),
    ).toEqual(["2026-01-20", "2026-02-20", "2026-03-20"]);
  });

  test("refuses to loop forever on a zero interval", () => {
    expect(() =>
      computeOccurrences(
        rule({ frequency: "daily", interval: 0, nextRunOn: "2026-01-01" }),
        "2026-12-31",
      ),
    ).toThrow();
  });
});
