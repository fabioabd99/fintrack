import { NextResponse, type NextRequest } from "next/server";

import { recurringRuleInputSchema } from "@/lib/validators/recurring";
import { notFound, requireApiUser,
  requireApiUserForWrite, validationError } from "@/server/api";
import {
  createRecurringRule,
  listRecurringRules,
} from "@/server/queries/recurring";

export async function GET() {
  const { user, response } = await requireApiUser();
  if (!user) return response;

  return NextResponse.json({ data: await listRecurringRules(user.id) });
}

export async function POST(request: NextRequest) {
  const { user, response } = await requireApiUserForWrite();
  if (!user) return response;

  const body = await request.json().catch(() => null);
  const parsed = recurringRuleInputSchema.safeParse(body);

  if (!parsed.success) return validationError(parsed.error);

  const row = await createRecurringRule(user.id, parsed.data);
  if (!row) return notFound();

  return NextResponse.json({ data: row }, { status: 201 });
}
