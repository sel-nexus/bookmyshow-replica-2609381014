"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import type { Movie, Theatre, BookingConfirmation } from "@/lib/api";

/** sessionStorage keys for persisting the auth session across reloads. */
const STORAGE_MOBILE = "bms_mobile";
const STORAGE_TOKEN = "bms_token";

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

  // Rehydrate the persisted session after mount (client-only, so SSR and the
  // first client render agree on the empty initial state).
  useEffect(() => {
    try {
      const savedMobile = window.sessionStorage.getItem(STORAGE_MOBILE);
      const savedToken = window.sessionStorage.getItem(STORAGE_TOKEN);
      if (savedMobile) setMobile(savedMobile);
      if (savedToken) setToken(savedToken);
    } catch {
      // sessionStorage unavailable (e.g. privacy mode) — stay logged out.
    }
  }, []);

  const setSession = useCallback((nextMobile: string, nextToken: string) => {
    setMobile(nextMobile);
    setToken(nextToken);
    try {
      if (nextToken) {
        window.sessionStorage.setItem(STORAGE_MOBILE, nextMobile);
        window.sessionStorage.setItem(STORAGE_TOKEN, nextToken);
      } else {
        window.sessionStorage.removeItem(STORAGE_MOBILE);
        window.sessionStorage.removeItem(STORAGE_TOKEN);
      }
    } catch {
      // sessionStorage unavailable — the in-memory session still works.
    }
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
    try {
      window.sessionStorage.removeItem(STORAGE_MOBILE);
      window.sessionStorage.removeItem(STORAGE_TOKEN);
    } catch {
      // sessionStorage unavailable — nothing to clear.
    }
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
