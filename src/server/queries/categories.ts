import { and, asc, eq, isNull, sql } from "drizzle-orm";

import { db } from "@/db";
import { categories, transactions } from "@/db/schema";
import type { CategoryInput } from "@/lib/validators/category";

// Categories are archived, not deleted, so past transactions keep them.

export type CategoryListRow = {
  id: string;
  name: string;
  kind: "income" | "expense";
  color: string | null;
  transactionCount: number;
  totalCents: number;
  archivedAt: Date | null;
};

export async function listCategories(
  userId: string,
  { includeHidden = false } = {},
): Promise<CategoryListRow[]> {
  return db
    .select({
      id: categories.id,
      name: categories.name,
      kind: categories.kind,
      color: categories.color,
      transactionCount: sql<number>`count(${transactions.id})::int`,
      totalCents: sql<number>`coalesce(sum(${transactions.amountCents}), 0)::int`,
      archivedAt: categories.archivedAt,
    })
    .from(categories)
    .leftJoin(transactions, eq(transactions.categoryId, categories.id))
    .where(
      includeHidden
        ? eq(categories.userId, userId)
        : and(eq(categories.userId, userId), isNull(categories.archivedAt)),
    )
    .groupBy(categories.id)
    .orderBy(asc(categories.archivedAt), asc(categories.kind), asc(categories.name));
}

export const CATEGORY_NAME_TAKEN = "category_name_taken" as const;

// unique_violation. Drizzle wraps the driver error, so walk the `cause` chain.
function isUniqueViolation(error: unknown) {
  let current: unknown = error;

  for (let depth = 0; depth < 5 && current; depth++) {
    if (
      typeof current === "object" &&
      current !== null &&
      (current as { code?: string }).code === "23505"
    ) {
      return true;
    }

    current = (current as { cause?: unknown }).cause;
  }

  return false;
}

export async function createCategory(userId: string, input: CategoryInput) {
  try {
    const [row] = await db
      .insert(categories)
      .values({ userId, ...input })
      .returning();

    return row;
  } catch (error) {
    if (isUniqueViolation(error)) return CATEGORY_NAME_TAKEN;
    throw error;
  }
}

export async function updateCategory(
  userId: string,
  id: string,
  input: CategoryInput,
) {
  try {
    const [row] = await db
      .update(categories)
      .set(input)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)))
      .returning();

    return row ?? null;
  } catch (error) {
    if (isUniqueViolation(error)) return CATEGORY_NAME_TAKEN;
    throw error;
  }
}

export async function setCategoryHidden(
  userId: string,
  id: string,
  hidden: boolean,
) {
  const [row] = await db
    .update(categories)
    .set({ archivedAt: hidden ? new Date() : null })
    .where(and(eq(categories.id, id), eq(categories.userId, userId)))
    .returning();

  return row ?? null;
}
