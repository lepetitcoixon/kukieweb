import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header"; // Updated import path
import Footer from "@/components/layout/Footer"; // Updated import path

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "My Awesome Site", // Default title for homepage or pages without specific title
    template: "%s | My Awesome Site", // Template for other pages
  },
  description: "A site built with Next.js and Strapi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Header />
        <main style={{ flexGrow: 1, maxWidth: '960px', margin: '0 auto', padding: '1rem' }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
