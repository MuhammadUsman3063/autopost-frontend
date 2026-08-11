// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Ya jo bhi default font tum use kar rahe ho
import "./globals.css";
import { Providers } from "./components/Providers"; // 1. Naya Import

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AutoPost AI",
  description: "Social Media Automation Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* 2. Puri app ko Providers ke andar wrap kar diya */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}