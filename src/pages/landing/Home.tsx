import { Link } from "react-router-dom";
import { LandingLayout } from "@/components/landing/LandingLayout";
import { Button } from "@/components/ui/button";
import { TestimonialCarousel } from "@/components/landing/TestimonialCarousel";
import { AnimatedCounter } from "@/components/landing/AnimatedCounter";
import { ScrollReveal } from "@/components/landing/ScrollReveal";
import { Clock, Users, TrendingUp, Check, MessageSquare, Target, BarChart3, X } from "lucide-react";
import { PricingPreviewCard } from "@/components/landing/PricingPreviewCard";
import trainerClientGym from "@/assets/trainer-client-gym.jpg";
import trainerOverhead from "@/assets/trainer-client-overhead.jpg";
import trainerHomeYoga from "@/assets/trainer-home-yoga.jpg";
import groupTraining from "@/assets/group-training-class.jpg";

export default function Home() {
  return (
    <LandingLayout>
      {/* Hero Section - Relief Focused */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-background" />
        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Copy */}
            <ScrollReveal>
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/30 text-primary text-sm font-semibold mb-8 shadow-glow animate-pulse-glow">
                  <Clock className="h-4 w-4" />
                  <span>Finally, One System</span>
                </div>
                
                <h1 className="text-6xl md:text-7xl font-black mb-8 leading-[1.1]">
                  Stop Juggling.{" "}
                  <span className="relative inline-block">
                    <span className="bg-gradient-to-r from-primary via-primary-hover to-primary bg-clip-text text-transparent animate-gradient-shift" style={{
                      backgroundSize: '200% auto'
                    }}>
                      Start Coaching.
                    </span>
                  </span>
                </h1>
                
                <p className="text-2xl text-foreground/80 mb-10 leading-relaxed font-light">
                  One system handles client follow-ups, check-ins, and retention. You get 8 hours back every week.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Link to="/pricing">
                    <Button size="lg" className="shadow-glow hover:shadow-glow-intense w-full sm:w-auto text-lg px-8 py-6 transition-all duration-300 hover:scale-105">
                      Get Your Time Back
                    </Button>
                  </Link>
                  <Link to="/pricing">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-6 hover:bg-primary/10 transition-all duration-300">
                      See Plans
                    </Button>
                  </Link>
                </div>

                {/* Social Proof Stats - Time Focused */}
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-primary/20">
                    <div className="text-3xl font-bold text-primary mb-1">
                      <AnimatedCounter end={8} suffix="h" />
                    </div>
                    <div className="text-xs text-muted-foreground">Saved Weekly</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-success/20">
                    <div className="text-3xl font-bold text-success mb-1">
                      <AnimatedCounter end={5} suffix=" min" />
                    </div>
                    <div className="text-xs text-muted-foreground">Daily Review</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-primary/20">
                    <div className="text-3xl font-bold text-primary mb-1">
                      <AnimatedCounter end={0} suffix="" />
                    </div>
                    <div className="text-xs text-muted-foreground">Clients Forgotten</div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Right: Visual Dashboard */}
            <ScrollReveal delay={200}>
              <div className="relative">
                {/* Main Dashboard Card */}
                <div className="relative rounded-3xl overflow-hidden border border-primary/30 shadow-2xl shadow-primary/20 backdrop-blur-xl bg-card/80">
                  <div className="p-8 space-y-4">
                    {/* What You Stop Doing */}
                    <div className="flex items-center justify-between p-5 rounded-xl bg-success/10 backdrop-blur-sm border border-success/30 hover:scale-[1.02] transition-transform duration-300">
                      <div>
                        <p className="text-sm text-muted-foreground font-medium mb-1">Follow-ups Handled</p>
                        <p className="text-4xl font-bold text-success">
                          <AnimatedCounter end={24} duration={1500} />
                        </p>
                      </div>
                      <MessageSquare className="h-12 w-12 text-success opacity-80" />
                    </div>
                    
                    <div className="flex items-center justify-between p-5 rounded-xl bg-primary/10 backdrop-blur-sm border border-primary/30 hover:scale-[1.02] transition-transform duration-300">
                      <div>
                        <p className="text-sm text-muted-foreground font-medium mb-1">Clients Checked On</p>
                        <p className="text-4xl font-bold text-primary">
                          <AnimatedCounter end={47} duration={1500} />
                        </p>
                      </div>
                      <Users className="h-12 w-12 text-primary opacity-80" />
                    </div>
                    
                    <div className="flex items-center justify-between p-5 rounded-xl bg-warning/10 backdrop-blur-sm border border-warning/30 hover:scale-[1.02] transition-transform duration-300">
                      <div>
                        <p className="text-sm text-muted-foreground font-medium mb-1">At-Risk Clients Saved</p>
                        <p className="text-4xl font-bold text-warning">
                          <AnimatedCounter end={3} duration={1500} />
                        </p>
                      </div>
                      <Target className="h-12 w-12 text-warning opacity-80" />
                    </div>
                  </div>
                </div>
                
                {/* Floating notification */}
                <div className="absolute -bottom-10 -left-8 p-5 rounded-2xl bg-card backdrop-blur-xl border border-success/40 shadow-2xl shadow-success/30 max-w-xs animate-float">
                  <div className="flex items-center gap-4">
                    <div className="relative h-14 w-14 rounded-full overflow-hidden border-2 border-success/50 flex-shrink-0">
                      <img src={trainerOverhead} alt="Client" className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Check className="h-4 w-4 text-success" />
                        <p className="text-sm font-bold text-foreground">Client Re-Engaged!</p>
                      </div>
                      <p className="text-xs text-muted-foreground">You didn't have to remember</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -right-12 -top-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* What You Stop Doing Section */}
      <section className="py-24 bg-gradient-to-b from-card/30 to-transparent">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold mb-6">
                What You Stop Doing
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                These burdens disappear when you have one system that handles it all.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <ScrollReveal delay={100}>
              <div className="p-6 rounded-2xl bg-card border border-danger/20 hover:border-danger/40 transition-all text-center">
                <div className="h-12 w-12 rounded-xl bg-danger/10 flex items-center justify-center mb-4 mx-auto">
                  <X className="h-6 w-6 text-danger" />
                </div>
                <h3 className="text-lg font-bold mb-2">Remembering Who to Message</h3>
                <p className="text-sm text-muted-foreground">
                  No more mental lists. No more "I should check on..."
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="p-6 rounded-2xl bg-card border border-danger/20 hover:border-danger/40 transition-all text-center">
                <div className="h-12 w-12 rounded-xl bg-danger/10 flex items-center justify-center mb-4 mx-auto">
                  <X className="h-6 w-6 text-danger" />
                </div>
                <h3 className="text-lg font-bold mb-2">Chasing Down No-Shows</h3>
                <p className="text-sm text-muted-foreground">
                  The system notices before they disappear.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <div className="p-6 rounded-2xl bg-card border border-danger/20 hover:border-danger/40 transition-all text-center">
                <div className="h-12 w-12 rounded-xl bg-danger/10 flex items-center justify-center mb-4 mx-auto">
                  <X className="h-6 w-6 text-danger" />
                </div>
                <h3 className="text-lg font-bold mb-2">Late-Night Admin</h3>
                <p className="text-sm text-muted-foreground">
                  No more catch-up sessions at 11pm.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={400}>
              <div className="p-6 rounded-2xl bg-card border border-danger/20 hover:border-danger/40 transition-all text-center">
                <div className="h-12 w-12 rounded-xl bg-danger/10 flex items-center justify-center mb-4 mx-auto">
                  <X className="h-6 w-6 text-danger" />
                </div>
                <h3 className="text-lg font-bold mb-2">Clients Slipping Away</h3>
                <p className="text-sm text-muted-foreground">
                  No one falls through the cracks anymore.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Pain Points Section - Enhanced */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-card/50 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal>
            <h2 className="text-5xl font-bold text-center mb-6">
              Sound Familiar?
            </h2>
            <p className="text-center text-muted-foreground text-lg mb-16 max-w-2xl mx-auto">
              Every trainer faces these. Most just accept them.
            </p>
          </ScrollReveal>
          
          <div className="grid md:grid-cols-3 gap-8">
            <ScrollReveal delay={100}>
              <div className="p-8 rounded-2xl bg-card border border-warning/30 hover:border-warning/50 transition-all">
                <div className="h-16 w-16 rounded-xl bg-warning/10 flex items-center justify-center mb-6">
                  <Clock className="h-8 w-8 text-warning" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Your Nights Disappear</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Admin bleeds into evenings and weekends. You spend more time on your phone than with your family.
                </p>
              </div>
            </ScrollReveal>
            
            <ScrollReveal delay={200}>
              <div className="p-8 rounded-2xl bg-card border border-danger/30 hover:border-danger/50 transition-all">
                <div className="h-16 w-16 rounded-xl bg-danger/10 flex items-center justify-center mb-6">
                  <TrendingUp className="h-8 w-8 text-danger rotate-180" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Clients Ghost You</h3>
                <p className="text-muted-foreground leading-relaxed">
                  By the time you notice, they're gone. You keep meaning to reach out, but something else always comes up.
                </p>
              </div>
            </ScrollReveal>
            
            <ScrollReveal delay={300}>
              <div className="p-8 rounded-2xl bg-card border border-warning/30 hover:border-warning/50 transition-all">
                <div className="h-16 w-16 rounded-xl bg-warning/10 flex items-center justify-center mb-6">
                  <Users className="h-8 w-8 text-warning" />
                </div>
                <h3 className="text-2xl font-bold mb-3">New Clients Fall Through</h3>
                <p className="text-muted-foreground leading-relaxed">
                  The first 30 days make or break retention. But you're too busy with existing clients to nurture new ones.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* What Happens Instead Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <h2 className="text-5xl font-bold text-center mb-6">
              What Happens When You Stop Juggling
            </h2>
            <p className="text-center text-muted-foreground text-lg mb-20 max-w-3xl mx-auto">
              This is what your day looks like with one system handling the load.
            </p>
          </ScrollReveal>

          <div className="space-y-16 max-w-4xl mx-auto">
            {/* Morning */}
            <ScrollReveal delay={100}>
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/30 text-success text-sm font-semibold mb-6">
                    <Clock className="h-5 w-5" />
                    <span>8:00 AM</span>
                  </div>
                  <h3 className="text-3xl font-bold mb-4">You Don't Notice Who Needs Attention</h3>
                  <p className="text-lg text-foreground/80 mb-6 leading-relaxed">
                    The system already noticed. Check-ins are drafted. At-risk clients are flagged. You just review and send.
                  </p>
                  <ul className="space-y-3">
                    {["Messages ready to approve", "At-risk clients highlighted", "5 minutes, done"].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="h-4 w-4 text-success" />
                        </div>
                        <span className="text-foreground/80">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="relative">
                  <div className="rounded-2xl overflow-hidden border border-success/30 shadow-xl">
                    <img src={trainerClientGym} alt="Training session" className="w-full h-64 object-cover" />
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* During Day */}
            <ScrollReveal delay={200}>
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="order-2 lg:order-1 relative">
                  <div className="rounded-2xl overflow-hidden border border-primary/30 shadow-xl">
                    <img src={trainerHomeYoga} alt="Focused training" className="w-full h-64 object-cover" />
                  </div>
                </div>
                <div className="order-1 lg:order-2">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-semibold mb-6">
                    <MessageSquare className="h-5 w-5" />
                    <span>Throughout Day</span>
                  </div>
                  <h3 className="text-3xl font-bold mb-4">You Don't Think About Follow-Ups</h3>
                  <p className="text-lg text-foreground/80 mb-6 leading-relaxed">
                    While you're coaching, the system is watching. Engagement drops? It notices. Check-in needed? It's drafted.
                  </p>
                  <ul className="space-y-3">
                    {["Runs quietly in background", "No mental load", "Nothing falls through"].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-foreground/80">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </ScrollReveal>

            {/* Evening */}
            <ScrollReveal delay={300}>
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warning/10 border border-warning/30 text-warning text-sm font-semibold mb-6">
                    <BarChart3 className="h-5 w-5" />
                    <span>End of Day</span>
                  </div>
                  <h3 className="text-3xl font-bold mb-4">You Actually Go Home</h3>
                  <p className="text-lg text-foreground/80 mb-6 leading-relaxed">
                    No 11pm catch-up sessions. No guilt about clients you didn't message. Everything's handled.
                  </p>
                  <ul className="space-y-3">
                    {["Evening is yours", "No admin backlog", "Peace of mind"].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="h-4 w-4 text-warning" />
                        </div>
                        <span className="text-foreground/80">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="relative">
                  <div className="rounded-2xl overflow-hidden border border-warning/30 shadow-xl">
                    <img src={groupTraining} alt="Group training" className="w-full h-64 object-cover" />
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Time Calculator */}
      <section className="py-24 bg-gradient-to-b from-card/50 to-transparent">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4">Your Week Back</h2>
                <p className="text-xl text-muted-foreground">What would you do with 8 extra hours every week?</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="p-8 rounded-2xl bg-danger/5 border border-danger/20">
                  <h3 className="text-xl font-bold mb-6 text-danger">Without TrainU</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <X className="h-5 w-5 text-danger flex-shrink-0 mt-0.5" />
                      <span className="text-foreground/80">2+ hours daily on client messaging</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="h-5 w-5 text-danger flex-shrink-0 mt-0.5" />
                      <span className="text-foreground/80">Constant mental load of who to check on</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="h-5 w-5 text-danger flex-shrink-0 mt-0.5" />
                      <span className="text-foreground/80">Clients slip away unnoticed</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="h-5 w-5 text-danger flex-shrink-0 mt-0.5" />
                      <span className="text-foreground/80">Admin bleeds into personal time</span>
                    </li>
                  </ul>
                </div>

                <div className="p-8 rounded-2xl bg-success/5 border border-success/20">
                  <h3 className="text-xl font-bold mb-6 text-success">With TrainU</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-foreground/80">5 minutes daily review</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-foreground/80">Zero mental load - system handles it</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-foreground/80">At-risk clients flagged automatically</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-foreground/80">Evenings and weekends are yours</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 p-6 rounded-2xl bg-primary/10 border border-primary/30 text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  <AnimatedCounter end={8} suffix=" hours" /> saved per week
                </div>
                <p className="text-muted-foreground">That's 32 hours a month. An extra week of your life.</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <h2 className="text-4xl font-bold text-center mb-4">
              Trainers Who Got Their Time Back
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Real trainers. Real relief. Real results.
            </p>
          </ScrollReveal>
          
          <TestimonialCarousel />
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-24 bg-gradient-to-b from-card/50 to-transparent">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <h2 className="text-4xl font-bold text-center mb-4">
              Pick a Plan. Get Your Week Back.
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              All plans include 14-day free trial. Cancel anytime.
            </p>
          </ScrollReveal>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <ScrollReveal delay={100}>
              <PricingPreviewCard
                tier={{
                  name: "Starter",
                  price: 79,
                  description: "All your messages in one place. Never miss a follow-up.",
                  highlights: ["One inbox for everything", "Follow-ups handled", "At-risk alerts"],
                  roi: "4 hours/week saved",
                }}
              />
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <PricingPreviewCard
                tier={{
                  name: "Professional",
                  price: 99,
                  description: "Everything runs automatically. You just approve.",
                  highlights: ["Everything in Starter", "Full automation", "Priority support"],
                  roi: "8 hours/week saved",
                  popular: true,
                }}
              />
            </ScrollReveal>
            <ScrollReveal delay={300}>
              <PricingPreviewCard
                tier={{
                  name: "Growth+",
                  price: 497,
                  description: "We handle everything, including your marketing.",
                  highlights: ["Everything in Pro", "Ad management", "White-glove support"],
                  roi: "10+ hours/week saved",
                }}
              />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-5xl font-bold mb-6">
                Ready to Stop Juggling?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                One system. 8 hours back. Starting at $79/month.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/pricing">
                  <Button size="lg" className="shadow-glow hover:shadow-glow-intense text-lg px-8 py-6 transition-all duration-300 hover:scale-105">
                    Get Your Time Back
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                14-day free trial. No credit card required. Cancel anytime.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </LandingLayout>
  );
}
