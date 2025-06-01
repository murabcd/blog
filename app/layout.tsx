import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Navbar } from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import Footer from "@/components/footer";

import { baseUrl } from "./sitemap";

import { Analytics } from "@vercel/analytics/next";

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
  description: "Exploring AI, tech, and product building.",
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Murad Abdulkadyrov",
    description: "Exploring AI, tech, and product building.",
    url: baseUrl,
    siteName: "Murad Abdulkadyrov",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Murad Abdulkadyrov",
    description: "Exploring AI, tech, and product building.",
    images: ["/api/og"],
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="mx-4 lg:mx-auto max-w-xl min-h-screen flex flex-col">
            <Navbar />
            <div className="flex-grow">
              <main className="mt-6 px-2 md:px-0">
                {children}
                <Analytics />
              </main>
            </div>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
