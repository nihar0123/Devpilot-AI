"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { ProjectProvider } from "@/components/projects/project-provider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ProjectProvider>{children}</ProjectProvider>
      <Toaster position="bottom-right" theme="dark" richColors />
    </SessionProvider>
  );
}
