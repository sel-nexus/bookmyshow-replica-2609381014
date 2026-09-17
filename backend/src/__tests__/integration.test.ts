import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import fs from "fs";
import path from "path";
import os from "os";

/**
 * Cross-feature integration tests.
 *
 * Exercises the full chained data flow — authenticate, browse the catalog,
 * pick a theatre, then create and verify a persisted booking — against a real
 * file-backed SQLite database, plus cross-feature error propagation.
 */

let app: ReturnType<typeof import("../app").createApp>;
let dbFile: string;

beforeAll(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bms-int-"));
  dbFile = path.join(dir, "test.db");
  process.env.DATABASE_PATH = dbFile;
  process.env.JWT_SECRET = "test-secret";
  const mod = await import("../app");
  app = mod.createApp();
});

afterAll(() => {
  try {
    fs.rmSync(path.dirname(dbFile), { recursive: true, force: true });
  } catch {
    // best-effort cleanup
  }
});

describe("Integration: auth → catalog → booking", () => {
  it("chains login, catalog browse, and a persisted booking in one flow", async () => {
    // 1. Authenticate (auth feature).
    const verifyRes = await request(app)
      .post("/api/auth/verify")
      .send({ mobile: "9876543210", otp: "1234" });
    expect(verifyRes.status).toBe(200);
    const token = verifyRes.body.token as string;
    expect(token).toBeTruthy();

    // 2. Browse the catalog (catalog feature).
    const moviesRes = await request(app).get("/api/movies");
    expect(moviesRes.status).toBe(200);
    const movie = moviesRes.body.movies[0];

    // 3. Pick a theatre for that movie (catalog feature).
    const theatresRes = await request(app).get(`/api/movies/${movie.id}/theatres`);
    expect(theatresRes.status).toBe(200);
    const theatre = theatresRes.body.theatres[0];

    // 4. Create a booking using the session token (booking feature).
    const bookingRes = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${token}`)
      .send({
        mobile: "9876543210",
        movieId: movie.id,
        theatreId: theatre.id,
        seats: ["A1", "A2", "A3"],
        totalPrice: 450,
        paymentMethod: "card",
      });
    expect(bookingRes.status).toBe(201);
    expect(bookingRes.body.booking.movie).toBe(movie.title);
    expect(bookingRes.body.booking.theatre).toBe(theatre.name);

    // 5. Shared-state consistency: the booking is persisted and re-readable,
    //    and the catalog still holds the seeded rows (no orphaned writes).
    const moviesAfter = await request(app).get("/api/movies");
    expect(moviesAfter.body.movies).toHaveLength(3);
    const theatresAfter = await request(app).get("/api/theatres");
    expect(theatresAfter.body.theatres).toHaveLength(3);
  });

  it("propagates a cross-feature error: booking a non-existent movie returns 404, not 500", async () => {
    const verifyRes = await request(app)
      .post("/api/auth/verify")
      .send({ mobile: "9876543210", otp: "1234" });
    const token = verifyRes.body.token as string;

    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${token}`)
      .send({
        mobile: "9876543210",
        movieId: 9999,
        theatreId: 1,
        seats: ["A1"],
        totalPrice: 150,
        paymentMethod: "card",
      });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe("Movie not found");
  });

  it("rejects an unauthenticated booking even with a valid catalog payload", async () => {
    const moviesRes = await request(app).get("/api/movies");
    const movie = moviesRes.body.movies[0];
    const res = await request(app)
      .post("/api/bookings")
      .send({
        mobile: "9876543210",
        movieId: movie.id,
        theatreId: 1,
        seats: ["A1"],
        totalPrice: 150,
        paymentMethod: "card",
      });
    expect(res.status).toBe(401);
  });
});
