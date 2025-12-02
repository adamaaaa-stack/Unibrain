import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "UniBrain - Turn Any Text Into a Learning Experience",
  description:
    "UniBrain converts any text into structured learning packages with AI-generated summaries, flashcards, and quizzes. Learn smarter, not harder.",
  keywords: ["learning", "AI", "flashcards", "quiz", "education", "study"],
  openGraph: {
    title: "UniBrain - Turn Any Text Into a Learning Experience",
    description:
      "Convert any text into summaries, flashcards, and quizzes with AI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={outfit.variable}>
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4663238355932795"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className="font-sans antialiased mesh-gradient grid-pattern min-h-screen">
        <AuthProvider>
          <Navbar />
          <main className="pt-16">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
