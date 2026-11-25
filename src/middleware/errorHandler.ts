import type { ErrorRequestHandler, RequestHandler } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const notFoundHandler: RequestHandler = (_req, _res, next) => {
  next(new AppError(404, "Route not found."));
};

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _req,
  res,
  next
) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      error: "Request validation failed.",
      details: error.flatten()
    });
    return;
  }

  if (error instanceof mongoose.Error.ValidationError) {
    res.status(400).json({
      error: "Database validation failed.",
      details: Object.values(error.errors).map((item) => item.message)
    });
    return;
  }

  if (error instanceof mongoose.Error.CastError) {
    res.status(400).json({ error: "Invalid value." });
    return;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  ) {
    res.status(409).json({ error: "A record with that value already exists." });
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    error.type === "entity.parse.failed"
  ) {
    res.status(400).json({ error: "Request body contains invalid JSON." });
    return;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    error.type === "entity.too.large"
  ) {
    res.status(413).json({ error: "Request body is too large." });
    return;
  }

  const errorName = error instanceof Error ? error.name : "UnknownError";
  if (
    errorName === "MongoServerSelectionError" ||
    errorName === "MongoNetworkError" ||
    errorName === "MongoTimeoutError"
  ) {
    res.status(503).json({ error: "Database temporarily unavailable." });
    return;
  }

  console.error("Unhandled API error:", error);
  res.status(500).json({ error: "Internal server error." });
};
