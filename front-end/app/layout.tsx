import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TypingOn | Master Your Typing Speed",
  description: "A personalized typing practice platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Apply a solid black color scheme to the entire website; no theme or transition needed. */}
      <body
        className={`${inter.className} bg-[#0a0a0a] text-zinc-100 min-h-screen`}
      >
        <Navbar />
        <main className="min-h-[calc(100vh-80px)]">{children}</main>
      </body>
    </html>
  );
}
