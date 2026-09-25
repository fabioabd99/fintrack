import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { SignInForm } from "@/components/forms/sign-in-form";
import { SITE_DESCRIPTION } from "@/lib/site";
import { getSession } from "@/server/auth-context";

// canonical without ?next=
export const metadata: Metadata = {
  title: "Sign in · Tillpay",
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/sign-in" },
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (await getSession()) {
    redirect("/");
  }

  const { next } = await searchParams;

  // only allow relative paths ("//host" is protocol-relative, so reject it)
  const isInternal = !!next && next.startsWith("/") && !next.startsWith("//");
  const destination = isInternal ? next : "/";

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="text-sm text-muted-foreground">
          Pick up where you left off.
        </p>
      </header>

      <SignInForm next={destination} />

      <p className="text-sm text-muted-foreground">
        No account yet?{" "}
        <Link
          href="/sign-up"
          className="font-medium text-foreground underline underline-offset-4 decoration-border transition-colors hover:decoration-foreground"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
