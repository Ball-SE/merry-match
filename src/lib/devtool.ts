import { loadStripe, type StripeConstructorOptions } from "@stripe/stripe-js";

const opts = {
  developerTools: { assistant: { enabled: false } },
} as unknown as StripeConstructorOptions;

export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  opts
);
