import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import {
  notFound,
  requireApiUserForWrite,
  validationError,
} from "@/server/api";
import {
  deleteRecurringRule,
  setRuleActive,
} from "@/server/queries/recurring";

type Context = { params: Promise<{ id: string }> };

const activeSchema = z.object({ active: z.boolean() });

// pause / resume
export async function PUT(request: NextRequest, context: Context) {
  const { user, response } = await requireApiUserForWrite();
  if (!user) return response;

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = activeSchema.safeParse(body);

  if (!parsed.success) return validationError(parsed.error);

  const row = await setRuleActive(user.id, id, parsed.data.active);
  if (!row) return notFound();

  return NextResponse.json({ data: row });
}

export async function DELETE(_request: NextRequest, context: Context) {
  const { user, response } = await requireApiUserForWrite();
  if (!user) return response;

  const { id } = await context.params;
  const row = await deleteRecurringRule(user.id, id);
  if (!row) return notFound();

  return NextResponse.json({ data: row });
}
