import { AlertTriangle, RefreshCcw } from "lucide-react";

type Props = {
  title?: string;
  description?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = "Something went wrong",
  description = "We could not load this data. Please try again.",
  onRetry,
}: Props) {
  return (
    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-300">
        <AlertTriangle size={22} />
      </div>

      <h3 className="text-lg font-semibold text-white">{title}</h3>

      <p className="mx-auto mt-2 max-w-md text-sm text-red-200/80">
        {description}
      </p>

      {onRetry ? (
        <button
          onClick={onRetry}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-slate-200"
        >
          <RefreshCcw size={15} />
          Retry
        </button>
      ) : null}
    </div>
  );
}
