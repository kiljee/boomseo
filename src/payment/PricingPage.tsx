import {
  ArrowRight,
  Check,
  Coins,
  CreditCard,
  Sparkles,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

import { useAuth } from "wasp/client/auth";
import {
  generateCheckoutSession,
  getCustomerPortalUrl,
  useQuery,
} from "wasp/client/operations";
import { routes } from "wasp/client/router";

import {
  Alert,
  AlertDescription,
} from "../client/components/ui/alert";
import { Button } from "../client/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardTitle,
} from "../client/components/ui/card";
import { cn } from "../client/utils";

import {
  PaymentPlanId,
  paymentPlans,
  SubscriptionStatus,
} from "./plans";

// Highlighted subscription plan
const bestDealPaymentPlanId = PaymentPlanId.Pro;

interface PaymentPlanCard {
  name: string;
  price: string;
  description: string;
  credits?: string;
  features: string[];
}

const paymentPlanCards: Record<PaymentPlanId, PaymentPlanCard> = {
  [PaymentPlanId.Hobby]: {
    name: "Starter",
    price: "$19",
    description:
      "Everything you need to start improving your SEO content.",
    credits: "30 credits / month",
    features: [
      "1 SEO workspace",
      "Keyword and SERP research",
      "Competitor content analysis",
      "WDF-IDF article analysis",
      "AI article generation and optimization",
      "Basic customer support",
    ],
  },

  [PaymentPlanId.Pro]: {
    name: "Pro",
    price: "$39",
    description:
      "A complete SEO content workflow for professionals.",
    credits: "100 credits / month",
    features: [
      "Everything in Starter",
      "Up to 3 SEO workspaces",
      "More AI content workflows",
      "Advanced SEO opportunity research",
      "Google Search Console integration",
      "Priority customer support",
    ],
  },

  [PaymentPlanId.Credits10]: {
    name: "10 Credits",
    price: "$5",
    description:
      "Get additional credits whenever you need them.",
    credits: "10 one-time credits",
    features: [
      "10 additional account credits",
      "Use credits for supported AI operations",
      "No monthly commitment",
      "Purchased credits never expire",
    ],
  },
};

const planIcons = {
  [PaymentPlanId.Hobby]: Sparkles,
  [PaymentPlanId.Pro]: Zap,
  [PaymentPlanId.Credits10]: Coins,
};

