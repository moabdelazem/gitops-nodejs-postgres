import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/app-error";
import logger from "../utils/logger";

function isPgError(err: unknown): err is { code: string; detail?: string } {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    typeof (err as { code?: unknown }).code === "string"
  );
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    logger.warn({ statusCode: err.statusCode, message: err.message });
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  if (err instanceof ZodError) {
    const errors = err.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    logger.warn({ validationErrors: errors });
    res.status(400).json({ error: "Validation failed", details: errors });
    return;
  }

  if (isPgError(err)) {
    logger.warn({ code: err.code, detail: err.detail }, "Database error");

    if (err.code === "23505") {
      res.status(409).json({ error: "Resource already exists" });
      return;
    }

    if (err.code === "23503") {
      res.status(400).json({ error: "Invalid reference value" });
      return;
    }

    if (err.code === "22P02") {
      res.status(400).json({ error: "Invalid input format" });
      return;
    }

    if (err.code === "23502" || err.code === "23514") {
      res.status(400).json({ error: "Invalid database payload" });
      return;
    }
  }

  logger.error({ err }, "Unhandled error");
  res.status(500).json({ error: "Internal server error" });
}
