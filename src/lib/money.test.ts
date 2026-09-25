import { describe, expect, test } from "vitest";

import { formatCents, parseAmountToCents } from "./money";

describe("parseAmountToCents", () => {
  test("parses a whole number as cents", () => {
    expect(parseAmountToCents("12")).toBe(1200);
  });

  test("parses a dot decimal separator", () => {
    expect(parseAmountToCents("12.34")).toBe(1234);
  });

  test("parses a comma decimal separator", () => {
    expect(parseAmountToCents("12,34")).toBe(1234);
  });

  test("pads a single decimal place", () => {
    expect(parseAmountToCents("12.5")).toBe(1250);
  });

  test("parses comma grouping with a dot decimal", () => {
    expect(parseAmountToCents("1,234.56")).toBe(123456);
  });

  test("parses dot grouping with a comma decimal", () => {
    expect(parseAmountToCents("1.234,56")).toBe(123456);
  });

  test("parses space grouping", () => {
    expect(parseAmountToCents("1 234,56")).toBe(123456);
  });

  test("treats a trailing group of three digits as grouping, not decimals", () => {
    expect(parseAmountToCents("1,555")).toBe(155500);
  });

  test("parses a negative amount", () => {
    expect(parseAmountToCents("-5.50")).toBe(-550);
  });

  test("ignores surrounding whitespace", () => {
    expect(parseAmountToCents("  12.34  ")).toBe(1234);
  });

  test("parses zero", () => {
    expect(parseAmountToCents("0")).toBe(0);
  });

  test("rejects an empty string", () => {
    expect(parseAmountToCents("")).toBeNull();
  });

  test("rejects whitespace only", () => {
    expect(parseAmountToCents("   ")).toBeNull();
  });

  test("rejects non-numeric text", () => {
    expect(parseAmountToCents("abc")).toBeNull();
  });

  test("rejects a bare minus sign", () => {
    expect(parseAmountToCents("-")).toBeNull();
  });

  test("rejects a bare separator", () => {
    expect(parseAmountToCents(".")).toBeNull();
  });

  test("rejects more than two decimal places", () => {
    expect(parseAmountToCents("1.2345")).toBeNull();
  });

  test("rejects malformed grouping", () => {
    expect(parseAmountToCents("1.2.3")).toBeNull();
  });

  test("rejects a group that is not three digits", () => {
    expect(parseAmountToCents("1,23,456")).toBeNull();
  });

  test("rejects a doubled minus sign", () => {
    expect(parseAmountToCents("--5")).toBeNull();
  });

  test("returns an integer, never a float", () => {
    const total = Array.from({ length: 100 }).reduce<number>(
      (sum) => sum + parseAmountToCents("0.10")!,
      0,
    );

    expect(total).toBe(1000);
  });
});

describe("formatCents", () => {
  test("formats a positive amount", () => {
    expect(formatCents(123456, "EUR")).toBe("€1,234.56");
  });

  test("formats a negative amount", () => {
    expect(formatCents(-550, "EUR")).toBe("-€5.50");
  });

  test("formats zero", () => {
    expect(formatCents(0, "EUR")).toBe("€0.00");
  });

  test("formats a different currency", () => {
    expect(formatCents(100, "USD")).toBe("$1.00");
  });

  test("round-trips through parseAmountToCents", () => {
    const cents = 987654;
    const formatted = formatCents(cents, "EUR").replace("€", "");

    expect(parseAmountToCents(formatted)).toBe(cents);
  });
});
