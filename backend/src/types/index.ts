/**
 * Shared domain types and DTOs for the BookMyShow Replica backend.
 */

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

/** A persisted booking. */
export interface Booking {
  id: number;
  confirmationId: string;
  mobile: string;
  movieId: number;
  theatreId: number;
  seats: string[];
  totalPrice: number;
  paymentMethod: PaymentMethod;
  createdAt: string;
}

/** Supported dummy payment methods. */
export type PaymentMethod = "card" | "upi";

/** Standard success envelope. */
export interface SuccessResponse<T> {
  success: true;
  data?: T;
  message?: string;
  token?: string;
}

/** Standard error envelope. */
export interface ErrorResponse {
  success: false;
  error: string;
}
