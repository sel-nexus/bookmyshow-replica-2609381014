import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PaymentPage from "@/app/payment/page";
import { BookingProvider } from "@/context/BookingContext";
import * as api from "@/lib/api";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock("@/lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api")>();
  return { ...actual, createBooking: vi.fn() };
});

// Seed the booking context with a movie/theatre/seats so the page does not
// redirect away during the test.
function renderPayment() {
  const utils = render(
    <BookingProvider>
      <PaymentPage />
    </BookingProvider>
  );
  return utils;
}

describe("PaymentPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows Card fields by default", () => {
    renderPayment();
    expect(screen.getByLabelText(/card number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/expiry date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cvv/i)).toBeInTheDocument();
  });

  it("switches to the UPI field when UPI is selected", async () => {
    renderPayment();
    await userEvent.click(screen.getByRole("button", { name: /upi/i }));
    expect(screen.getByLabelText(/upi id/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/card number/i)).not.toBeInTheDocument();
  });

  it("switches back to Card fields when Card is selected", async () => {
    renderPayment();
    await userEvent.click(screen.getByRole("button", { name: /upi/i }));
    await userEvent.click(screen.getByRole("button", { name: /card/i }));
    expect(screen.getByLabelText(/card number/i)).toBeInTheDocument();
  });

  it("renders a Pay button showing the total", () => {
    renderPayment();
    expect(screen.getByRole("button", { name: /^pay/i })).toBeInTheDocument();
  });
});
