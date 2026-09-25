import { describe, expect, it } from "vitest";

import { assertServerEnv, authBaseUrl } from "./env";

const complete = {
  DATABASE_URL: "postgresql://user:pass@db.example.com:5432/tillpay",
  BETTER_AUTH_SECRET: "a".repeat(64),
  BETTER_AUTH_URL: "https://tillpay.example.com",
  CRON_SECRET: "b".repeat(32),
};

describe("assertServerEnv", () => {
  it("accepts a complete configuration", () => {
    expect(() => assertServerEnv(complete)).not.toThrow();
  });

  it("names every missing variable at once", () => {
    expect(() =>
      assertServerEnv({ ...complete, BETTER_AUTH_SECRET: undefined, CRON_SECRET: undefined }),
    ).toThrow(/BETTER_AUTH_SECRET[\s\S]*CRON_SECRET/);
  });

  it("rejects a secret too short to be a real one", () => {
    expect(() => assertServerEnv({ ...complete, BETTER_AUTH_SECRET: "secret" })).toThrow(
      /at least 32 characters/,
    );
  });

  it("accepts Vercel's production URL when BETTER_AUTH_URL is not set", () => {
    expect(() =>
      assertServerEnv({
        ...complete,
        BETTER_AUTH_URL: undefined,
        VERCEL_PROJECT_PRODUCTION_URL: "tillpay.vercel.app",
      }),
    ).not.toThrow();
  });

  it("still requires one of the two", () => {
    expect(() => assertServerEnv({ ...complete, BETTER_AUTH_URL: undefined })).toThrow(
      /BETTER_AUTH_URL/,
    );
  });
});

describe("authBaseUrl", () => {
  it("prefers BETTER_AUTH_URL", () => {
    expect(
      authBaseUrl({
        BETTER_AUTH_URL: "https://tillpay.example.com",
        VERCEL_PROJECT_PRODUCTION_URL: "tillpay.vercel.app",
      }),
    ).toBe("https://tillpay.example.com");
  });

  it("falls back to the Vercel production domain over https", () => {
    expect(authBaseUrl({ VERCEL_PROJECT_PRODUCTION_URL: "tillpay.vercel.app" })).toBe(
      "https://tillpay.vercel.app",
    );
  });

  it("is undefined when neither is set", () => {
    expect(authBaseUrl({})).toBeUndefined();
  });
});
