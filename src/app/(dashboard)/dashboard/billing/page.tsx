"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { CheckCircle, Zap, Shield, ArrowRight } from "lucide-react";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "",
    description: "For individuals getting started",
    features: ["1 project", "50 AI analyses/month", "Basic code review", "Bug detection", "Community support"],
    cta: "Current Plan",
    current: true,
    color: "border-white/10",
    buttonClass: "bg-white/10 text-slate-400 cursor-not-allowed",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29",
    period: "/mo",
    description: "For professional developers & small teams",
    features: ["Unlimited projects", "Unlimited AI analyses", "Advanced code review", "Test generation", "Docs generation", "Team up to 10 members", "GitHub analytics", "Priority support"],
    cta: "Upgrade to Pro",
    current: false,
    color: "border-purple-500/40",
    buttonClass: "bg-[var(--purple)] text-white hover:opacity-90",
  },
  {
    id: "scale",
    name: "Scale",
    price: "$99",
    period: "/mo",
    description: "For growing teams that need more power",
    features: ["Everything in Pro", "Unlimited team members", "SSO & RBAC", "Audit logs", "Webhook integrations", "Dedicated support", "SLA guarantee"],
    cta: "Contact Sales",
    current: false,
    color: "border-sky-500/30",
    buttonClass: "bg-sky-500/20 text-sky-200 border border-sky-500/30 hover:bg-sky-500/30",
  },
];

export default function BillingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleUpgrade(planId: string) {
    if (planId === "scale") {
      window.location.assign("mailto:support@devpilot.ai?subject=Scale Plan Inquiry");
      return;
    }
    try {
      setLoading(planId);
      const res = await fetch("/api/billing/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ planId }) });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.demoCheckout) toast.info(data.message);
      if (data.checkoutUrl) window.location.assign(data.checkoutUrl);
    } catch {
      toast.error("Could not start checkout. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">Billing & Plans</h1>
        <p className="mt-2 text-slate-400">Manage your subscription and usage. Checkout is in demo mode until Stripe price IDs are configured.</p>
      </div>

      {/* Current Usage */}
      <Card>
        <h2 className="text-lg font-semibold">Current Usage — Free Plan</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {[
            { label: "AI Analyses", used: 32, total: 50 },
            { label: "Projects", used: 1, total: 1 },
            { label: "Team Members", used: 1, total: 1 },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">{item.label}</p>
              <p className="mt-1 text-2xl font-semibold">{item.used}<span className="text-sm text-slate-400">/{item.total}</span></p>
              <div className="mt-3 h-2 rounded-full bg-white/10">
                <div className="h-2 rounded-full bg-[var(--purple)] transition-all" style={{ width: `${Math.min(100, (item.used / item.total) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Plans */}
      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <div key={plan.id} className={`relative rounded-3xl border p-6 ${plan.color} bg-white/[0.02]`}>
            {plan.id === "pro" && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--purple)] px-4 py-1 text-xs font-semibold text-white">
                Most Popular
              </div>
            )}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">{plan.name}</p>
                <p className="mt-1 text-4xl font-bold">{plan.price}<span className="text-lg font-normal text-slate-400">{plan.period}</span></p>
              </div>
              {plan.id === "pro" ? <Zap size={24} className="text-purple-300" /> : plan.id === "scale" ? <Shield size={24} className="text-sky-300" /> : null}
            </div>
            <p className="mt-3 text-sm text-slate-400">{plan.description}</p>
            <ul className="mt-6 space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                  <CheckCircle size={14} className="shrink-0 text-emerald-400" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => !plan.current && handleUpgrade(plan.id)}
              disabled={plan.current || loading === plan.id}
              className={`mt-8 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${plan.buttonClass}`}
            >
              {loading === plan.id ? "Processing..." : plan.cta}
              {!plan.current && <ArrowRight size={14} />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
