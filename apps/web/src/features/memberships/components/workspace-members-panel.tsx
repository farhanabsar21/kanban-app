import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { Plus, Shield, Trash2, UserPlus, Users } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  useAddWorkspaceMember,
  useRemoveWorkspaceMember,
  useUpdateWorkspaceMemberRole,
  useWorkspaceMembers,
} from "../hooks/use-memberships";
import {
  type AddMemberFormValues,
  addMemberSchema,
} from "../schemas/member-schema";
import { toast } from "sonner";

type Props = {
  workspaceId: string;
};

type ApiError = {
  message: string;
};

export function WorkspaceMembersPanel({ workspaceId }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const { data, isLoading } = useWorkspaceMembers(workspaceId);
  const addMemberMutation = useAddWorkspaceMember(workspaceId);
  const updateRoleMutation = useUpdateWorkspaceMemberRole(workspaceId);
  const removeMemberMutation = useRemoveWorkspaceMember(workspaceId);

  const members = data?.members ?? [];

  const form = useForm<AddMemberFormValues>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      email: "",
      role: "MEMBER",
    },
  });

  const onSubmit = async (values: AddMemberFormValues) => {
    try {
      await addMemberMutation.mutateAsync({
        workspaceId,
        email: values.email,
        role: values.role,
      });

      toast.success("Member added");

      form.reset({
        email: "",
        role: "MEMBER",
      });

      setIsOpen(false);
    } catch {
      // rendered below
    }
  };

  const errorMessage =
    addMemberMutation.error instanceof AxiosError
      ? (addMemberMutation.error.response?.data as ApiError | undefined)
          ?.message
      : null;

  return (
    <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users size={18} />
            <h3 className="text-lg font-semibold">Workspace members</h3>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Add existing users to this workspace and manage their roles.
          </p>
        </div>

        <button
          onClick={() => setIsOpen((value) => !value)}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 hover:bg-white/10"
        >
          <Plus size={15} />
          Add member
        </button>
      </div>

      {isOpen ? (
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mb-5 rounded-xl border border-white/10 bg-slate-900 p-4"
        >
          {errorMessage ? (
            <div className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {errorMessage}
            </div>
          ) : null}

          <div className="grid gap-3 md:grid-cols-[1fr_160px_auto]">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">
                User email
              </label>
              <input
                type="email"
                {...form.register("email")}
                placeholder="member@example.com"
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-white/30"
              />
              {form.formState.errors.email ? (
                <p className="mt-1 text-sm text-red-300">
                  {form.formState.errors.email.message}
                </p>
              ) : null}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">
                Role
              </label>
              <select
                {...form.register("role")}
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-white/30"
              >
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={addMemberMutation.isPending}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-slate-200 disabled:opacity-60 md:w-auto"
              >
                <UserPlus size={15} />
                {addMemberMutation.isPending ? "Adding..." : "Add"}
              </button>
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            MVP note: this adds an already registered user by email. Later we
            can add real email invitations.
          </p>
        </form>
      ) : null}

      {isLoading ? (
        <p className="text-sm text-slate-400">Loading members...</p>
      ) : members.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-slate-500">
          No members found.
        </div>
      ) : (
        <div className="space-y-3">
          {members.map((member) => {
            const isOwner = member.role === "OWNER";

            return (
              <div
                key={member.id}
                className="flex flex-col gap-3 rounded-xl border border-white/10 bg-slate-900 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-white">{member.user.name}</p>
                    {isOwner ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs text-yellow-300">
                        <Shield size={12} />
                        Owner
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {member.user.email}
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <select
                    value={member.role}
                    disabled={
                      isOwner ||
                      updateRoleMutation.isPending ||
                      removeMemberMutation.isPending
                    }
                    onChange={(event) => {
                      const role = event.target.value as "ADMIN" | "MEMBER";

                      updateRoleMutation.mutate(
                        {
                          workspaceId,
                          memberId: member.id,
                          role,
                        },
                        {
                          onSuccess: () => toast.success("Role updated"),
                          onError: () => toast.error("Failed to update role"),
                        },
                      );
                    }}
                    className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="OWNER" disabled>
                      Owner
                    </option>
                    <option value="ADMIN">Admin</option>
                    <option value="MEMBER">Member</option>
                  </select>

                  <button
                    type="button"
                    disabled={isOwner || removeMemberMutation.isPending}
                    onClick={() => {
                      removeMemberMutation.mutate(
                        {
                          workspaceId,
                          memberId: member.id,
                        },
                        {
                          onSuccess: () => toast.success("Member removed"),
                          onError: () => toast.error("Failed to remove member"),
                        },
                      );
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 size={15} />
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
