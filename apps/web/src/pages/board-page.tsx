import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { ArrowLeft, CheckCircle2, LogOut, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useLogout, useMe } from "../features/auth/hooks/use-auth";
import { useBoard } from "../features/boards/hooks/use-boards";
import {
  useCreateColumn,
  useDeleteColumn,
  useReorderColumns,
  useUpdateColumn,
} from "../features/columns/hooks/use-columns";
import {
  type CreateColumnFormValues,
  createColumnSchema,
} from "../features/columns/schemas/column-schema";
import { CreateTaskForm } from "../features/tasks/components/create-task-form";
import { TaskDetailsModal } from "../features/tasks/components/task-details-modal";
import { useMoveTask } from "../features/tasks/hooks/use-tasks";
import {
  closestCorners,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  horizontalListSortingStrategy,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableTaskCard } from "../features/tasks/components/sortable-task-card";
import { DroppableColumn } from "../features/columns/components/droppable-column";
import { SortableColumn } from "../features/columns/components/sortable-column";
import { useBoardRealtime } from "../features/boards/hooks/use-board-realtime";
import { BoardPageSkeleton } from "../components/shared/board-page-skeleton";
import { ErrorState } from "../components/shared/error-state";
import { EmptyState } from "../components/shared/empty-state";

type ApiError = {
  message: string;
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

export function BoardPage() {
  const { boardId } = useParams();
  const navigate = useNavigate();

  const { data: me } = useMe();
  const { data, isLoading, isError, refetch } = useBoard(boardId);
  const createColumnMutation = useCreateColumn();
  const updateColumnMutation = useUpdateColumn();
  const deleteColumnMutation = useDeleteColumn();
  const moveTaskMutation = useMoveTask();
  const logoutMutation = useLogout();
  const reorderColumnsMutation = useReorderColumns();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creatingTaskColumnId, setCreatingTaskColumnId] = useState<
    string | null
  >(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<
    "ALL" | "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  >("ALL");

  const [presenceUsers, setPresenceUsers] = useState<
    { socketId: string; name: string; email: string }[]
  >([]);

  const form = useForm<CreateColumnFormValues>({
    resolver: zodResolver(createColumnSchema),
    defaultValues: {
      name: "",
    },
  });

  const board = data?.board;
  const columns = board?.columns ?? [];

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const hasActiveFilters =
    Boolean(normalizedSearch) || priorityFilter !== "ALL";

  const filteredColumns = columns.map((column) => ({
    ...column,
    tasks: column.tasks.filter((task) => {
      const matchesSearch =
        !normalizedSearch ||
        task.title.toLowerCase().includes(normalizedSearch) ||
        task.description?.toLowerCase().includes(normalizedSearch);

      const matchesPriority =
        priorityFilter === "ALL" || task.priority === priorityFilter;

      return matchesSearch && matchesPriority;
    }),
  }));

  const isSavingOrder =
    moveTaskMutation.isPending ||
    reorderColumnsMutation.isPending ||
    updateColumnMutation.isPending ||
    deleteColumnMutation.isPending ||
    hasActiveFilters;

  const onCreateColumn = async (values: CreateColumnFormValues) => {
    if (!boardId) return;

    try {
      await createColumnMutation.mutateAsync({
        boardId,
        name: values.name,
      });

      form.reset();
      setIsCreateOpen(false);
    } catch {
      // rendered below
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  function findColumnByTaskId(taskId: string) {
    return columns.find((column) =>
      column.tasks.some((task) => task.id === taskId),
    );
  }

  function findColumnById(columnId: string) {
    return columns.find((column) => column.id === columnId);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || !board) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    if (activeType === "column") {
      const oldIndex = columns.findIndex((column) => column.id === activeId);
      const newIndex = columns.findIndex((column) => column.id === overId);

      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
        return;
      }

      const nextColumnIds = [...columns.map((column) => column.id)];
      const [removed] = nextColumnIds.splice(oldIndex, 1);
      nextColumnIds.splice(newIndex, 0, removed);

      reorderColumnsMutation.mutate({
        boardId: board.id,
        columnIds: nextColumnIds,
      });

      return;
    }

    if (activeType !== "task") return;

    const activeTaskId = activeId;

    const sourceColumn = findColumnByTaskId(activeTaskId);

    if (!sourceColumn) return;

    const overColumn =
      overType === "column"
        ? findColumnById(overId)
        : findColumnByTaskId(overId);

    const targetColumn = overColumn;

    if (!targetColumn) return;

    const targetTasks = targetColumn.tasks.filter(
      (task) => task.id !== activeTaskId,
    );

    const overTaskIndex = targetTasks.findIndex((task) => task.id === overId);

    const targetPosition =
      overTaskIndex === -1 ? targetTasks.length : Math.max(0, overTaskIndex);

    const sourcePosition = sourceColumn.tasks.findIndex(
      (task) => task.id === activeTaskId,
    );

    if (
      sourceColumn.id === targetColumn.id &&
      sourcePosition === targetPosition
    ) {
      return;
    }

    moveTaskMutation.mutate({
      taskId: activeTaskId,
      boardId: board.id,
      targetColumnId: targetColumn.id,
      targetPosition,
    });
  }

  useBoardRealtime({
    boardId,
    user: me?.user
      ? {
          id: me.user.id,
          name: me.user.name,
          email: me.user.email,
        }
      : undefined,
    onPresenceUpdate: setPresenceUsers,
  });

  const onLogout = async () => {
    await logoutMutation.mutateAsync();
    navigate("/login");
  };

  const errorMessage =
    createColumnMutation.error instanceof AxiosError
      ? (createColumnMutation.error.response?.data as ApiError | undefined)
          ?.message
      : null;

  if (isLoading) {
    return <BoardPageSkeleton />;
  }

  if (isError || !board) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        <ErrorState
          title="Board not found"
          description="This board may not exist, or you may not have access to it."
          onRetry={() => refetch()}
        />
      </main>
    );
  }

  console.log("presence", presenceUsers);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-950/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-4">
            <Link
              to={`/workspaces/${board.workspace.id}`}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-slate-300 hover:bg-white/10"
            >
              <ArrowLeft size={18} />
            </Link>

            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                {board.workspace.name}
              </p>
              <h1 className="text-xl font-bold">{board.name}</h1>
              <p className="text-sm text-slate-400">
                Welcome back, {me?.user.name}
              </p>
            </div>
            {presenceUsers.length > 0 ? (
              <div className="hidden items-center gap-2 md:flex">
                <span className="text-xs text-slate-500">Viewing now</span>

                <div className="flex -space-x-2">
                  {presenceUsers.slice(0, 4).map((user) => (
                    <div
                      key={user.socketId}
                      title={`${user.name} (${user.email})`}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-950 bg-white text-xs font-bold text-slate-950"
                    >
                      {user.name.slice(0, 1).toUpperCase()}
                    </div>
                  ))}
                </div>

                {presenceUsers.length > 4 ? (
                  <span className="text-xs text-slate-400">
                    +{presenceUsers.length - 4}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>

          <button
            onClick={onLogout}
            disabled={logoutMutation.isPending}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 hover:bg-white/10 disabled:opacity-60"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      <section className="px-6 py-6">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold">Board</h2>
            <p className="mt-1 text-sm text-slate-400">
              {board.description ||
                "Manage your workflow using columns and tasks."}
            </p>
          </div>

          {isSavingOrder ? (
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-400">
              Saving order...
            </span>
          ) : null}

          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-slate-200"
          >
            <Plus size={16} />
            New column
          </button>
        </div>

        {hasActiveFilters ? (
          <p className="mb-4 text-sm text-slate-500">
            Drag and drop is disabled while filters are active.
          </p>
        ) : null}

        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:flex-row md:items-center">
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search tasks..."
            className="flex-1 rounded-lg border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-white/30"
          />

          <select
            value={priorityFilter}
            onChange={(event) =>
              setPriorityFilter(
                event.target.value as
                  | "ALL"
                  | "LOW"
                  | "MEDIUM"
                  | "HIGH"
                  | "URGENT",
              )
            }
            className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-white/30"
          >
            <option value="ALL">All priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>

          {searchQuery || priorityFilter !== "ALL" ? (
            <button
              onClick={() => {
                setSearchQuery("");
                setPriorityFilter("ALL");
              }}
              className="rounded-lg border border-white/10 px-3 py-2.5 text-sm text-slate-300 hover:bg-white/10"
            >
              Clear
            </button>
          ) : null}
        </div>

        {isCreateOpen ? (
          <div className="mb-6 max-w-xl rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="mb-4 text-lg font-semibold">Create column</h3>

            {errorMessage ? (
              <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {errorMessage}
              </div>
            ) : null}

            <form
              onSubmit={form.handleSubmit(onCreateColumn)}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <div className="flex-1">
                <input
                  {...form.register("name")}
                  placeholder="e.g. Todo"
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-white/30"
                />
                {form.formState.errors.name ? (
                  <p className="mt-1 text-sm text-red-300">
                    {form.formState.errors.name.message}
                  </p>
                ) : null}
              </div>

              <button
                type="submit"
                disabled={createColumnMutation.isPending}
                className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-slate-200 disabled:opacity-60"
              >
                {createColumnMutation.isPending ? "Creating..." : "Create"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsCreateOpen(false);
                  form.reset();
                }}
                className="rounded-lg border border-white/10 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/10"
              >
                Cancel
              </button>
            </form>
          </div>
        ) : null}

        {filteredColumns.length === 0 ? (
          <EmptyState
            icon={<CheckCircle2 size={22} />}
            title="No columns yet"
            description="Create columns like Todo, In Progress, and Done to start using this board."
            action={
              <button
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-slate-200"
              >
                <Plus size={16} />
                Create column
              </button>
            }
          />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={columns.map((column) => column.id)}
              strategy={horizontalListSortingStrategy}
            >
              <div className="flex gap-4 overflow-x-auto pb-6">
                {filteredColumns.map((column) => (
                  <div
                    key={column.id}
                    className="flex max-h-[calc(100vh-230px)] min-w-80 flex-col rounded-2xl border border-white/10 bg-white/5"
                  >
                    <SortableColumn
                      key={column.id}
                      columnId={column.id}
                      title={column.name}
                      taskCount={column.tasks.length}
                      disabled={isSavingOrder}
                      isRenaming={updateColumnMutation.isPending}
                      isDeleting={deleteColumnMutation.isPending}
                      onRename={(name) => {
                        updateColumnMutation.mutate({
                          boardId: board.id,
                          columnId: column.id,
                          name,
                        });
                      }}
                      onDelete={() => {
                        deleteColumnMutation.mutate({
                          boardId: board.id,
                          columnId: column.id,
                        });
                      }}
                    >
                      <DroppableColumn columnId={column.id}>
                        {creatingTaskColumnId === column.id ? (
                          <CreateTaskForm
                            boardId={board.id}
                            columnId={column.id}
                            onCancel={() => setCreatingTaskColumnId(null)}
                            onCreated={() => setCreatingTaskColumnId(null)}
                          />
                        ) : (
                          <button
                            onClick={() => setCreatingTaskColumnId(column.id)}
                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 px-3 py-2.5 text-sm text-slate-400 hover:border-white/20 hover:bg-white/5 hover:text-white"
                          >
                            <Plus size={15} />
                            Add task
                          </button>
                        )}
                        <SortableContext
                          items={column.tasks.map((task) => task.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {column.tasks.length > 0
                            ? column.tasks.map((task) => (
                                <SortableTaskCard
                                  key={task.id}
                                  task={task}
                                  disabled={isSavingOrder}
                                  onOpen={() => setSelectedTaskId(task.id)}
                                />
                              ))
                            : null}
                        </SortableContext>
                      </DroppableColumn>
                    </SortableColumn>
                  </div>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </section>
      {selectedTaskId ? (
        <TaskDetailsModal
          taskId={selectedTaskId}
          boardId={board.id}
          workspaceId={board.workspace.id}
          onClose={() => setSelectedTaskId(null)}
        />
      ) : null}
    </main>
  );
}
