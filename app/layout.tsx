import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rusetat | Itinerary Builder",
  description:
    "Thoughtfully planned journeys by Rusetat Migration & Travel International.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
