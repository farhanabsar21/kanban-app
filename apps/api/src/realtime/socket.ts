import { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import { env } from "../config/env";

let io: Server | null = null;

export function initSocket(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("board:join", (boardId: string) => {
      socket.join(`board:${boardId}`);
    });

    socket.on("board:leave", (boardId: string) => {
      socket.leave(`board:${boardId}`);
    });

    socket.on("disconnect", () => {
      // no-op for now
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.IO has not been initialized");
  }

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
