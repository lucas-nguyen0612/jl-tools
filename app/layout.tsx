import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Habit Tracker",
  description: "Personal habit tracker focused on streaks and consistency."
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <div className="mx-auto w-full max-w-5xl px-6 py-8">
          {children}
        </div>
      </body>
    </html>
  );
}
