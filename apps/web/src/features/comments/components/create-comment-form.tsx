import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { useCreateComment } from "../hooks/use-comments";
import {
  type CreateCommentFormValues,
  createCommentSchema,
} from "../schemas/comment-schema";

type Props = {
  taskId: string;
  boardId: string;
};

type ApiError = {
  message: string;
};

export function CreateCommentForm({ taskId, boardId }: Props) {
  const createCommentMutation = useCreateComment();

  const form = useForm<CreateCommentFormValues>({
    resolver: zodResolver(createCommentSchema),
    defaultValues: {
      body: "",
    },
  });

  const onSubmit = async (values: CreateCommentFormValues) => {
    try {
      await createCommentMutation.mutateAsync({
        taskId,
        boardId,
        body: values.body,
      });

      form.reset();
    } catch {
      // rendered below
    }
  };

  const errorMessage =
    createCommentMutation.error instanceof AxiosError
      ? (createCommentMutation.error.response?.data as ApiError | undefined)
          ?.message
      : null;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
      {errorMessage ? (
        <div className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {errorMessage}
        </div>
      ) : null}

      <textarea
        {...form.register("body")}
        rows={3}
        placeholder="Write a comment..."
        className="w-full resize-none rounded-lg border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-white/30"
      />

      {form.formState.errors.body ? (
        <p className="text-sm text-red-300">
          {form.formState.errors.body.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={createCommentMutation.isPending}
        className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-slate-200 disabled:opacity-60"
      >
        {createCommentMutation.isPending ? "Posting..." : "Post comment"}
      </button>
    </form>
  );
}
