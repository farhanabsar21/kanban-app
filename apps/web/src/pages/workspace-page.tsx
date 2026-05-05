import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import {
  ArrowLeft,
  LayoutDashboard,
  LogOut,
  Plus,
  LayoutGrid,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useLogout, useMe } from "../features/auth/hooks/use-auth";
import {
  useCreateBoard,
  useWorkspaceBoards,
} from "../features/boards/hooks/use-boards";
import {
  type CreateBoardFormValues,
  createBoardSchema,
} from "../features/boards/schemas/board-schema";
import { useWorkspace } from "../features/workspaces/hooks/use-workspaces";

type ApiError = {
  message: string;
};

export function WorkspacePage() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  const { data: me } = useMe();
  const { data: workspaceData, isLoading: isWorkspaceLoading } =
    useWorkspace(workspaceId);
  const { data: boardsData, isLoading: isBoardsLoading } =
    useWorkspaceBoards(workspaceId);

  const createBoardMutation = useCreateBoard();
  const logoutMutation = useLogout();

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const form = useForm<CreateBoardFormValues>({
    resolver: zodResolver(createBoardSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onCreateBoard = async (values: CreateBoardFormValues) => {
    if (!workspaceId) return;

    try {
      const result = await createBoardMutation.mutateAsync({
        workspaceId,
        name: values.name,
        description: values.description || undefined,
      });

      form.reset();
      setIsCreateOpen(false);
      navigate(`/boards/${result.board.id}`);
    } catch {
      // rendered below
    }
  };

  const onLogout = async () => {
    await logoutMutation.mutateAsync();
    navigate("/login");
  };

  const errorMessage =
    createBoardMutation.error instanceof AxiosError
      ? (createBoardMutation.error.response?.data as ApiError | undefined)
          ?.message
      : null;

  const workspace = workspaceData?.workspace;
  const boards = boardsData?.boards ?? [];

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-slate-300 hover:bg-white/10"
            >
              <ArrowLeft size={18} />
            </Link>

            <div>
              <h1 className="text-xl font-bold">
                {isWorkspaceLoading ? "Loading..." : workspace?.name}
              </h1>
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

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold">Boards</h2>
            <p className="mt-1 text-sm text-slate-400">
              Create and open boards inside this workspace.
            </p>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-slate-200"
          >
            <Plus size={16} />
            New board
          </button>
        </div>

        {isCreateOpen ? (
          <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="mb-4 text-lg font-semibold">Create board</h3>

            {errorMessage ? (
              <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {errorMessage}
              </div>
            ) : null}

            <form
              onSubmit={form.handleSubmit(onCreateBoard)}
              className="space-y-4"
            >
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">
                  Board name
                </label>
                <input
                  {...form.register("name")}
                  placeholder="e.g. Product Roadmap"
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-white/30"
                />
                {form.formState.errors.name ? (
                  <p className="mt-1 text-sm text-red-300">
                    {form.formState.errors.name.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">
                  Description
                </label>
                <textarea
                  {...form.register("description")}
                  placeholder="Optional board description"
                  rows={3}
                  className="w-full resize-none rounded-lg border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-white/30"
                />
                {form.formState.errors.description ? (
                  <p className="mt-1 text-sm text-red-300">
                    {form.formState.errors.description.message}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={createBoardMutation.isPending}
                  className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-slate-200 disabled:opacity-60"
                >
                  {createBoardMutation.isPending ? "Creating..." : "Create"}
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
              </div>
            </form>
          </div>
        ) : null}

        {isBoardsLoading ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-slate-400">
            Loading boards...
          </div>
        ) : boards.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-10 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <LayoutGrid size={22} />
            </div>
            <h3 className="text-lg font-semibold">No boards yet</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
              Create your first board to start adding columns and tasks.
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-slate-200"
            >
              <Plus size={16} />
              Create board
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {boards.map((board) => (
              <Link
                key={board.id}
                to={`/boards/${board.id}`}
                className="group rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:-translate-y-0.5 hover:bg-white/10"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-950">
                  <LayoutGrid size={20} />
                </div>

                <h3 className="font-semibold text-white group-hover:underline">
                  {board.name}
                </h3>

                <p className="mt-2 line-clamp-2 min-h-10 text-sm text-slate-400">
                  {board.description || "No description"}
                </p>

                <div className="mt-5 flex items-center gap-4 text-sm text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <LayoutDashboard size={15} />
                    {board._count?.columns ?? 0} columns
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users size={15} />
                    {board._count?.tasks ?? 0} tasks
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
