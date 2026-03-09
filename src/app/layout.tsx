import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "DiscordNest — Find & Promote Discord Servers",
    template: "%s | DiscordNest",
  },
  description:
    "Discover and join amazing Discord communities. Promote your server and grow your community with DiscordNest.",
  openGraph: {
    siteName: "DiscordNest",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers>
          <Navbar />
          <main className="pt-20 min-h-screen">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
