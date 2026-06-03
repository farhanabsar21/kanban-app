import { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import { env } from "../config/env";

let io: Server | null = null;

const boardPresence = new Map<
  string,
  Map<string, { socketId: string; name: string; email: string }>
>();

function getBoardUsers(boardId: string) {
  return Array.from(boardPresence.get(boardId)?.values() ?? []);
}

export function initSocket(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on(
      "board:join",
      (payload: {
        boardId: string;
        user: { id: string; name: string; email: string };
      }) => {
        const { boardId, user } = payload;

        socket.join(`board:${boardId}`);

        const users = boardPresence.get(boardId) ?? new Map();

        users.set(user.id, {
          socketId: socket.id,
          name: user.name,
          email: user.email,
        });

        boardPresence.set(boardId, users);

        io?.to(`board:${boardId}`).emit("board:presence-updated", {
          boardId,
          users: getBoardUsers(boardId),
        });
      },
    );

    socket.on(
      "comment:typing-start",
      (payload: {
        boardId: string;
        taskId: string;
        user: {
          id: string;
          name: string;
          email: string;
        };
      }) => {
        socket
          .to(`board:${payload.boardId}`)
          .emit("comment:typing-start", payload);
      },
    );

    socket.on(
      "comment:typing-stop",
      (payload: {
        boardId: string;
        taskId: string;
        user: {
          id: string;
          name: string;
          email: string;
        };
      }) => {
        socket
          .to(`board:${payload.boardId}`)
          .emit("comment:typing-stop", payload);
      },
    );

    socket.on("board:leave", (boardId: string) => {
      const users = boardPresence.get(boardId);

      if (users) {
        for (const [userId, user] of users.entries()) {
          if (user.socketId === socket.id) {
            users.delete(userId);
          }
        }

        io?.to(`board:${boardId}`).emit("board:presence-updated", {
          boardId,
          users: getBoardUsers(boardId),
        });
      }

      socket.leave(`board:${boardId}`);
    });

    socket.on("disconnect", () => {
      for (const [boardId, users] of boardPresence.entries()) {
        let changed = false;

        for (const [userId, user] of users.entries()) {
          if (user.socketId === socket.id) {
            users.delete(userId);
            changed = true;
          }
        }

        if (changed) {
          io?.to(`board:${boardId}`).emit("board:presence-updated", {
            boardId,
            users: getBoardUsers(boardId),
          });
        }
      }
    });
  });

  return io;
}

export function emitBoardEvent(
  boardId: string,
  event: string,
  payload: Record<string, unknown>,
) {
  if (!io) return;

  io.to(`board:${boardId}`).emit(event, payload);
}
