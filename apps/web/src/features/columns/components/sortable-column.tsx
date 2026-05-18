import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { type ReactNode } from "react";

type Props = {
  columnId: string;
  title: string;
  taskCount: number;
  disabled?: boolean;
  children: ReactNode;
};

export function SortableColumn({
  columnId,
  title,
  taskCount,
  disabled,
  children,
}: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: columnId,
    disabled,
    data: {
      type: "column",
      columnId,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex max-h-[calc(100vh-230px)] min-w-80 flex-col rounded-2xl border border-white/10 bg-white/5 ${
        isDragging ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-xs text-slate-400">{taskCount} tasks</p>
        </div>

        <button
          type="button"
          disabled={disabled}
          className="cursor-grab rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={17} />
        </button>
      </div>

      {children}
    </div>
  );
}
