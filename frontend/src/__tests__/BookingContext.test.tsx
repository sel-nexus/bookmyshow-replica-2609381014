import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BookingProvider, useBooking } from "@/context/BookingContext";
import { ReactNode } from "react";

const wrapper = ({ children }: { children: ReactNode }) => (
  <BookingProvider>{children}</BookingProvider>
);

describe("BookingContext", () => {
  it("starts unauthenticated with an empty draft", () => {
    const { result } = renderHook(() => useBooking(), { wrapper });
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.draft.movie).toBeNull();
    expect(result.current.draft.seats).toEqual([]);
  });

  it("stores the session and marks the user authenticated", () => {
    const { result } = renderHook(() => useBooking(), { wrapper });
    act(() => result.current.setSession("9876543210", "token-abc"));
    expect(result.current.mobile).toBe("9876543210");
    expect(result.current.token).toBe("token-abc");
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("merges partial draft updates", () => {
    const { result } = renderHook(() => useBooking(), { wrapper });
    act(() =>
      result.current.setDraft({
        movie: { id: 1, title: "Paradise", poster: "", genre: "Drama", rating: "U/A" },
      })
    );
    act(() => result.current.setDraft({ seats: ["A1", "A2", "A3"], totalPrice: 450 }));
    expect(result.current.draft.movie?.title).toBe("Paradise");
    expect(result.current.draft.seats).toEqual(["A1", "A2", "A3"]);
    expect(result.current.draft.totalPrice).toBe(450);
  });

  it("resets the session and draft", () => {
    const { result } = renderHook(() => useBooking(), { wrapper });
    act(() => result.current.setSession("9876543210", "token-abc"));
    act(() => result.current.reset());
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.draft.movie).toBeNull();
  });

  it("throws when used outside a BookingProvider", () => {
    // Suppress the expected React error boundary console output.
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useBooking())).toThrow(
      /must be used within a BookingProvider/
    );
    spy.mockRestore();
  });
});
