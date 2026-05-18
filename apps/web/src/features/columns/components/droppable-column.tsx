import { useDroppable } from "@dnd-kit/core";
import { type ReactNode } from "react";

type Props = {
  columnId: string;
  children: ReactNode;
};

export function DroppableColumn({ columnId, children }: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: columnId,
    data: {
      type: "column",
      columnId,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 space-y-3 overflow-y-auto p-3 ${
        isOver ? "bg-white/5" : ""
      }`}
    >
      {children}
    </div>
  );
}
