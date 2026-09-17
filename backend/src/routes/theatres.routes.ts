import { Router, Request, Response, NextFunction } from "express";
import { theatresService } from "../services/theatres.service";

/**
 * Theatres router: theatre listing.
 */
export const theatresRouter = Router();

/**
 * GET /api/theatres — return all theatres.
 */
theatresRouter.get(
  "/",
  (_req: Request, res: Response, next: NextFunction): void => {
    try {
      const theatres = theatresService.listTheatres();
      res.status(200).json({ theatres });
    } catch (err) {
      next(err);
    }
  }
);
