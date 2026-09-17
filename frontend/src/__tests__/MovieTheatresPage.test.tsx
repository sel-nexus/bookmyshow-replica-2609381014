import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import MovieTheatresPage from "@/app/movies/[id]/page";
import { BookingProvider } from "@/context/BookingContext";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: vi.fn() }),
}));

vi.mock("@/lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api")>();
  return { ...actual, getMovies: vi.fn(), getMovieTheatres: vi.fn() };
});

import { getMovies, getMovieTheatres } from "@/lib/api";

const MOVIES = [
  { id: 1, title: "Paradise", poster: "", genre: "Drama", rating: "U/A" },
];
const THEATRES = [
  { id: 1, name: "Sandhya 70mm", location: "Hyderabad" },
  { id: 2, name: "Sudharsham 70mm", location: "Hyderabad" },
  { id: 3, name: "Allu Cinemas", location: "Hyderabad" },
];

function renderPage() {
  return render(
    <BookingProvider>
      <MovieTheatresPage params={{ id: "1" }} />
    </BookingProvider>
  );
}

describe("MovieTheatresPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists the theatres showing the movie", async () => {
    vi.mocked(getMovies).mockResolvedValue({ movies: MOVIES });
    vi.mocked(getMovieTheatres).mockResolvedValue({ theatres: THEATRES });
    renderPage();
    expect(await screen.findByText("Sandhya 70mm")).toBeInTheDocument();
    expect(screen.getByText("Sudharsham 70mm")).toBeInTheDocument();
    expect(screen.getByText("Allu Cinemas")).toBeInTheDocument();
  });

  it("keeps Continue disabled until a theatre is selected, then navigates to seats", async () => {
    vi.mocked(getMovies).mockResolvedValue({ movies: MOVIES });
    vi.mocked(getMovieTheatres).mockResolvedValue({ theatres: THEATRES });
    renderPage();
    const continueBtn = await screen.findByRole("button", {
      name: /continue to seats/i,
    });
    expect(continueBtn).toBeDisabled();
    await userEvent.click(await screen.findByText("Sandhya 70mm"));
    expect(continueBtn).toBeEnabled();
    await userEvent.click(continueBtn);
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/seats"));
  });

  it("shows an error when theatres fail to load", async () => {
    vi.mocked(getMovies).mockResolvedValue({ movies: MOVIES });
    vi.mocked(getMovieTheatres).mockRejectedValue(new Error("network"));
    renderPage();
    expect(
      await screen.findByText(/could not load theatres/i)
    ).toBeInTheDocument();
  });
});
