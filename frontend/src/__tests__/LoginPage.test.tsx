import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import LoginPage from "@/app/login/page";
import { BookingProvider } from "@/context/BookingContext";

// Mock next/navigation's useRouter.
const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: vi.fn() }),
}));

// Mock the API client.
vi.mock("@/lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api")>();
  return {
    ...actual,
    login: vi.fn(),
  };
});

import { login } from "@/lib/api";

function renderLogin() {
  return render(
    <BookingProvider>
      <LoginPage />
    </BookingProvider>
  );
}

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the mobile number field and submit button", () => {
    renderLogin();
    expect(
      screen.getByLabelText(/mobile number/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /continue/i })
    ).toBeInTheDocument();
  });

  it("shows a validation error for an invalid mobile number", async () => {
    renderLogin();
    await userEvent.type(screen.getByLabelText(/mobile number/i), "123");
    await userEvent.click(screen.getByRole("button", { name: /continue/i }));
    expect(
      await screen.findByText(/valid 10-digit mobile number/i)
    ).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it("submits a valid mobile number and navigates to the OTP screen", async () => {
    vi.mocked(login).mockResolvedValue({ success: true, message: "OTP sent" });
    renderLogin();
    await userEvent.type(
      screen.getByLabelText(/mobile number/i),
      "9876543210"
    );
    await userEvent.click(screen.getByRole("button", { name: /continue/i }));
    await waitFor(() => expect(login).toHaveBeenCalledWith("9876543210"));
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/login/otp"));
  });

  it("shows an API error message when login fails", async () => {
    const { ApiError } = await import("@/lib/api");
    vi.mocked(login).mockRejectedValue(new ApiError("Server error", 500));
    renderLogin();
    await userEvent.type(
      screen.getByLabelText(/mobile number/i),
      "9876543210"
    );
    await userEvent.click(screen.getByRole("button", { name: /continue/i }));
    expect(await screen.findByText(/server error/i)).toBeInTheDocument();
  });
});
