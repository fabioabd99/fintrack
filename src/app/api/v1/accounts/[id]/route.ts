import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { accountInputSchema } from "@/lib/validators/account";
import {
  notFound,
  requireApiUserForWrite,
  validationError,
} from "@/server/api";
import { setAccountHidden, updateAccount } from "@/server/queries/accounts";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: Context) {
  const { user, response } = await requireApiUserForWrite();
  if (!user) return response;

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = accountInputSchema.safeParse(body);

  if (!parsed.success) return validationError(parsed.error);

  const row = await updateAccount(user.id, id, parsed.data);
  if (!row) return notFound();

  return NextResponse.json({ data: row });
}

const hiddenSchema = z.object({ hidden: z.boolean() });

// Archive / restore. No DELETE since it would cascade to transactions.
export async function PUT(request: NextRequest, context: Context) {
  const { user, response } = await requireApiUserForWrite();
  if (!user) return response;

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = hiddenSchema.safeParse(body);

  if (!parsed.success) return validationError(parsed.error);

  const row = await setAccountHidden(user.id, id, parsed.data.hidden);
  if (!row) return notFound();

  return NextResponse.json({ data: row });
}
