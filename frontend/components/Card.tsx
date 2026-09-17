import { HTMLAttributes, ReactNode } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Card content. */
  children: ReactNode;
  /** Add hover lift + deepening shadow. */
  interactive?: boolean;
}

/**
 * Card primitive.
 *
 * A rounded, softly-shadowed surface. `interactive` adds a hover lift used for
 * clickable cards (movies, theatres).
 */
export function Card({
  children,
  interactive = false,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-card border border-border bg-surface shadow-card transition-[box-shadow,transform] duration-200 ease-out ${
        interactive ? "hover:-translate-y-1 hover:shadow-card-hover" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
