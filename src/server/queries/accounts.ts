import { and, asc, eq, isNull, sql } from "drizzle-orm";

import { db } from "@/db";
import { accounts, transactions } from "@/db/schema";
import type { AccountInput } from "@/lib/validators/account";

// Accounts are archived, never deleted (the FK cascades to transactions).

export type AccountListRow = {
  id: string;
  name: string;
  kind: "checking" | "savings" | "cash" | "card";
  currency: string;
  initialBalanceCents: number;
  balanceCents: number;
  transactionCount: number;
  archivedAt: Date | null;
};

export async function listAccounts(
  userId: string,
  { includeHidden = false } = {},
): Promise<AccountListRow[]> {
  return db
    .select({
      id: accounts.id,
      name: accounts.name,
      kind: accounts.kind,
      currency: accounts.currency,
      initialBalanceCents: accounts.initialBalanceCents,
      balanceCents: sql<number>`(
        ${accounts.initialBalanceCents} + coalesce(sum(${transactions.amountCents}), 0)
      )::int`,
      transactionCount: sql<number>`count(${transactions.id})::int`,
      archivedAt: accounts.archivedAt,
    })
    .from(accounts)
    .leftJoin(transactions, eq(transactions.accountId, accounts.id))
    .where(
      includeHidden
        ? eq(accounts.userId, userId)
        : and(eq(accounts.userId, userId), isNull(accounts.archivedAt)),
    )
    .groupBy(accounts.id)
    .orderBy(asc(accounts.archivedAt), asc(accounts.name));
}

export async function createAccount(userId: string, input: AccountInput) {
  const [row] = await db
    .insert(accounts)
    .values({ userId, ...input })
    .returning();

  return row;
}

export async function updateAccount(
  userId: string,
  id: string,
  input: AccountInput,
) {
  const [row] = await db
    .update(accounts)
    .set(input)
    .where(and(eq(accounts.id, id), eq(accounts.userId, userId)))
    .returning();

  return row ?? null;
}

export async function setAccountHidden(
  userId: string,
  id: string,
  hidden: boolean,
) {
  const [row] = await db
    .update(accounts)
    .set({ archivedAt: hidden ? new Date() : null })
    .where(and(eq(accounts.id, id), eq(accounts.userId, userId)))
    .returning();

  return row ?? null;
}
