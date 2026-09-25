import { eq } from "drizzle-orm";
import { afterAll, describe, expect, test } from "vitest";

import { db } from "@/db";
import { appRateLimits } from "@/db/schema";
import { checkRateLimit } from "./rate-limit";

// needs DATABASE_URL
const key = `test:${crypto.randomUUID()}`;

afterAll(async () => {
  if (!process.env.DATABASE_URL) return;
  await db.delete(appRateLimits).where(eq(appRateLimits.key, key));
});

describe.runIf(process.env.DATABASE_URL)("shared rate limit", () => {
  test("allows up to the limit, then refuses with a wait", async () => {
    const limits = { max: 2, windowMs: 60_000 };

    expect((await checkRateLimit(key, limits)).allowed).toBe(true);
    expect((await checkRateLimit(key, limits)).allowed).toBe(true);

    const third = await checkRateLimit(key, limits);
    expect(third.allowed).toBe(false);
    expect(third.retryAfterSeconds).toBeGreaterThan(0);
  });

  test("counts concurrent requests exactly, with no lost updates", async () => {
    const burstKey = `${key}:burst`;
    const results = await Promise.all(
      Array.from({ length: 10 }, () =>
        checkRateLimit(burstKey, { max: 4, windowMs: 60_000 }),
      ),
    );

    expect(results.filter((result) => result.allowed)).toHaveLength(4);
    await db.delete(appRateLimits).where(eq(appRateLimits.key, burstKey));
  });

  test("a new window starts once the old one has passed", async () => {
    const shortKey = `${key}:short`;
    const limits = { max: 1, windowMs: 50 };

    expect((await checkRateLimit(shortKey, limits)).allowed).toBe(true);
    expect((await checkRateLimit(shortKey, limits)).allowed).toBe(false);
    await new Promise((resolve) => setTimeout(resolve, 80));
    expect((await checkRateLimit(shortKey, limits)).allowed).toBe(true);

    await db.delete(appRateLimits).where(eq(appRateLimits.key, shortKey));
  });
});
