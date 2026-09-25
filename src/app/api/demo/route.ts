import { NextResponse, type NextRequest } from "next/server";

import { apiError } from "@/server/api";
import { createDisposableDemo } from "@/server/demo-accounts";
import { checkRateLimit } from "@/server/rate-limit";

// POST /api/demo: creates a disposable demo user and signs them in.
// Rate limited per IP since each one inserts a year of data.
function clientAddress(request: NextRequest) {
  // set by Vercel, can't be spoofed there
  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

export async function POST(request: NextRequest) {
  // production only, like Better Auth's own limits, so local testing isn't blocked
  const limit =
    process.env.NODE_ENV === "production"
      ? await checkRateLimit(`demo:${clientAddress(request)}`, {
          max: 5,
          windowMs: 60 * 60_000,
        })
      : { allowed: true, retryAfterSeconds: 0 };

  if (!limit.allowed) {
    const response = apiError(
      "rate_limited",
      "Too many demos from here for now. Try again a little later.",
    );
    response.headers.set("Retry-After", String(limit.retryAfterSeconds));
    return response;
  }

  const signUp = await createDisposableDemo();

  // only forward the session cookie
  const response = NextResponse.json({ data: { ok: true } }, { status: 201 });
  for (const cookie of signUp.headers.getSetCookie()) {
    response.headers.append("set-cookie", cookie);
  }
  return response;
}
