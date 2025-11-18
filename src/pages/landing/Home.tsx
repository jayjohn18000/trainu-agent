import { Link } from "react-router-dom";
import { LandingLayout } from "@/components/landing/LandingLayout";
import { Button } from "@/components/ui/button";
import { ROICalculator } from "@/components/landing/ROICalculator";
import { TestimonialCarousel } from "@/components/landing/TestimonialCarousel";
import { CompetitorTable } from "@/components/landing/CompetitorTable";
import { AnimatedCounter } from "@/components/landing/AnimatedCounter";
import { FeatureCard } from "@/components/landing/FeatureCard";
import { ScrollReveal } from "@/components/landing/ScrollReveal";
import { Brain, TrendingUp, Clock, Users, MessageSquare, Target, Zap, Shield, BarChart3, Check, Sparkles, ArrowLeftRight, Tag, Menu } from "lucide-react";
import { PricingPreviewCard } from "@/components/landing/PricingPreviewCard";
import trainerClientGym from "@/assets/trainer-client-gym.jpg";
import trainerOverhead from "@/assets/trainer-client-overhead.jpg";
import trainerHomeYoga from "@/assets/trainer-home-yoga.jpg";
import groupTraining from "@/assets/group-training-class.jpg";
import gradientBg from "@/assets/gradient-mesh-bg.svg";
export default function Home() {
  return <LandingLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-background" />
        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Copy */}
            <ScrollReveal>
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/30 text-primary text-sm font-semibold mb-8 shadow-glow animate-pulse-glow">
                  <Sparkles className="h-4 w-4" />
                  <span>Built for GHL Users</span>
                </div>
                
                <h1 className="text-6xl md:text-7xl font-black mb-8 leading-[1.1]">
                  Stop Losing Clients.{" "}
                  <span className="relative inline-block">
                    <span className="bg-gradient-to-r from-primary via-primary-hover to-primary bg-clip-text text-transparent animate-gradient-shift" style={{
                    backgroundSize: '200% auto'
                  }}>
                      Start Growing.
                    </span>
                  </span>
                </h1>
                
                <p className="text-2xl text-foreground/80 mb-10 leading-relaxed font-light">
                  AI-powered CRM with unified client management, automated engagement, and zero setup time.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Link to="/login">
                    <Button size="lg" className="shadow-glow hover:shadow-glow-intense w-full sm:w-auto text-lg px-8 py-6 transition-all duration-300 hover:scale-105">
                      Start Free Trial
                    </Button>
                  </Link>
                  <Link to="/how-it-works">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-6 hover:bg-primary/10 transition-all duration-300">
                      See How It Works
                    </Button>
                  </Link>
                </div>

                {/* Challenge CTA */}
                <div className="mb-12 p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-primary-hover/10 to-primary/10 border border-primary/30 backdrop-blur-sm">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">🏆</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-2 text-foreground">Rate Your Trainer Challenge 2025</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Win from a $10k prize pool! Submit your trainer rating and compete for rewards. Challenge ends March 31.
                      </p>
                      <Link to="/challenge">
                        <Button size="sm" variant="secondary" className="shadow-md hover:scale-105 transition-transform">
                          View Challenge Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Social Proof Stats */}
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-primary/20">
                    <div className="text-3xl font-bold text-primary mb-1">
                      <AnimatedCounter end={100} suffix="+" />
                    </div>
                    <div className="text-xs text-muted-foreground">Active Trainers</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-success/20">
                    <div className="text-3xl font-bold text-success mb-1">
                      <AnimatedCounter end={92} suffix="%" />
                    </div>
                    <div className="text-xs text-muted-foreground">Satisfaction</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-primary/20">
                    <div className="text-3xl font-bold text-primary mb-1">
                      <AnimatedCounter end={15} suffix="h" />
                    </div>
                    <div className="text-xs text-muted-foreground">Time Saved</div>
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
                    {/* Mock Dashboard with animated counters */}
                    <div className="flex items-center justify-between p-5 rounded-xl bg-danger/10 backdrop-blur-sm border border-danger/30 hover:scale-[1.02] transition-transform duration-300">
                      <div>
                        <p className="text-sm text-muted-foreground font-medium mb-1">At-Risk Clients</p>
                        <p className="text-4xl font-bold text-danger">
                          <AnimatedCounter end={3} duration={1500} />
                        </p>
                      </div>
                      <Target className="h-12 w-12 text-danger opacity-80" />
                    </div>
                    
                    <div className="flex items-center justify-between p-5 rounded-xl bg-primary/10 backdrop-blur-sm border border-primary/30 hover:scale-[1.02] transition-transform duration-300">
                      <div>
                        <p className="text-sm text-muted-foreground font-medium mb-1">AI Messages Drafted</p>
                        <p className="text-4xl font-bold text-primary">
                          <AnimatedCounter end={24} duration={1500} />
                        </p>
                      </div>
                      <MessageSquare className="h-12 w-12 text-primary opacity-80" />
                    </div>
                    
                    <div className="flex items-center justify-between p-5 rounded-xl bg-success/10 backdrop-blur-sm border border-success/30 hover:scale-[1.02] transition-transform duration-300">
                      <div>
                        <p className="text-sm text-muted-foreground font-medium mb-1">Retention Rate</p>
                        <p className="text-4xl font-bold text-success">
                          <AnimatedCounter end={94} suffix="%" duration={1500} />
                        </p>
                      </div>
                      <BarChart3 className="h-12 w-12 text-success opacity-80" />
                    </div>
                  </div>
                </div>
                
                {/* Floating notification with image */}
                <div className="absolute -bottom-10 -left-8 p-5 rounded-2xl bg-card backdrop-blur-xl border border-primary/40 shadow-2xl shadow-primary/30 max-w-xs animate-float">
                  <div className="flex items-center gap-4">
                    <div className="relative h-14 w-14 rounded-full overflow-hidden border-2 border-primary/50 flex-shrink-0">
                      <img src={trainerOverhead} alt="Client" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Check className="h-4 w-4 text-success" />
                        <p className="text-sm font-bold text-foreground">Client Re-Engaged!</p>
                      </div>
                      <p className="text-xs text-muted-foreground">Ben Lopez • Just now</p>
                    </div>
                  </div>
                </div>

                {/* Background accent */}
                <div className="absolute -right-12 -top-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* CRM Section */}
      <section className="py-24 bg-gradient-to-b from-card/30 to-transparent">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold mb-6">
                Your CRM, Unified & Automated
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Manage SMS, email, and social media in one place. No data migration needed.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <ScrollReveal delay={100}>
              <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <ArrowLeftRight className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Bi-Directional Sync</h3>
                <p className="text-sm text-muted-foreground">
                  Contacts and messages sync automatically. Real-time updates across platforms.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Unified Inbox</h3>
                <p className="text-sm text-muted-foreground">
                  SMS, email, and social messages in one place. Complete conversation history.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Tag className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Automated Tagging</h3>
                <p className="text-sm text-muted-foreground">
                  AI applies engagement tags automatically. Sync tags back for workflows.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={400}>
              <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Contact Management</h3>
                <p className="text-sm text-muted-foreground">
                  Import existing contacts instantly. Update fields in either platform.
                </p>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={500}>
            <div className="flex items-center justify-center gap-8 p-8 rounded-2xl bg-gradient-to-r from-card/80 to-card/50 border border-primary/20">
              <div className="text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg mb-2 mx-auto">
                  <span className="text-2xl font-black text-white">GHL</span>
                </div>
                <p className="text-sm font-medium text-muted-foreground">GoHighLevel</p>
              </div>
              
              <ArrowLeftRight className="h-10 w-10 text-primary animate-pulse" />
              
              <div className="text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-glow mb-2 mx-auto">
                  <span className="text-2xl font-black text-primary-foreground">TU</span>
                </div>
                <p className="text-sm font-medium text-muted-foreground">TrainU</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-card/50 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal>
            <h2 className="text-5xl font-bold text-center mb-6">
              The Problems Holding You Back
            </h2>
            <p className="text-center text-muted-foreground text-lg mb-16 max-w-2xl mx-auto">
              Every trainer faces these challenges. TrainU eliminates them.
            </p>
          </ScrollReveal>
          
          <div className="grid md:grid-cols-3 gap-8">
            <ScrollReveal delay={100}>
              <FeatureCard icon={<Clock className="h-14 w-14" />} title="Time Drain" description="15+ hours weekly on admin tasks instead of training clients." image={trainerClientGym} variant="hover-lift" className="border-warning/20 hover:border-warning/40" />
            </ScrollReveal>
            
            <ScrollReveal delay={200}>
              <FeatureCard icon={<TrendingUp className="h-14 w-14 rotate-180" />} title="Silent Churn" description="Clients ghosting without warning. Too late when you notice." image={trainerHomeYoga} variant="hover-lift" className="border-danger/20 hover:border-danger/40" />
            </ScrollReveal>
            
            <ScrollReveal delay={300}>
              <FeatureCard icon={<Users className="h-14 w-14" />} title="Onboarding Chaos" description="New clients falling through the cracks in first 30 days." image={groupTraining} variant="hover-lift" className="border-warning/20 hover:border-warning/40" />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <h2 className="text-5xl font-bold text-center mb-6">
              How TrainU Solves It
            </h2>
            <p className="text-center text-muted-foreground text-lg mb-20 max-w-3xl mx-auto">
              Three powerful pillars working together to keep your clients engaged and your business growing.
            </p>
          </ScrollReveal>

          <div className="space-y-32">
            {/* AI Inbox */}
            <ScrollReveal delay={100}>
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/30 text-primary text-sm font-semibold mb-6">
                    <Brain className="h-5 w-5" />
                    <span>AI-Powered Retention</span>
                  </div>
                  <h3 className="text-4xl font-bold mb-6 leading-tight">Save 10+ Hours Per Week</h3>
                  <p className="text-lg text-foreground/80 mb-8 leading-relaxed">
                    AI drafts personalized check-ins so you spend time training, not typing. Review and send in 30 seconds.
                  </p>
                  <ul className="space-y-4">
                    {["Predictive at-risk alerts 7 days before churn", "Context-aware message drafts using client history", "Trainers report 90% less time on client messaging"].map((item, i) => <li key={i} className="flex items-start gap-4">
                        <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-1">
                          <Check className="h-5 w-5 text-success" />
                        </div>
                        <span className="text-foreground/80 text-lg">{item}</span>
                      </li>)}
                  </ul>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-3xl blur-3xl" />
                  <div className="relative p-8 rounded-3xl bg-gradient-to-br from-card/80 to-background/80 backdrop-blur-xl border border-primary/30 shadow-2xl">
                    <div className="space-y-4">
                      <div className="p-5 rounded-xl bg-warning/10 backdrop-blur-sm border border-warning/30 hover:scale-[1.02] transition-transform">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="h-3 w-3 bg-warning rounded-full animate-pulse" />
                          <p className="text-sm font-bold text-warning">High Priority</p>
                        </div>
                        <p className="text-sm text-foreground font-medium">Ben Lopez - No response in 5 days</p>
                      </div>
                      <div className="p-5 rounded-xl bg-background/50 backdrop-blur-sm border border-border">
                        <p className="text-xs text-muted-foreground mb-3 font-semibold">AI DRAFT:</p>
                        <p className="text-sm italic leading-relaxed text-foreground/90">
                          "Hey Ben! Noticed you've been quiet. Everything OK? Want to jump on a quick call this week?"
                        </p>
                        <div className="mt-4 flex gap-2">
                          <div className="flex-1 p-2 rounded-lg bg-primary/10 text-center text-xs text-primary font-medium">
                            Edit
                          </div>
                          <div className="flex-1 p-2 rounded-lg bg-success/10 text-center text-xs text-success font-medium">
                            Send
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Gamification */}
            <ScrollReveal delay={100}>
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div className="order-2 lg:order-1 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-warning/20 to-transparent rounded-3xl blur-3xl" />
                  <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-primary/30 shadow-2xl">
                    <img src={trainerOverhead} alt="Personal Training Session" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <div className="text-center space-y-4 backdrop-blur-xl bg-card/80 p-8 rounded-2xl border border-primary/30">
                        <div className="text-7xl mb-2">🔥</div>
                        <p className="text-5xl font-bold text-primary mb-2">
                          <AnimatedCounter end={5} /> Week Streak
                        </p>
                        <p className="text-muted-foreground text-sm">Keep going to unlock Gold Badge!</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="order-1 lg:order-2">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warning/10 backdrop-blur-sm border border-warning/30 text-warning text-sm font-semibold mb-6">
                    <Target className="h-5 w-5" />
                    <span>Client Engagement</span>
                  </div>
                  <h3 className="text-4xl font-bold mb-6 leading-tight">Keep Clients Engaged Longer</h3>
                  <p className="text-lg text-foreground/80 mb-8 leading-relaxed">
                    Clients stay motivated with streaks, challenges, and leaderboards. They compete, you retain.
                  </p>
                  <ul className="space-y-4">
                    {["43% longer average client tenure", "Community challenges create accountability", "85% of clients hit milestones faster"].map((item, i) => <li key={i} className="flex items-start gap-4">
                        <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-1">
                          <Check className="h-5 w-5 text-success" />
                        </div>
                        <span className="text-foreground/80 text-lg">{item}</span>
                      </li>)}
                  </ul>
                </div>
              </div>
            </ScrollReveal>

            {/* Analytics */}
            <ScrollReveal delay={100}>
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-info/10 backdrop-blur-sm border border-info/30 text-info text-sm font-semibold mb-6">
                    <BarChart3 className="h-5 w-5" />
                    <span>Data-Driven Insights</span>
                  </div>
                  <h3 className="text-4xl font-bold mb-6 leading-tight">Know Before They Churn</h3>
                  <p className="text-lg text-foreground/80 mb-8 leading-relaxed">
                    See at-risk clients before they cancel. Get AI recommendations to re-engage them automatically.
                  </p>
                  <ul className="space-y-4">
                    {["70% reduction in surprise cancellations", "Response rate tracking across all channels", "Real-time insights optimize your approach"].map((item, i) => <li key={i} className="flex items-start gap-4">
                        <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-1">
                          <Check className="h-5 w-5 text-success" />
                        </div>
                        <span className="text-foreground/80 text-lg">{item}</span>
                      </li>)}
                  </ul>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-success/20 to-transparent rounded-3xl blur-3xl" />
                  <div className="relative p-8 rounded-3xl bg-gradient-to-br from-card/80 to-background/80 backdrop-blur-xl border border-primary/30 shadow-2xl">
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm text-muted-foreground font-medium">Retention Rate</span>
                          <span className="text-3xl font-bold text-success">
                            <AnimatedCounter end={94} suffix="%" />
                          </span>
                        </div>
                        <div className="h-3 rounded-full bg-success/20 overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-success to-success/80 transition-all duration-1000 ease-out" style={{
                          width: '94%'
                        }} />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm text-muted-foreground font-medium">Response Rate</span>
                          <span className="text-3xl font-bold text-primary">
                            <AnimatedCounter end={87} suffix="%" />
                          </span>
                        </div>
                        <div className="h-3 rounded-full bg-primary/20 overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-primary to-primary-hover transition-all duration-1000 ease-out delay-200" style={{
                          width: '87%'
                        }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Custom App Integration Section */}
      

      {/* ROI Calculator */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-card/30 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal>
            <ROICalculator />
          </ScrollReveal>
        </div>
      </section>

      {/* Testimonials - Feature Highlights */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <h2 className="text-5xl font-bold text-center mb-6">
              Built for Real Trainers
            </h2>
            <p className="text-center text-muted-foreground text-lg mb-16 max-w-2xl mx-auto">
              Join 100+ trainers who've transformed their client retention
            </p>
          </ScrollReveal>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ScrollReveal delay={100}>
              <div className="group relative overflow-hidden rounded-2xl border border-primary/20 hover:border-primary/40 transition-all duration-300">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={trainerClientGym} alt="Personal Training" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="h-5 w-5 text-success" />
                    <span className="text-sm font-semibold text-success">Verified Trainer</span>
                  </div>
                  <p className="text-lg font-bold mb-2">+34% retention in 90 days</p>
                  <p className="text-sm text-muted-foreground">"The AI inbox saves me 10+ hours every week."</p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="group relative overflow-hidden rounded-2xl border border-primary/20 hover:border-primary/40 transition-all duration-300">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={trainerHomeYoga} alt="Home Training" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="h-5 w-5 text-success" />
                    <span className="text-sm font-semibold text-success">Verified Trainer</span>
                  </div>
                  <p className="text-lg font-bold mb-2">Saved 8 clients from churning</p>
                  <p className="text-sm text-muted-foreground">"Caught at-risk clients before I even noticed."</p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <div className="group relative overflow-hidden rounded-2xl border border-primary/20 hover:border-primary/40 transition-all duration-300">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={groupTraining} alt="Group Training" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="h-5 w-5 text-success" />
                    <span className="text-sm font-semibold text-success">Verified Trainer</span>
                  </div>
                  <p className="text-lg font-bold mb-2">92% client satisfaction</p>
                  <p className="text-sm text-muted-foreground">"Gamification keeps my clients coming back."</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Competitor Table */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-card/30 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal>
            <h2 className="text-5xl font-bold text-center mb-6">
              Why Trainers Choose TrainU
            </h2>
            <p className="text-center text-muted-foreground text-lg mb-16 max-w-2xl mx-auto">
              The only platform built specifically for retention automation
            </p>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <CompetitorTable />
          </ScrollReveal>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold mb-6">
                Pricing That Pays for Itself
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
                Choose the plan that fits your business. All plans include automated onboarding and CRM integration.
              </p>
              <p className="text-lg font-semibold text-primary">
                Average trainer saves $2,400/month in retained revenue
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <ScrollReveal delay={100}>
              <PricingPreviewCard tier={{
              name: "Starter",
              price: 79,
              description: "Core CRM & Communication Hub",
              roi: "Pays for itself in 3 clients saved",
              highlights: ["Up to 2 calendars", "Basic automations", "$10/mo messaging credit", "GHL CRM integration"]
            }} />
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <PricingPreviewCard tier={{
              name: "Professional",
              price: 99,
              description: "Unlimited scale + SaaS access",
              popular: true,
              roi: "Pays for itself in 2 clients saved",
              highlights: ["Unlimited contacts & users", "Advanced automations", "$25/mo messaging credit", "Full SaaS dashboard"]
            }} />
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <PricingPreviewCard tier={{
              name: "Growth+",
              price: 497,
              description: "Full GHL power + white-glove support",
              roi: "ROI-positive from day 1",
              highlights: ["Full GHL features suite", "$100/mo messaging credit", "1:1 demo & onboarding", "Campaign management support"]
            }} />
            </ScrollReveal>
          </div>

          <ScrollReveal delay={400}>
            <div className="text-center mt-12">
              <Link to="/pricing">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  View Full Pricing Details
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/10" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal>
            <div className="max-w-4xl mx-auto text-center p-16 rounded-3xl bg-gradient-to-br from-card/80 to-background/80 backdrop-blur-xl border border-primary/30 shadow-2xl shadow-primary/20">
              <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Ready to Stop Losing Clients?
              </h2>
              <p className="text-2xl text-foreground/80 mb-12 leading-relaxed">
                Start your 14-day free trial. No credit card required.
              </p>
              <Link to="/login">
                <Button size="lg" className="shadow-glow-intense hover:scale-105 transition-all duration-300 text-lg px-12 py-8">
                  Start Free Trial
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground mt-8 flex items-center justify-center gap-2">
                <Shield className="h-4 w-4" />
                Setup takes 10 minutes • GHL integration included • TCPA compliant
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </LandingLayout>;
}