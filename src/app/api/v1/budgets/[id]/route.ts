import { NextResponse, type NextRequest } from "next/server";

import { notFound, requireApiUserForWrite } from "@/server/api";
import { deleteBudget } from "@/server/queries/budgets";

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { user, response } = await requireApiUserForWrite();
  if (!user) return response;

  const { id } = await context.params;
  const row = await deleteBudget(user.id, id);

  if (!row) return notFound();

  return NextResponse.json({ data: row });
}
