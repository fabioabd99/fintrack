import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { SignUpForm } from "@/components/forms/sign-up-form";
import { getSession } from "@/server/auth-context";

export const metadata: Metadata = {
  title: "Create an account · Tillpay",
  description:
    "Create a free Tillpay account: see what you can spend until payday, track spending by category and set monthly caps.",
  alternates: { canonical: "/sign-up" },
};

export default async function SignUpPage() {
  if (await getSession()) {
    redirect("/");
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create an account
        </h1>
        <p className="text-sm text-muted-foreground">
          Start with an empty ledger and add your accounts as you go.
        </p>
      </header>

      <SignUpForm />

      <p className="text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-medium text-foreground underline underline-offset-4 decoration-border transition-colors hover:decoration-foreground"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
