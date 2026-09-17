import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { bookingsService } from "../services/bookings.service";
import { validateBody } from "../middleware/validate";

const bookingSchema = z.object({
  mobile: z.string().regex(/^[0-9]{10}$/, "Mobile number must be 10 digits"),
  movieId: z.number().int().positive("movieId must be a positive integer"),
  theatreId: z.number().int().positive("theatreId must be a positive integer"),
  seats: z.array(z.string()).min(1, "At least one seat is required"),
  totalPrice: z.number().int().nonnegative("totalPrice must be non-negative"),
  paymentMethod: z.enum(["card", "upi"]),
});

/**
 * Bookings router: create a booking.
 */
export const bookingsRouter = Router();

/**
 * POST /api/bookings — persist a booking and return its confirmation.
 */
bookingsRouter.post(
  "/",
  validateBody(bookingSchema),
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const input = req.body as z.infer<typeof bookingSchema>;
      const booking = bookingsService.createBooking(input);
      res.status(201).json({ success: true, booking });
    } catch (err) {
      next(err);
    }
  }
);
