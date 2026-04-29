import { MarketingNavbar } from "@/components/layout/marketing-navbar";
import { MarketingFooter } from "@/components/layout/marketing-footer";
import { Card } from "@/components/ui/card";

export default function DocsPage() {
  return (
    <main>
      <MarketingNavbar />
      <section className="mx-auto max-w-5xl px-6 pt-16 lg:px-8 lg:pt-24">
        <p className="text-sm font-medium text-[#c9c4ff]">Documentation</p>
        <h1 className="mt-3 text-4xl font-semibold">DevPilot AI Docs</h1>
        <p className="mt-4 text-lg text-slate-300">Everything you need to set up the app, understand the architecture, and integrate the AI workflows into your team.</p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {[
            ["Getting Started", "Configure environment variables, run Prisma, and launch the development server in minutes."],
            ["Authentication", "Use GitHub OAuth, optional Google sign-in, and magic links with Gmail SMTP when configured."],
            ["AI Routes", "POST code to the review, bug finder, docs generator, and test generator endpoints with demo fallbacks."],
            ["Dashboard Modules", "Explore analytics, team collaboration, billing, and settings from a shared dashboard shell."],
          ].map(([title, description]) => (
            <Card key={title} className="rounded-3xl bg-white/5">
              <h2 className="text-2xl font-semibold">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">{description}</p>
            </Card>
          ))}
        </div>
      </section>
      <MarketingFooter />
    </main>
  );
}

