import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

// reuse the client across hot reloads in dev
const globalForDb = globalThis as unknown as {
  tillpayClient?: ReturnType<typeof postgres>;
};

// prepare: false for transaction-mode poolers (Neon pooled URL, PgBouncer)
const client =
  globalForDb.tillpayClient ?? postgres(connectionString, { prepare: false });

if (process.env.NODE_ENV !== "production") {
  globalForDb.tillpayClient = client;
}

export const db = drizzle(client, { schema });
