import { useEffect, useMemo, useRef, useState } from "react";
import { socket } from "../../../lib/socket";

type User = {
  id: string;
  name: string;
  email: string;
};

type TypingPayload = {
  boardId: string;
  taskId: string;
  user: User;
};

type Options = {
  boardId: string;
  taskId: string;
  user?: User;
};

export function useCommentTyping({ boardId, taskId, user }: Options) {
  const [typingUsers, setTypingUsers] = useState<User[]>([]);
  const timeoutRef = useRef<number | null>(null);

  const payload = useMemo(() => {
    if (!user) return null;

    return {
      boardId,
      taskId,
      user,
    };
  }, [boardId, taskId, user]);

  useEffect(() => {
    const handleTypingStart = (event: TypingPayload) => {
      if (event.boardId !== boardId || event.taskId !== taskId) return;
      if (event.user.id === user?.id) return;

      setTypingUsers((current) => {
        const exists = current.some((item) => item.id === event.user.id);
        if (exists) return current;
        return [...current, event.user];
      });
    };

    const handleTypingStop = (event: TypingPayload) => {
      if (event.boardId !== boardId || event.taskId !== taskId) return;

      setTypingUsers((current) =>
        current.filter((item) => item.id !== event.user.id),
      );
    };

    socket.on("comment:typing-start", handleTypingStart);
    socket.on("comment:typing-stop", handleTypingStop);

    return () => {
      socket.off("comment:typing-start", handleTypingStart);
      socket.off("comment:typing-stop", handleTypingStop);
    };
  }, [boardId, taskId, user?.id]);

  const startTyping = () => {
    if (!payload) return;

    socket.emit("comment:typing-start", payload);

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      socket.emit("comment:typing-stop", payload);
      timeoutRef.current = null;
    }, 1500);
  };

  const stopTyping = () => {
    if (!payload) return;

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    socket.emit("comment:typing-stop", payload);
  };

  return {
    typingUsers,
    startTyping,
    stopTyping,
  };
}
