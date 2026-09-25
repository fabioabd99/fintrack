import { describe, expect, it } from "vitest";

import { signUpSchema } from "./auth";

const base = { name: "Ana", email: "ana@example.com" };
const passes = (password: string) =>
  signUpSchema.safeParse({ ...base, password }).success;

describe("sign-up password rule", () => {
  it("rejects anything shorter than 10 characters", () => {
    expect(passes("short1234")).toBe(false);
  });

  it("rejects the passwords everyone tries first, whatever the case", () => {
    expect(passes("1234567890")).toBe(false);
    expect(passes("Password123")).toBe(false);
    expect(passes("qwertyuiop")).toBe(false);
  });

  it("accepts a long, uncommon password", () => {
    expect(passes("green-kettle-on-tuesday")).toBe(true);
  });
});
