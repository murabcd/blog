import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Navbar } from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import Footer from "@/components/footer";
import { Toaster } from "@/components/ui/sonner";

import { baseUrl } from "./sitemap";

import { Analytics } from "@vercel/analytics/next";
import { ConvexClientProvider } from "./convex-client-provider";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const ogImage = new URL("/opengraph-image", baseUrl).toString();

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
		images: [
			{
				url: ogImage,
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Murad Abdulkadyrov",
		description: "Exploring AI, tech, and product building.",
		creator: "@murabcd",
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

export const viewport = {
	width: "device-width",
	initialScale: 1,
	themeColor: "#ffffff",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
			>
				<ConvexClientProvider>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange
					>
						<a
							href="#main-content"
							className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] bg-background text-foreground border border-border rounded-md px-3 py-2 shadow-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
						>
							Skip to content
						</a>
						<div className="mx-4 lg:mx-auto max-w-xl min-h-screen flex flex-col">
							<Navbar />
							<div className="grow">
								<main id="main-content" className="mt-6 px-0">
									{children}
									<Analytics />
								</main>
							</div>
							<Toaster />
							<Footer />
						</div>
					</ThemeProvider>
				</ConvexClientProvider>
			</body>
		</html>
	);
}
