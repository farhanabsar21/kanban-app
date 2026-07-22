import { CSS } from "@dnd-kit/utilities";
import { Calendar, Clock, Flag, MessageSquare } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { type BoardTask } from "../../boards/api/board-api";
import { Markdown } from "../../../components/shared/markdown";

type Props = {
  task: BoardTask;
  onOpen: () => void;
  disabled?: boolean;
};

const priorityLabel: Record<string, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

function formatDate(value: string | null) {
  if (!value) return null;

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function SortableTaskCard({ task, onOpen, disabled }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    disabled,
    data: {
      type: "task",
      task,
    },
  });

  function getDueDateStyle(value: string | null) {
    if (!value) {
      return {
        label: "No due date",
        className: "text-slate-500",
      };
    }

    const now = new Date();
    const due = new Date(value);

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());

    const diffDays = Math.ceil(
      (dueDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays < 0) {
      return {
        label: `Overdue · ${formatDate(value)}`,
        className: "text-red-300",
      };
    }

    if (diffDays === 0) {
      return {
        label: `Due today`,
        className: "text-orange-300",
      };
    }

    if (diffDays <= 2) {
      return {
        label: `Due soon · ${formatDate(value)}`,
        className: "text-yellow-300",
      };
    }

    return {
      label: formatDate(value) ?? "No due date",
      className: "text-emerald-300",
    };
  }

  const dueDate = getDueDateStyle(task.dueDate);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <button
      ref={setNodeRef}
      type="button"
      style={style}
      onClick={onOpen}
      disabled={disabled}
      className={`w-full rounded-xl border border-white/10 bg-slate-900 p-4 text-left transition hover:border-white/20 hover:bg-slate-800 ${
        isDragging ? "opacity-50" : ""
      }`}
      {...attributes}
      {...listeners}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <h4 className="font-medium text-white">{task.title}</h4>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-xs text-slate-300">
          <Flag size={12} />
          {priorityLabel[task.priority]}
        </span>
      </div>

      <Markdown>{task.description ?? ""}</Markdown>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <MessageSquare size={13} />
          Comments
        </span>

        <span className={`inline-flex items-center gap-1 ${dueDate.className}`}>
          {task.dueDate ? <Calendar size={13} /> : <Clock size={13} />}
          {dueDate.label}
        </span>
      </div>
    </button>
  );
}
