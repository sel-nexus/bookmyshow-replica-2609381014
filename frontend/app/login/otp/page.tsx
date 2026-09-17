"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { verifyOtp, ApiError } from "@/lib/api";
import { useBooking } from "@/context/BookingContext";
import { FormField } from "@/components/FormField";
import { Button } from "@/components/Button";

/**
 * OTP entry page.
 *
 * Verifies the hardcoded OTP against the backend and, on success, stores the
 * session token and routes to the movie dashboard.
 */
export default function OtpPage() {
  const router = useRouter();
  const { mobile, setSession } = useBooking();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If the user lands here without a mobile number, send them back to login.
  useEffect(() => {
    if (!mobile) {
      router.replace("/login");
    }
  }, [mobile, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!otp) {
      setError("Enter the OTP");
      return;
    }
    setLoading(true);
    try {
      const { token } = await verifyOtp(mobile, otp);
      setSession(mobile, token);
      router.push("/movies");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Verification failed"
      );
      setLoading(false);
    }
  }

  return (
    <div className="container-page flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <div className="w-full max-w-md rounded-card border border-border bg-surface p-8 shadow-card">
        <h1 className="text-2xl font-bold text-foreground">Enter OTP</h1>
        <p className="mt-2 text-sm text-foreground-muted">
          We sent a one-time password to{" "}
          <span className="font-medium text-foreground">{mobile}</span>.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
          <FormField
            label="One-time password"
            type="text"
            inputMode="numeric"
            placeholder="1234"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            error={error || undefined}
            required
            maxLength={4}
            autoComplete="one-time-code"
          />
          <Button type="submit" loading={loading} className="w-full" size="lg">
            Verify &amp; sign in
          </Button>
        </form>
        <p className="mt-4 text-center text-xs text-foreground-muted">
          Demo OTP: 1234
        </p>
      </div>
    </div>
  );
}
