import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { config } from "../config";

/**
 * SQLite database singleton.
 *
 * Opens a single file-backed connection shared across the app, ensures the
 * parent directory exists, and initializes the schema. Never open a
 * connection per request.
 */

let db: Database.Database | null = null;

/**
 * Get (creating on first use) the shared SQLite connection.
 *
 * Returns:
 *   The shared better-sqlite3 database instance.
 */
export function getDb(): Database.Database {
  if (db) {
    return db;
  }
  const dir = path.dirname(config.databasePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  db = new Database(config.databasePath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  initSchema(db);
  return db;
}

/**
 * Initialize the database schema idempotently.
 *
 * Args:
 *   database: The database instance to initialize.
 */
function initSchema(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS movies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      poster TEXT NOT NULL DEFAULT '',
      genre TEXT NOT NULL DEFAULT '',
      rating TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS theatres (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      location TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS movie_theatres (
      movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
      theatre_id INTEGER NOT NULL REFERENCES theatres(id) ON DELETE CASCADE,
      PRIMARY KEY (movie_id, theatre_id)
    );
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      confirmation_id TEXT NOT NULL UNIQUE,
      mobile TEXT NOT NULL,
      movie_id INTEGER NOT NULL REFERENCES movies(id),
      theatre_id INTEGER NOT NULL REFERENCES theatres(id),
      seats TEXT NOT NULL,
      total_price INTEGER NOT NULL,
      payment_method TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

/**
 * Close the shared connection. Used by tests to reset state.
 */
export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
