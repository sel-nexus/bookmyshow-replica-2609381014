import { ErrorRequestHandler } from "express";

/**
 * Centralized Express error-handling middleware.
 *
 * Formats every unhandled error into a consistent JSON error envelope.
 * Mounted as the last `app.use()` so Express routes all thrown/forwarded
 * errors here. Must keep the four-argument signature for Express to treat
 * it as an error handler.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const status = (err as { status?: number }).status ?? 500;
  const message = err.message ?? "Internal server error";
  res.status(status).json({ success: false, error: message });
};
