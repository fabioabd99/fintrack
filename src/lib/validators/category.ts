import { z } from "zod";

export const CATEGORY_KINDS = ["income", "expense"] as const;

export const CATEGORY_COLORS = [
  "#dc2626",
  "#f97316",
  "#f59e0b",
  "#16a34a",
  "#14b8a6",
  "#0891b2",
  "#0ea5e9",
  "#8b5cf6",
  "#a855f7",
  "#ec4899",
  "#64748b",
  "#94a3b8",
] as const;

export const categoryInputSchema = z.object({
  name: z.string().trim().min(1, "Give the category a name").max(60),
  kind: z.enum(CATEGORY_KINDS),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Pick a colour")
    .nullable()
    .default(null),
});

export type CategoryInput = z.infer<typeof categoryInputSchema>;
