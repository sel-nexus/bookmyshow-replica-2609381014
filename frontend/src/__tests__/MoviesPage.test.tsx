import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import MoviesPage from "@/app/movies/page";
import { BookingProvider } from "@/context/BookingContext";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock("@/lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api")>();
  return { ...actual, getMovies: vi.fn() };
});

import { getMovies } from "@/lib/api";

const MOVIES = [
  { id: 1, title: "Paradise", poster: "", genre: "Drama", rating: "U/A" },
  { id: 2, title: "Bloody Romeo", poster: "", genre: "Action", rating: "A" },
  { id: 3, title: "OG2", poster: "", genre: "Thriller", rating: "U/A" },
];

function renderMovies() {
  return render(
    <BookingProvider>
      <MoviesPage />
    </BookingProvider>
  );
}

describe("MoviesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the seeded movies fetched from the API", async () => {
    vi.mocked(getMovies).mockResolvedValue({ movies: MOVIES });
    renderMovies();
    // Each movie renders a heading inside its card.
    expect(
      await screen.findByRole("heading", { name: "Paradise" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Bloody Romeo" })
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "OG2" })).toBeInTheDocument();
  });

  it("shows an error message when the catalog fails to load", async () => {
    vi.mocked(getMovies).mockRejectedValue(new Error("network"));
    renderMovies();
    expect(
      await screen.findByText(/could not load movies/i)
    ).toBeInTheDocument();
  });

  it("links each movie to its theatre-selection page", async () => {
    vi.mocked(getMovies).mockResolvedValue({ movies: MOVIES });
    renderMovies();
    await waitFor(() =>
      screen.getByRole("heading", { name: "Paradise" })
    );
    const links = screen.getAllByRole("link");
    expect(links.some((l) => l.getAttribute("href") === "/movies/1")).toBe(
      true
    );
  });
});
