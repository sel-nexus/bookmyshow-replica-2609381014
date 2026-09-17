import Link from "next/link";

/**
 * Public landing page.
 *
 * The unauthenticated entry point. Leads with a brand hero and a single
 * primary call to action that routes the user into the booking funnel.
 */
export default function LandingPage() {
  return (
    <div className="bg-background">
      <section className="container-page flex flex-col items-center py-24 text-center sm:py-32">
        <span className="mb-4 inline-block rounded-full bg-primary-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-600">
          Now showing
        </span>
        <h1 className="max-w-3xl text-5xl font-extrabold leading-tight tracking-tight text-foreground sm:text-6xl">
          Book your movie tickets in{" "}
          <span className="text-primary-500">seconds</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-foreground-muted">
          Browse the latest releases, pick your favourite theatre and seats,
          and check out with a quick payment. Your perfect movie night starts
          here.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full bg-primary-500 px-8 py-3.5 text-base font-semibold text-white shadow-card transition-all duration-200 ease-out hover:bg-primary-600 hover:shadow-card-hover hover:-translate-y-0.5"
          >
            Book tickets
          </Link>
          <Link
            href="/movies"
            className="inline-flex items-center justify-center rounded-full border border-border bg-surface px-8 py-3.5 text-base font-semibold text-foreground transition-colors hover:bg-surface-raised"
          >
            Browse movies
          </Link>
        </div>
      </section>

      <section className="container-page pb-24">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              title: "Curated catalog",
              body: "A hand-picked selection of currently showing blockbusters.",
            },
            {
              title: "Favourite theatres",
              body: "Choose from premium cinemas near you with the best screens.",
            },
            {
              title: "Instant booking",
              body: "Secure your seats and get instant confirmation, every time.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-card border border-border bg-surface p-6 shadow-card"
            >
              <h3 className="text-lg font-bold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-foreground-muted">
                {feature.body}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
