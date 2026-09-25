import { eq } from "drizzle-orm";

import { auth } from "../lib/auth";
import { DEMO_EMAIL, DEMO_PASSWORD } from "../lib/demo";
import { seedDemoData } from "../server/demo-data";
import { db } from "./index";
import { users } from "./schema";

// pnpm db:seed: local demo user with a year of data.
async function seed() {
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, DEMO_EMAIL));

  if (existing) {
    await db.delete(users).where(eq(users.id, existing.id));
    console.log("Removed the previous demo user.");
  }

  // through Better Auth so the password hash and default categories match a
  // real sign-up
  const signUp = await auth.api.signUpEmail({
    body: { name: "Demo User", email: DEMO_EMAIL, password: DEMO_PASSWORD },
  });

  await db
    .update(users)
    .set({ isDemo: true })
    .where(eq(users.id, signUp.user.id));

  const seeded = await seedDemoData(signUp.user.id);

  console.log(
    [
      "Seeded:",
      `  user         ${DEMO_EMAIL} / ${DEMO_PASSWORD}`,
      `  accounts     ${seeded.accounts}`,
      `  transactions ${seeded.transactions}`,
      "  budgets      4",
      "  recurring    3",
    ].join("\n"),
  );
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
