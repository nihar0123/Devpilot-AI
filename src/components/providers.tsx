"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster position="bottom-right" theme="dark" richColors />
    </SessionProvider>
  );
}
