"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { ProjectProvider } from "@/components/projects/project-provider";
import { ThemeProvider, useTheme } from "@/components/theme-context";

function ThemeAwareToaster() {
  const { theme } = useTheme();
  return <Toaster position="bottom-right" theme={theme} richColors />;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <ProjectProvider>
          {children}
          <ThemeAwareToaster />
        </ProjectProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
