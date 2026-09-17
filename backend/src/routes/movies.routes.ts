import { Router, Request, Response, NextFunction } from "express";
import { moviesService } from "../services/movies.service";

/**
 * Movies router: catalog listing and per-movie theatre lookup.
 */
export const moviesRouter = Router();

/**
 * GET /api/movies — return the full movie catalog.
 */
moviesRouter.get(
  "/",
  (_req: Request, res: Response, next: NextFunction): void => {
    try {
      const movies = moviesService.listMovies();
      res.status(200).json({ movies });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/movies/:id/theatres — return the theatres showing a movie.
 */
moviesRouter.get(
  "/:id/theatres",
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        res.status(400).json({ success: false, error: "Invalid movie id" });
        return;
      }
      const movie = moviesService.getMovie(id);
      if (!movie) {
        res.status(404).json({ success: false, error: "Movie not found" });
        return;
      }
      const theatres = moviesService.listTheatresForMovie(id);
      res.status(200).json({ theatres });
    } catch (err) {
      next(err);
    }
  }
);
