import { Skeleton } from "./skeleton";

export function TaskModalSkeleton() {
  return (
    <div className="p-6">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="mt-5 h-32 w-full" />

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>

      <Skeleton className="mt-8 h-48 w-full rounded-2xl" />
      <Skeleton className="mt-8 h-48 w-full rounded-2xl" />
    </div>
  );
}
