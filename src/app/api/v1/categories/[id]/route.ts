import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { categoryInputSchema } from "@/lib/validators/category";
import {
  apiError,
  notFound,
  requireApiUserForWrite,
  validationError,
} from "@/server/api";
import {
  CATEGORY_NAME_TAKEN,
  setCategoryHidden,
  updateCategory,
} from "@/server/queries/categories";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: Context) {
  const { user, response } = await requireApiUserForWrite();
  if (!user) return response;

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = categoryInputSchema.safeParse(body);

  if (!parsed.success) return validationError(parsed.error);

  const result = await updateCategory(user.id, id, parsed.data);

  if (result === CATEGORY_NAME_TAKEN) {
    return apiError("conflict", "You already have a category with that name.");
  }

  if (!result) return notFound();

  return NextResponse.json({ data: result });
}

const hiddenSchema = z.object({ hidden: z.boolean() });

// Archive / restore. No DELETE, see queries/categories.ts.
export async function PUT(request: NextRequest, context: Context) {
  const { user, response } = await requireApiUserForWrite();
  if (!user) return response;

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = hiddenSchema.safeParse(body);

  if (!parsed.success) return validationError(parsed.error);

  const row = await setCategoryHidden(user.id, id, parsed.data.hidden);
  if (!row) return notFound();

  return NextResponse.json({ data: row });
}
