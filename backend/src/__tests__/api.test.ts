import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import fs from "fs";
import path from "path";
import os from "os";

/**
 * API tests for the catalog endpoints, run against a real (file-backed)
 * SQLite database in a temp directory. The app seeds the catalog on startup.
 */

let app: ReturnType<typeof import("../app").createApp>;
let dbFile: string;

beforeAll(async () => {
  // Point the app at an isolated temp database before importing it.
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bms-test-"));
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

describe("GET /api/health", () => {
  it("returns 200 ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});

describe("GET /api/movies", () => {
  it("returns the three seeded movies", async () => {
    const res = await request(app).get("/api/movies");
    expect(res.status).toBe(200);
    const titles = res.body.movies.map((m: { title: string }) => m.title);
    expect(titles).toEqual(
      expect.arrayContaining(["Paradise", "Bloody Romeo", "OG2"])
    );
    expect(res.body.movies).toHaveLength(3);
  });
});

describe("GET /api/theatres", () => {
  it("returns the three seeded theatres", async () => {
    const res = await request(app).get("/api/theatres");
    expect(res.status).toBe(200);
    const names = res.body.theatres.map((t: { name: string }) => t.name);
    expect(names).toEqual(
      expect.arrayContaining(["Sandhya 70mm", "Sudharsham 70mm", "Allu Cinemas"])
    );
    expect(res.body.theatres).toHaveLength(3);
  });
});

describe("GET /api/movies/:id/theatres", () => {
  it("returns the theatres showing a movie", async () => {
    const moviesRes = await request(app).get("/api/movies");
    const movieId = moviesRes.body.movies[0].id;
    const res = await request(app).get(`/api/movies/${movieId}/theatres`);
    expect(res.status).toBe(200);
    expect(res.body.theatres.length).toBeGreaterThan(0);
  });

  it("returns 404 for a non-existent movie", async () => {
    const res = await request(app).get("/api/movies/9999/theatres");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("returns 400 for a non-numeric movie id", async () => {
    const res = await request(app).get("/api/movies/abc/theatres");
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe("POST /api/auth/login", () => {
  it("accepts a valid mobile number", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ mobile: "9876543210" });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("rejects an invalid mobile number with 400", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ mobile: "123" });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe("POST /api/auth/verify", () => {
  it("returns a session token for the correct OTP", async () => {
    const res = await request(app)
      .post("/api/auth/verify")
      .send({ mobile: "9876543210", otp: "1234" });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.token).toBe("string");
  });

  it("rejects a wrong OTP with 401", async () => {
    const res = await request(app)
      .post("/api/auth/verify")
      .send({ mobile: "9876543210", otp: "0000" });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

/**
 * Helper: obtain a valid session token for authenticated booking requests.
 */
async function getToken(): Promise<string> {
  const res = await request(app)
    .post("/api/auth/verify")
    .send({ mobile: "9876543210", otp: "1234" });
  return res.body.token as string;
}

const VALID_BOOKING = {
  mobile: "9876543210",
  movieId: 1,
  theatreId: 1,
  seats: ["A1", "A2", "A3"],
  totalPrice: 450,
  paymentMethod: "upi",
};

describe("POST /api/bookings", () => {
  it("creates a booking and returns 201 with a confirmation", async () => {
    const token = await getToken();
    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${token}`)
      .send(VALID_BOOKING);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.booking.confirmationId).toMatch(/^BMS-/);
    expect(res.body.booking.movie).toBe("Paradise");
    expect(res.body.booking.theatre).toBe("Sandhya 70mm");
    expect(res.body.booking.seats).toEqual(["A1", "A2", "A3"]);
    expect(res.body.booking.totalPrice).toBe(450);
  });

  it("rejects a booking without an auth token with 401", async () => {
    const res = await request(app).post("/api/bookings").send(VALID_BOOKING);
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("rejects a booking with an invalid token with 401", async () => {
    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", "Bearer not-a-real-token")
      .send(VALID_BOOKING);
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("returns 404 for a non-existent movie", async () => {
    const token = await getToken();
    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${token}`)
      .send({ ...VALID_BOOKING, movieId: 9999 });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("returns 404 for a non-existent theatre", async () => {
    const token = await getToken();
    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${token}`)
      .send({ ...VALID_BOOKING, theatreId: 9999 });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("rejects a missing seats field with 400", async () => {
    const token = await getToken();
    const { seats, ...withoutSeats } = VALID_BOOKING;
    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${token}`)
      .send(withoutSeats);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("rejects an empty seats array with 400", async () => {
    const token = await getToken();
    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${token}`)
      .send({ ...VALID_BOOKING, seats: [] });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("rejects an invalid paymentMethod enum with 400", async () => {
    const token = await getToken();
    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${token}`)
      .send({ ...VALID_BOOKING, paymentMethod: "bitcoin" });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("rejects a non-integer movieId with 400", async () => {
    const token = await getToken();
    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${token}`)
      .send({ ...VALID_BOOKING, movieId: "one" });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe("Security boundaries", () => {
  it("treats a SQL-injection string in mobile as invalid input, not a 500", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ mobile: "'; DROP TABLE movies; --" });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).not.toMatch(/stack|sqlite/i);
  });

  it("does not leak a stack trace on a malformed JSON body", async () => {
    const token = await getToken();
    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json")
      .send("{ not valid json ");
    // Express's JSON parser rejects malformed bodies with exactly 400, and the
    // error envelope must not leak internals.
    expect(res.status).toBe(400);
    expect(JSON.stringify(res.body)).not.toMatch(/at Object|node_modules/);
  });

  it("stores an XSS string as inert data without executing or reflecting raw HTML", async () => {
    const token = await getToken();
    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${token}`)
      .send({ ...VALID_BOOKING, seats: ["<script>alert(1)</script>"] });
    // The value is stored as an inert string and returned as JSON (201), never
    // reflected as executable HTML.
    expect(res.status).toBe(201);
    expect(res.headers["content-type"]).toMatch(/application\/json/);
    expect(res.body.booking.seats[0]).toBe("<script>alert(1)</script>");
  });
});
