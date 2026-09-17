"use client";

import type { Theatre } from "@/lib/api";
import { Card } from "./Card";

/**
 * Theatre card.
 *
 * A selectable theatre option showing the theatre name and location.
 */
export function TheatreCard({
  theatre,
  selected,
  onSelect,
}: {
  theatre: Theatre;
  selected: boolean;
  onSelect: (theatre: Theatre) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(theatre)}
      aria-pressed={selected}
      className="block w-full text-left"
    >
      <Card
        interactive
        className={`p-5 ${
          selected ? "border-primary-500 ring-2 ring-ring/40" : ""
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-foreground">{theatre.name}</h3>
            <p className="mt-1 text-sm text-foreground-muted">
              {theatre.location}
            </p>
          </div>
          <span
            className={`inline-flex h-6 w-6 items-center justify-center rounded-full border-2 ${
              selected
                ? "border-primary-500 bg-primary-500 text-white"
                : "border-border text-transparent"
            }`}
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
        </div>
      </Card>
    </button>
  );
}
