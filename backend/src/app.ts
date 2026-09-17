import express, { Express, Request, Response } from "express";
import cors from "cors";
import { config } from "./config";
import { errorHandler } from "./middleware/errorHandler";
import { authRouter } from "./routes/auth.routes";
import { moviesRouter } from "./routes/movies.routes";
import { theatresRouter } from "./routes/theatres.routes";
import { seedDatabase } from "./db/seed";

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
  // Pre-seed the catalog (movies + theatres) idempotently on startup.
  seedDatabase();

  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors({ origin: config.corsOrigins, credentials: true }));

  // Liveness probe — the single carve-out from feature routing. No DB access.
  app.get("/api/health", (_req: Request, res: Response) => {
    res.status(200).json({ status: "ok" });
  });

  // Feature routers.
  app.use("/api/auth", authRouter);
  app.use("/api/movies", moviesRouter);
  app.use("/api/theatres", theatresRouter);

  app.use(errorHandler);

  return app;
}
