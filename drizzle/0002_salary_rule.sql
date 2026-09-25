ALTER TABLE "recurring_rules" ADD COLUMN "is_salary" boolean DEFAULT false NOT NULL;--> statement-breakpoint
-- existing users: a single active monthly income rule becomes the salary
UPDATE "recurring_rules" r SET "is_salary" = true
WHERE r."type" = 'income' AND r."active" AND r."frequency" = 'monthly'
  AND (SELECT count(*) FROM "recurring_rules" o
       WHERE o."user_id" = r."user_id" AND o."type" = 'income' AND o."active" AND o."frequency" = 'monthly') = 1;--> statement-breakpoint
CREATE UNIQUE INDEX "recurring_rules_one_salary_key" ON "recurring_rules" USING btree ("user_id") WHERE "recurring_rules"."is_salary";--> statement-breakpoint
ALTER TABLE "recurring_rules" ADD CONSTRAINT "recurring_rules_salary_is_income" CHECK (NOT "recurring_rules"."is_salary" OR "recurring_rules"."type" = 'income');