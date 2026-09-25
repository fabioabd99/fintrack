import { format } from "date-fns";
import { and, eq, sql } from "drizzle-orm";
import { beforeAll, describe, expect, test } from "vitest";

import { db } from "@/db";
import { recurringRules, transactions, users } from "@/db/schema";

// Checks on the seeded demo user. Needs the database and `pnpm db:seed`.
let userId: string | null = null;

beforeAll(async () => {
  try {
    const [row] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, "demo@tillpay.app"));
    userId = row?.id ?? null;
  } catch {
    userId = null;
  }
});

describe.runIf(process.env.DATABASE_URL)("seeded demo data", () => {
  test("no active repeating rule is due today or earlier", async () => {
    if (!userId) return;

    const today = format(new Date(), "yyyy-MM-dd");
    const rules = await db
      .select({ description: recurringRules.description, nextRunOn: recurringRules.nextRunOn })
      .from(recurringRules)
      .where(and(eq(recurringRules.userId, userId), eq(recurringRules.active, true)));

    // a rule due today would duplicate a seeded transaction
    for (const rule of rules) {
      expect(rule.nextRunOn > today, `${rule.description} next runs ${rule.nextRunOn}`).toBe(true);
    }
  });

  test("the salary arrives at most once a month", async () => {
    if (!userId) return;

    const months = await db
      .select({
        month: sql<string>`to_char(${transactions.occurredOn}, 'YYYY-MM')`,
        count: sql<number>`count(*)::int`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.description, "Monthly salary"),
        ),
      )
      .groupBy(sql`1`);

    for (const { month, count } of months) {
      expect(count, `salaries in ${month}`).toBe(1);
    }
  });
});
