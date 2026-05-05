import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Tag } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useCreateLabel, useWorkspaceLabels } from "../hooks/use-labels";
import {
  type CreateLabelFormValues,
  createLabelSchema,
} from "../schemas/label-schema";

type Props = {
  workspaceId: string;
};

const defaultColors = [
  "#2563eb",
  "#16a34a",
  "#dc2626",
  "#9333ea",
  "#ea580c",
  "#0891b2",
];

export function WorkspaceLabelsPanel({ workspaceId }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const { data, isLoading } = useWorkspaceLabels(workspaceId);
  const createLabelMutation = useCreateLabel(workspaceId);

  const labels = data?.labels ?? [];

  const form = useForm<CreateLabelFormValues>({
    resolver: zodResolver(createLabelSchema),
    defaultValues: {
      name: "",
      color: defaultColors[0],
    },
  });

  const selectedColor = form.watch("color");

  const onSubmit = async (values: CreateLabelFormValues) => {
    await createLabelMutation.mutateAsync({
      workspaceId,
      name: values.name,
      color: values.color,
    });

    form.reset({
      name: "",
      color: defaultColors[0],
    });

    setIsOpen(false);
  };

  return (
    <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Tag size={18} />
            <h3 className="text-lg font-semibold">Workspace labels</h3>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Labels created here can be attached to tasks.
          </p>
        </div>

        <button
          onClick={() => setIsOpen((value) => !value)}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 hover:bg-white/10"
        >
          <Plus size={15} />
          New label
        </button>
      </div>

      {isOpen ? (
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mb-5 rounded-xl border border-white/10 bg-slate-900 p-4"
        >
          <div className="mb-3">
            <label className="mb-1 block text-sm font-medium text-slate-300">
              Label name
            </label>
            <input
              {...form.register("name")}
              placeholder="e.g. Frontend"
              className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-white/30"
            />
            {form.formState.errors.name ? (
              <p className="mt-1 text-sm text-red-300">
                {form.formState.errors.name.message}
              </p>
            ) : null}
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Color
            </label>

            <div className="flex flex-wrap gap-2">
              {defaultColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => form.setValue("color", color)}
                  className={`h-8 w-8 rounded-full border-2 ${
                    selectedColor === color
                      ? "border-white"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select ${color}`}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={createLabelMutation.isPending}
              className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-slate-200 disabled:opacity-60"
            >
              {createLabelMutation.isPending ? "Creating..." : "Create label"}
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg border border-white/10 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/10"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {isLoading ? (
        <p className="text-sm text-slate-400">Loading labels...</p>
      ) : labels.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-slate-500">
          No labels yet.
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {labels.map((label) => (
            <span
              key={label.id}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900 px-3 py-1.5 text-sm text-white"
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: label.color ?? "#94a3b8" }}
              />
              {label.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
