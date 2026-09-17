import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import OtpPage from "@/app/login/otp/page";
import { BookingProvider } from "@/context/BookingContext";

const pushMock = vi.fn();
const replaceMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: replaceMock }),
}));

vi.mock("@/lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api")>();
  return { ...actual, verifyOtp: vi.fn() };
});

import { verifyOtp } from "@/lib/api";

function renderOtp() {
  return render(
    <BookingProvider>
      <OtpPage />
    </BookingProvider>
  );
}

describe("OtpPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the OTP field and verify button", () => {
    renderOtp();
    expect(screen.getByLabelText(/one-time password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /verify/i })
    ).toBeInTheDocument();
  });

  it("shows a validation error when the OTP is empty", async () => {
    renderOtp();
    await userEvent.click(screen.getByRole("button", { name: /verify/i }));
    expect(await screen.findByText(/enter the otp/i)).toBeInTheDocument();
    expect(verifyOtp).not.toHaveBeenCalled();
  });

  it("shows an error message when verification fails", async () => {
    const { ApiError } = await import("@/lib/api");
    vi.mocked(verifyOtp).mockRejectedValue(new ApiError("Invalid OTP", 401));
    renderOtp();
    await userEvent.type(screen.getByLabelText(/one-time password/i), "0000");
    await userEvent.click(screen.getByRole("button", { name: /verify/i }));
    expect(await screen.findByText(/invalid otp/i)).toBeInTheDocument();
  });
});
