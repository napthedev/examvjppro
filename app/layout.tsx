import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import ConvexClientProvider from "../components/convex-client-provider";
import { ThemeProvider } from "../components/theme-provider";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "ExamVjpPro - AI-Powered Question Generator",
  description:
    "Transform your PDF lecture files into multiple-choice questions with AI. Perfect for students and educators.",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexClientProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                try {
                  const theme = localStorage.getItem('theme');
                  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  const actualTheme = theme === 'system' || !theme ? systemTheme : theme;
                  
                  if (actualTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (_) {
                  // Fallback to system preference
                  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    document.documentElement.classList.add('dark');
                  }
                }
              `,
            }}
          />
        </head>
        <body
          className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}
        >
          <ThemeProvider>
            <Suspense fallback={null}>{children}</Suspense>
            <Toaster richColors />
            <Analytics />
          </ThemeProvider>
        </body>
      </html>
    </ConvexClientProvider>
  );
}
