"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

export default function InviteAcceptancePage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const { status } = useSession();
  const [loading, setLoading] = useState(false);

  async function acceptInvite() {
    if (status === "unauthenticated") {
      toast.info("Please log in to accept this invite.");
      router.push(`/login?callbackUrl=/invite/${params.token}`);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/team/invites/accept", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: params.token }) });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Invite accepted");
      router.push("/dashboard/team");
    } catch (error) {
      console.error(error);
      toast.error("Could not accept invite");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <Card className="w-full max-w-xl text-center">
        <p className="text-sm font-medium text-[#c9c4ff]">Workspace Invite</p>
        <h1 className="mt-4 text-4xl font-semibold">Join the DevPilot workspace</h1>
        <p className="mt-4 text-sm leading-7 text-slate-300">You were invited to collaborate on code reviews, bug triage, and documentation workflows. Accept the invite to continue to the team dashboard.</p>
        <button type="button" className="mt-8 rounded-2xl bg-[var(--purple)] px-6 py-3 text-sm font-semibold text-white" onClick={acceptInvite} disabled={loading || status === "loading"}>
          {status === "loading" ? "Loading..." : status === "unauthenticated" ? "Log in to Accept" : loading ? "Accepting..." : "Accept Invite"}
        </button>
      </Card>
    </div>
  );
}
