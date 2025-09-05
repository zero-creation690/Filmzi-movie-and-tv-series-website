import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { ErrorBoundary } from "@/components/error-boundary"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Filmzi - Movies & TV Series Download",
  description: "Download and stream the latest movies and TV series in HD quality",
  generator: "v0.app",
  keywords: ["movies", "tv series", "download", "stream", "HD", "entertainment", "anime"],
  authors: [{ name: "Filmzi" }],
  creator: "Filmzi",
  publisher: "Filmzi",
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "https://ar-hosting.pages.dev/1756681512254.jpg",
    shortcut: "https://ar-hosting.pages.dev/1756681512254.jpg",
    apple: "https://ar-hosting.pages.dev/1756681512254.jpg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://filmzi.vercel.app",
    title: "Filmzi - Movies & TV Series Download",
    description: "Download and stream the latest movies and TV series in HD quality",
    siteName: "Filmzi",
    images: [
      {
        url: "https://ar-hosting.pages.dev/1756681512254.jpg",
        width: 1200,
        height: 630,
        alt: "Filmzi - Movies & TV Series",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Filmzi - Movies & TV Series Download",
    description: "Download and stream the latest movies and TV series in HD quality",
    images: ["https://ar-hosting.pages.dev/1756681512254.jpg"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <ErrorBoundary>
          <Suspense fallback={<div>Loading...</div>}>
            <Navigation />
          </Suspense>
          <main className="min-h-screen">{children}</main>
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  )
}
