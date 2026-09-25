import { NextResponse, type NextRequest } from "next/server";

import { transactionInputSchema } from "@/lib/validators/transaction";
import {
  apiError,
  notFound,
  requireApiUser,
  requireApiUserForWrite,
  validationError,
} from "@/server/api";
import {
  TRANSFER_NOT_EDITABLE,
  deleteTransaction,
  getTransaction,
  updateTransaction,
} from "@/server/queries/transactions";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: Context) {
  const { user, response } = await requireApiUser();
  if (!user) return response;

  const { id } = await context.params;
  const row = await getTransaction(user.id, id);

  // 404 for other users' rows too
  if (!row) return notFound();

  return NextResponse.json({ data: row });
}

export async function PATCH(request: NextRequest, context: Context) {
  const { user, response } = await requireApiUserForWrite();
  if (!user) return response;

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = transactionInputSchema.safeParse(body);

  if (!parsed.success) return validationError(parsed.error);

  const result = await updateTransaction(user.id, id, parsed.data);

  if (result === TRANSFER_NOT_EDITABLE) {
    return apiError(
      "conflict",
      "A transfer is two linked rows. Delete it and create it again.",
    );
  }

  if (!result) return notFound();

  return NextResponse.json({ data: result });
}

export async function DELETE(_request: NextRequest, context: Context) {
  const { user, response } = await requireApiUserForWrite();
  if (!user) return response;

  const { id } = await context.params;
  const result = await deleteTransaction(user.id, id);

  if (!result) return notFound();

  return NextResponse.json({ data: result });
}
