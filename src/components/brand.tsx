import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden
      className={cn("size-7 shrink-0 rounded-lg", className)}
    >
      <rect width="32" height="32" rx="8" fill="#2653c1" />
      <path fill="#fff" d="M8.5 7.5h15V12h-5.25v13h-4.5V12H8.5z" />
    </svg>
  );
}

export function Brand({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)} translate="no">
      <BrandMark />
      <span className="text-[1.0625rem] font-semibold tracking-tight">Tillpay</span>
    </span>
  );
}
