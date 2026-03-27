import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Cutter Gang",
  description: "A private gang for viewing videos and chatting globally.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased dark`}>
      <body suppressHydrationWarning className="min-h-full flex flex-col font-sans bg-background text-foreground bg-neutral-950">
        {children}
      </body>
    </html>
  );
}
