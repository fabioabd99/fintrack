import { describe, expect, it } from "vitest";

import { capState } from "./cap-state";

describe("capState", () => {
  it("is ok below 80% of the cap", () => {
    expect(capState(0)).toBe("ok");
    expect(capState(0.79)).toBe("ok");
  });

  it("is near from 80% up to and including the cap", () => {
    expect(capState(0.8)).toBe("near");
    expect(capState(0.96)).toBe("near");
    expect(capState(1)).toBe("near");
  });

  it("is over only once spending passes the cap", () => {
    expect(capState(1.0001)).toBe("over");
    expect(capState(1.78)).toBe("over");
  });
});
