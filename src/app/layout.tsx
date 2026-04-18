import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/navbar";
import { Github } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Token Analytics Dashboard | Real-time On-chain Insights",
  description: "Advanced analytics for ERC-20 tokens across Ethereum, Arbitrum, Base, and Polygon. Track volume, holders, and transfers instantly.",
  openGraph: {
    title: "Token Analytics Dashboard",
    description: "Deep on-chain insights for any ERC-20 token.",
    url: "https://token-analytics-dashboard.vercel.app",
    siteName: "Token Analytics",
    images: [
      {
        url: "https://token-analytics-dashboard.vercel.app/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Token Analytics Dashboard",
    description: "Advanced on-chain analytics at your fingertips.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-background antialiased flex flex-col`}>
        <Providers>
          <div className="relative flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              <div className="container py-8 md:py-12">
                {children}
              </div>
            </main>
            <footer className="border-t bg-muted/20 py-8">
              <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
                <div className="flex flex-col items-center gap-2 md:items-start">
                  <p className="text-sm font-semibold tracking-tight">Token Analytics Dashboard</p>
                  <p className="text-xs text-muted-foreground text-center md:text-left">
                    &copy; {new Date().getFullYear()} Demo Project. Built for professional portfolio purposes.
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <a 
                    href="https://github.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm font-medium hover:text-primary transition-colors"
                  >
                    <Github className="h-4 w-4" />
                    GitHub
                  </a>
                  <span className="text-xs text-muted-foreground hidden md:inline">|</span>
                  <p className="text-xs text-muted-foreground">Data via Alchemy & CoinGecko</p>
                </div>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
