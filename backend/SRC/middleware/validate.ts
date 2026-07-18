import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { AppError } from "./errorHandler";

export function validate(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const first = errors.array()[0];
    throw new AppError(first.msg, 422);
  }
  next();
}
