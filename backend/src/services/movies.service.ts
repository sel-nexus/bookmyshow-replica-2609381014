import { getDb } from "../db/database";
import type { Movie, Theatre } from "../types";

/**
 * Movies catalog service — queries against the seeded database.
 */
export class MoviesService {
  /**
   * List every movie in the catalog.
   *
   * Returns:
   *   All movies, ordered by id.
   */
  listMovies(): Movie[] {
    const rows = getDb()
      .prepare("SELECT id, title, poster, genre, rating FROM movies ORDER BY id")
      .all();
    return rows as Movie[];
  }

  /**
   * Find a single movie by id.
   *
   * Args:
   *   id: The movie id.
   *
   * Returns:
   *   The movie, or undefined when it does not exist.
   */
  getMovie(id: number): Movie | undefined {
    const row = getDb()
      .prepare("SELECT id, title, poster, genre, rating FROM movies WHERE id = ?")
      .get(id);
    return row as Movie | undefined;
  }

  /**
   * List the theatres showing a given movie.
   *
   * Args:
   *   movieId: The movie id.
   *
   * Returns:
   *   The theatres mapped to that movie.
   */
  listTheatresForMovie(movieId: number): Theatre[] {
    const rows = getDb()
      .prepare(
        `SELECT t.id, t.name, t.location
         FROM theatres t
         JOIN movie_theatres mt ON mt.theatre_id = t.id
         WHERE mt.movie_id = ?
         ORDER BY t.id`
      )
      .all(movieId);
    return rows as Theatre[];
  }
}

export const moviesService = new MoviesService();
