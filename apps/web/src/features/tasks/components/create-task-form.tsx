import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { useCreateTask } from "../hooks/use-tasks";
import {
  type CreateTaskFormValues,
  createTaskSchema,
} from "../schemas/task-schema";

type Props = {
  boardId: string;
  columnId: string;
  onCancel: () => void;
  onCreated: () => void;
};

type ApiError = {
  message: string;
};

export function CreateTaskForm({
  boardId,
  columnId,
  onCancel,
  onCreated,
}: Props) {
  const createTaskMutation = useCreateTask();

  const form = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "MEDIUM",
      dueDate: "",
    },
  });

  const onSubmit = async (values: CreateTaskFormValues) => {
    try {
      await createTaskMutation.mutateAsync({
        boardId,
        columnId,
        title: values.title,
        description: values.description || undefined,
        priority: values.priority,
        dueDate: values.dueDate
          ? new Date(values.dueDate).toISOString()
          : undefined,
      });

      form.reset();
      onCreated();
    } catch {
      // rendered below
    }
  };

  const errorMessage =
    createTaskMutation.error instanceof AxiosError
      ? createTaskMutation.error.response?.data?.message
      : null;

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="rounded-xl border border-white/10 bg-slate-900 p-3"
    >
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-white">New task</h4>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md p-1 text-slate-400 hover:bg-white/10 hover:text-white"
        >
          <X size={15} />
        </button>
      </div>

      {errorMessage ? (
        <div className="mb-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {errorMessage}
        </div>
      ) : null}

      <div className="space-y-3">
        <div>
          <input
            {...form.register("title")}
            placeholder="Task title"
            className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-white/30"
          />
          {form.formState.errors.title ? (
            <p className="mt-1 text-xs text-red-300">
              {form.formState.errors.title.message}
            </p>
          ) : null}
        </div>

        <textarea
          {...form.register("description")}
          placeholder="Description optional"
          rows={3}
          className="w-full resize-none rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-white/30"
        />

        <div className="grid grid-cols-2 gap-2">
          <select
            {...form.register("priority")}
            className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>

          <input
            type="date"
            {...form.register("dueDate")}
            className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={createTaskMutation.isPending}
            className="flex-1 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-200 disabled:opacity-60"
          >
            {createTaskMutation.isPending ? "Creating..." : "Create task"}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 hover:bg-white/10"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
