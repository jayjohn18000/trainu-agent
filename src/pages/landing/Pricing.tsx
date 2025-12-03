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
import { ComparisonTable } from "@/components/landing/ComparisonTable";
import trainerClientImage from "@/assets/trainer-client-gym.jpg";
import gradientBg from "@/assets/gradient-mesh-bg.svg";

const tiers = [
  {
    name: "Starter",
    price: 79,
    checkoutUrl: "https://buy.stripe.com/28E4gB5M31lP4eP8I2frW00",
    tier: "starter",
    description: "Core CRM & Communication Hub for solo trainers",
    popular: false,
    features: [
      { name: "GoHighLevel CRM integration", included: true },
      { name: "Unified inbox (SMS, email, social)", included: true },
      { name: "Up to 2 calendars", included: true },
      { name: "Basic automations & workflows", included: true },
      { name: "$10/mo messaging credit (rolls over)", included: true },
      { name: "Automated onboarding included", included: true },
      { name: "Unlimited contacts", included: false },
      { name: "Advanced automations", included: false },
      { name: "SaaS dashboard access", included: false },
    ],
    roi: "Pays for itself in 3 clients saved",
  },
  {
    name: "Professional",
    price: 99,
    checkoutUrl: "https://buy.stripe.com/9B600lcarfcF8v5gaufrW01",
    tier: "professional",
    description: "Unlimited scale + SaaS access for growing studios",
    popular: true,
    features: [
      { name: "Everything in Starter, plus:", included: true },
      { name: "Unlimited contacts & users", included: true },
      { name: "$25/mo messaging credit (rolls over)", included: true },
      { name: "Advanced automations & campaigns", included: true },
      { name: "Full SaaS product access", included: true },
      { name: "Priority support", included: true },
      { name: "Full GHL features", included: false },
      { name: "1:1 onboarding session", included: false },
    ],
    roi: "Pays for itself in 2 clients saved",
  },
  {
    name: "Growth+",
    price: 497,
    checkoutUrl: "https://buy.stripe.com/00waEZ3DV0hL6mX2jEfrW02",
    tier: "growth",
    description: "Full GHL power + white-glove support + AD Management",
    popular: false,
    features: [
      { name: "Everything in Professional, plus:", included: true },
      { name: "Full GoHighLevel suite access", included: true },
      { name: "$100/mo messaging credit (rolls over)", included: true },
      { name: "1:1 demo & onboarding session", included: true },
      { name: "Campaign & ad management support", included: true },
      { name: "Agency & affiliate tools", included: true },
      { name: "White-label options", included: true },
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
  {
    question: "How does automated onboarding work?",
    answer: "After you select your plan and complete payment through our secure GHL checkout, our system automatically creates your sub-account, installs snapshots with pre-built automations and tags, sends you a welcome email/SMS with login credentials, and provisions all SaaS features. When you log in for the first time at app.trainu.us, you'll see an interactive walkthrough and setup checklist. Most trainers are fully operational in under 10 minutes with zero manual configuration required.",
  },
  {
    question: "Is the GHL integration included in all plans?",
    answer: "Yes! All plans include bi-directional sync with GoHighLevel. Your contacts, messages, and engagement data sync automatically. Professional and Growth+ plans unlock additional GHL features like advanced workflows and (Growth+ only) full GHL suite access including funnels, pipelines, and websites.",
  },
  {
    question: "What's included in the messaging credits?",
    answer: "Each plan includes monthly messaging credits that roll over for up to 3 months: Starter gets $10, Professional gets $25, and Growth+ gets $100. These credits cover SMS, MMS, email, and automations. Standard SMS costs ~$0.01-0.015 per message. Unused credits roll over, so you never lose value.",
  },
  {
    question: "How does the GHL checkout work?",
    answer: "When you click 'Get Started,' you'll be redirected to our secure GHL order form where Stripe processes your payment. GHL automatically handles billing automation, failed payment recovery, and account lockouts if needed. After payment, our system provisions your account instantly and sends you login credentials.",
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
                  <Badge variant="secondary" className="mb-2">
                    <Zap className="h-3 w-3 mr-1" />
                    14-Day Free Trial
                  </Badge>
                  <p className="text-xs text-success">{tier.roi}</p>
                </div>

                <a 
                  href={tier.checkoutUrl} 
                  className="block mb-6"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    className={`w-full ${tier.popular ? "shadow-glow" : ""}`}
                    variant={tier.popular ? "default" : "outline"}
                  >
                    Start Free Trial
                  </Button>
                </a>

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

          {/* Feature Comparison Table */}
          <ScrollReveal className="mt-20">
            <h2 className="text-3xl font-bold text-center mb-12">Compare Plans</h2>
            <ComparisonTable 
              tiers={[
                { name: "Starter", popular: false },
                { name: "Professional", popular: true },
                { name: "Growth+", popular: false }
              ]}
              features={[
                {
                  category: "Core Features",
                  items: [
                    { name: "GHL CRM Integration", tiers: [true, true, true] },
                    { name: "Unified Inbox (SMS, Email, Social)", tiers: [true, true, true] },
                    { name: "Automated Onboarding", tiers: [true, true, true] },
                    { name: "Document & Media Vault", tiers: [true, true, true] },
                  ]
                },
                {
                  category: "Scale & Capacity",
                  items: [
                    { name: "Contacts", tiers: [true, true, true] },
                    { name: "Users/Trainers", tiers: [false, true, true] },
                    { name: "Calendars", tiers: [false, true, true] },
                  ]
                },
                {
                  category: "Messaging",
                  items: [
                    { name: "Monthly Credit", tiers: [true, true, true] },
                    { name: "Credit Rollover (3 months)", tiers: [true, true, true] },
                  ]
                },
                {
                  category: "Automations",
                  items: [
                    { name: "Basic Workflows", tiers: [true, true, true] },
                    { name: "Advanced Campaigns", tiers: [false, true, true] },
                    { name: "Full GHL Automation Suite", tiers: [false, false, true] },
                  ]
                },
                {
                  category: "Platform Access",
                  items: [
                    { name: "SaaS Dashboard", tiers: [false, true, true] },
                    { name: "Full GHL Features", tiers: [false, false, true] },
                    { name: "Funnels & Websites", tiers: [false, false, true] },
                    { name: "Pipelines & Opportunities", tiers: [false, false, true] },
                  ]
                },
                {
                  category: "Support",
                  items: [
                    { name: "Email Support", tiers: [true, true, true] },
                    { name: "Priority Support", tiers: [false, true, true] },
                    { name: "1:1 Onboarding Session", tiers: [false, false, true] },
                    { name: "Campaign Management Support", tiers: [false, false, true] },
                  ]
                },
              ]}
            />
          </ScrollReveal>

          {/* Automated Onboarding Info Box */}
          <ScrollReveal className="mt-20 max-w-4xl mx-auto">
            <Card className="p-8 bg-primary/5 border-primary/20">
              <div className="flex items-start gap-4">
                <Zap className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-2xl font-bold mb-3">All Plans Include Automated Onboarding</h3>
                  <p className="text-muted-foreground mb-4">
                    From the moment you subscribe, our system handles everything: sub-account creation, snapshot installation, welcome messages, and dashboard setup. You'll be retaining clients in under 10 minutes with zero manual configuration.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-success" />
                      <span>Instant account provisioning via GHL</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-success" />
                      <span>Welcome email/SMS with login credentials</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-success" />
                      <span>First-login walkthrough & setup checklist</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-success" />
                      <span>Pre-configured automations, tags, and calendars</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-success" />
                      <span>Ready to use immediately - no waiting</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </ScrollReveal>

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

      {/* Checkout Flow Visual */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-center mb-12">How the Complete Flow Works</h2>
            <Card className="max-w-3xl mx-auto p-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <div>
                    <h3 className="font-bold mb-1">Select Your Plan on trainu.us</h3>
                    <p className="text-sm text-muted-foreground">Browse features and choose the plan that fits your needs</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <div>
                    <h3 className="font-bold mb-1">Secure GHL Checkout (Stripe Payment)</h3>
                    <p className="text-sm text-muted-foreground">Redirected to secure checkout, Stripe processes payment</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <div>
                    <h3 className="font-bold mb-1">Automated Provisioning</h3>
                    <p className="text-sm text-muted-foreground">Sub-account created, snapshots installed, welcome messages sent</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">4</div>
                  <div>
                    <h3 className="font-bold mb-1">Log In at app.trainu.us</h3>
                    <p className="text-sm text-muted-foreground">Access your credentials and login to your new account</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">5</div>
                  <div>
                    <h3 className="font-bold mb-1">Dashboard Walkthrough & Setup Checklist</h3>
                    <p className="text-sm text-muted-foreground">Interactive tour shows you key features on first login</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-success text-success-foreground flex items-center justify-center font-bold flex-shrink-0">✓</div>
                  <div>
                    <h3 className="font-bold mb-1">Start Retaining Clients</h3>
                    <p className="text-sm text-muted-foreground">All features ready, CRM automations active, AI learning begins</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-center text-muted-foreground mt-8">
                From signup to active use in under 10 minutes. No manual setup required.
              </p>
            </Card>
          </ScrollReveal>
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
