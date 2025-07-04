import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Web3Provider } from "@/components/Web3Provider";
import { Providers } from "@/components/providers";
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
  title: "CardFi Yield Manager - Turn Every Swipe Into Smart Yield",
  description: "Automate USDC DeFi returns based on MetaMask Card activity. Smart rebalancing across multichain protocols with Circle Wallet integration.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Web3Provider>
            <Providers>
              {children}
            </Providers>
          </Web3Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}
