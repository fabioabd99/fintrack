import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import {
  apiError,
  notFound,
  requireApiUserForWrite,
  validationError,
} from "@/server/api";
import {
  deleteRecurringRule,
  SALARY_MUST_BE_INCOME,
  setRuleActive,
  setRuleSalary,
} from "@/server/queries/recurring";

type Context = { params: Promise<{ id: string }> };

const updateSchema = z.union([
  z.object({ active: z.boolean() }),
  z.object({ isSalary: z.boolean() }),
]);

// pause / resume, or mark as the salary
export async function PUT(request: NextRequest, context: Context) {
  const { user, response } = await requireApiUserForWrite();
  if (!user) return response;

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);

  if (!parsed.success) return validationError(parsed.error);

  const row =
    "active" in parsed.data
      ? await setRuleActive(user.id, id, parsed.data.active)
      : await setRuleSalary(user.id, id, parsed.data.isSalary);

  if (!row) return notFound();
  if (row === SALARY_MUST_BE_INCOME) {
    return apiError("validation_failed", "Only money coming in can be a salary.");
  }

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
