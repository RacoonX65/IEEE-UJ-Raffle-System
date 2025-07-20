import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IEEE UJ Raffle System - Admin Dashboard",
  description: "Secure admin dashboard for IEEE UJ raffle ticket sales management",
  keywords: ["IEEE", "UJ", "University of Johannesburg", "raffle", "tickets", "admin", "dashboard"],
  authors: [{ name: "IEEE UJ Student Branch" }],
  creator: "IEEE UJ Student Branch",
  publisher: "IEEE UJ Student Branch",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://ieee-uj-raffle-system.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "IEEE UJ Raffle System",
    description: "Professional raffle ticket management system for IEEE UJ events",
    url: "https://ieee-uj-raffle-system.vercel.app",
    siteName: "IEEE UJ Raffle System",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "IEEE UJ Raffle System - Professional Event Management",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "IEEE UJ Raffle System",
    description: "Professional raffle ticket management system for IEEE UJ events",
    images: ["/og-image.png"],
  },
  robots: {
    index: false, // Admin dashboard should not be indexed
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/favicon.svg", sizes: "180x180", type: "image/svg+xml" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/favicon.svg",
        color: "#6366f1",
      },
    ],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
