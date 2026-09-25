import { NextResponse, type NextRequest } from "next/server";

import {
  parseTransactionFilters,
  transactionInputSchema,
} from "@/lib/validators/transaction";
import { notFound, requireApiUser,
  requireApiUserForWrite, validationError } from "@/server/api";
import {
  createTransaction,
  listTransactions,
} from "@/server/queries/transactions";

export async function GET(request: NextRequest) {
  const { user, response } = await requireApiUser();
  if (!user) return response;

  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const filters = parseTransactionFilters(params);
  const result = await listTransactions(user.id, filters);

  return NextResponse.json({
    data: result.rows,
    meta: {
      page: filters.page,
      pageSize: filters.pageSize,
      pageCount: result.pageCount,
      total: result.total,
      incomeCents: result.incomeCents,
      expenseCents: result.expenseCents,
    },
  });
}

// Transfers go through /api/v1/transfers.
export async function POST(request: NextRequest) {
  const { user, response } = await requireApiUserForWrite();
  if (!user) return response;

  const body = await request.json().catch(() => null);
  const parsed = transactionInputSchema.safeParse(body);

  if (!parsed.success) return validationError(parsed.error);

  const row = await createTransaction(user.id, parsed.data);

  if (!row) return notFound();

  return NextResponse.json({ data: row }, { status: 201 });
}
