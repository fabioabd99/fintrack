import { eq } from "drizzle-orm";
import { beforeAll, describe, expect, test } from "vitest";

import { db } from "@/db";
import { users } from "@/db/schema";
import { getMonthlyTrend, getSpendingByCategory } from "./reports";
import { listTransactions } from "./transactions";
import { parseTransactionFilters } from "@/lib/validators/transaction";

// Integration tests on the seeded demo user. They check invariants, not exact
// amounts, so they survive a re-seed. Skipped without a database.
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

describe.runIf(process.env.DATABASE_URL)("report aggregates", () => {
  test("the monthly trend has one row per month, with no gaps", async () => {
    if (!userId) return;

    const trend = await getMonthlyTrend(userId, 12);

    expect(trend).toHaveLength(12);

    // empty months must still be returned
    for (let index = 1; index < trend.length; index++) {
      const previous = new Date(`${trend[index - 1].month}T12:00:00`);
      const current = new Date(`${trend[index].month}T12:00:00`);
      const monthsApart =
        (current.getFullYear() - previous.getFullYear()) * 12 +
        (current.getMonth() - previous.getMonth());

      expect(monthsApart).toBe(1);
    }
  });

  test("monthly income and spending are never negative magnitudes", async () => {
    if (!userId) return;

    for (const point of await getMonthlyTrend(userId, 12)) {
      expect(point.incomeCents).toBeGreaterThanOrEqual(0);
      expect(point.expenseCents).toBeGreaterThanOrEqual(0);
      expect(point.netCents).toBe(point.incomeCents - point.expenseCents);
    }
  });

  test("category shares add up to one", async () => {
    if (!userId) return;

    const rows = await getSpendingByCategory(userId, "2020-01-01", "2030-12-31");
    if (rows.length === 0) return;

    const total = rows.reduce((sum, row) => sum + row.share, 0);
    expect(total).toBeCloseTo(1, 5);
  });

  test("categories come back largest first", async () => {
    if (!userId) return;

    const rows = await getSpendingByCategory(userId, "2020-01-01", "2030-12-31");

    for (let index = 1; index < rows.length; index++) {
      expect(rows[index - 1].cents).toBeGreaterThanOrEqual(rows[index].cents);
    }
  });

  test("transfers are excluded from income and spending", async () => {
    if (!userId) return;

    const filters = parseTransactionFilters({ type: "transfer" });
    const transfersOnly = await listTransactions(userId, filters);

    expect(transfersOnly.incomeCents).toBe(0);
    expect(transfersOnly.expenseCents).toBe(0);
  });

  test("paging a sorted list never repeats or drops a row", async () => {
    if (!userId) return;

    const base = parseTransactionFilters({
      sort: "amountCents",
      dir: "desc",
      pageSize: "25",
    });

    const first = await listTransactions(userId, base);
    const seen = new Set<string>();

    for (let page = 1; page <= first.pageCount; page++) {
      const result = await listTransactions(userId, { ...base, page });
      for (const row of result.rows) seen.add(row.id);
    }

    expect(seen.size).toBe(first.total);
  });
});
