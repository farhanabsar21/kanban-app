import { CSS } from "@dnd-kit/utilities";
import { Check, GripVertical, Pencil, Trash2, X } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { useState, type ReactNode } from "react";

type Props = {
  columnId: string;
  title: string;
  taskCount: number;
  disabled?: boolean;
  onRename: (name: string) => void;
  onDelete: () => void;
  isRenaming?: boolean;
  isDeleting?: boolean;
  children: ReactNode;
};

export function SortableColumn({
  columnId,
  title,
  taskCount,
  disabled,
  onRename,
  onDelete,
  isRenaming,
  isDeleting,
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

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(title);

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
        <div className="min-w-0 flex-1">
          {isEditing ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();

                const trimmedName = name.trim();

                if (!trimmedName || trimmedName === title) {
                  setIsEditing(false);
                  setName(title);
                  return;
                }

                onRename(trimmedName);
                setIsEditing(false);
              }}
              className="flex gap-2"
            >
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoFocus
                className="min-w-0 flex-1 rounded-lg border border-white/10 bg-slate-950 px-2 py-1.5 text-sm text-white outline-none focus:border-white/30"
              />

              <button
                type="submit"
                disabled={isRenaming}
                className="rounded-lg border border-white/10 p-1.5 text-slate-300 hover:bg-white/10 disabled:opacity-60"
              >
                <Check size={15} />
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setName(title);
                }}
                className="rounded-lg border border-white/10 p-1.5 text-slate-300 hover:bg-white/10"
              >
                <X size={15} />
              </button>
            </form>
          ) : (
            <>
              <h3 className="truncate font-semibold">{title}</h3>
              <p className="text-xs text-slate-400">{taskCount} tasks</p>
            </>
          )}
        </div>

        {!isEditing ? (
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={disabled}
              onClick={() => setIsEditing(true)}
              className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Pencil size={15} />
            </button>

            <button
              type="button"
              disabled={disabled || isDeleting || taskCount > 0}
              onClick={() => {
                if (taskCount > 0) return;

                const confirmed = window.confirm(
                  "Delete this empty column? This action cannot be undone.",
                );

                if (confirmed) onDelete();
              }}
              title={
                taskCount > 0
                  ? "Only empty columns can be deleted"
                  : "Delete column"
              }
              className="rounded-lg p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Trash2 size={15} />
            </button>

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
        ) : null}
      </div>
      {children}
    </div>
  );
}
