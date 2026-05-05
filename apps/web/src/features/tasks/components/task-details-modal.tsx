import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Flag, MessageSquare, Tag, UserRound, X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTask, useUpdateTask } from "../hooks/use-tasks";
import {
  type UpdateTaskFormValues,
  updateTaskSchema,
} from "../schemas/task-schema";
import { CreateCommentForm } from "../../comments/components/create-comment-form";
import {
  useAttachLabelToTask,
  useRemoveLabelFromTask,
  useWorkspaceLabels,
} from "../../labels/hooks/use-labels";
import { useWorkspaceMembers } from "../../memberships/hooks/use-memberships";
import {
  useAddAssigneeToTask,
  useRemoveAssigneeFromTask,
} from "../../assignees/hooks/use-assignees";

type Props = {
  taskId: string;
  boardId: string;
  workspaceId: string;
  onClose: () => void;
};

function formatCommentDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function TaskDetailsModal({
  taskId,
  boardId,
  workspaceId,
  onClose,
}: Props) {
  const { data, isLoading } = useTask(taskId);
  const updateTaskMutation = useUpdateTask();

  const task = data?.task;

  const { data: labelsData } = useWorkspaceLabels(workspaceId);
  const attachLabelMutation = useAttachLabelToTask(boardId, taskId);
  const removeLabelMutation = useRemoveLabelFromTask(boardId, taskId);

  const workspaceLabels = labelsData?.labels ?? [];
  const attachedLabelIds = new Set(
    task?.labels.map((item) => item.labelId) ?? [],
  );

  const { data: membersData } = useWorkspaceMembers(workspaceId);
  const addAssigneeMutation = useAddAssigneeToTask(boardId, taskId);
  const removeAssigneeMutation = useRemoveAssigneeFromTask(boardId, taskId);

  const workspaceMembers = membersData?.members ?? [];
  const assignedUserIds = new Set(
    task?.assignees.map((item) => item.userId) ?? [],
  );

  const form = useForm<UpdateTaskFormValues>({
    resolver: zodResolver(updateTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "MEDIUM",
      dueDate: "",
    },
  });

  useEffect(() => {
    if (!task) return;

    form.reset({
      title: task.title,
      description: task.description ?? "",
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
    });
  }, [task, form]);

  const onSubmit = async (values: UpdateTaskFormValues) => {
    await updateTaskMutation.mutateAsync({
      taskId,
      boardId,
      title: values.title,
      description: values.description || null,
      priority: values.priority,
      dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-slate-950 text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Task details
            </p>
            <h2 className="text-lg font-semibold">
              {isLoading ? "Loading..." : task?.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {isLoading || !task ? (
          <div className="p-6 text-slate-400">Loading task...</div>
        ) : (
          <div className="max-h-[calc(90vh-73px)] overflow-y-auto p-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">
                  Title
                </label>
                <input
                  {...form.register("title")}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-white/30"
                />
                {form.formState.errors.title ? (
                  <p className="mt-1 text-sm text-red-300">
                    {form.formState.errors.title.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">
                  Description
                </label>
                <textarea
                  {...form.register("description")}
                  rows={5}
                  className="w-full resize-none rounded-lg border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-white/30"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-300">
                    <Flag size={15} />
                    Priority
                  </label>
                  <select
                    {...form.register("priority")}
                    className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-white/30"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-300">
                    <Calendar size={15} />
                    Due date
                  </label>
                  <input
                    type="date"
                    {...form.register("dueDate")}
                    className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={updateTaskMutation.isPending}
                className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-slate-200 disabled:opacity-60"
              >
                {updateTaskMutation.isPending ? "Saving..." : "Save changes"}
              </button>
            </form>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <UserRound size={15} />
                  Assignees
                </div>
                <p className="text-sm text-slate-400">
                  {task.assignees.length} assigned
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <Tag size={15} />
                  Labels
                </div>
                <p className="text-sm text-slate-400">
                  {task.labels.length} labels
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <MessageSquare size={15} />
                  Comments
                </div>
                <p className="text-sm text-slate-400">
                  {task.comments.length} comments
                </p>
              </div>
            </div>
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="mb-5 flex items-center gap-2">
                <Tag size={18} />
                <h3 className="text-lg font-semibold">Labels</h3>
              </div>

              <div className="mb-5">
                <p className="mb-2 text-sm font-medium text-slate-300">
                  Attached labels
                </p>

                {task.labels.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-slate-500">
                    No labels attached.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {task.labels.map((item) => (
                      <button
                        key={item.labelId}
                        type="button"
                        onClick={() => removeLabelMutation.mutate(item.labelId)}
                        disabled={removeLabelMutation.isPending}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-red-500/10 hover:text-red-300 disabled:opacity-60"
                      >
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{
                            backgroundColor: item.label.color ?? "#94a3b8",
                          }}
                        />
                        {item.label.name}
                        <X size={13} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-slate-300">
                  Available labels
                </p>

                {workspaceLabels.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-slate-500">
                    No workspace labels yet. Create labels from the backend/API
                    for now.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {workspaceLabels.map((label) => {
                      const isAttached = attachedLabelIds.has(label.id);

                      return (
                        <button
                          key={label.id}
                          type="button"
                          onClick={() => {
                            if (!isAttached) {
                              attachLabelMutation.mutate(label.id);
                            }
                          }}
                          disabled={isAttached || attachLabelMutation.isPending}
                          className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50 bg-white/5 hover:bg-white/10"
                        >
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{
                              backgroundColor: label.color ?? "#94a3b8",
                            }}
                          />
                          {label.name}
                          {isAttached ? "✓" : "+"}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="mb-5 flex items-center gap-2">
                <UserRound size={18} />
                <h3 className="text-lg font-semibold">Assignees</h3>
              </div>

              <div className="mb-5">
                <p className="mb-2 text-sm font-medium text-slate-300">
                  Assigned users
                </p>

                {task.assignees.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-slate-500">
                    No assignees yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {task.assignees.map((assignee) => (
                      <div
                        key={assignee.userId}
                        className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-900 p-3"
                      >
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {assignee.user.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {assignee.user.email}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeAssigneeMutation.mutate(assignee.userId)
                          }
                          disabled={removeAssigneeMutation.isPending}
                          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-60"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-slate-300">
                  Workspace members
                </p>

                {workspaceMembers.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-slate-500">
                    No workspace members found.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {workspaceMembers.map((member) => {
                      const isAssigned = assignedUserIds.has(member.userId);

                      return (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => {
                            if (!isAssigned) {
                              addAssigneeMutation.mutate(member.userId);
                            }
                          }}
                          disabled={isAssigned || addAssigneeMutation.isPending}
                          className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-900 p-3 text-left hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <div>
                            <p className="text-sm font-semibold text-white">
                              {member.user.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {member.user.email}
                            </p>
                          </div>

                          <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-slate-300">
                            {isAssigned ? "Assigned" : "Assign"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="mb-5 flex items-center gap-2">
                <MessageSquare size={18} />
                <h3 className="text-lg font-semibold">Comments</h3>
              </div>

              <CreateCommentForm taskId={task.id} boardId={boardId} />

              <div className="mt-6 space-y-4">
                {task.comments.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/10 p-5 text-center text-sm text-slate-500">
                    No comments yet. Start the discussion.
                  </div>
                ) : (
                  task.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="rounded-xl border border-white/10 bg-slate-900 p-4"
                    >
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {comment.author.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {comment.author.email}
                          </p>
                        </div>

                        <span className="text-xs text-slate-500">
                          {formatCommentDate(comment.createdAt)}
                        </span>
                      </div>

                      <p className="whitespace-pre-wrap text-sm leading-6 text-slate-300">
                        {comment.body}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
