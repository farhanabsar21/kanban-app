import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { LogOut, Plus, Users, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useLogout, useMe } from "../features/auth/hooks/use-auth";
import {
  useCreateWorkspace,
  useWorkspaces,
} from "../features/workspaces/hooks/use-workspaces";
import {
  type CreateWorkspaceFormValues,
  createWorkspaceSchema,
} from "../features/workspaces/schemas/workspace-schema";

type ApiError = {
  message: string;
};

export function DashboardPage() {
  const navigate = useNavigate();
  const { data: me } = useMe();
  const { data, isLoading } = useWorkspaces();
  const createWorkspaceMutation = useCreateWorkspace();
  const logoutMutation = useLogout();

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const form = useForm<CreateWorkspaceFormValues>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: "",
    },
  });

  const onCreateWorkspace = async (values: CreateWorkspaceFormValues) => {
    try {
      const result = await createWorkspaceMutation.mutateAsync(values);
      form.reset();
      setIsCreateOpen(false);
      navigate(`/workspaces/${result.workspace.id}`);
    } catch {
      // rendered below
    }
  };

  const onLogout = async () => {
    await logoutMutation.mutateAsync();
    navigate("/login");
  };

  const errorMessage =
    createWorkspaceMutation.error instanceof AxiosError
      ? (createWorkspaceMutation.error.response?.data as ApiError | undefined)
          ?.message
      : null;

  const workspaces = data?.workspaces ?? [];

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-xl font-bold">Kanban</h1>
            <p className="text-sm text-slate-400">
              Welcome back, {me?.user.name}
            </p>
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
            <h2 className="text-2xl font-bold">Workspaces</h2>
            <p className="mt-1 text-sm text-slate-400">
              Create or open a workspace to manage boards and tasks.
            </p>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-slate-200"
          >
            <Plus size={16} />
            New workspace
          </button>
        </div>

        {isCreateOpen ? (
          <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="mb-4 text-lg font-semibold">Create workspace</h3>

            {errorMessage ? (
              <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {errorMessage}
              </div>
            ) : null}

            <form
              onSubmit={form.handleSubmit(onCreateWorkspace)}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <div className="flex-1">
                <input
                  {...form.register("name")}
                  placeholder="e.g. Product Team"
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
                disabled={createWorkspaceMutation.isPending}
                className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-slate-200 disabled:opacity-60"
              >
                {createWorkspaceMutation.isPending ? "Creating..." : "Create"}
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

        {isLoading ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-slate-400">
            Loading workspaces...
          </div>
        ) : workspaces.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-10 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <LayoutDashboard size={22} />
            </div>
            <h3 className="text-lg font-semibold">No workspaces yet</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
              Create your first workspace to start organizing boards, columns,
              and tasks.
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-slate-200"
            >
              <Plus size={16} />
              Create workspace
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workspaces.map((workspace) => (
              <Link
                key={workspace.id}
                to={`/workspaces/${workspace.id}`}
                className="group rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:-translate-y-0.5 hover:bg-white/10"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-950">
                  <LayoutDashboard size={20} />
                </div>

                <h3 className="font-semibold text-white group-hover:underline">
                  {workspace.name}
                </h3>

                <p className="mt-1 text-sm text-slate-400">/{workspace.slug}</p>

                <div className="mt-5 flex items-center gap-4 text-sm text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <LayoutDashboard size={15} />
                    {workspace._count?.boards ?? 0} boards
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users size={15} />
                    {workspace._count?.members ?? 0} members
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
