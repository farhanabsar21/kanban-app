import {
  AlertTriangle,
  CheckSquare,
  FolderKanban,
  Users,
  Workflow,
} from "lucide-react";
import { Skeleton } from "../../../components/shared/skeleton";
import { useDashboardAnalytics } from "../hooks/use-analytics";

export function DashboardAnalyticsCards() {
  const { data, isLoading } = useDashboardAnalytics();

  const analytics = data?.analytics;

  const cards = [
    {
      label: "Workspaces",
      value: analytics?.totalWorkspaces ?? 0,
      icon: FolderKanban,
    },
    {
      label: "Boards",
      value: analytics?.totalBoards ?? 0,
      icon: Workflow,
    },
    {
      label: "Tasks",
      value: analytics?.totalTasks ?? 0,
      icon: CheckSquare,
    },
    {
      label: "Members",
      value: analytics?.totalMembers ?? 0,
      icon: Users,
    },
    {
      label: "Overdue",
      value: analytics?.overdueTasks ?? 0,
      icon: AlertTriangle,
    },
  ];

  if (isLoading) {
    return (
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-white/10 bg-white/5 p-5"
          >
            <Skeleton className="h-8 w-8 rounded-xl" />
            <Skeleton className="mt-5 h-7 w-16" />
            <Skeleton className="mt-2 h-4 w-24" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.label}
            className="rounded-2xl border border-white/10 bg-white/5 p-5"
          >
            <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-950">
              <Icon size={18} />
            </div>

            <p className="text-2xl font-bold text-white">{card.value}</p>
            <p className="mt-1 text-sm text-slate-400">{card.label}</p>
          </div>
        );
      })}
    </div>
  );
}
