"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBooking } from "@/context/BookingContext";
import { Button } from "@/components/Button";

/** The hardcoded seat set and price for this replica. */
const SEATS = ["A1", "A2", "A3"];
const TOTAL_PRICE = 450;

/**
 * Seat selection page.
 *
 * Shows a visual seat grid; clicking "Select Seats" selects the hardcoded set
 * (A1, A2, A3) and computes the total price, per the replica's scope.
 */
export default function SeatsPage() {
  const router = useRouter();
  const { draft, setDraft } = useBooking();
  const [selected, setSelected] = useState<string[]>([]);

  // Guard: require a chosen movie + theatre before selecting seats.
  useEffect(() => {
    if (!draft.movie || !draft.theatre) {
      router.replace("/movies");
    }
  }, [draft, router]);

  function handleSelectSeats() {
    setSelected(SEATS);
    setDraft({ seats: SEATS, totalPrice: TOTAL_PRICE });
  }

  function handleContinue() {
    router.push("/payment");
  }

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-extrabold text-foreground">Select seats</h1>
      <p className="mt-2 text-foreground-muted">
        {draft.movie?.title} · {draft.theatre?.name}
      </p>

      {/* Visual seat grid (representational). */}
      <div className="mt-10 rounded-card border border-border bg-surface p-8 shadow-card">
        <div className="mx-auto mb-8 h-1.5 w-2/3 rounded-full bg-neutral-300" />
        <div className="grid grid-cols-6 gap-3">
          {["A1", "A2", "A3", "A4", "A5", "A6", "B1", "B2", "B3", "B4", "B5", "B6"].map(
            (seat) => {
              const isSelected = selected.includes(seat);
              return (
                <div
                  key={seat}
                  className={`flex aspect-square items-center justify-center rounded-lg border text-sm font-semibold ${
                    isSelected
                      ? "border-primary-500 bg-primary-500 text-white"
                      : "border-border bg-surface-raised text-foreground-muted"
                  }`}
                >
                  {seat}
                </div>
              );
            }
          )}
        </div>
      </div>

      <div className="mt-8 flex flex-col items-start gap-4">
        {selected.length === 0 ? (
          <Button size="lg" onClick={handleSelectSeats}>
            Select Seats
          </Button>
        ) : (
          <>
            <p className="text-lg text-foreground">
              Selected seats:{" "}
              <span className="font-semibold">{selected.join(", ")}</span>
            </p>
            <p className="text-2xl font-extrabold text-foreground">
              Total: Rs. {TOTAL_PRICE}
            </p>
            <Button size="lg" onClick={handleContinue}>
              Proceed to pay
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
