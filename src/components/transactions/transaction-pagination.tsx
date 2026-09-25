"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { parseAsInteger, useQueryStates } from "nuqs";

import { Button } from "@/components/ui/button";

export function TransactionPagination({
  page,
  pageCount,
}: {
  page: number;
  pageCount: number;
}) {
  const [, setQuery] = useQueryStates(
    { page: parseAsInteger.withDefault(1) },
    { shallow: false },
  );

  if (pageCount <= 1) return null;

  return (
    <nav
      aria-label="Transaction pages"
      className="flex items-center justify-between gap-4 pt-2"
    >
      <Button
        variant="outline"
        className="h-11"
        disabled={page <= 1}
        onClick={() => void setQuery({ page: page - 1 })}
      >
        <ChevronLeft data-icon="inline-start" />
        Newer
      </Button>

      <p className="text-sm text-muted-foreground">
        Page {page} of {pageCount}
      </p>

      <Button
        variant="outline"
        className="h-11"
        disabled={page >= pageCount}
        onClick={() => void setQuery({ page: page + 1 })}
      >
        Older
        <ChevronRight data-icon="inline-end" />
      </Button>
    </nav>
  );
}
