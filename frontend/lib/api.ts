/**
 * Typed API client for the BookMyShow Replica backend.
 *
 * The base URL defaults to same-origin (empty string) so the dev-server proxy
 * or co-hosted deployment forwards `/api` to the backend. Never hardcode a
 * host here.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

/** A movie in the catalog. */
export interface Movie {
  id: number;
  title: string;
  poster: string;
  genre: string;
  rating: string;
}

/** A theatre showing movies. */
export interface Theatre {
  id: number;
  name: string;
  location: string;
}

/** A confirmed booking returned by the backend. */
export interface BookingConfirmation {
  id: number;
  confirmationId: string;
  movie: string;
  theatre: string;
  seats: string[];
  totalPrice: number;
}

/** Payload submitted to create a booking. */
export interface BookingPayload {
  mobile: string;
  movieId: number;
  theatreId: number;
  seats: string[];
  totalPrice: number;
  paymentMethod: "card" | "upi";
}

/** Error thrown for non-2xx API responses, carrying the server message. */
export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Perform a JSON request against the backend and unwrap the envelope.
 *
 * Args:
 *   path: The request path beginning with `/api`.
 *   options: Fetch init options (method, body, headers).
 *
 * Returns:
 *   The parsed JSON response body.
 *
 * Raises:
 *   ApiError: When the response is not OK, carrying the server's error message.
 */
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const body = (await res.json().catch(() => ({}))) as {
    success?: boolean;
    error?: string;
  } & T;
  if (!res.ok) {
    throw new ApiError(body.error ?? `Request failed (${res.status})`, res.status);
  }
  return body;
}

/** Begin login by submitting a mobile number. */
export function login(mobile: string) {
  return request<{ success: true; message: string }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ mobile }),
  });
}

/** Verify the OTP and return a session token. */
export function verifyOtp(mobile: string, otp: string) {
  return request<{ success: true; token: string }>("/api/auth/verify", {
    method: "POST",
    body: JSON.stringify({ mobile, otp }),
  });
}

/** Fetch the movie catalog. */
export function getMovies() {
  return request<{ movies: Movie[] }>("/api/movies");
}

/** Fetch all theatres. */
export function getTheatres() {
  return request<{ theatres: Theatre[] }>("/api/theatres");
}

/** Fetch the theatres showing a given movie. */
export function getMovieTheatres(movieId: number) {
  return request<{ theatres: Theatre[] }>(`/api/movies/${movieId}/theatres`);
}

/** Submit a booking and return its confirmation. Requires the session token. */
export function createBooking(payload: BookingPayload, token: string) {
  return request<{ success: true; booking: BookingConfirmation }>(
    "/api/bookings",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }
  );
}
