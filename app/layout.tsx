import { ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cloud Intelligence Platform",
  description: "Cloud observability and infrastructure operations platform",
  icons: {
    icon: []
  }
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[var(--background)] text-[var(--text)] antialiased">
        {children}
      </body>
    </html>
  );
}
