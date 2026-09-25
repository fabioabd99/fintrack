"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";

import "@/lib/zod-config";

// Nonce is needed for next-themes' inline script under the CSP.
export function ThemeProvider({
  nonce,
  children,
}: {
  nonce?: string;
  children: React.ReactNode;
}) {
  return (
    <NextThemeProvider
      nonce={nonce}
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemeProvider>
  );
}
