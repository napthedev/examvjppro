import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import ConvexClientProvider from "../components/convex-client-provider";
import { dark } from "@clerk/themes";
import "./globals.css";

export const metadata: Metadata = {
  title: "ExamVjpPro - AI-Powered Question Generator",
  description:
    "Transform your PDF lecture files into multiple-choice questions with AI. Perfect for students and educators.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <ConvexClientProvider>
        {/* Wrap the layout inside ConvexClientProvider */}
        <html lang="en" className="dark">
          <body
            className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}
          >
            <Suspense fallback={null}>{children}</Suspense>
            <Analytics />
          </body>
        </html>
      </ConvexClientProvider>
    </ClerkProvider>
  );
}
