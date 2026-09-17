"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import type { Movie, Theatre, BookingConfirmation } from "@/lib/api";

/** Shape of the in-progress booking held in context. */
export interface BookingDraft {
  movie: Movie | null;
  theatre: Theatre | null;
  seats: string[];
  totalPrice: number;
}

/** Shape of the booking context value. */
interface BookingContextValue {
  /** The authenticated user's mobile number. */
  mobile: string;
  /** The session token issued after OTP verification. */
  token: string;
  /** Whether the user is authenticated. */
  isAuthenticated: boolean;
  /** The in-progress booking selection. */
  draft: BookingDraft;
  /** The confirmed booking after payment. */
  confirmation: BookingConfirmation | null;
  /** Store the authenticated session. */
  setSession: (mobile: string, token: string) => void;
  /** Update the in-progress booking draft. */
  setDraft: (draft: Partial<BookingDraft>) => void;
  /** Store the confirmed booking. */
  setConfirmation: (confirmation: BookingConfirmation) => void;
  /** Clear the session and any in-progress booking. */
  reset: () => void;
}

const BookingContext = createContext<BookingContextValue | undefined>(
  undefined
);

const initialDraft: BookingDraft = {
  movie: null,
  theatre: null,
  seats: [],
  totalPrice: 0,
};

/**
 * Booking provider.
 *
 * Holds the authenticated session and the in-progress booking selection in
 * React Context so each step of the funnel can read and advance the state.
 */
export function BookingProvider({ children }: { children: ReactNode }) {
  const [mobile, setMobile] = useState("");
  const [token, setToken] = useState("");
  const [draft, setDraftState] = useState<BookingDraft>(initialDraft);
  const [confirmation, setConfirmationState] =
    useState<BookingConfirmation | null>(null);

  const setSession = useCallback((nextMobile: string, nextToken: string) => {
    setMobile(nextMobile);
    setToken(nextToken);
  }, []);

  const setDraft = useCallback((partial: Partial<BookingDraft>) => {
    setDraftState((prev) => ({ ...prev, ...partial }));
  }, []);

  const setConfirmation = useCallback((next: BookingConfirmation) => {
    setConfirmationState(next);
  }, []);

  const reset = useCallback(() => {
    setMobile("");
    setToken("");
    setDraftState(initialDraft);
    setConfirmationState(null);
  }, []);

  const value: BookingContextValue = {
    mobile,
    token,
    isAuthenticated: token !== "",
    draft,
    confirmation,
    setSession,
    setDraft,
    setConfirmation,
    reset,
  };

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
}

/**
 * Access the booking context.
 *
 * Raises:
 *   Error: When used outside a BookingProvider.
 */
export function useBooking(): BookingContextValue {
  const ctx = useContext(BookingContext);
  if (ctx === undefined) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return ctx;
}
