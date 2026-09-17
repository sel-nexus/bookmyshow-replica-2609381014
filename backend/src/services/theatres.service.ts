import { getDb } from "../db/database";
import type { Theatre } from "../types";

/**
 * Theatres service — queries against the seeded database.
 */
export class TheatresService {
  /**
   * List every theatre.
   *
   * Returns:
   *   All theatres, ordered by id.
   */
  listTheatres(): Theatre[] {
    const rows = getDb()
      .prepare("SELECT id, name, location FROM theatres ORDER BY id")
      .all();
    return rows as Theatre[];
  }

  /**
   * Find a single theatre by id.
   *
   * Args:
   *   id: The theatre id.
   *
   * Returns:
   *   The theatre, or undefined when it does not exist.
   */
  getTheatre(id: number): Theatre | undefined {
    const row = getDb()
      .prepare("SELECT id, name, location FROM theatres WHERE id = ?")
      .get(id);
    return row as Theatre | undefined;
  }
}

export const theatresService = new TheatresService();
