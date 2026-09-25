import { db } from "@/db";
import { categories } from "@/db/schema";

// Categories created for every new user.
export const DEFAULT_CATEGORIES = [
  { name: "Salary", kind: "income", color: "#16a34a" },
  { name: "Freelance", kind: "income", color: "#0ea5e9" },
  { name: "Rent", kind: "expense", color: "#2563eb" },
  { name: "Groceries", kind: "expense", color: "#f59e0b" },
  { name: "Utilities", kind: "expense", color: "#8b5cf6" },
  { name: "Transport", kind: "expense", color: "#0891b2" },
  { name: "Dining", kind: "expense", color: "#ec4899" },
  { name: "Health", kind: "expense", color: "#14b8a6" },
  { name: "Entertainment", kind: "expense", color: "#a855f7" },
  { name: "Shopping", kind: "expense", color: "#f97316" },
  { name: "Subscriptions", kind: "expense", color: "#64748b" },
  { name: "Other", kind: "expense", color: "#94a3b8" },
] as const;

// Idempotent, existing names are skipped by the unique index.
export async function createDefaultCategories(userId: string) {
  await db
    .insert(categories)
    .values(DEFAULT_CATEGORIES.map((category) => ({ userId, ...category })))
    .onConflictDoNothing();
}
