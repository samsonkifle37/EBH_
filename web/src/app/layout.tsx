import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import OfflineBanner from "@/components/OfflineBanner";
import NativeBootstrap from "@/components/NativeBootstrap";
import NativePushPrompt from "@/components/NativePushPrompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Ethiopian Business Hub UK — Discover Ethiopian Businesses & Events",
    template: "%s | Ethiopian Business Hub UK",
  },
  description:
    "Discover, support and grow Ethiopian businesses, events and services across the UK. Restaurants, grocery stores, lawyers, accountants, weddings and more.",
  openGraph: {
    siteName: "Ethiopian Business Hub UK",
    type: "website",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ethiopian Business Hub UK",
    description: "Discover and support verified Ethiopian-owned businesses across the UK.",
  },
  manifest: "/manifest.webmanifest",
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
      <body className="min-h-screen flex flex-col">
        <NativeBootstrap />
        <OfflineBanner />
        <Header />
        {/* pb-20 on mobile ensures content isn't hidden behind the fixed bottom nav */}
        <div className="flex-1 pb-20 md:pb-0">{children}</div>
        <Footer />
        <NativePushPrompt />
        {/* Locked mobile bottom navigation — see docs/design-system/mobile-bottom-nav.md */}
        <MobileBottomNav />
      </body>
    </html>
  );
}
