import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { env } from "../../config/env";
import { AppError } from "../errors/app-error";

type JwtPayload = {
  userId: string;
};

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.accessToken;

  if (!token) {
    return next(new AppError("Unauthorized", 401));
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    req.userId = payload.userId;

    return next();
  } catch {
    return next(new AppError("Unauthorized", 401));
  }
}
