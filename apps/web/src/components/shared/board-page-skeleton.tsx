import { Skeleton } from "./skeleton";

export function BoardPageSkeleton() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-950/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <div>
              <Skeleton className="h-3 w-32" />
              <Skeleton className="mt-2 h-6 w-48" />
              <Skeleton className="mt-2 h-4 w-40" />
            </div>
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
      </header>

      <section className="px-6 py-6">
        <div className="mb-6 flex justify-between">
          <div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="mt-2 h-4 w-80" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4">
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="flex gap-4 overflow-x-auto pb-6">
          {Array.from({ length: 3 }).map((_, columnIndex) => (
            <div
              key={columnIndex}
              className="min-w-80 rounded-2xl border border-white/10 bg-white/5"
            >
              <div className="border-b border-white/10 px-4 py-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="mt-2 h-3 w-16" />
              </div>

              <div className="space-y-3 p-3">
                <Skeleton className="h-12 w-full rounded-xl" />

                {Array.from({ length: 3 }).map((_, taskIndex) => (
                  <div
                    key={taskIndex}
                    className="rounded-xl border border-white/10 bg-slate-900 p-4"
                  >
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="mt-3 h-4 w-full" />
                    <Skeleton className="mt-2 h-4 w-2/3" />
                    <div className="mt-4 flex justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
