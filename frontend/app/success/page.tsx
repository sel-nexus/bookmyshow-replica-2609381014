"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useBooking } from "@/context/BookingContext";

/**
 * Booking success page.
 *
 * Shows the "Congratulations!" confirmation with the booked movie, theatre,
 * and seats returned from the backend.
 */
export default function SuccessPage() {
  const router = useRouter();
  const { confirmation } = useBooking();

  // Guard: require a confirmed booking.
  useEffect(() => {
    if (!confirmation) {
      router.replace("/movies");
    }
  }, [confirmation, router]);

  if (!confirmation) {
    return null;
  }

  return (
    <div className="container-page flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <div className="w-full max-w-md rounded-card border border-border bg-surface p-8 text-center shadow-card">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-light">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            className="h-8 w-8 text-success"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
        <h1 className="mt-6 text-3xl font-extrabold text-foreground">
          Congratulations!
        </h1>
        <p className="mt-2 text-foreground-muted">
          Your booking is confirmed.
        </p>

        <dl className="mt-8 space-y-3 rounded-card bg-surface-raised p-6 text-left">
          <div className="flex justify-between">
            <dt className="text-sm text-foreground-muted">Booking ID</dt>
            <dd className="text-sm font-semibold text-foreground">
              {confirmation.confirmationId}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm text-foreground-muted">Movie</dt>
            <dd className="text-sm font-semibold text-foreground">
              {confirmation.movie}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm text-foreground-muted">Theatre</dt>
            <dd className="text-sm font-semibold text-foreground">
              {confirmation.theatre}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm text-foreground-muted">Seats</dt>
            <dd className="text-sm font-semibold text-foreground">
              {confirmation.seats.join(", ")}
            </dd>
          </div>
          <div className="flex justify-between border-t border-border pt-3">
            <dt className="text-sm font-medium text-foreground">Total paid</dt>
            <dd className="text-sm font-bold text-foreground">
              Rs. {confirmation.totalPrice}
            </dd>
          </div>
        </dl>

        <Link
          href="/movies"
          className="mt-8 inline-block rounded-full bg-primary-500 px-8 py-3 text-base font-semibold text-white shadow-card transition-[background-color,box-shadow] hover:bg-primary-600 hover:shadow-card-hover"
        >
          Book another ticket
        </Link>
      </div>
    </div>
  );
}
