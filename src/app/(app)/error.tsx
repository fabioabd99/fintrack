"use client";

import { RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // the error itself is logged on the server under the digest
  return (
    <main className="mx-auto flex w-full max-w-lg flex-col px-4 py-16">
      <Surface className="p-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          That did not load
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Something went wrong on our side. Nothing was saved or changed.
        </p>

        <Button className="mt-6 h-11" onClick={reset}>
          <RotateCw data-icon="inline-start" />
          Try again
        </Button>

        {error.digest ? (
          <p className="mt-6 font-mono text-xs text-muted-foreground">
            Reference {error.digest}
          </p>
        ) : null}
      </Surface>
    </main>
  );
}
