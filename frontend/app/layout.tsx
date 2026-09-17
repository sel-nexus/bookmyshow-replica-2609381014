import type { Metadata } from "next";
import { Header } from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "BookMyShow Replica — Book Movie Tickets",
  description:
    "Browse currently showing movies, pick a theatre and seats, and book your tickets online.",
};

/**
 * Root layout for the BookMyShow Replica frontend.
 *
 * Loads the brand fonts, applies the global token stylesheet, and wraps every
 * page in the shared sticky header.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
