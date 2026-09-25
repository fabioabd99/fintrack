import { sql } from "drizzle-orm";

import { db } from "@/db";
import { appRateLimits } from "@/db/schema";

// Fixed-window rate limit stored in Postgres so it holds across instances.
// A single upsert increments the count and resets expired windows atomically.
export async function checkRateLimit(
  key: string,
  { max = 60, windowMs = 60_000 }: { max?: number; windowMs?: number } = {},
) {
  const now = Date.now();
  const expired = now - windowMs;

  const [row] = await db
    .insert(appRateLimits)
    .values({ key, count: 1, windowStartedAt: now })
    .onConflictDoUpdate({
      target: appRateLimits.key,
      set: {
        count: sql`CASE WHEN ${appRateLimits.windowStartedAt} <= ${expired} THEN 1 ELSE ${appRateLimits.count} + 1 END`,
        windowStartedAt: sql`CASE WHEN ${appRateLimits.windowStartedAt} <= ${expired} THEN ${now} ELSE ${appRateLimits.windowStartedAt} END`,
      },
    })
    .returning({
      count: appRateLimits.count,
      windowStartedAt: appRateLimits.windowStartedAt,
    });

  if (row.count > max) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((row.windowStartedAt + windowMs - now) / 1000),
      ),
    };
  }

  return { allowed: true, retryAfterSeconds: 0 };
}
