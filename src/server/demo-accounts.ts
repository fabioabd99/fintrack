import { and, eq, like, lt } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { DEMO_LIFETIME_HOURS, DISPOSABLE_DEMO_DOMAIN } from "@/lib/demo";
import { seedDemoData } from "@/server/demo-data";

// Each visitor gets their own demo user (sign-up + seed data), removed after
// a day. Returns the sign-up response so its Set-Cookie signs them in.
export async function createDisposableDemo() {
  const email = `visitor-${crypto.randomUUID()}@${DISPOSABLE_DEMO_DOMAIN}`;
  // random, nobody needs to know it
  const password = `${crypto.randomUUID()}${crypto.randomUUID()}`;

  const signUp = await auth.api.signUpEmail({
    body: { name: "Demo visitor", email, password },
    asResponse: true,
  });

  if (!signUp.ok) {
    throw new Error(`Demo sign-up failed with status ${signUp.status}`);
  }

  const { user } = (await signUp.clone().json()) as { user: { id: string } };

  await db.update(users).set({ isDemo: true }).where(eq(users.id, user.id));
  await seedDemoData(user.id);

  return signUp;
}

// Deletes disposable demo users older than a day (data cascades).
export async function removeExpiredDemos(now = new Date()) {
  const cutoff = new Date(now.getTime() - DEMO_LIFETIME_HOURS * 3_600_000);

  const removed = await db
    .delete(users)
    .where(
      and(
        eq(users.isDemo, true),
        like(users.email, `%@${DISPOSABLE_DEMO_DOMAIN}`),
        lt(users.createdAt, cutoff),
      ),
    )
    .returning({ id: users.id });

  return removed.length;
}
