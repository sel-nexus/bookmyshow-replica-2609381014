import Link from "next/link";

/**
 * Sticky glass brand header.
 *
 * Renders the BookMyShow wordmark and primary navigation. Uses a translucent
 * backdrop blur over a hairline bottom border, per the modern house style.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-surface/80 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-foreground"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-white">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
              />
            </svg>
          </span>
          <span>
            book<span className="text-primary-500">my</span>show
          </span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/movies"
            className="text-sm font-medium text-foreground-muted hover:text-foreground"
          >
            Movies
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-primary-500 px-4 py-2 text-sm font-semibold text-white shadow-card transition-[background-color,box-shadow] hover:bg-primary-600 hover:shadow-card-hover"
          >
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}
