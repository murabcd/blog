import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import { baseUrl } from "./sitemap";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Murad Abdulkadyrov",
    template: "%s | Murad Abdulkadyrov",
  },
  description: "This is Murad's blog.",
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Murad Abdulkadyrov",
    description: "This is Murad's blog.",
    url: baseUrl,
    siteName: "Murad Abdulkadyrov",
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased max-w-xl mx-4 mt-8 lg:mx-auto flex flex-col min-h-screen`}
      >
        <main className="flex-auto min-w-0 mt-6 flex flex-col px-2 md:px-0">
          <Navbar />
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
