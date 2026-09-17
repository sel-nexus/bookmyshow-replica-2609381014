import { randomBytes } from "crypto";
import { getDb } from "../db/database";
import { moviesService } from "./movies.service";
import { theatresService } from "./theatres.service";
import type { Booking, PaymentMethod } from "../types";

/** Payload accepted to create a booking. */
export interface CreateBookingInput {
  mobile: string;
  movieId: number;
  theatreId: number;
  seats: string[];
  totalPrice: number;
  paymentMethod: PaymentMethod;
}

/** The confirmation shape returned to the caller. */
export interface BookingConfirmation {
  id: number;
  confirmationId: string;
  movie: string;
  theatre: string;
  seats: string[];
  totalPrice: number;
}

/**
 * Bookings service — persists bookings and returns confirmations.
 */
export class BookingsService {
  /**
   * Create and persist a booking.
   *
   * Args:
   *   input: The booking details.
   *
   * Returns:
   *   The booking confirmation with a generated confirmation id.
   *
   * Raises:
   *   Error: With `status: 404` when the movie or theatre does not exist.
   */
  createBooking(input: CreateBookingInput): BookingConfirmation {
    const movie = moviesService.getMovie(input.movieId);
    if (!movie) {
      const err = new Error("Movie not found") as Error & { status?: number };
      err.status = 404;
      throw err;
    }
    const theatre = theatresService.getTheatre(input.theatreId);
    if (!theatre) {
      const err = new Error("Theatre not found") as Error & { status?: number };
      err.status = 404;
      throw err;
    }

    const confirmationId = `BMS-${randomBytes(4).toString("hex").toUpperCase()}`;
    const db = getDb();
    const result = db
      .prepare(
        `INSERT INTO bookings
         (confirmation_id, mobile, movie_id, theatre_id, seats, total_price, payment_method)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        confirmationId,
        input.mobile,
        input.movieId,
        input.theatreId,
        JSON.stringify(input.seats),
        input.totalPrice,
        input.paymentMethod
      );

    return {
      id: Number(result.lastInsertRowid),
      confirmationId,
      movie: movie.title,
      theatre: theatre.name,
      seats: input.seats,
      totalPrice: input.totalPrice,
    };
  }

  /**
   * Fetch a persisted booking by id.
   *
   * Args:
   *   id: The booking id.
   *
   * Returns:
   *   The booking, or undefined when it does not exist.
   */
  getBooking(id: number): Booking | undefined {
    const row = getDb()
      .prepare("SELECT * FROM bookings WHERE id = ?")
      .get(id) as
      | {
          id: number;
          confirmation_id: string;
          mobile: string;
          movie_id: number;
          theatre_id: number;
          seats: string;
          total_price: number;
          payment_method: PaymentMethod;
          created_at: string;
        }
      | undefined;
    if (!row) return undefined;
    return {
      id: row.id,
      confirmationId: row.confirmation_id,
      mobile: row.mobile,
      movieId: row.movie_id,
      theatreId: row.theatre_id,
      seats: JSON.parse(row.seats) as string[],
      totalPrice: row.total_price,
      paymentMethod: row.payment_method,
      createdAt: row.created_at,
    };
  }
}

export const bookingsService = new BookingsService();
