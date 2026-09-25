import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
        <span translate="no">Tillpay</span>
      </p>

      <h1 className="text-3xl font-semibold tracking-tight">
        That page is not here
      </h1>
      <p className="text-base text-muted-foreground">
        The link may be old, or the page may have moved.
      </p>

      <Link href="/" className={buttonVariants({ className: "mt-2 h-11" })}>
        Back to your money
      </Link>
    </main>
  );
}
