"use client";

import Link from "next/link";
import type { Movie } from "@/lib/api";
import { Card } from "./Card";

/**
 * Movie poster card.
 *
 * Shows a poster placeholder with the movie title and genre, and links to the
 * theatre-selection page for that movie.
 */
export function MovieCard({ movie }: { movie: Movie }) {
  return (
    <Link href={`/movies/${movie.id}`} className="group block">
      <Card interactive className="overflow-hidden">
        <div className="flex aspect-[2/3] items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-950">
          <span className="px-4 text-center font-display text-2xl font-extrabold text-white">
            {movie.title}
          </span>
        </div>
        <div className="p-4">
          <h3 className="font-bold text-foreground group-hover:text-primary-600">
            {movie.title}
          </h3>
          <p className="mt-1 text-sm text-foreground-muted">
            {movie.genre} · {movie.rating}
          </p>
        </div>
      </Card>
    </Link>
  );
}
