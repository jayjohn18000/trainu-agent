import { LandingLayout } from "@/components/landing/LandingLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Clock, Check, ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/landing/ScrollReveal";
import { AnimatedCounter } from "@/components/landing/AnimatedCounter";

export default function HowItWorks() {
  return (
    <LandingLayout>
      {/* Hero - Ultra Simple */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-card/30 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Connect Once.{" "}
              <span className="bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
                Stop Thinking About It.
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              10 minutes setup. 5 minutes daily. That's it.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/pricing">
                <Button size="lg" className="shadow-glow">
                  Get Started
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Simple 3-Step Process */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Three Steps. That's All.</h2>
            </div>
          </ScrollReveal>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <ScrollReveal delay={100}>
                <Card className="p-8 text-center relative">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                      1
                    </div>
                  </div>
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 mt-4">
                    <Clock className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Connect</h3>
                  <p className="text-muted-foreground mb-4">
                    Pick a plan. We set up your account automatically.
                  </p>
                  <div className="text-sm text-primary font-medium">~10 minutes</div>
                </Card>
              </ScrollReveal>

              {/* Arrow */}
              <div className="hidden md:flex items-center justify-center">
                <ArrowRight className="h-8 w-8 text-muted-foreground" />
              </div>

              {/* Step 2 */}
              <ScrollReveal delay={200}>
                <Card className="p-8 text-center relative md:col-start-2">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                      2
                    </div>
                  </div>
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 mt-4">
                    <Check className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Auto-Runs</h3>
                  <p className="text-muted-foreground mb-4">
                    The system watches your clients. Drafts messages. Flags issues.
                  </p>
                  <div className="text-sm text-success font-medium">24/7 automatic</div>
                </Card>
              </ScrollReveal>

              {/* Arrow */}
              <div className="hidden md:flex items-center justify-center md:col-start-3 md:row-start-1">
                {/* Placeholder for layout */}
              </div>
            </div>

            {/* Step 3 - Full Width */}
            <ScrollReveal delay={300}>
              <Card className="p-8 text-center mt-8 border-success/30 bg-success/5">
                <div className="h-8 w-8 rounded-full bg-success text-success-foreground flex items-center justify-center font-bold text-sm mx-auto mb-4">
                  3
                </div>
                <h3 className="text-2xl font-bold mb-3">Review 5 Min/Day</h3>
                <p className="text-muted-foreground mb-4 max-w-lg mx-auto">
                  Morning routine: open your queue, approve messages, go train clients. Done.
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/30 text-success font-medium">
                  <Clock className="h-4 w-4" />
                  <span>5 minutes daily</span>
                </div>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Time Summary */}
      <section className="py-16 bg-card/50">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="max-w-3xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="p-8 rounded-2xl bg-card border border-border text-center">
                  <h3 className="text-lg font-bold mb-4 text-muted-foreground">Total Setup Time</h3>
                  <div className="text-5xl font-black text-primary mb-2">
                    <AnimatedCounter end={10} /> min
                  </div>
                  <p className="text-sm text-muted-foreground">One-time, then never again</p>
                </div>

                <div className="p-8 rounded-2xl bg-card border border-border text-center">
                  <h3 className="text-lg font-bold mb-4 text-muted-foreground">Daily Time Investment</h3>
                  <div className="text-5xl font-black text-success mb-2">
                    <AnimatedCounter end={5} /> min
                  </div>
                  <p className="text-sm text-muted-foreground">Review and approve, that's it</p>
                </div>
              </div>

              <div className="mt-8 p-6 rounded-2xl bg-primary/10 border border-primary/20 text-center">
                <p className="text-lg text-foreground">
                  <span className="font-bold">Result:</span> You get{" "}
                  <span className="text-primary font-bold">8+ hours back</span> every week.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* What You Don't Have to Do */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">What You Don't Have to Do</h2>
              <p className="text-xl text-muted-foreground">The system handles all of this</p>
            </div>
          </ScrollReveal>

          <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6">
            {[
              "Remember who to message",
              "Track client engagement",
              "Write check-in messages",
              "Notice who's at risk",
              "Chase down no-shows",
              "Catch up on admin at night",
              "Manage multiple inboxes",
              "Manually tag clients",
            ].map((item, index) => (
              <ScrollReveal key={item} delay={index * 50}>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-success/5 border border-success/20">
                  <Check className="h-5 w-5 text-success flex-shrink-0" />
                  <span className="text-foreground">{item}</span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-b from-card/50 to-transparent">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-6">
                Ready to Stop Juggling?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                10 minutes to set up. 5 minutes a day. Your life back.
              </p>
              <Link to="/pricing">
                <Button size="lg" className="shadow-glow hover:shadow-glow-intense text-lg px-8 py-6 transition-all duration-300 hover:scale-105">
                  Get Your Time Back
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground mt-4">
                14-day free trial. No credit card required.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </LandingLayout>
  );
}
