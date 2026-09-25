import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { authBaseUrl } from "@/lib/env";
import { MIN_PASSWORD_LENGTH } from "@/lib/validators/auth";
import { createDefaultCategories } from "@/server/default-categories";

export const auth = betterAuth({
  baseURL: authBaseUrl(),
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: {
    enabled: true,
    // same as the form, the endpoint can be called directly
    minPasswordLength: MIN_PASSWORD_LENGTH,
  },
  // stored in Postgres so it works across serverless instances
  rateLimit: {
    storage: "database",
    modelName: "rateLimits",
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 3 },
    },
  },
  // optional, only enabled when the env vars are set
  socialProviders:
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : undefined,
  user: {
    modelName: "users",
    additionalFields: {
      isDemo: {
        type: "boolean",
        defaultValue: false,
        input: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        // every new user gets the default categories
        after: async (user) => {
          await createDefaultCategories(user.id);
        },
      },
    },
  },
  session: {
    modelName: "sessions",
  },
  account: {
    modelName: "authAccounts",
  },
  verification: {
    modelName: "verifications",
  },
  advanced: {
    database: {
      generateId: "uuid",
    },
  },
});
