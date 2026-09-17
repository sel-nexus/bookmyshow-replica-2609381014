import { describe, it, expect, beforeEach, afterAll } from "vitest";
import fs from "fs";
import path from "path";
import os from "os";

/**
 * Unit tests for BookingsService against a real (file-backed) SQLite database
 * in a temp directory. Covers happy path, persistence, and error branches.
 */

let dbDir: string;

// Point at an isolated temp database before importing any app modules.
dbDir = fs.mkdtempSync(path.join(os.tmpdir(), "bms-bookings-"));
process.env.DATABASE_PATH = path.join(dbDir, "test.db");
process.env.JWT_SECRET = "test-secret";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { seedDatabase } = await import("../db/seed");
const { bookingsService } = await import("../services/bookings.service");
const { moviesService } = await import("../services/movies.service");
const { theatresService } = await import("../services/theatres.service");
const { closeDb } = await import("../db/database");

afterAll(() => {
  closeDb();
  try {
    fs.rmSync(dbDir, { recursive: true, force: true });
  } catch {
    // best-effort cleanup
  }
});

describe("BookingsService", () => {
  beforeEach(() => {
    seedDatabase();
  });

  it("creates a booking and returns a confirmation with movie, theatre, and seats", () => {
    const movie = moviesService.listMovies()[0];
    const theatre = theatresService.listTheatres()[0];
    const confirmation = bookingsService.createBooking({
      mobile: "9876543210",
      movieId: movie.id,
      theatreId: theatre.id,
      seats: ["A1", "A2", "A3"],
      totalPrice: 450,
      paymentMethod: "card",
    });
    expect(confirmation.confirmationId).toMatch(/^BMS-/);
    expect(confirmation.movie).toBe(movie.title);
    expect(confirmation.theatre).toBe(theatre.name);
    expect(confirmation.seats).toEqual(["A1", "A2", "A3"]);
    expect(confirmation.totalPrice).toBe(450);
  });

  it("persists the booking so it can be re-queried from the database", () => {
    const movie = moviesService.listMovies()[0];
    const theatre = theatresService.listTheatres()[0];
    const confirmation = bookingsService.createBooking({
      mobile: "9876543210",
      movieId: movie.id,
      theatreId: theatre.id,
      seats: ["A1", "A2", "A3"],
      totalPrice: 450,
      paymentMethod: "upi",
    });
    const persisted = bookingsService.getBooking(confirmation.id);
    expect(persisted).toBeDefined();
    expect(persisted?.confirmationId).toBe(confirmation.confirmationId);
    expect(persisted?.seats).toEqual(["A1", "A2", "A3"]);
    expect(persisted?.paymentMethod).toBe("upi");
  });

  it("throws 404 when the movie does not exist", () => {
    const theatre = theatresService.listTheatres()[0];
    try {
      bookingsService.createBooking({
        mobile: "9876543210",
        movieId: 9999,
        theatreId: theatre.id,
        seats: ["A1"],
        totalPrice: 150,
        paymentMethod: "card",
      });
      expect.unreachable("should have thrown");
    } catch (err) {
      expect((err as Error & { status?: number }).status).toBe(404);
      expect((err as Error).message).toBe("Movie not found");
    }
  });

  it("throws 404 when the theatre does not exist", () => {
    const movie = moviesService.listMovies()[0];
    try {
      bookingsService.createBooking({
        mobile: "9876543210",
        movieId: movie.id,
        theatreId: 9999,
        seats: ["A1"],
        totalPrice: 150,
        paymentMethod: "card",
      });
      expect.unreachable("should have thrown");
    } catch (err) {
      expect((err as Error & { status?: number }).status).toBe(404);
      expect((err as Error).message).toBe("Theatre not found");
    }
  });

  it("returns undefined when re-querying a non-existent booking id", () => {
    expect(bookingsService.getBooking(999999)).toBeUndefined();
  });

  it("enforces the unique confirmation_id constraint", () => {
    // Two bookings must never share a confirmation id.
    const movie = moviesService.listMovies()[0];
    const theatre = theatresService.listTheatres()[0];
    const a = bookingsService.createBooking({
      mobile: "9876543210",
      movieId: movie.id,
      theatreId: theatre.id,
      seats: ["A1"],
      totalPrice: 150,
      paymentMethod: "card",
    });
    const b = bookingsService.createBooking({
      mobile: "9876543210",
      movieId: movie.id,
      theatreId: theatre.id,
      seats: ["A2"],
      totalPrice: 150,
      paymentMethod: "card",
    });
    expect(a.confirmationId).not.toBe(b.confirmationId);
  });
});
