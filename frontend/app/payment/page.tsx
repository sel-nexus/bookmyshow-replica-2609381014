"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createBooking, ApiError } from "@/lib/api";
import { useBooking } from "@/context/BookingContext";
import { FormField } from "@/components/FormField";
import { Button } from "@/components/Button";
import { LoadingSpinner } from "@/components/LoadingSpinner";

type PaymentMethod = "card" | "upi";

/** The simulated payment processing duration (exactly 2 seconds). */
const PROCESSING_MS = 2000;

/**
 * Payment page.
 *
 * Offers Card and UPI options, collects the relevant dummy details, shows a
 * 2-second "Processing Payment..." state, then submits the booking to the
 * backend and routes to the success screen.
 */
export default function PaymentPage() {
  const router = useRouter();
  const { mobile, draft, setConfirmation } = useBooking();

  const [method, setMethod] = useState<PaymentMethod>("card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [upiId, setUpiId] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  // Guard: require seats before paying.
  useEffect(() => {
    if (!draft.movie || !draft.theatre || draft.seats.length === 0) {
      router.replace("/movies");
    }
  }, [draft, router]);

  async function handlePay(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!draft.movie || !draft.theatre) return;

    setProcessing(true);
    // Simulated gateway: hold the processing state for exactly 2 seconds.
    await new Promise((resolve) => setTimeout(resolve, PROCESSING_MS));

    try {
      const res = await createBooking({
        mobile,
        movieId: draft.movie.id,
        theatreId: draft.theatre.id,
        seats: draft.seats,
        totalPrice: draft.totalPrice,
        paymentMethod: method,
      });
      setConfirmation(res.booking);
      router.push("/success");
    } catch (err) {
      setProcessing(false);
      setError(
        err instanceof ApiError ? err.message : "Payment failed. Try again."
      );
    }
  }

  if (processing) {
    return (
      <div className="container-page flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-12">
        <LoadingSpinner label="Processing payment" />
        <p className="mt-6 text-xl font-semibold text-foreground">
          Processing Payment...
        </p>
        <p className="mt-2 text-sm text-foreground-muted">
          Please don&apos;t close this window.
        </p>
      </div>
    );
  }

  return (
    <div className="container-page flex min-h-[calc(100vh-4rem)] justify-center py-12">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-extrabold text-foreground">Payment</h1>
        <p className="mt-2 text-foreground-muted">
          {draft.movie?.title} · {draft.theatre?.name} ·{" "}
          {draft.seats.join(", ")} · Rs. {draft.totalPrice}
        </p>

        {/* Payment method toggle */}
        <div className="mt-8 grid grid-cols-2 gap-3">
          {(["card", "upi"] as PaymentMethod[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMethod(m)}
              aria-pressed={method === m}
              className={`rounded-card border px-4 py-3 text-sm font-semibold capitalize transition-colors ${
                method === m
                  ? "border-primary-500 bg-primary-50 text-primary-700"
                  : "border-border bg-surface text-foreground hover:bg-surface-raised"
              }`}
            >
              {m === "card" ? "Card" : "UPI"}
            </button>
          ))}
        </div>

        <form onSubmit={handlePay} className="mt-6 space-y-5" noValidate>
          {method === "card" ? (
            <>
              <FormField
                label="Card number"
                inputMode="numeric"
                placeholder="4111 1111 1111 1111"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                required
                autoComplete="cc-number"
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Expiry date"
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  required
                  autoComplete="cc-exp"
                />
                <FormField
                  label="CVV"
                  inputMode="numeric"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  required
                  maxLength={4}
                  autoComplete="cc-csc"
                />
              </div>
            </>
          ) : (
            <FormField
              label="UPI ID"
              placeholder="user@upi"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              required
            />
          )}

          {error && (
            <p role="alert" className="text-sm text-error">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" className="w-full">
            Pay Rs. {draft.totalPrice}
          </Button>
        </form>
      </div>
    </div>
  );
}
