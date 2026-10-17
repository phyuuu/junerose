import type { Metadata } from "next";
import { Cormorant_Garamond, Geist_Mono, Instrument_Sans } from "next/font/google";
import BrowserPrivacyCleanup from "@/components/BrowserPrivacyCleanup";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant-garamond",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: {
    default: "JuneRose",
    template: "%s | JuneRose",
  },
  description:
    "Browse JuneRose clothing, choose available sizes and colors, and send an order request for staff confirmation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${instrumentSans.variable} ${cormorantGaramond.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <BrowserPrivacyCleanup />
        {children}
      </body>
    </html>
  );
}
