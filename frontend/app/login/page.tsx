"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { login, ApiError } from "@/lib/api";
import { useBooking } from "@/context/BookingContext";
import { FormField } from "@/components/FormField";
import { Button } from "@/components/Button";

/**
 * Login page — mobile-number entry.
 *
 * Accepts a 10-digit mobile number, calls the login API, and routes to the
 * OTP entry screen on success.
 */
export default function LoginPage() {
  const router = useRouter();
  const { setSession } = useBooking();
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!/^[0-9]{10}$/.test(mobile)) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }
    setLoading(true);
    try {
      await login(mobile);
      // Keep the mobile in context so the OTP screen can verify it.
      setSession(mobile, "");
      router.push("/login/otp");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="container-page flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <div className="w-full max-w-md rounded-card border border-border bg-surface p-8 shadow-card">
        <h1 className="text-2xl font-bold text-foreground">Sign in</h1>
        <p className="mt-2 text-sm text-foreground-muted">
          Enter your mobile number to receive a one-time password.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
          <FormField
            label="Mobile number"
            type="tel"
            inputMode="numeric"
            placeholder="98765 43210"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            error={error || undefined}
            required
            maxLength={10}
            autoComplete="tel"
          />
          <Button type="submit" loading={loading} className="w-full" size="lg">
            Continue
          </Button>
        </form>
        <p className="mt-4 text-center text-xs text-foreground-muted">
          Demo: any 10-digit number works. The OTP is 1234.
        </p>
      </div>
    </div>
  );
}
