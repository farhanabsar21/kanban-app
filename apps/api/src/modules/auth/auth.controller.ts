import { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/async-handler";
import { getCurrentUser, loginUser, registerUser } from "./auth.service";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await registerUser(req.body);

  res.cookie("accessToken", result.token, cookieOptions);

  res.status(201).json({
    user: result.user,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await loginUser(req.body);

  res.cookie("accessToken", result.token, cookieOptions);

  res.status(200).json({
    user: result.user,
  });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.userId) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const user = await getCurrentUser(req.userId);

  if (!user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  res.status(200).json({
    user,
  });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie("accessToken", cookieOptions);

  res.status(200).json({
    message: "Logged out successfully",
  });
});
