import { type ReactNode } from "react";

type Props = {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-10 text-center">
      {icon ? (
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
          {icon}
        </div>
      ) : null}

      <h3 className="text-lg font-semibold text-white">{title}</h3>

      <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
        {description}
      </p>

      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
