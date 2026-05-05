"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getProviders, signIn, useSession } from "next-auth/react";
import { Loader2, ShieldCheck, Sparkles, Workflow } from "lucide-react";
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
  const pathname = usePathname();
  const isSignup = pathname.includes("/signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [providers, setProviders] = useState<Record<string, unknown> | null>(null);

  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const googleConfigured = Boolean(providers?.google);
  const githubConfigured = Boolean(providers?.github);

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
        CredentialsSignin: "Invalid email or password",
        default: "Authentication failed, try again",
      };
      toast.error(msgs[error] || msgs.default);
    }
  }, [searchParams]);

  if (status === "loading") return <LoadingScreen />;

  const handleGitHub = async () => {
    if (!githubConfigured) return;
    try {
      setGithubLoading(true);
      await signIn("github", { callbackUrl });
    } finally {
      setGithubLoading(false);
    }
  };

  const handleGoogle = async () => {
    if (!googleConfigured) return;
    try {
      setGoogleLoading(true);
      await signIn("google", { callbackUrl });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!email.includes("@")) {
      toast.error("Valid email is required");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Signup failed");
      }

      toast.success("Account created successfully.");
      const signInResult = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl,
      });

      if (signInResult?.ok) {
        router.replace(callbackUrl);
      } else {
        toast.success("Signup complete. Please sign in.");
      }
    } catch (error) {
      toast.error((error as Error).message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email.includes("@")) {
      toast.error("Valid email is required");
      return;
    }
    if (!password) {
      toast.error("Password is required");
      return;
    }

    try {
      setLoading(true);
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl,
      });

      if (result?.ok) {
        router.replace(callbackUrl);
      } else {
        toast.error(result?.error ?? "Invalid credentials");
      }
    } catch {
      toast.error("Login failed");
    } finally {
      setLoading(false);
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
            <h1 className="text-5xl font-semibold tracking-tight text-white md:text-6xl">DevPilot AI <span className="text-[#aeb0ff]">Code Quality Cockpit</span></h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">Connect a repo, run AI reviews, assign follow-up tasks, and track exactly who finished the work.</p>
          </div>
          <ul className="space-y-4 text-sm text-slate-200">
            {highlights.map((item, index) => (
              <li key={item} className="flex items-start gap-3">
                {index === 0 ? <ShieldCheck className="mt-0.5 text-indigo-300" size={18} /> : null}
                {index === 1 ? <Workflow className="mt-0.5 text-sky-300" size={18} /> : null}
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="relative z-20">
          <Card className="mx-auto w-full max-w-xl rounded-[32px] p-8 sm:p-10">
            <div className="mb-6 grid grid-cols-2 rounded-2xl border border-white/10 bg-white/5 p-1 text-sm">
              <Link href="/login" className={`rounded-xl px-4 py-2 text-center ${!isSignup ? "bg-white text-slate-900" : "text-slate-300"}`}>Sign in</Link>
              <Link href="/signup" className={`rounded-xl px-4 py-2 text-center ${isSignup ? "bg-white text-slate-900" : "text-slate-300"}`}>Sign up</Link>
            </div>
            <h2 className="text-4xl font-semibold text-white">{isSignup ? "Create your cockpit" : "Sign in to your cockpit"}</h2>
            <p className="mt-4 text-base leading-7 text-slate-300">{isSignup ? "Create your account with email and password, then sign in to your workspace." : "Use your email and password to sign in to your workspace."}</p>
            <div className="mt-8 space-y-3">
              <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" onKeyDown={(event) => event.key === "Enter" && (isSignup ? handleSignup() : handleLogin())} />
              {isSignup ? <Input type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" /> : null}
              <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" onKeyDown={(event) => event.key === "Enter" && (isSignup ? handleSignup() : handleLogin())} />
              <Button type="button" size="lg" className="w-full" onClick={isSignup ? handleSignup : handleLogin} disabled={loading}>
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                {loading ? "Working..." : isSignup ? "Create account" : "Sign in"}
              </Button>
            </div>
            <div className="my-8 h-px bg-white/10" />
            <div className="space-y-3">
              <Button type="button" size="lg" className="w-full" onClick={handleGitHub} disabled={!githubConfigured || githubLoading}>
                {githubLoading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                {githubLoading ? "Connecting..." : isSignup ? "Sign up with GitHub" : "Continue with GitHub"}
              </Button>
              <Button type="button" size="lg" variant="outline" className="w-full" onClick={handleGoogle} disabled={!googleConfigured || googleLoading} title={googleConfigured ? undefined : "Configure GOOGLE_CLIENT_ID in .env to enable"}>
                {googleLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                {googleLoading ? "Connecting..." : isSignup ? "Sign up with Google" : "Continue with Google"}
              </Button>
            </div>
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
