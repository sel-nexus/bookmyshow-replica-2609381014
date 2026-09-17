"use client";

import { useEffect, useState } from "react";
import { getMovies, type Movie } from "@/lib/api";
import { MovieCard } from "@/components/MovieCard";

/**
 * Movie dashboard.
 *
 * Lists the currently showing movies, fetched from the backend catalog API.
 */
export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getMovies()
      .then((res) => {
        if (!cancelled) {
          setMovies(res.movies);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Could not load movies. Please try again.");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-extrabold text-foreground">
        Now showing
      </h1>
      <p className="mt-2 text-foreground-muted">
        Pick a movie to see theatres and showtimes.
      </p>

      {loading ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="aspect-[2/3] animate-pulse rounded-card bg-surface-raised"
            />
          ))}
        </div>
      ) : error ? (
        <p role="alert" className="mt-10 text-error">
          {error}
        </p>
      ) : movies.length === 0 ? (
        <div className="mt-10 rounded-card border border-border bg-surface p-12 text-center">
          <p className="text-lg font-semibold text-foreground">
            No movies showing right now
          </p>
          <p className="mt-2 text-sm text-foreground-muted">
            Check back soon — new releases are added regularly.
          </p>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
}
