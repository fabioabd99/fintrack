import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function ActionCard({
  icon: Icon,
  tone = "neutral",
  title,
  detail,
  href,
  action,
  children,
}: {
  icon: LucideIcon;
  tone?: "neutral" | "warning" | "positive";
  title: React.ReactNode;
  detail?: React.ReactNode;
  href?: string;
  action?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full",
            tone === "warning" && "bg-negative/10 text-negative",
            tone === "positive" && "bg-positive/10 text-positive",
            tone === "neutral" && "bg-muted text-muted-foreground",
          )}
        >
          <Icon className="size-4.5" aria-hidden />
        </span>

        <div className="min-w-0 flex-1">
          <p className="font-medium leading-snug">{title}</p>
          {detail ? (
            <p className="mt-0.5 text-sm text-muted-foreground">{detail}</p>
          ) : null}
          {children ? <div className="mt-3">{children}</div> : null}
        </div>

        {href && action ? (
          <Link
            href={href}
            className="shrink-0 rounded-md px-2 py-1 text-sm font-medium text-primary transition-colors hover:bg-muted"
          >
            {action}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
