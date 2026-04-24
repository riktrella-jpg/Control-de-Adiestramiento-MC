"use client";

import { AppStateProvider } from "@/context/app-state-provider";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <AppStateProvider>
        {children}
        <Toaster />
      </AppStateProvider>
    </ThemeProvider>
  );
}
