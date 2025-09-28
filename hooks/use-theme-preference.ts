"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function useThemePreference() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return {
      theme: "system",
      setTheme,
      actualTheme: "dark", // Default fallback
      mounted: false,
    };
  }

  const actualTheme = theme === "system" ? systemTheme : theme;

  return {
    theme,
    setTheme,
    actualTheme,
    mounted: true,
  };
}
