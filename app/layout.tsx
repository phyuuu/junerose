import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import BrowserPrivacyCleanup from "@/components/BrowserPrivacyCleanup";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <BrowserPrivacyCleanup />
        {children}
      </body>
    </html>
  );
}
