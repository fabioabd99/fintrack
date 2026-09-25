import { sql } from "drizzle-orm";

import { db } from "@/db";


export type MonthlyPoint = {
  month: string;
  incomeCents: number;
  expenseCents: number;
  netCents: number;
};

// Income and spending per month (transfers excluded). generate_series fills
// empty months with zeros.
export async function getMonthlyTrend(
  userId: string,
  months = 12,
): Promise<MonthlyPoint[]> {
  const rows = await db.execute<{
    month: string;
    income_cents: number;
    expense_cents: number;
  }>(sql`
    WITH bounds AS (
      SELECT (date_trunc('month', current_date) - make_interval(months => ${months - 1}))::date AS first_month,
             date_trunc('month', current_date)::date AS last_month
    ),
    months AS (
      SELECT generate_series(
        (SELECT first_month FROM bounds),
        (SELECT last_month FROM bounds),
        '1 month'
      )::date AS month
    )
    SELECT
      to_char(m.month, 'YYYY-MM-DD') AS month,
      coalesce(sum(t.amount_cents) FILTER (WHERE t.type = 'income'), 0)::int AS income_cents,
      coalesce(-sum(t.amount_cents) FILTER (WHERE t.type = 'expense'), 0)::int AS expense_cents
    FROM months m
    LEFT JOIN transactions t
      ON date_trunc('month', t.occurred_on)::date = m.month
     AND t.user_id = ${userId}
     AND t.type <> 'transfer'
    GROUP BY m.month
    ORDER BY m.month
  `);

  return rows.map((row) => ({
    month: row.month,
    incomeCents: row.income_cents,
    // positive
    expenseCents: row.expense_cents,
    netCents: row.income_cents - row.expense_cents,
  }));
}

export type CategoryTotal = {
  id: string | null;
  name: string;
  color: string | null;
  cents: number;
  share: number;
};

// Spending per category, largest first. Uncategorised gets its own row.
export async function getSpendingByCategory(
  userId: string,
  from: string,
  to: string,
): Promise<CategoryTotal[]> {
  const rows = await db.execute<{
    id: string | null;
    name: string | null;
    color: string | null;
    cents: number;
  }>(sql`
    SELECT c.id, c.name, c.color, (-sum(t.amount_cents))::int AS cents
    FROM transactions t
    LEFT JOIN categories c ON c.id = t.category_id
    WHERE t.user_id = ${userId}
      AND t.type = 'expense'
      AND t.occurred_on >= ${from}
      AND t.occurred_on <= ${to}
    GROUP BY c.id, c.name, c.color
    ORDER BY (-sum(t.amount_cents)) DESC
  `);

  const total = rows.reduce((sum, row) => sum + row.cents, 0) || 1;

  return rows.map((row) => ({
    id: row.id,
    name: row.name ?? "Uncategorised",
    color: row.color,
    cents: row.cents,
    share: row.cents / total,
  }));
}
