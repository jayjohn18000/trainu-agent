import { LandingLayout } from "@/components/landing/LandingLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Zap, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollReveal } from "@/components/landing/ScrollReveal";
import { AnimatedCounter } from "@/components/landing/AnimatedCounter";

const tiers = [
  {
    name: "Starter",
    price: 79,
    checkoutUrl: "https://buy.stripe.com/28E4gB5M31lP4eP8I2frW00",
    tier: "starter",
    headline: "All your messages in one place",
    description: "Never miss a follow-up again",
    popular: false,
    features: [
      { name: "One inbox for everything", included: true },
      { name: "Follow-ups handled automatically", included: true },
      { name: "At-risk client alerts", included: true },
      { name: "Up to 2 calendars", included: true },
      { name: "$10/mo messaging credit", included: true },
      { name: "Full automation", included: false },
      { name: "Priority support", included: false },
    ],
    timeSaved: "4 hours/week",
  },
  {
    name: "Professional",
    price: 99,
    checkoutUrl: "https://buy.stripe.com/9B600lcarfcF8v5gaufrW01",
    tier: "professional",
    headline: "Everything runs automatically",
    description: "You just approve. 5 minutes a day.",
    popular: true,
    features: [
      { name: "Everything in Starter", included: true },
      { name: "Full automation & campaigns", included: true },
      { name: "Unlimited contacts", included: true },
      { name: "$25/mo messaging credit", included: true },
      { name: "Priority support", included: true },
      { name: "White-glove onboarding", included: false },
      { name: "Ad management", included: false },
    ],
    timeSaved: "8 hours/week",
  },
  {
    name: "Growth+",
    price: 497,
    checkoutUrl: "https://buy.stripe.com/00waEZ3DV0hL6mX2jEfrW02",
    tier: "growth",
    headline: "We handle everything",
    description: "Including your marketing",
    popular: false,
    features: [
      { name: "Everything in Professional", included: true },
      { name: "White-glove onboarding", included: true },
      { name: "Campaign & ad management", included: true },
      { name: "$100/mo messaging credit", included: true },
      { name: "Dedicated support", included: true },
      { name: "Custom automations", included: true },
    ],
    timeSaved: "10+ hours/week",
  },
];

const faqs = [
  {
    question: "How long does setup take?",
    answer: "About 10 minutes. Our automated system handles account creation, configuration, and sends you login credentials. You'll be up and running same day.",
  },
  {
    question: "What if I'm not tech-savvy?",
    answer: "That's the point. You don't need to be. The system runs in the background. You spend 5 minutes a day reviewing and approving. That's it.",
  },
  {
    question: "How does the free trial work?",
    answer: "14 days, full access, no credit card required. Cancel anytime. If you love it, your plan starts automatically.",
  },
  {
    question: "Can I change plans later?",
    answer: "Yes. Upgrade anytime and it takes effect immediately. Downgrade at the end of your billing cycle.",
  },
  {
    question: "What counts as a message?",
    answer: "Standard SMS = 160 characters. Longer messages count as multiple. Your plan includes credits that roll over for 3 months. Overages are $0.015 each.",
  },
  {
    question: "Do you work with my existing tools?",
    answer: "Yes. We connect with GoHighLevel and sync your contacts, messages, and calendars automatically. No data migration needed.",
  },
  {
    question: "What if I need help?",
    answer: "All plans include support. Professional gets priority response. Growth+ gets a dedicated contact. Email hello@trainu.us anytime.",
  },
];

export default function Pricing() {
  return (
    <LandingLayout>
      {/* Hero */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-card/30 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Pick a Plan.{" "}
              <span className="bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
                Get Your Week Back.
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              All plans give you back hours every week. Choose based on how much automation you want.
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
                  className={`p-8 relative ${
                    tier.popular ? "border-primary/50 shadow-lg shadow-primary/10" : "border-border"
                  }`}
                >
                  {tier.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                      Most Popular
                    </Badge>
                  )}

                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                    <p className="text-lg font-medium text-foreground mb-1">{tier.headline}</p>
                    <p className="text-sm text-muted-foreground mb-6">{tier.description}</p>
                    <div className="mb-4">
                      <span className="text-5xl font-bold">
                        $<AnimatedCounter end={tier.price} duration={1200} />
                      </span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    
                    {/* Time Saved Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/30 text-success text-sm font-medium mb-4">
                      <Clock className="h-4 w-4" />
                      <span>{tier.timeSaved} saved</span>
                    </div>
                    
                    <Badge variant="secondary" className="block w-fit mx-auto">
                      <Zap className="h-3 w-3 mr-1" />
                      14-Day Free Trial
                    </Badge>
                  </div>

                  <a href={tier.checkoutUrl} className="block mb-6" target="_blank" rel="noopener noreferrer">
                    <Button
                      className={`w-full ${tier.popular ? "shadow-glow" : ""}`}
                      variant={tier.popular ? "default" : "outline"}
                    >
                      Start Free Trial
                    </Button>
                  </a>

                  <ul className="space-y-3">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="h-5 w-5 text-muted flex-shrink-0 mt-0.5" />
                        )}
                        <span className={`text-sm ${feature.included ? "text-foreground" : "text-muted-foreground"}`}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Time Back Summary */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="max-w-4xl mx-auto p-8 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary mb-1">Starter</div>
                  <div className="text-4xl font-black text-foreground mb-2">4h</div>
                  <p className="text-sm text-muted-foreground">Back each week</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-1">Professional</div>
                  <div className="text-4xl font-black text-foreground mb-2">8h</div>
                  <p className="text-sm text-muted-foreground">Back each week</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-1">Growth+</div>
                  <div className="text-4xl font-black text-foreground mb-2">10h+</div>
                  <p className="text-sm text-muted-foreground">Back each week</p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <ScrollReveal>
              <h2 className="text-3xl font-bold text-center mb-12">Common Questions</h2>
            </ScrollReveal>
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border border-border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-6">
                Ready to Stop Juggling?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                14-day free trial. No credit card. Cancel anytime.
              </p>
              <Link to="/login">
                <Button size="lg" className="shadow-glow hover:shadow-glow-intense text-lg px-8 py-6 transition-all duration-300 hover:scale-105">
                  Get Your Time Back
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Technical details footer note */}
      <section className="py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <p className="text-center text-xs text-muted-foreground">
            Works with GoHighLevel. TCPA compliant. SOC 2 certified. All data encrypted.
          </p>
        </div>
      </section>
    </LandingLayout>
  );
}
