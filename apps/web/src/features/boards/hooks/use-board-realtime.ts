import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { socket } from "../../../lib/socket";

const BOARD_EVENTS = [
  "board:task-created",
  "board:task-updated",
  "board:task-deleted",
  "board:task-moved",
  "board:column-created",
  "board:column-updated",
  "board:column-deleted",
  "board:columns-reordered",

  "board:comment-created",
  "board:comment-updated",
  "board:comment-deleted",

  "board:label-attached",
  "board:label-removed",

  "board:assignee-added",
  "board:assignee-removed",
  "board:notification-created",
];

type PresenceUser = {
  socketId: string;
  name: string;
  email: string;
};

type UseBoardRealtimeOptions = {
  boardId?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  onPresenceUpdate?: (users: PresenceUser[]) => void;
};

export function useBoardRealtime({
  boardId,
  user,
  onPresenceUpdate,
}: UseBoardRealtimeOptions) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!boardId) return;

    const joinBoard = () => {
      if (!boardId || !user) return;

      socket.emit("board:join", {
        boardId,
        user,
      });
    };

    const handleBoardEvent = (payload: {
      boardId?: string;
      taskId?: string;
    }) => {
      if (payload.boardId !== boardId) return;

      queryClient.refetchQueries({
        queryKey: ["boards", boardId],
        type: "active",
      });

      if (payload.taskId) {
        queryClient.refetchQueries({
          queryKey: ["tasks", payload.taskId],
          type: "active",
        });
      }

      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      });
    };

    const handlePresenceUpdate = (payload: {
      boardId?: string;
      users: PresenceUser[];
    }) => {
      if (payload.boardId !== boardId) return;
      onPresenceUpdate?.(payload.users);
    };

    if (!socket.connected) {
      socket.connect();
    } else {
      joinBoard();
    }

    socket.on("connect", joinBoard);

    BOARD_EVENTS.forEach((event) => {
      socket.on(event, handleBoardEvent);
    });

    socket.on("board:presence-updated", handlePresenceUpdate);

    return () => {
      socket.emit("board:leave", boardId);
      socket.off("connect", joinBoard);

      BOARD_EVENTS.forEach((event) => {
        socket.off(event, handleBoardEvent);
      });

      socket.off("board:presence-updated", handlePresenceUpdate);
    };
  }, [boardId, queryClient]);
}
