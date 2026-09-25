import { z } from "zod";

export const budgetInputSchema = z.object({
  categoryId: z.uuid("Choose a category"),
  // first day of the month
  periodMonth: z.iso.date(),
  limitCents: z.number().int().positive("Enter an amount above zero"),
});

export type BudgetInput = z.infer<typeof budgetInputSchema>;
