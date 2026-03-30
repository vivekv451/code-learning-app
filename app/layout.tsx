import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "LearnPro — Student Learning Platform",
  description: "Learn Java, HTML, CSS, JS & more. Compete, win prizes, earn certificates!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
        <script src="https://cdn.tailwindcss.com"></script>
        <script>{`tailwind.config={theme:{extend:{fontFamily:{sans:['Plus Jakarta Sans','sans-serif'],mono:['JetBrains Mono','monospace']}}}}`}</script>
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
