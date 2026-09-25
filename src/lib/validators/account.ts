import { z } from "zod";

export const ACCOUNT_KINDS = ["checking", "savings", "cash", "card"] as const;

export const ACCOUNT_KIND_LABELS: Record<
  (typeof ACCOUNT_KINDS)[number],
  string
> = {
  checking: "Current account",
  savings: "Savings",
  cash: "Cash",
  card: "Card",
};

export const accountInputSchema = z.object({
  name: z.string().trim().min(1, "Give the account a name").max(60),
  kind: z.enum(ACCOUNT_KINDS),
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/, "Use a three-letter code, like EUR"),
  // cards can start negative
  initialBalanceCents: z.number().int(),
});

export type AccountInput = z.infer<typeof accountInputSchema>;
