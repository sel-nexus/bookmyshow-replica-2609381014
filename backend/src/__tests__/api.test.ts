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
