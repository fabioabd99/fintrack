import { eq } from "drizzle-orm";
import { afterAll, describe, expect, test } from "vitest";

import { db } from "@/db";
import { categories, users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { DEFAULT_CATEGORIES, createDefaultCategories } from "./default-categories";

// Integration test, needs DATABASE_URL.
const email = `defaults-${Date.now()}@test.tillpay.app`;

async function categoriesOf(userId: string) {
  return db
    .select({ name: categories.name, kind: categories.kind })
    .from(categories)
    .where(eq(categories.userId, userId));
}

afterAll(async () => {
  if (!process.env.DATABASE_URL) return;
  await db.delete(users).where(eq(users.email, email));
});

describe.runIf(process.env.DATABASE_URL)("default categories", () => {
  let userId = "";

  test("a new account starts with the default categories", async () => {
    const signUp = await auth.api.signUpEmail({
      body: { name: "Defaults Test", email, password: "a-long-test-password" },
    });
    userId = signUp.user.id;

    const rows = await categoriesOf(userId);

    expect(rows).toHaveLength(DEFAULT_CATEGORIES.length);
    expect(rows).toEqual(
      expect.arrayContaining(
        DEFAULT_CATEGORIES.map(({ name, kind }) => ({ name, kind })),
      ),
    );
  });

  test("running it again adds nothing", async () => {
    await createDefaultCategories(userId);

    expect(await categoriesOf(userId)).toHaveLength(DEFAULT_CATEGORIES.length);
  });
});
