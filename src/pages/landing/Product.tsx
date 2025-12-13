import { LandingLayout } from "@/components/landing/LandingLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MessageSquare, Users, Check, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/landing/ScrollReveal";
import { AnimatedCounter } from "@/components/landing/AnimatedCounter";
import trainerClientGym from "@/assets/trainer-client-gym.jpg";
import trainerOverhead from "@/assets/trainer-client-overhead.jpg";
import groupTraining from "@/assets/group-training-class.jpg";
export default function Product() {
  return <LandingLayout>
      {/* Hero */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-card/30 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal>
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/30 text-primary text-sm font-semibold mb-8 shadow-glow">
                <Clock className="h-4 w-4" />
                <span>One System</span>
              </div>
              <h1 className="text-6xl md:text-7xl font-black mb-8 leading-[1.1]">
                Set It Once.{" "}
                <span className="bg-gradient-to-r from-primary via-primary-hover to-primary bg-clip-text text-transparent animate-gradient-shift" style={{
                backgroundSize: '200% auto'
              }}>
                  Stop Thinking About It.
                </span>
              </h1>
              <p className="text-2xl text-foreground/80 leading-relaxed font-light max-w-3xl mx-auto">
                This runs quietly in the background while you coach. Check in once a day. Everything else is handled.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* What You Don't Do Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-card/50 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">What You Don't Have to Do</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                The system handles these. You just approve.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <ScrollReveal delay={100}>
              <Card className="p-8 hover:shadow-lg transition-all duration-300 border-primary/20">
                <div className="h-14 w-14 rounded-2xl bg-success/10 flex items-center justify-center mb-6">
                  <Check className="h-7 w-7 text-success" />
                </div>
                <h3 className="text-xl font-bold mb-3">Notice who needs attention</h3>
                <p className="text-foreground/80 leading-relaxed">
                  The system notices for you. At-risk clients are flagged before they ghost.
                </p>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={150}>
              <Card className="p-8 hover:shadow-lg transition-all duration-300 border-primary/20">
                <div className="h-14 w-14 rounded-2xl bg-success/10 flex items-center justify-center mb-6">
                  <Check className="h-7 w-7 text-success" />
                </div>
                <h3 className="text-xl font-bold mb-3">Remember follow-ups</h3>
                <p className="text-foreground/80 leading-relaxed">No mental lists. No sticky notes. Check-ins are drafted automatically
.</p>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <Card className="p-8 hover:shadow-lg transition-all duration-300 border-primary/20">
                <div className="h-14 w-14 rounded-2xl bg-success/10 flex items-center justify-center mb-6">
                  <Check className="h-7 w-7 text-success" />
                </div>
                <h3 className="text-xl font-bold mb-3">Think about what to say</h3>
                <p className="text-foreground/80 leading-relaxed">Messages are written for you. Review, edit if needed, send.



              </p>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={250}>
              <Card className="p-8 hover:shadow-lg transition-all duration-300 border-primary/20">
                <div className="h-14 w-14 rounded-2xl bg-success/10 flex items-center justify-center mb-6">
                  <Check className="h-7 w-7 text-success" />
                </div>
                <h3 className="text-xl font-bold mb-3">Chase down no-shows</h3>
                <p className="text-foreground/80 leading-relaxed">
                  Re-engagement messages go out before you'd even notice they stopped.
                </p>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <Card className="p-8 hover:shadow-lg transition-all duration-300 border-primary/20">
                <div className="h-14 w-14 rounded-2xl bg-success/10 flex items-center justify-center mb-6">
                  <Check className="h-7 w-7 text-success" />
                </div>
                <h3 className="text-xl font-bold mb-3">Manually track engagement</h3>
                <p className="text-foreground/80 leading-relaxed">
                  Patterns are tracked automatically. You see the summary, not the spreadsheets.
                </p>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={350}>
              <Card className="p-8 hover:shadow-lg transition-all duration-300 border-primary/20">
                <div className="h-14 w-14 rounded-2xl bg-success/10 flex items-center justify-center mb-6">
                  <Check className="h-7 w-7 text-success" />
                </div>
                <h3 className="text-xl font-bold mb-3">Catch up on admin at night</h3>
                <p className="text-foreground/80 leading-relaxed">
                  5 minutes in the morning. That's your total daily investment.
                </p>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* How It Works (Simple) */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Your Daily Routine</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                This is all you do. Really.
              </p>
            </div>
          </ScrollReveal>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <ScrollReveal delay={100}>
                <div className="text-center">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 border-2 border-primary/30">
                    <span className="text-3xl font-bold text-primary">1</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3">Wake Up</h3>
                  <p className="text-muted-foreground">
                    Messages are already drafted. Clients are already flagged.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={200}>
                <div className="text-center">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 border-2 border-primary/30">
                    <span className="text-3xl font-bold text-primary">2</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3">Review & Approve</h3>
                  <p className="text-muted-foreground">
                    5 minutes. Scan the queue. Approve what looks good. Edit if needed.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={300}>
                <div className="text-center">
                  <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6 border-2 border-success/30">
                    <span className="text-3xl font-bold text-success">3</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3">Go Coach</h3>
                  <p className="text-muted-foreground">
                    That's it. The system handles the rest while you train clients.
                  </p>
                </div>
              </ScrollReveal>
            </div>

            <ScrollReveal delay={400}>
              <div className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 text-center">
                <div className="text-5xl font-bold text-primary mb-2">
                  <AnimatedCounter end={5} /> minutes
                </div>
                <p className="text-xl text-muted-foreground">
                  Total daily time investment. The rest runs automatically.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Client Experience */}
      <section className="py-24 bg-gradient-to-b from-card/50 to-transparent">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">What Your Clients Experience</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                They feel cared for. They don't know it's automated.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <ScrollReveal delay={100}>
              <div className="rounded-3xl overflow-hidden border border-primary/30 shadow-xl relative group">
                <img src={trainerClientGym} alt="Client experience" className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="backdrop-blur-xl bg-card/80 p-6 rounded-2xl border border-primary/30">
                    <h3 className="text-xl font-bold mb-2">Consistent Check-Ins</h3>
                    <p className="text-sm text-muted-foreground">
                      Clients feel like you're always thinking about them. Because the system is.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="rounded-3xl overflow-hidden border border-warning/30 shadow-xl relative group">
                <img src={groupTraining} alt="Group engagement" className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="backdrop-blur-xl bg-card/80 p-6 rounded-2xl border border-warning/30">
                    <h3 className="text-xl font-bold mb-2">Streaks & Progress</h3>
                    <p className="text-sm text-muted-foreground">
                      Clients see their consistency. Friendly competition keeps them coming back.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">What Trainers Report</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                After 30 days with the system running.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <ScrollReveal delay={100}>
              <div className="text-center p-6 rounded-2xl bg-card border border-border">
                <div className="text-4xl font-bold text-primary mb-2">
                  <AnimatedCounter end={8} suffix="h" />
                </div>
                <p className="text-sm text-muted-foreground">Saved per week</p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={150}>
              <div className="text-center p-6 rounded-2xl bg-card border border-border">
                <div className="text-4xl font-bold text-success mb-2">
                  <AnimatedCounter end={40} suffix="%" />
                </div>
                <p className="text-sm text-muted-foreground">Less churn</p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="text-center p-6 rounded-2xl bg-card border border-border">
                <div className="text-4xl font-bold text-warning mb-2">
                  <AnimatedCounter end={5} suffix=" min" />
                </div>
                <p className="text-sm text-muted-foreground">Daily time spent</p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={250}>
              <div className="text-center p-6 rounded-2xl bg-card border border-border">
                <div className="text-4xl font-bold text-primary mb-2">
                  <AnimatedCounter end={0} />
                </div>
                <p className="text-sm text-muted-foreground">Clients forgotten</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-b from-card/50 to-transparent">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Stop Juggling?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Set it once. 5 minutes a day. Get your life back.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/pricing">
                  <Button size="lg" className="shadow-glow hover:shadow-glow-intense text-lg px-8 py-6 transition-all duration-300 hover:scale-105">
                    Get Your Time Back
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                14-day free trial. No credit card required.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </LandingLayout>;
}