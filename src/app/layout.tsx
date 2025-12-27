import type { Metadata } from "next";
import "./globals.css";

/**
 * PRIVACY NOTICE: Metadata Configuration
 * 
 * This layout uses system fonts only to avoid any external font loading.
 * No analytics, tracking scripts, or external resources are included.
 */

export const metadata: Metadata = {
  title: "Scream Therapy - Private Stress Relief",
  description: "A completely private stress-relief application. Scream, vent, and release stress - all locally in your browser. No data ever leaves your device.",
  keywords: ["stress relief", "private", "scream therapy", "venting", "mental health"],
  robots: "noindex, nofollow", // Don't index this site
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Privacy-focused meta tags */}
        <meta name="referrer" content="no-referrer" />
      </head>
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
