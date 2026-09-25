import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 lg:py-10">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <Skeleton className="h-72 rounded-3xl sm:col-span-2 lg:col-span-4" />
        <Skeleton className="h-72 rounded-3xl lg:col-span-2" />
        <Skeleton className="h-40 rounded-3xl lg:col-span-2" />
        <Skeleton className="h-40 rounded-3xl lg:col-span-2" />
        <Skeleton className="h-40 rounded-3xl lg:col-span-2" />
      </div>

      <span className="sr-only" role="status">
        Loading…
      </span>
    </main>
  );
}
