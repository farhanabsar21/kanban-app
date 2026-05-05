import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Flag,
  LogOut,
  MessageSquare,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useLogout, useMe } from "../features/auth/hooks/use-auth";
import { useBoard } from "../features/boards/hooks/use-boards";
import { useCreateColumn } from "../features/columns/hooks/use-columns";
import {
  type CreateColumnFormValues,
  createColumnSchema,
} from "../features/columns/schemas/column-schema";
import { CreateTaskForm } from "../features/tasks/components/create-task-form";

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
  const { data, isLoading } = useBoard(boardId);
  const createColumnMutation = useCreateColumn();
  const logoutMutation = useLogout();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creatingTaskColumnId, setCreatingTaskColumnId] = useState<
    string | null
  >(null);

  const form = useForm<CreateColumnFormValues>({
    resolver: zodResolver(createColumnSchema),
    defaultValues: {
      name: "",
    },
  });

  const board = data?.board;
  const columns = board?.columns ?? [];

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
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        Loading board...
      </main>
    );
  }

  if (!board) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        Board not found
      </main>
    );
  }

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

          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-slate-200"
          >
            <Plus size={16} />
            New column
          </button>
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

        {columns.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-10 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <CheckCircle2 size={22} />
            </div>
            <h3 className="text-lg font-semibold">No columns yet</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
              Create columns like Todo, In Progress, and Done to start using
              this board.
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-slate-200"
            >
              <Plus size={16} />
              Create column
            </button>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-6">
            {columns.map((column) => (
              <div
                key={column.id}
                className="flex max-h-[calc(100vh-230px)] min-w-80 flex-col rounded-2xl border border-white/10 bg-white/5"
              >
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                  <div>
                    <h3 className="font-semibold">{column.name}</h3>
                    <p className="text-xs text-slate-400">
                      {column.tasks.length} tasks
                    </p>
                  </div>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto p-3">
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
                  {column.tasks.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-white/10 p-4 text-center text-sm text-slate-500">
                      No tasks yet
                    </div>
                  ) : (
                    column.tasks.map((task) => {
                      const dueDate = formatDate(task.dueDate);

                      return (
                        <button
                          key={task.id}
                          className="w-full rounded-xl border border-white/10 bg-slate-900 p-4 text-left transition hover:border-white/20 hover:bg-slate-800"
                        >
                          <div className="mb-3 flex items-start justify-between gap-3">
                            <h4 className="font-medium text-white">
                              {task.title}
                            </h4>
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
                    })
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
