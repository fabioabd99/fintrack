import { describe, expect, it } from "vitest";

import { firstPayday } from "./payday";

describe("firstPayday", () => {
  it("is later this month when the day is still ahead", () => {
    expect(firstPayday(30, "2026-09-25")).toBe("2026-09-30");
  });

  it("is next month when the day is today", () => {
    expect(firstPayday(25, "2026-09-25")).toBe("2026-10-25");
  });

  it("is next month when the day has passed", () => {
    expect(firstPayday(5, "2026-09-25")).toBe("2026-10-05");
  });

  it("uses the last day of a short month", () => {
    expect(firstPayday(31, "2026-09-25")).toBe("2026-09-30");
    expect(firstPayday(31, "2026-02-10")).toBe("2026-02-28");
  });

  it("rolls over into the next year", () => {
    expect(firstPayday(5, "2026-12-20")).toBe("2027-01-05");
  });
});
