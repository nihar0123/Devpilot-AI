import Link from "next/link";
import { BarChart2, Bug, FileText, Shield, TestTube, Users } from "lucide-react";
import { MarketingNavbar } from "@/components/layout/marketing-navbar";
import { MarketingFooter } from "@/components/layout/marketing-footer";
import { Card } from "@/components/ui/card";

const features = [
  { icon: Shield, title: "AI Code Review", description: "Analyze quality, detect security risks, get refactoring suggestions with a score out of 100." },
  { icon: FileText, title: "Documentation Generator", description: "Generate README, setup guides, and API docs from your codebase instantly." },
  { icon: Bug, title: "Intelligent Bug Finder", description: "Detect null issues, dead code, SQL injection risks, and logic errors with severity labels." },
  { icon: TestTube, title: "Unit Test Generator", description: "Generate comprehensive test suites with edge cases and mock examples for JS and Python." },
  { icon: BarChart2, title: "Repo Analytics", description: "Track commit activity, code quality trends, bug hotspots, and team productivity." },
  { icon: Users, title: "Team Dashboard", description: "Manage team members, track sprint progress, and see developer leaderboards." },
];

const testimonials = [
  { quote: "DevPilot AI cut our review turnaround time by nearly half in the first sprint.", name: "Ava Thompson", role: "Staff Engineer", company: "Northstar Cloud" },
  { quote: "The bug finder caught two production regressions before they reached QA. That alone paid for the platform.", name: "Rohan Desai", role: "Engineering Manager", company: "LoopStack" },
  { quote: "Documentation generation turned our onboarding from a week-long scramble into a repeatable checklist.", name: "Mina Park", role: "Platform Lead", company: "ScaleForge" },
];

const stats = ["10,000+ developers", "500,000+ lines reviewed", "99.9% uptime", "4.9/5 rating"];

export default function LandingPage() {
  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(117,104,255,0.24),transparent_25%),radial-gradient(circle_at_top_right,rgba(62,207,255,0.14),transparent_28%)]" />
        <div className="grid-bg absolute inset-x-0 top-0 h-[520px] opacity-40" />
      </div>

      <MarketingNavbar />

      <section className="mx-auto max-w-7xl px-6 pt-16 pb-14 lg:px-8 lg:pt-24">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-200">? Build Faster. Review Smarter. Ship Better.</span>
          <h1 className="mt-8 text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">AI Productivity Suite for Modern Developers</h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-300">Automate code reviews, generate docs, find bugs, create tests, and track repo performance — all in one platform.</p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/login" className="inline-flex items-center justify-center rounded-2xl bg-[var(--purple)] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_35px_rgba(117,104,255,0.35)]">Start Free</Link>
            <Link href="/dashboard" className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white">Live Demo</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid rounded-3xl border border-white/10 bg-white/5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item, index) => (
            <div key={item} className={`px-6 py-5 text-center text-sm text-slate-200 ${index < stats.length - 1 ? "border-b border-white/10 lg:border-b-0 lg:border-r" : ""}`}>
              {item}
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 pt-24 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-[#c9c4ff]">Features</p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Everything your team needs to review, document, and ship confidently</h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur hover:border-[rgba(117,104,255,0.45)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(117,104,255,0.18)] text-[#c9c4ff]">
                <feature.icon size={22} />
              </div>
              <h3 className="mt-5 text-xl font-semibold">{feature.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pt-24 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            ["Connect", "Link your GitHub repo or paste code directly"],
            ["Analyze", "AI analyzes your code for quality, bugs, and improvements"],
            ["Ship", "Apply suggestions and ship better code faster"],
          ].map(([title, description], index) => (
            <Card key={title} className="rounded-3xl bg-white/5">
              <div className="text-sm font-semibold text-[#c9c4ff]">0{index + 1}</div>
              <h3 className="mt-4 text-2xl font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pt-24 lg:px-8">
        <div className="flex flex-col gap-8 rounded-[32px] border border-white/10 bg-white/5 p-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-[#c9c4ff]">Pricing</p>
            <h2 className="mt-3 text-3xl font-semibold">Simple, transparent pricing</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">Start on the free plan, upgrade to Pro when your team needs deeper automation, or talk to us about enterprise workflows.</p>
          </div>
          <Link href="/pricing" className="text-sm font-semibold text-[#c9c4ff]">See all features</Link>
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {[{ name: "Free", price: "$0", blurb: "For solo developers exploring AI-assisted workflows." }, { name: "Pro", price: "$29/mo", blurb: "For active teams that want all AI tools and analytics.", featured: true }, { name: "Enterprise", price: "Custom", blurb: "For organizations that need SSO, governance, and custom support." }].map((plan) => (
            <Card key={plan.name} className={`rounded-3xl ${plan.featured ? "border-[rgba(117,104,255,0.6)] shadow-[0_20px_60px_rgba(117,104,255,0.18)]" : "bg-white/5"}`}>
              {plan.featured ? <span className="inline-flex rounded-full bg-[rgba(117,104,255,0.2)] px-3 py-1 text-xs font-semibold text-[#c9c4ff]">Most Popular</span> : null}
              <h3 className="mt-4 text-2xl font-semibold">{plan.name}</h3>
              <p className="mt-2 text-3xl font-semibold">{plan.price}</p>
              <p className="mt-3 text-sm leading-7 text-slate-300">{plan.blurb}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pt-24 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-[#c9c4ff]">Testimonials</p>
          <h2 className="mt-3 text-3xl font-semibold">Teams trust DevPilot AI in fast-moving product environments</h2>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="rounded-3xl bg-white/5">
              <p className="text-sm leading-7 text-slate-200">“{testimonial.quote}”</p>
              <div className="mt-6">
                <p className="font-semibold">{testimonial.name}</p>
                <p className="text-sm text-slate-400">{testimonial.role}, {testimonial.company}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pt-24 lg:px-8">
        <div className="rounded-[32px] border border-[rgba(117,104,255,0.3)] bg-[linear-gradient(135deg,rgba(117,104,255,0.18),rgba(6,16,31,0.85))] px-8 py-12 text-center">
          <h2 className="text-3xl font-semibold sm:text-4xl">Ready to ship better code?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300">Join thousands of developers already using DevPilot AI.</p>
          <Link href="/login" className="mt-8 inline-flex rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-slate-900">Start for free</Link>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}

