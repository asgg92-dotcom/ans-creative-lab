import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import { Providers } from "@/app/providers"; 
import { ThemeSwitch } from "@/components/ThemeSwitch"; 
import { Navbar } from "@/components/Navbar";
import { CustomCursor } from "@/components/ui/CustomCursor";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["900"], // 아주 굵은 폰트만
});

export const metadata: Metadata = {
  title: "LinkHub - Vibe Coding Gallery",
  description: "다양한 테마로 즐기는 나만의 링크 갤러리",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          <CustomCursor />
          <Navbar />
          {children}
          <ThemeSwitch />
        </Providers>
      </body>
    </html>
  );
}
