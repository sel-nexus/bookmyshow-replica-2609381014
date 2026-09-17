import { describe, it, expect, vi, beforeEach } from "vitest";
import * as api from "@/lib/api";

/**
 * Tests for the typed API client. `fetch` is mocked (network boundary); the
 * client's envelope-unwrapping and error mapping are exercised.
 */

describe("api client", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  function mockFetch(status: number, body: unknown) {
    return vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
      })
    );
  }

  it("getMovies unwraps the movies envelope", async () => {
    mockFetch(200, { movies: [{ id: 1, title: "Paradise" }] });
    const res = await api.getMovies();
    expect(res.movies[0].title).toBe("Paradise");
  });

  it("verifyOtp returns the session token on success", async () => {
    mockFetch(200, { success: true, token: "tok-123" });
    const res = await api.verifyOtp("9876543210", "1234");
    expect(res.token).toBe("tok-123");
  });

  it("throws an ApiError carrying the server message on a non-2xx response", async () => {
    mockFetch(401, { success: false, error: "Invalid OTP" });
    await expect(api.verifyOtp("9876543210", "0000")).rejects.toMatchObject({
      name: "ApiError",
      message: "Invalid OTP",
      status: 401,
    });
  });

  it("createBooking sends the Authorization header with the token", async () => {
    const spy = mockFetch(201, {
      success: true,
      booking: { id: 1, confirmationId: "BMS-X", movie: "Paradise", theatre: "Sandhya 70mm", seats: ["A1"], totalPrice: 150 },
    });
    await api.createBooking(
      {
        mobile: "9876543210",
        movieId: 1,
        theatreId: 1,
        seats: ["A1"],
        totalPrice: 150,
        paymentMethod: "card",
      },
      "tok-123"
    );
    const [, init] = spy.mock.calls[0];
    expect((init?.headers as Record<string, string>).Authorization).toBe(
      "Bearer tok-123"
    );
  });
});
