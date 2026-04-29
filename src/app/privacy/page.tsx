import { MarketingNavbar } from "@/components/layout/marketing-navbar";
import { MarketingFooter } from "@/components/layout/marketing-footer";

export default function PrivacyPage() {
  return (
    <main>
      <MarketingNavbar />
      <section className="mx-auto max-w-4xl px-6 py-20 lg:px-8">
        <h1 className="text-4xl font-semibold">Privacy Policy</h1>
        <p className="mt-6 text-base leading-8 text-slate-300">We only store the information required to authenticate users, power the dashboard, and improve collaboration experiences across your workspace.</p>
      </section>
      <MarketingFooter />
    </main>
  );
}

