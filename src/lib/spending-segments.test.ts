import { describe, expect, it } from "vitest";

import { spendingSegments } from "./spending-segments";

const row = (id: string, cents: number) => ({
  id,
  name: id,
  color: "#000000",
  thisMonthCents: cents,
});

describe("spendingSegments", () => {
  it("keeps the largest categories, largest first", () => {
    const segments = spendingSegments([row("b", 100), row("a", 300), row("c", 200)], 600, 2);

    expect(segments.map((s) => s.id)).toEqual(["a", "c", "other"]);
  });

  it("puts everything else, uncategorised included, into Other", () => {
    const segments = spendingSegments([row("a", 300), row("b", 200)], 700, 1);

    expect(segments.at(-1)).toEqual({ id: "other", name: "Other", color: null, cents: 400 });
  });

  it("has no Other segment when nothing is left over", () => {
    const segments = spendingSegments([row("a", 300), row("b", 200)], 500, 4);

    expect(segments.map((s) => s.id)).toEqual(["a", "b"]);
  });

  it("never returns a negative Other", () => {
    const segments = spendingSegments([row("a", 300)], 250, 4);

    expect(segments.map((s) => s.id)).toEqual(["a"]);
  });
});
