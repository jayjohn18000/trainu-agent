import { LandingLayout } from "@/components/landing/LandingLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollReveal } from "@/components/landing/ScrollReveal";
import { AnimatedCounter } from "@/components/landing/AnimatedCounter";
import trainerClientImage from "@/assets/trainer-client-gym.jpg";
import gradientBg from "@/assets/gradient-mesh-bg.svg";

const tiers = [
  {
    name: "Starter",
    price: 99,
    description: "Perfect for solo trainers getting started",
    popular: false,
    features: [
      { name: "Up to 15 clients", included: true },
      { name: "AI message drafting", included: true },
      { name: "Predictive at-risk alerts", included: true },
      { name: "Basic analytics dashboard", included: true },
      { name: "Client gamification", included: true },
      { name: "Email support", included: true },
      { name: "GoHighLevel integration", included: true },
      { name: "1,000 SMS messages/month", included: true },
      { name: "White-label branding", included: false },
      { name: "Advanced analytics", included: false },
      { name: "Priority support", included: false },
      { name: "Custom workflows", included: false },
    ],
    roi: "Pays for itself in 4 clients saved",
  },
  {
    name: "Growth",
    price: 249,
    description: "For trainers scaling their business",
    popular: true,
    features: [
      { name: "Up to 50 clients", included: true },
      { name: "AI message drafting", included: true },
      { name: "Predictive at-risk alerts", included: true },
      { name: "Advanced analytics dashboard", included: true },
      { name: "Client gamification", included: true },
      { name: "Priority email & chat support", included: true },
      { name: "GoHighLevel integration", included: true },
      { name: "5,000 SMS messages/month", included: true },
      { name: "White-label branding", included: true },
      { name: "Advanced analytics", included: true },
      { name: "Custom workflows", included: true },
      { name: "API access", included: false },
    ],
    roi: "Pays for itself in 2 clients saved",
  },
  {
    name: "Pro",
    price: 499,
    description: "For studios and multi-trainer teams",
    popular: false,
    features: [
      { name: "Unlimited clients", included: true },
      { name: "AI message drafting", included: true },
      { name: "Predictive at-risk alerts", included: true },
      { name: "Enterprise analytics", included: true },
      { name: "Client gamification", included: true },
      { name: "Dedicated success manager", included: true },
      { name: "GoHighLevel integration", included: true },
      { name: "15,000 SMS messages/month", included: true },
      { name: "White-label branding", included: true },
      { name: "Advanced analytics", included: true },
      { name: "Custom workflows", included: true },
      { name: "Full API access", included: true },
    ],
    roi: "ROI-positive from day 1",
  },
];

const faqs = [
  {
    question: "How does billing work?",
    answer: "All plans are billed monthly with no long-term contracts. You can upgrade, downgrade, or cancel anytime. We offer a 14-day free trial on all plans with no credit card required.",
  },
  {
    question: "What counts as an SMS message?",
    answer: "Standard SMS messages are 160 characters. Messages longer than 160 characters count as multiple segments. MMS (images/videos) count as 3 message credits. Additional messages beyond your plan limit cost $0.015 each.",
  },
  {
    question: "Can I upgrade or downgrade plans?",
    answer: "Yes! You can change plans anytime from your account settings. Upgrades take effect immediately with prorated billing. Downgrades take effect at the next billing cycle.",
  },
  {
    question: "How does the GoHighLevel integration work?",
    answer: "TrainU connects to your GHL account via OAuth in under 10 minutes. We sync contacts bidirectionally, push AI-drafted messages to GHL workflows, and pull engagement data for risk scoring. No data migration needed.",
  },
  {
    question: "What happens if I exceed my client or SMS limits?",
    answer: "For client limits, we'll notify you and give you 7 days to upgrade before pausing new client adds. For SMS, we'll send you an alert at 80% usage. Overages are billed at $0.015 per message.",
  },
  {
    question: "Is there a setup fee?",
    answer: "No setup fees ever. We guide you through onboarding with video tutorials and live chat support. Most trainers are fully set up within 30 minutes.",
  },
  {
    question: "Do you offer discounts for annual plans?",
    answer: "Yes! Pay annually and save 20% (2 months free). Contact our sales team for multi-year or multi-location discounts.",
  },
  {
    question: "What if I need more than 15,000 SMS messages per month?",
    answer: "Pro plan users can purchase additional SMS bundles at discounted rates. Contact sales for custom enterprise pricing if you regularly exceed 50,000 messages/month.",
  },
];

export default function Pricing() {
  return (
    <LandingLayout>
      {/* Hero */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 opacity-30">
          <img src={gradientBg} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Pricing That{" "}
              <span className="bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
                Pays for Itself
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Transparent pricing designed to scale with your business. No hidden fees, no long-term contracts.
            </p>
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-success" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-success" />
              <span>Cancel anytime</span>
            </div>
          </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {tiers.map((tier, index) => (
              <ScrollReveal key={tier.name} delay={index * 100}>
              <Card
                key={tier.name}
                className={`p-8 relative ${
                  tier.popular
                    ? "border-primary/50 shadow-lg shadow-primary/10"
                    : "border-border"
                }`}
              >
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                  <p className="text-sm text-muted-foreground mb-6">{tier.description}</p>
                  <div className="mb-2">
                    <span className="text-5xl font-bold">
                      $<AnimatedCounter end={tier.price} duration={1200} />
                    </span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-xs text-success">{tier.roi}</p>
                </div>

                <Link to="/login" className="block mb-6">
                  <Button
                    className={`w-full ${tier.popular ? "shadow-glow" : ""}`}
                    variant={tier.popular ? "default" : "outline"}
                  >
                    Start Free Trial
                  </Button>
                </Link>

                <ul className="space-y-3">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="h-5 w-5 text-muted flex-shrink-0 mt-0.5" />
                      )}
                      <span
                        className={`text-sm ${
                          feature.included ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
              </ScrollReveal>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="mt-16 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-success" />
              <span>PCI DSS Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-success" />
              <span>SOC 2 Type II</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-success" />
              <span>TCPA Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-success" />
              <span>GDPR Ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <ScrollReveal>
              <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            </ScrollReveal>
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border border-border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Enterprise CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src={trainerClientImage} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal>
          <Card className="max-w-4xl mx-auto p-12 backdrop-blur-xl bg-card/90 border-primary/20 shadow-glow">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Need a Custom Plan?</h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Large studios, multi-location businesses, and enterprises with unique needs can work with our sales team for custom pricing and features.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact">
                  <Button size="lg" variant="outline">
                    Contact Sales
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" className="shadow-glow">
                    Start Free Trial
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
          </ScrollReveal>
        </div>
      </section>
    </LandingLayout>
  );
}
