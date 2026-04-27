import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "../config/env";
import { errorHandler } from "../common/middleware/error-handler";
import { notFoundHandler } from "../common/middleware/not-found";
import { apiRouter } from "../routes";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true,
    }),
  );

  app.use(helmet());
  app.use(express.json());
  app.use(cookieParser());

  app.use("/api", apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