export function PricingPage() {
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<PaymentPlanId | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: user } = useAuth();
  const navigate = useNavigate();

  const isUserSubscribed =
    !!user?.subscriptionStatus &&
    user.subscriptionStatus !== SubscriptionStatus.Deleted;

  const {
    data: customerPortalUrl,
    isLoading: isCustomerPortalUrlLoading,
    error: customerPortalUrlError,
  } = useQuery(getCustomerPortalUrl, {
    enabled: isUserSubscribed,
  });

  async function handleBuyNowClick(paymentPlanId: PaymentPlanId) {
    if (!user) {
      navigate(routes.LoginRoute.to);
      return;
    }

    try {
      setErrorMessage(null);
      setIsPaymentLoading(true);
      setLoadingPlan(paymentPlanId);

      const checkoutResults =
        await generateCheckoutSession(paymentPlanId);

      if (checkoutResults?.sessionUrl) {
        window.open(checkoutResults.sessionUrl, "_self");
      } else {
        throw new Error("Unable to create checkout session.");
      }
    } catch (error: unknown) {
      console.error(error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while processing your payment. Please try again."
      );

      setIsPaymentLoading(false);
      setLoadingPlan(null);
    }
  }

  function handleCustomerPortalClick() {
    if (!user) {
      navigate(routes.LoginRoute.to);
      return;
    }

    setErrorMessage(null);

    if (customerPortalUrlError) {
      setErrorMessage(
        "Unable to retrieve your billing portal. Please try again."
      );
      return;
    }

    if (!customerPortalUrl) {
      setErrorMessage(
        "Your billing portal is currently unavailable. Please contact support."
      );
      return;
    }

    window.open(customerPortalUrl, "_blank", "noopener,noreferrer");
  }

  function handleFreePlanClick() {
    if (user) {
      navigate(routes.DashboardRoute.to);
    } else {
      navigate(routes.SignupRoute.to);
    }
  }

  return (
    <main className="relative overflow-hidden pb-24 pt-16 sm:pt-20">
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 flex justify-center overflow-hidden blur-3xl"
      >
        <div className="h-96 w-[48rem] rounded-full bg-primary/10 opacity-70" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <section className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
            <CreditCard className="h-4 w-4" />
            Simple and transparent pricing
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Better SEO content.
            <span className="block text-gradient-primary">
              Smarter pricing.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Research competitors, discover keyword opportunities, and
            optimize your articles with data-driven SEO insights.
            Choose a plan that fits your workflow.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              Start with free credits
            </span>

            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              Flexible monthly plans
            </span>

            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              Optional credit top-ups
            </span>
          </div>
        </section>

        {/* Error message */}
        {errorMessage && (
          <Alert
            variant="destructive"
            className="mx-auto mt-10 max-w-2xl"
          >
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* Pricing cards */}
        <section
          id="pricing"
          className="mx-auto mt-16 grid max-w-7xl grid-cols-1 items-stretch gap-6 md:grid-cols-2 xl:grid-cols-4"
        >
          {/* Free plan */}
          <Card className="relative flex flex-col overflow-hidden rounded-2xl border-border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <CardContent className="flex flex-1 flex-col p-7 sm:p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Sparkles className="h-6 w-6" />
              </div>

              <div className="mt-6">
                <CardTitle className="text-xl font-semibold">
                  Free
                </CardTitle>

                <p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">
                  Explore BoomSEO and experience the core SEO workflow.
                </p>
              </div>

              <div className="mt-7">
                <div className="text-4xl font-bold tracking-tight text-foreground">
                  $0
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  No payment required
                </p>

                <p className="mt-3 text-sm font-semibold text-primary">
                  3 initial credits
                </p>
              </div>

              <div className="mt-8 flex-1 border-t border-border pt-7">
                <p className="mb-5 text-sm font-semibold">
                  What's included
                </p>

                <ul className="space-y-4">
                  {[
                    "1 SEO workspace",
                    "Explore keyword research",
                    "Try competitor analysis",
                    "Test WDF-IDF analysis",
                  ].map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm leading-6 text-muted-foreground"
                    >
                      <Check className="mt-0.5 h-4 w-4 flex-none text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>

            <CardFooter className="p-7 pt-0 sm:p-8 sm:pt-0">
              <Button
                onClick={handleFreePlanClick}
                variant="outline"
                className="h-11 w-full group"
              >
                {user ? "Go to dashboard" : "Get started"}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </CardFooter>
          </Card>

          {/* Paid plans */}
          {Object.values(PaymentPlanId).map((planId) => {
            const plan = paymentPlanCards[planId];
            const Icon = planIcons[planId];

            const isSubscription =
              paymentPlans[planId].effect.kind === "subscription";

            const isBestDeal = planId === bestDealPaymentPlanId;

            // Subscription plans use the billing portal for existing subscribers.
            // Credit purchases remain available to subscribers.
            const shouldManageSubscription =
              isUserSubscribed && isSubscription;

            return (
              <Card
                key={planId}
                className={cn(
                  "relative flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
                  isBestDeal
                    ? "border-primary/60 shadow-lg ring-2 ring-primary"
                    : "border-border shadow-sm"
                )}
              >
                {isBestDeal && (
                  <div className="absolute right-0 top-0">
                    <div className="rounded-bl-xl bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground">
                      MOST POPULAR
                    </div>
                  </div>
                )}

                <CardContent className="flex flex-1 flex-col p-7 sm:p-8">
                  {/* Plan icon */}
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-xl",
                      isBestDeal
                        ? "bg-primary text-primary-foreground"
                        : "bg-primary/10 text-primary"
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  {/* Plan heading */}
                  <div className="mt-6">
                    <CardTitle
                      id={planId}
                      className="text-xl font-semibold"
                    >
                      {plan.name}
                    </CardTitle>

                    <p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">
                      {plan.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mt-7">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold tracking-tight text-foreground">
                        {plan.price}
                      </span>

                      <span className="text-sm font-medium text-muted-foreground">
                        {isSubscription ? "/ month" : "one-time"}
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-muted-foreground">
                      {isSubscription
                        ? "Billed monthly"
                        : "No recurring payment"}
                    </p>

                    {plan.credits && (
                      <p className="mt-3 text-sm font-semibold text-primary">
                        {plan.credits}
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <div className="mt-8 flex-1 border-t border-border pt-7">
                    <p className="mb-5 text-sm font-semibold">
                      What's included
                    </p>

                    <ul className="space-y-4">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-3 text-sm leading-6 text-muted-foreground"
                        >
                          <Check
                            className="mt-0.5 h-4 w-4 flex-none text-primary"
                            aria-hidden="true"
                          />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>

                {/* CTA */}
                <CardFooter className="p-7 pt-0 sm:p-8 sm:pt-0">
                  <Button
                    onClick={() =>
                      shouldManageSubscription
                        ? handleCustomerPortalClick()
                        : handleBuyNowClick(planId)
                    }
                    disabled={
                      isPaymentLoading ||
                      (shouldManageSubscription &&
                        isCustomerPortalUrlLoading)
                    }
                    variant={isBestDeal ? "default" : "outline"}
                    className="group h-11 w-full"
                  >
                    {isPaymentLoading && loadingPlan === planId ? (
                      "Processing..."
                    ) : shouldManageSubscription ? (
                      "Manage subscription"
                    ) : !user ? (
                      "Get started"
                    ) : planId === PaymentPlanId.Credits10 ? (
                      "Buy 10 credits"
                    ) : (
                      `Choose ${plan.name}`
                    )}

                    {!isPaymentLoading && (
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </section>

        {/* Subscription and credit information */}
        <section className="mx-auto mt-16 max-w-4xl">
          <div className="grid gap-6 rounded-2xl border border-border bg-card p-7 sm:grid-cols-2 sm:p-9">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">
                  Monthly subscriptions
                </h3>
              </div>

              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Choose Starter or Pro depending on your SEO workflow.
                Each plan includes a monthly credit allowance for supported
                research and AI operations. You can manage your subscription
                through the billing portal.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">
                  Flexible credits
                </h3>
              </div>

              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Need additional usage? Purchase credits separately without
                changing your subscription. Purchased credits are
                independent of your monthly plan.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="mx-auto mt-24 max-w-3xl text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Ready to improve your SEO workflow?
          </h2>

          <p className="mt-4 leading-7 text-muted-foreground">
            Start researching keywords, analyzing competitor content,
            and finding opportunities to improve your articles.
          </p>

          <div className="mt-8">
            <Button
              size="lg"
              onClick={handleFreePlanClick}
              className="group"
            >
              Get started
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}