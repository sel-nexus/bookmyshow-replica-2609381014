import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SeatsPage from "@/app/seats/page";
import { BookingProvider, useBooking } from "@/context/BookingContext";
import { useEffect } from "react";

const pushMock = vi.fn();
const replaceMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: replaceMock }),
}));

// Seed a chosen movie + theatre so the page does not redirect away.
function SeedDraft({ children }: { children: React.ReactNode }) {
  const { setDraft } = useBooking();
  useEffect(() => {
    setDraft({
      movie: { id: 1, title: "Paradise", poster: "", genre: "Drama", rating: "U/A" },
      theatre: { id: 1, name: "Sandhya 70mm", location: "Hyderabad" },
    });
  }, [setDraft]);
  return <>{children}</>;
}

function renderSeats() {
  return render(
    <BookingProvider>
      <SeedDraft>
        <SeatsPage />
      </SeedDraft>
    </BookingProvider>
  );
}

describe("SeatsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("selects the hardcoded seats and shows the total when Select Seats is clicked", async () => {
    renderSeats();
    await userEvent.click(
      await screen.findByRole("button", { name: /select seats/i })
    );
    expect(await screen.findByText(/A1, A2, A3/)).toBeInTheDocument();
    expect(screen.getByText(/Rs\. 450/)).toBeInTheDocument();
  });

  it("proceeds to payment after seats are selected", async () => {
    renderSeats();
    await userEvent.click(
      await screen.findByRole("button", { name: /select seats/i })
    );
    await userEvent.click(
      await screen.findByRole("button", { name: /proceed to pay/i })
    );
    expect(pushMock).toHaveBeenCalledWith("/payment");
  });

  it("redirects to /movies when no movie/theatre has been chosen", () => {
    render(
      <BookingProvider>
        <SeatsPage />
      </BookingProvider>
    );
    expect(replaceMock).toHaveBeenCalledWith("/movies");
  });
});
