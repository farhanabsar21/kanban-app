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
];

export function useBoardRealtime(boardId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!boardId) return;

    const joinBoard = () => {
      console.log("socket connected:", socket.id);
      console.log("joining board:", boardId);
      socket.emit("board:join", boardId);
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

    return () => {
      socket.emit("board:leave", boardId);
      socket.off("connect", joinBoard);

      BOARD_EVENTS.forEach((event) => {
        socket.off(event, handleBoardEvent);
      });
    };
  }, [boardId, queryClient]);
}
