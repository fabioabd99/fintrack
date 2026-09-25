import { and, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { budgets } from "@/db/schema";

export type BudgetProgress = {
  id: string;
  categoryId: string;
  categoryName: string;
  color: string | null;
  limitCents: number;
  spentCents: number;
  /** can be > 1 */
  used: number;
};

// Budgets for a month with what was spent, closest to the limit first.
export async function getBudgetProgress(
  userId: string,
  month: string,
): Promise<BudgetProgress[]> {
  const rows = await db.execute<{
    id: string;
    category_id: string;
    category_name: string;
    color: string | null;
    limit_cents: number;
    spent_cents: number;
  }>(sql`
    SELECT
      b.id,
      b.category_id,
      c.name AS category_name,
      c.color,
      b.limit_cents,
      coalesce(-sum(t.amount_cents), 0)::int AS spent_cents
    FROM budgets b
    JOIN categories c ON c.id = b.category_id
    LEFT JOIN transactions t
      ON t.category_id = b.category_id
     AND t.user_id = b.user_id
     AND t.type = 'expense'
     AND date_trunc('month', t.occurred_on)::date = b.period_month
    WHERE b.user_id = ${userId}
      AND b.period_month = ${month}
    GROUP BY b.id, b.category_id, c.name, c.color, b.limit_cents
    ORDER BY (coalesce(-sum(t.amount_cents), 0)::numeric / b.limit_cents) DESC
  `);

  return rows.map((row) => ({
    id: row.id,
    categoryId: row.category_id,
    categoryName: row.category_name,
    color: row.color,
    limitCents: row.limit_cents,
    spentCents: row.spent_cents,
    used: row.spent_cents / row.limit_cents,
  }));
}

// Upsert on (user, category, month).
export async function upsertBudget(
  userId: string,
  categoryId: string,
  month: string,
  limitCents: number,
) {
  const [row] = await db
    .insert(budgets)
    .values({ userId, categoryId, periodMonth: month, limitCents })
    .onConflictDoUpdate({
      target: [budgets.userId, budgets.categoryId, budgets.periodMonth],
      set: { limitCents },
    })
    .returning();

  return row;
}

export async function deleteBudget(userId: string, id: string) {
  const [row] = await db
    .delete(budgets)
    .where(and(eq(budgets.id, id), eq(budgets.userId, userId)))
    .returning({ id: budgets.id });

  return row ?? null;
}
