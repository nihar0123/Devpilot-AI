export const BILLING_PLANS = [
  {
    id: "free",
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: ["1 project", "Demo analytics", "Basic AI usage"],
    stripePriceIdMonthly: null,
    stripePriceIdYearly: null,
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 29,
    yearlyPrice: 290,
    features: ["Unlimited projects", "Team collaboration", "Advanced analytics"],
    stripePriceIdMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY ?? null,
    stripePriceIdYearly: process.env.STRIPE_PRICE_PRO_YEARLY ?? null,
  },
  {
    id: "scale",
    name: "Scale",
    monthlyPrice: 99,
    yearlyPrice: 990,
    features: ["SSO + RBAC", "Audit logs", "Priority support"],
    stripePriceIdMonthly: process.env.STRIPE_PRICE_SCALE_MONTHLY ?? null,
    stripePriceIdYearly: process.env.STRIPE_PRICE_SCALE_YEARLY ?? null,
  },
] as const;

export type BillingPlanId = (typeof BILLING_PLANS)[number]["id"];
