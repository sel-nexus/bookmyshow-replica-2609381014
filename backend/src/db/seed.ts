import { getDb } from "./database";

/**
 * Seed data for the replica catalog.
 *
 * The acceptance dataset from the PRD: three movies and three theatres, with
 * every theatre showing every movie.
 */
const MOVIES = [
  { title: "Paradise", poster: "/posters/paradise.svg", genre: "Drama", rating: "U/A" },
  { title: "Bloody Romeo", poster: "/posters/bloody-romeo.svg", genre: "Action", rating: "A" },
  { title: "OG2", poster: "/posters/og2.svg", genre: "Thriller", rating: "U/A" },
];

const THEATRES = [
  { name: "Sandhya 70mm", location: "Hyderabad" },
  { name: "Sudharsham 70mm", location: "Hyderabad" },
  { name: "Allu Cinemas", location: "Hyderabad" },
];

/**
 * Seed the database idempotently.
 *
 * Each insert is conditional on absence (checked by unique title/name), so
 * running seed on every startup never duplicates rows. Also maps every movie
 * to every theatre.
 */
export function seedDatabase(): void {
  const db = getDb();

  const insertMovie = db.prepare(
    "INSERT INTO movies (title, poster, genre, rating) SELECT ?, ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM movies WHERE title = ?)"
  );
  const insertTheatre = db.prepare(
    "INSERT INTO theatres (name, location) SELECT ?, ? WHERE NOT EXISTS (SELECT 1 FROM theatres WHERE name = ?)"
  );
  const insertMapping = db.prepare(
    "INSERT OR IGNORE INTO movie_theatres (movie_id, theatre_id) VALUES (?, ?)"
  );

  const seedAll = db.transaction(() => {
    for (const movie of MOVIES) {
      insertMovie.run(movie.title, movie.poster, movie.genre, movie.rating, movie.title);
    }
    for (const theatre of THEATRES) {
      insertTheatre.run(theatre.name, theatre.location, theatre.name);
    }
    const movieIds = db.prepare("SELECT id FROM movies").all() as { id: number }[];
    const theatreIds = db.prepare("SELECT id FROM theatres").all() as { id: number }[];
    for (const movie of movieIds) {
      for (const theatre of theatreIds) {
        insertMapping.run(movie.id, theatre.id);
      }
    }
  });

  seedAll();
}
