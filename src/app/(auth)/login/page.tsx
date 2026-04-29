"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getProviders, signIn, useSession } from "next-auth/react";
import { Loader2, Mail, ShieldCheck, Sparkles, Workflow } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const highlights = [
  "AI code reviews with actionable refactors",
  "Documentation and tests generated in minutes",
  "Team analytics, invite workflows, and audit logs",
];

function LoadingScreen() {
  return <div className="flex min-h-screen items-center justify-center text-sm text-slate-400">Loading workspace...</div>;
}

function LoginContent() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [providers, setProviders] = useState<Record<string, unknown> | null>(null);

  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const googleConfigured = Boolean(providers?.google);
  const emailConfigured = Boolean(providers?.email);

  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
  }, [status, router]);

  useEffect(() => {
    void getProviders().then((result) => setProviders(result ?? {}));
  }, []);

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      const msgs: Record<string, string> = {
        OAuthSignin: "Error connecting to provider",
        OAuthCallback: "OAuth callback error, try again",
        OAuthAccountNotLinked: "Email already linked to another provider",
        EmailSignin: "Failed to send magic link",
        default: "Authentication failed, try again",
      };
      toast.error(msgs[error] || msgs.default);
    }
  }, [searchParams]);

  if (status === "loading") return <LoadingScreen />;

  const handleGitHub = async () => {
    try {
      setGithubLoading(true);
      await signIn("github", { callbackUrl: "/dashboard" });
    } finally {
      setGithubLoading(false);
    }
  };

  const handleGoogle = async () => {
    if (!googleConfigured) return;
    try {
      setGoogleLoading(true);
      await signIn("google", { callbackUrl: "/dashboard" });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleEmail = async () => {
    if (!email.includes("@")) {
      toast.error("Invalid email");
      return;
    }

    try {
      setEmailLoading(true);
      const result = await signIn("email", { email, callbackUrl, redirect: false });
      if (result?.ok) {
        setEmailSent(true);
      } else {
        toast.error("Failed to send magic link");
      }
    } catch {
      toast.error("Failed to send magic link");
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.35),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(56,189,248,0.28),transparent_32%),linear-gradient(to_bottom,#070b14,#0b1222)]" />
      <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/2 bg-[linear-gradient(135deg,rgba(117,104,255,0.12),transparent)] lg:block" />
      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 gap-10 px-6 py-10 lg:grid-cols-2 lg:items-center">
        <section className="space-y-8">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs text-slate-200"><Sparkles size={14} /> Build Faster. Review Smarter. Ship Better.</p>
          <div>
            <h1 className="text-5xl font-semibold tracking-tight text-white md:text-6xl">Welcome to <span className="text-[#aeb0ff]">DevPilot AI</span></h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">The AI Developer Productivity Suite for modern engineering teams.</p>
          </div>
          <ul className="space-y-4 text-sm text-slate-200">
            {highlights.map((item, index) => (
              <li key={item} className="flex items-start gap-3">
                {index === 0 ? <ShieldCheck className="mt-0.5 text-indigo-300" size={18} /> : null}
                {index === 1 ? <Workflow className="mt-0.5 text-sky-300" size={18} /> : null}
                {index === 2 ? <Mail className="mt-0.5 text-emerald-300" size={18} /> : null}
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="relative z-20">
          <Card className="mx-auto w-full max-w-xl rounded-[32px] p-8 sm:p-10">
            <h2 className="text-4xl font-semibold text-white">Sign in to your workspace</h2>
            <p className="mt-4 text-base leading-7 text-slate-300">Use your account to continue to dashboard and team tools.</p>
            <div className="mt-8 space-y-3">
              <Button type="button" size="lg" className="w-full" onClick={handleGitHub} disabled={githubLoading}>
                {githubLoading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                {githubLoading ? "Connecting..." : "Continue with GitHub"}
              </Button>
              <Button type="button" size="lg" variant="outline" className="w-full" onClick={handleGoogle} disabled={!googleConfigured || googleLoading} title={googleConfigured ? undefined : "Configure GOOGLE_CLIENT_ID in .env to enable"}>
                {googleLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                {googleLoading ? "Connecting..." : "Continue with Google"}
              </Button>
            </div>
            <div className="my-8 h-px bg-white/10" />
            {emailSent ? (
              <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">Check your email! We sent a magic link to {email}</div>
            ) : (
              <div className="space-y-3">
                <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" onKeyDown={(event) => event.key === "Enter" && handleEmail()} />
                <Button type="button" size="lg" variant="outline" className="w-full" onClick={handleEmail} disabled={emailLoading || !emailConfigured} title={emailConfigured ? undefined : "Configure RESEND_API_KEY in .env to enable"}>
                  {emailLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                  {emailLoading ? "Sending link..." : "Continue with Email"}
                </Button>
              </div>
            )}
            <p className="mt-8 text-xs text-slate-400">By continuing, you agree to our <Link href="/terms" className="text-slate-200 underline underline-offset-4">Terms</Link> and <Link href="/privacy" className="text-slate-200 underline underline-offset-4">Privacy Policy</Link>.</p>
          </Card>
        </section>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <LoginContent />
    </Suspense>
  );
}
