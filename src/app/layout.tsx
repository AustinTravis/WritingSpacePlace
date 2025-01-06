import type { Metadata } from "next";
import { GeistSans, GeistMono } from 'geist/font'
import Header from '@/components/Header' // Add this import
import "./globals.css";

export const metadata: Metadata = {
  title: "StoryApp - Your Creative Writing Space",
  description: "A platform for writers to create and manage their stories",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased min-h-screen flex flex-col`}>
        <Header />
        <main className="flex-grow">
          {children}
        </main>
      </body>
    </html>
  );
}