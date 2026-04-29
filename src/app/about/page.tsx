import { MarketingNavbar } from "@/components/layout/marketing-navbar";
import { MarketingFooter } from "@/components/layout/marketing-footer";

export default function AboutPage() {
  return (
    <main>
      <MarketingNavbar />
      <section className="mx-auto max-w-4xl px-6 py-20 lg:px-8">
        <h1 className="text-4xl font-semibold">About DevPilot AI</h1>
        <p className="mt-6 text-lg leading-8 text-slate-300">DevPilot AI is built for engineering teams that want faster feedback loops, better documentation habits, and fewer bugs escaping to production.</p>
      </section>
      <MarketingFooter />
    </main>
  );
}

