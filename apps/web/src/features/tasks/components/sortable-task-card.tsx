import { CSS } from "@dnd-kit/utilities";
import { Calendar, Clock, Flag, MessageSquare } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { type BoardTask } from "../../boards/api/board-api";

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

  const dueDate = formatDate(task.dueDate);

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

      {task.description ? (
        <p className="mb-3 line-clamp-2 text-sm text-slate-400">
          {task.description}
        </p>
      ) : null}

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <MessageSquare size={13} />
          Comments
        </span>

        {dueDate ? (
          <span className="inline-flex items-center gap-1">
            <Calendar size={13} />
            {dueDate}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1">
            <Clock size={13} />
            No due date
          </span>
        )}
      </div>
    </button>
  );
}
