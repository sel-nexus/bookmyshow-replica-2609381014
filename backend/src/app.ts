import express, { Express, Request, Response } from "express";
import cors from "cors";
import { config } from "./config";
import { errorHandler } from "./middleware/errorHandler";

/**
 * Build and configure the Express application.
 *
 * Mounts body parsing, CORS, the liveness probe, feature routers, and the
 * centralized error handler (last). Kept separate from the server bootstrap
 * so tests can exercise the app in-process without binding a port.
 *
 * Returns:
 *   A configured Express application.
 */
export function createApp(): Express {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors({ origin: config.corsOrigins, credentials: true }));

  // Liveness probe — the single carve-out from feature routing. No DB access.
  app.get("/api/health", (_req: Request, res: Response) => {
    res.status(200).json({ status: "ok" });
  });

  // Feature routers are mounted here by later slices.

  app.use(errorHandler);

  return app;
}
