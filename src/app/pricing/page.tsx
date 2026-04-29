"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { MarketingNavbar } from "@/components/layout/marketing-navbar";
import { MarketingFooter } from "@/components/layout/marketing-footer";
import { Card } from "@/components/ui/card";

const faqs = [
  ["Can I switch plans later?", "Yes. You can upgrade, downgrade, or move to annual billing from your settings page at any time."],
  ["Do you support GitHub repositories?", "Yes. The Pro and Enterprise plans include GitHub integration so your team can connect repositories directly."],
  ["What happens when I hit my analysis limit?", "We’ll notify you in-app and by email. You can wait for the monthly reset or upgrade for more capacity."],
  ["Does Enterprise include security controls?", "Enterprise includes SSO, SAML support, audit logs, and custom AI model configuration for stricter governance."],
  ["Can I try Pro before paying?", "Yes. The Pro plan starts with a free trial so you can validate workflows with your team before committing."],
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const plans = [
    { name: "Free", monthly: "$0/month", annual: "$0/month", cta: "Get Started Free", href: "/login", features: ["3 projects", "50 AI analyses per month", "Code review + bug finder", "Basic documentation", "Community support"] },
    { name: "Pro", monthly: "$29/month", annual: "$23/month", cta: "Start Free Trial", href: "/login", featured: true, features: ["Unlimited projects", "1,000 AI analyses per month", "All AI tools", "GitHub integration", "Team up to 10 members", "Priority support", "Analytics dashboard"] },
    { name: "Enterprise", monthly: "Custom", annual: "Custom", cta: "Contact Sales", href: "mailto:sales@devpilot.ai", features: ["Everything in Pro", "Unlimited team members", "SSO / SAML", "Custom AI model config", "SLA guarantee", "Dedicated support", "Audit logs"] },
  ];

  return (
    <main>
      <MarketingNavbar />
      <section className="mx-auto max-w-7xl px-6 pt-16 lg:px-8 lg:pt-24">
        <div className="text-center">
          <p className="text-sm font-medium text-[#c9c4ff]">Pricing</p>
          <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">Simple, transparent pricing</h1>
          <p className="mt-4 text-lg text-slate-300">Start free, scale as you grow</p>
          <div className="mt-8 inline-flex rounded-full border border-white/10 bg-white/5 p-1 text-sm">
            <button type="button" className={`rounded-full px-5 py-2 ${!annual ? "bg-white text-slate-900" : "text-slate-300"}`} onClick={() => setAnnual(false)}>Monthly</button>
            <button type="button" className={`rounded-full px-5 py-2 ${annual ? "bg-white text-slate-900" : "text-slate-300"}`} onClick={() => setAnnual(true)}>Annual</button>
            {annual ? <span className="ml-2 rounded-full bg-[rgba(117,104,255,0.2)] px-3 py-2 text-xs font-semibold text-[#c9c4ff]">20% off</span> : null}
          </div>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.name} className={`rounded-[32px] ${plan.featured ? "border-[rgba(117,104,255,0.7)] shadow-[0_20px_60px_rgba(117,104,255,0.18)]" : "bg-white/5"}`}>
              {plan.featured ? <span className="inline-flex rounded-full bg-[rgba(117,104,255,0.18)] px-3 py-1 text-xs font-semibold text-[#c9c4ff]">Most Popular</span> : null}
              <h2 className="mt-5 text-2xl font-semibold">{plan.name}</h2>
              <p className="mt-3 text-4xl font-semibold">{annual ? plan.annual : plan.monthly}</p>
              <div className="mt-6 space-y-3 text-sm text-slate-300">
                {plan.features.map((feature) => <div key={feature}>? {feature}</div>)}
              </div>
              <Link href={plan.href} className={`mt-8 inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold ${plan.featured ? "bg-[var(--purple)] text-white" : "border border-white/15 bg-white/5 text-white"}`}>{plan.cta}</Link>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 pt-20 lg:px-8">
        <h2 className="text-3xl font-semibold">Frequently asked questions</h2>
        <div className="mt-8 space-y-4">
          {faqs.map(([question, answer], index) => (
            <div key={question} className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <button type="button" className="flex w-full items-center justify-between gap-4 text-left" onClick={() => setOpenIndex(openIndex === index ? null : index)}>
                <span className="font-semibold">{question}</span>
                <ChevronDown className={`transition ${openIndex === index ? "rotate-180" : ""}`} size={18} />
              </button>
              {openIndex === index ? <p className="mt-4 text-sm leading-7 text-slate-300">{answer}</p> : null}
            </div>
          ))}
        </div>
      </section>
      <MarketingFooter />
    </main>
  );
}

