import { z } from "zod";

// Validated at startup in production (see instrumentation.ts).
const serverEnv = z.object({
  DATABASE_URL: z.url("DATABASE_URL must be a Postgres connection URL"),
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, "BETTER_AUTH_SECRET must be at least 32 characters (openssl rand -hex 48)"),
  BETTER_AUTH_URL: z.url(
    "BETTER_AUTH_URL must be the site's public URL (optional on Vercel, which provides it)",
  ),
  CRON_SECRET: z
    .string()
    .min(16, "CRON_SECRET must be at least 16 characters (openssl rand -hex 32)"),
});

type Env = Record<string, string | undefined>;

// BETTER_AUTH_URL, or the production domain Vercel sets on every deployment.
export function authBaseUrl(env: Env = process.env) {
  if (env.BETTER_AUTH_URL) return env.BETTER_AUTH_URL;
  if (env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return undefined;
}

export function assertServerEnv(env: Env = process.env) {
  const result = serverEnv.safeParse({ ...env, BETTER_AUTH_URL: authBaseUrl(env) });
  if (result.success) return;

  const problems = result.error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");

  throw new Error(`Missing or invalid environment variables:\n${problems}`);
}
