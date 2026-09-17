import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SuccessPage from "@/app/success/page";
import { BookingProvider } from "@/context/BookingContext";
import { useBooking } from "@/context/BookingContext";
import { useEffect } from "react";

const replaceMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: replaceMock }),
}));

// Seed a confirmed booking into the context before rendering the page.
function SeedConfirmation({ children }: { children: React.ReactNode }) {
  const { setConfirmation } = useBooking();
  useEffect(() => {
    setConfirmation({
      id: 1,
      confirmationId: "BMS-ABC123",
      movie: "Paradise",
      theatre: "Sandhya 70mm",
      seats: ["A1", "A2", "A3"],
      totalPrice: 450,
    });
  }, [setConfirmation]);
  return <>{children}</>;
}

describe("SuccessPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows Congratulations with the booked movie, theatre, and seats", async () => {
    render(
      <BookingProvider>
        <SeedConfirmation>
          <SuccessPage />
        </SeedConfirmation>
      </BookingProvider>
    );
    expect(
      await screen.findByText(/congratulations/i)
    ).toBeInTheDocument();
    expect(screen.getByText("Paradise")).toBeInTheDocument();
    expect(screen.getByText("Sandhya 70mm")).toBeInTheDocument();
    expect(screen.getByText("A1, A2, A3")).toBeInTheDocument();
    expect(screen.getByText("BMS-ABC123")).toBeInTheDocument();
  });

  it("redirects to /movies when there is no confirmed booking", () => {
    render(
      <BookingProvider>
        <SuccessPage />
      </BookingProvider>
    );
    expect(replaceMock).toHaveBeenCalledWith("/movies");
  });
});
