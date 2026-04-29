import { MarketingNavbar } from "@/components/layout/marketing-navbar";
import { MarketingFooter } from "@/components/layout/marketing-footer";

export default function TermsPage() {
  return (
    <main>
      <MarketingNavbar />
      <section className="mx-auto max-w-4xl px-6 py-20 lg:px-8">
        <h1 className="text-4xl font-semibold">Terms of Service</h1>
        <p className="mt-6 text-base leading-8 text-slate-300">Use DevPilot AI responsibly, protect your credentials, and review AI-generated suggestions before merging code into production.</p>
      </section>
      <MarketingFooter />
    </main>
  );
}

