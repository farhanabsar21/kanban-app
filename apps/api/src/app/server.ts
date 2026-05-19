import dotenv from "dotenv";
import path from "node:path";
import http from "node:http";

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

const { createApp } = await import("./app");
const { env } = await import("../config/env");
const { initSocket } = await import("../realtime/socket");

const app = createApp();
const server = http.createServer(app);

initSocket(server);

server.listen(env.PORT, () => {
  console.log(`API running on http://localhost:${env.PORT}`);
});
