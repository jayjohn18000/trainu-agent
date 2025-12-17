import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AnimatedCounter } from "@/components/landing/AnimatedCounter";
import { ScrollReveal } from "@/components/landing/ScrollReveal";
import { LeadCaptureForm } from "@/components/landing/LeadCaptureForm";
import { RevenuePathwaySection } from "@/components/landing/RevenuePathwaySection";
import { Check, DollarSign, TrendingUp, Zap, Clock, ShoppingBag, Users } from "lucide-react";
import trainerClientGym from "@/assets/trainer-client-gym.jpg";

const revenueTestimonials = [
  {
    name: "Marcus R.",
    role: "Studio Owner",
    text: "I added $1,200/mo in affiliate income within 6 weeks. The affiliate store basically runs itself.",
  },
  {
    name: "Sarah M.",
    role: "Online Coach",
    text: "My starter program sold 47 copies on autopilot last month. That's $2,350 I didn't have to work for.",
  },
  {
    name: "Jessica L.",
    role: "Personal Trainer",
    text: "No-show recovery alone pays for TrainU. I'm keeping clients I would have lost.",
  },
];

export default function Revenue() {
  return (
    <div className="min-h-screen bg-background">
      {/* Minimal Header - No Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-xl font-black text-primary-foreground">T</span>
            </div>
            <span className="text-2xl font-black">TrainU</span>
          </Link>
        </div>
      </header>

      {/* Hero Section - Revenue Focused */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 backdrop-blur-sm border border-success/30 text-success text-sm font-semibold mb-8">
                <DollarSign className="h-4 w-4" />
                <span>Your Online Revenue Pathway</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-black mb-6 leading-[1.1]">
                Earn More.{" "}
                <span className="bg-gradient-to-r from-success via-primary to-success bg-clip-text text-transparent">
                  Do Less.
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-foreground/80 mb-10 leading-relaxed max-w-3xl mx-auto">
                TrainU automates your follow-ups and installs a revenue engine—affiliate picks, digital programs, and client upsells—so you add extra income without extra work.
              </p>

              {/* Revenue Stats */}
              <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto mb-10">
                <div className="text-center p-4 rounded-xl bg-success/10 backdrop-blur-sm border border-success/30">
                  <div className="text-3xl font-bold text-success mb-1">
                    $<AnimatedCounter end={1200} duration={2000} />+
                  </div>
                  <div className="text-xs text-muted-foreground">Monthly Potential</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-primary/10 backdrop-blur-sm border border-primary/30">
                  <div className="text-3xl font-bold text-primary mb-1">
                    <AnimatedCounter end={10} /> min
                  </div>
                  <div className="text-xs text-muted-foreground">Setup Time</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-success/10 backdrop-blur-sm border border-success/30">
                  <div className="text-3xl font-bold text-success mb-1">
                    <AnimatedCounter end={0} />
                  </div>
                  <div className="text-xs text-muted-foreground">Extra Work</div>
                </div>
              </div>

              <Button 
                size="lg" 
                className="shadow-glow hover:shadow-glow-intense text-lg px-10 py-6 bg-success hover:bg-success/90 text-success-foreground"
                onClick={() => document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Start My Revenue Pathway
                <TrendingUp className="ml-2 h-5 w-5" />
              </Button>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Revenue Pathway Section - 3 Columns */}
      <RevenuePathwaySection />

      {/* What You Start Earning Section */}
      <section className="py-24 bg-gradient-to-b from-card/30 to-transparent">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                What You Start Earning
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Time savings AND income growth. Both work for you automatically.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { icon: ShoppingBag, text: "Set up an affiliate store in minutes", color: "success" },
              { icon: Zap, text: "Sell your starter programs automatically", color: "primary" },
              { icon: Users, text: "Recover no-shows while you sleep", color: "warning" },
              { icon: Clock, text: "Save 8 hours every week", color: "primary" },
              { icon: TrendingUp, text: "Turn one-time clients into recurring revenue", color: "success" },
              { icon: DollarSign, text: "Add $500-$2,000/mo without more sessions", color: "success" },
            ].map((item, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <div className={`p-6 rounded-2xl bg-card border border-${item.color}/20 hover:border-${item.color}/40 transition-all flex items-start gap-4`}>
                  <div className={`h-10 w-10 rounded-xl bg-${item.color}/10 flex items-center justify-center flex-shrink-0`}>
                    <Check className={`h-5 w-5 text-${item.color}`} />
                  </div>
                  <span className="text-lg font-medium">{item.text}</span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof - Revenue Focused Testimonials */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-6">
              Trainers Adding Revenue
            </h2>
            <p className="text-center text-muted-foreground text-lg mb-16 max-w-2xl mx-auto">
              Real results from trainers using the Revenue Pathway
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {revenueTestimonials.map((testimonial, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <div className="p-6 rounded-2xl bg-card border border-success/20 hover:border-success/40 transition-all">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <DollarSign key={i} className="h-4 w-4 text-success" />
                    ))}
                  </div>
                  <p className="text-foreground/90 mb-6 italic">"{testimonial.text}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Lead Capture Form Section */}
      <section id="lead-form" className="py-24 bg-gradient-to-b from-success/5 to-transparent">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto">
            <ScrollReveal>
              <div className="text-center mb-10">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  Get Your Revenue Plan
                </h2>
                <p className="text-lg text-muted-foreground">
                  See how much you could earn with your client base
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <LeadCaptureForm />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 border-t border-border/50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground mb-4">
            Questions? Email us at{" "}
            <a href="mailto:hello@trainu.us" className="text-primary hover:underline">
              hello@trainu.us
            </a>
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            <Link to="/product" className="hover:text-foreground transition-colors">Product</Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
