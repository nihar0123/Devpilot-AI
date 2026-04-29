"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center px-4 bg-slate-950">
          <Card className="max-w-md">
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertCircle size={48} className="text-red-400" />
              <h1 className="text-2xl font-bold">Something went wrong</h1>
              <p className="text-sm text-muted">{error.message || "An unexpected error occurred"}</p>
              <div className="flex flex-col gap-2 w-full">
                <Button onClick={() => reset()}>Try again</Button>
                <Link href="/dashboard">
                  <Button variant="outline" className="w-full">
                    Go to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </body>
    </html>
  );
}
