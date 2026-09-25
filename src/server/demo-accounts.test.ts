import { eq, inArray } from "drizzle-orm";
import { afterAll, describe, expect, test } from "vitest";

import { db } from "@/db";
import { accounts, transactions, users } from "@/db/schema";
import { DEMO_EMAIL } from "@/lib/demo";
import { createDisposableDemo, removeExpiredDemos } from "./demo-accounts";

// Integration test, needs DATABASE_URL. Cleans up the users it creates.
const created: string[] = [];

afterAll(async () => {
  if (!process.env.DATABASE_URL || created.length === 0) return;
  await db.delete(users).where(inArray(users.id, created));
});

async function newDemo() {
  const response = await createDisposableDemo();
  const { user } = (await response.json()) as { user: { id: string } };
  created.push(user.id);
  return { response, userId: user.id };
}

describe.runIf(process.env.DATABASE_URL)("disposable demo accounts", () => {
  test("each visitor gets an account of their own, signed in, with data", async () => {
    const first = await newDemo();
    const second = await newDemo();

    expect(first.userId).not.toBe(second.userId);
    expect(first.response.headers.getSetCookie().join(";")).toMatch(/session_token/);

    const [user] = await db.select().from(users).where(eq(users.id, first.userId));
    expect(user.isDemo).toBe(true);

    const ownAccounts = await db
      .select({ id: accounts.id })
      .from(accounts)
      .where(eq(accounts.userId, first.userId));
    const ownRows = await db
      .select({ id: transactions.id })
      .from(transactions)
      .where(eq(transactions.userId, first.userId));

    expect(ownAccounts).toHaveLength(3);
    expect(ownRows.length).toBeGreaterThan(100);
  });

  test("the daily clean-up removes day-old demos and nothing else", async () => {
    const { userId } = await newDemo();

    await removeExpiredDemos();
    expect(await db.select().from(users).where(eq(users.id, userId))).toHaveLength(1);

    // two days later, but the local seeded demo user must stay
    const later = new Date(Date.now() + 48 * 3_600_000);
    await removeExpiredDemos(later);

    expect(await db.select().from(users).where(eq(users.id, userId))).toHaveLength(0);
    expect(
      await db.select().from(transactions).where(eq(transactions.userId, userId)),
    ).toHaveLength(0);
    const seeded = await db.select().from(users).where(eq(users.email, DEMO_EMAIL));
    expect(seeded.length).toBeLessThanOrEqual(1);
    if (seeded.length) expect(seeded[0].isDemo).toBe(true);
  });
});
