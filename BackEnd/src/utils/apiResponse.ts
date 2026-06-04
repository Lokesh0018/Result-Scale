import { Response } from "express";

export const sendSuccess = (res: Response, status: number, message: string, data: Record<string, unknown> = {}) =>
  res.status(status).json({
    success: true,
    message,
    data,
    ...data,
  });

export const sendFailure = (res: Response, status: number, message: string, error: unknown = {}) =>
  res.status(status).json({
    success: false,
    message,
    error,
  });
