"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getMovies,
  getMovieTheatres,
  type Movie,
  type Theatre,
} from "@/lib/api";
import { useBooking } from "@/context/BookingContext";
import { TheatreCard } from "@/components/TheatreCard";
import { Button } from "@/components/Button";

/**
 * Theatre selection page for a chosen movie.
 *
 * Fetches the theatres showing the movie and lets the user pick one before
 * continuing to seat selection.
 */
export default function MovieTheatresPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { setDraft } = useBooking();
  const movieId = parseInt(params.id, 10);

  const [movie, setMovie] = useState<Movie | null>(null);
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [selected, setSelected] = useState<Theatre | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (Number.isNaN(movieId)) {
      setError("Invalid movie");
      setLoading(false);
      return;
    }
    let cancelled = false;
    Promise.all([getMovies(), getMovieTheatres(movieId)])
      .then(([moviesRes, theatresRes]) => {
        if (cancelled) return;
        setMovie(moviesRes.movies.find((m) => m.id === movieId) ?? null);
        setTheatres(theatresRes.theatres);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Could not load theatres. Please try again.");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [movieId]);

  function handleContinue() {
    if (!selected || !movie) return;
    setDraft({ movie, theatre: selected });
    router.push("/seats");
  }

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-extrabold text-foreground">
        {movie ? movie.title : "Select a theatre"}
      </h1>
      <p className="mt-2 text-foreground-muted">
        Choose where you&apos;d like to watch.
      </p>

      {loading ? (
        <div className="mt-10 space-y-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-card bg-surface-raised"
            />
          ))}
        </div>
      ) : error ? (
        <p role="alert" className="mt-10 text-error">
          {error}
        </p>
      ) : (
        <>
          <div className="mt-10 space-y-4">
            {theatres.map((theatre) => (
              <TheatreCard
                key={theatre.id}
                theatre={theatre}
                selected={selected?.id === theatre.id}
                onSelect={setSelected}
              />
            ))}
          </div>
          <div className="mt-8">
            <Button
              size="lg"
              disabled={!selected}
              onClick={handleContinue}
              className="w-full sm:w-auto"
            >
              Continue to seats
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
