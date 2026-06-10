import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { DateProvider } from "./context/DateContext";
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
  title: "TO DO",
  description: "TO DO by Cristian",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-hidden w-screen h-screen`}
      >
        <DateProvider>
          {children}
        </DateProvider>
      </body>
    </html>
  );
}
