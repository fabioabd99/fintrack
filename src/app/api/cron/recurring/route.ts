import { NextResponse, type NextRequest } from "next/server";

import { removeExpiredDemos } from "@/server/demo-accounts";
import {
  generateDueTransactions,
  listUsersWithDueRules,
} from "@/server/queries/recurring";

// Daily cron: generates due recurring transactions and deletes expired demo
// users. Vercel Cron sends GET, POST is for manual runs. Protected by
// CRON_SECRET (constant-time compare). Idempotent.
function authorised(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const header = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;

  if (header.length !== expected.length) return false;

  let mismatch = 0;
  for (let index = 0; index < expected.length; index++) {
    mismatch |= header.charCodeAt(index) ^ expected.charCodeAt(index);
  }

  return mismatch === 0;
}

async function run(request: NextRequest) {
  if (!authorised(request)) {
    return NextResponse.json(
      { error: { code: "unauthorized", message: "Not allowed." } },
      { status: 401 },
    );
  }

  const until = new Date().toISOString().slice(0, 10);
  const userIds = await listUsersWithDueRules(until);

  let created = 0;
  let rulesRun = 0;

  for (const userId of userIds) {
    const result = await generateDueTransactions(userId, until);
    created += result.created;
    rulesRun += result.rulesRun;
  }

  const demosRemoved = await removeExpiredDemos();

  return NextResponse.json({
    data: { users: userIds.length, rulesRun, created, until, demosRemoved },
  });
}

export const GET = run;
export const POST = run;
