import { LandingLayout } from "@/components/landing/LandingLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Zap, Settings, Brain, MessageSquare, TrendingUp, Play } from "lucide-react";
import { ScrollReveal } from "@/components/landing/ScrollReveal";
import { AnimatedCounter } from "@/components/landing/AnimatedCounter";
import trainerGroupImage from "@/assets/group-training-class.jpg";
import gradientBg from "@/assets/gradient-mesh-bg.svg";

const onboardingSteps = [
  {
    number: 1,
    title: "Connect Your GHL Account",
    description: "OAuth setup in under 2 minutes. We sync your existing contacts and message history automatically.",
    duration: "2 min",
    icon: Zap,
  },
  {
    number: 2,
    title: "Customize AI Tone & Rules",
    description: "Tell our AI how you communicate. Set quiet hours, preferred channels, and approval thresholds.",
    duration: "5 min",
    icon: Settings,
  },
  {
    number: 3,
    title: "AI Learns Your Clients",
    description: "TrainU analyzes existing engagement patterns, session history, and communication to build client profiles.",
    duration: "Auto",
    icon: Brain,
  },
  {
    number: 4,
    title: "Go Live",
    description: "Start receiving AI-drafted messages in your queue. Review, approve, and send with one tap.",
    duration: "Instant",
    icon: Play,
  },
];

const dailyWorkflow = [
  {
    time: "8:00 AM",
    event: "Check Today View",
    description: "See at-risk clients, AI drafts ready for review, and today's session reminders.",
    action: "Review 3 AI drafts",
  },
  {
    time: "8:05 AM",
    event: "Approve Messages",
    description: "Edit tone if needed, schedule send times, approve with one tap.",
    action: "2 min total",
  },
  {
    time: "Throughout Day",
    event: "AI Monitors Engagement",
    description: "TrainU tracks client responses, session check-ins, and app activity in real-time.",
    action: "No action needed",
  },
  {
    time: "6:00 PM",
    event: "End-of-Day Insights",
    description: "See who responded, who's trending at-risk, and tomorrow's priority clients.",
    action: "1 min review",
  },
];

export default function HowItWorks() {
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
            From Setup to{" "}
            <span className="bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
              Results in 30 Minutes
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            No data migration. No complex config. Just connect, customize, and start retaining clients.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" className="shadow-glow">
                Start Free Trial
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              <Play className="h-5 w-5 mr-2" />
              Watch Demo Video
            </Button>
          </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Onboarding Timeline */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-center mb-12">
              4 Steps to Go Live
            </h2>
          </ScrollReveal>

          <div className="max-w-4xl mx-auto space-y-6">
            {onboardingSteps.map((step, index) => (
              <ScrollReveal key={index} delay={index * 150}>
              <Card className="p-6 hover:border-primary/30 transition-all hover:scale-[1.02]">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                      {step.number}
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{step.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {step.duration}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>

                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <step.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </div>

                {index < onboardingSteps.length - 1 && (
                  <div className="ml-6 mt-4 mb-0 h-8 w-0.5 bg-gradient-to-b from-primary/50 to-transparent"></div>
                )}
              </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Daily Workflow */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">
              A Day in the Life with TrainU
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              See how TrainU fits into your daily routine without adding more work.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {dailyWorkflow.map((item, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-sm font-mono text-primary">{item.time}</div>
                    <Badge variant="outline" className="text-xs">{item.action}</Badge>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.event}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </Card>
              ))}
            </div>

            <ScrollReveal delay={200}>
            <div className="mt-12 p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Total Time Investment</h3>
                  <p className="text-muted-foreground">~10 minutes per day vs. 2+ hours manual follow-up</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-primary">
                    <AnimatedCounter end={85} suffix="%" duration={1500} />
                  </div>
                  <div className="text-sm text-muted-foreground">Time Saved</div>
                </div>
              </div>
            </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Feature Walkthrough */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            How Each Feature Works
          </h2>

          <div className="max-w-4xl mx-auto space-y-12">
            {/* AI Inbox */}
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
                  <MessageSquare className="h-4 w-4" />
                  <span>AI Inbox</span>
                </div>
                <h3 className="text-2xl font-semibold mb-4">Smart Message Queue</h3>
                <div className="space-y-3 text-muted-foreground">
                  <p className="flex items-start gap-2">
                    <span className="text-primary font-bold">1.</span>
                    AI detects Ben hasn't responded in 5 days (risk score jumps to 72)
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-primary font-bold">2.</span>
                    Drafts personalized check-in referencing his last strength workout
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-primary font-bold">3.</span>
                    Surfaces draft in your queue with priority label
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-primary font-bold">4.</span>
                    You approve, AI schedules for optimal send time (2:30 PM per Ben's history)
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-primary font-bold">5.</span>
                    Ben responds! Risk score drops to 35, AI suggests booking his next session
                  </p>
                </div>
              </div>
              <Card className="p-6 bg-gradient-to-br from-card to-background">
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-danger/10 border border-danger/20">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-2 w-2 rounded-full bg-danger animate-pulse"></div>
                      <span className="text-sm font-semibold text-danger">High Priority</span>
                    </div>
                    <p className="text-sm text-foreground font-medium">Ben Lopez - No response in 5 days</p>
                    <p className="text-xs text-muted-foreground mt-1">Risk Score: 72 → 35 after engagement</p>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-background border border-border">
                    <p className="text-xs text-muted-foreground mb-2">AI Draft Ready:</p>
                    <p className="text-sm italic">"Hey Ben! Noticed you crushed those deadlifts last week. Want to keep that momentum going? I've got spots open Tuesday/Thursday."</p>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">Approve & Send</Button>
                    <Button size="sm" variant="outline">Edit</Button>
                    <Button size="sm" variant="ghost">Skip</Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Gamification */}
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <Card className="p-6 bg-gradient-to-br from-card to-background order-2 md:order-1">
                <div className="text-center space-y-4">
                  <div className="text-6xl">🔥</div>
                  <div>
                    <p className="text-4xl font-bold text-primary">7 Week Streak</p>
                    <p className="text-muted-foreground mt-2">3 more weeks to Gold Badge!</p>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-2">Leaderboard Rank</p>
                    <p className="text-2xl font-bold">#3 of 24</p>
                  </div>
                </div>
              </Card>
              <div className="order-1 md:order-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-warning/10 border border-warning/20 text-warning text-sm font-medium mb-4">
                  <TrendingUp className="h-4 w-4" />
                  <span>Client Engagement</span>
                </div>
                <h3 className="text-2xl font-semibold mb-4">Gamification That Works</h3>
                <div className="space-y-3 text-muted-foreground">
                  <p className="flex items-start gap-2">
                    <span className="text-primary font-bold">1.</span>
                    Client completes workout, earns 25 XP + streak extends
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-primary font-bold">2.</span>
                    Push notification: "🔥 7 weeks! Keep going to unlock Gold Badge"
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-primary font-bold">3.</span>
                    Leaderboard updates in real-time, climbs to #3 in your community
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-primary font-bold">4.</span>
                    Social feed shows achievement, other clients comment and react
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-primary font-bold">5.</span>
                    Engagement drives 3x more session bookings and 40% higher retention
                  </p>
                </div>
              </div>
            </div>

            {/* Analytics */}
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-info/10 border border-info/20 text-info text-sm font-medium mb-4">
                  <TrendingUp className="h-4 w-4" />
                  <span>Predictive Analytics</span>
                </div>
                <h3 className="text-2xl font-semibold mb-4">Data-Driven Decisions</h3>
                <div className="space-y-3 text-muted-foreground">
                  <p className="flex items-start gap-2">
                    <span className="text-primary font-bold">1.</span>
                    Dashboard shows 3 clients trending at-risk this week
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-primary font-bold">2.</span>
                    Click into Ben's profile: missed 2 sessions, response rate dropped 40%
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-primary font-bold">3.</span>
                    AI suggests intervention strategy: personal check-in + session discount offer
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-primary font-bold">4.</span>
                    Track outcome: Ben re-engaged, booked 3 sessions, risk score normalized
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-primary font-bold">5.</span>
                    Learn what works: replicate strategy for similar at-risk patterns
                  </p>
                </div>
              </div>
              <Card className="p-6 bg-gradient-to-br from-card to-background">
                <h4 className="font-semibold mb-4">This Week's Insights</h4>
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-danger/10 border border-danger/20">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-danger">At-Risk Clients</span>
                      <span className="text-2xl font-bold text-danger">3</span>
                    </div>
                    <p className="text-xs text-muted-foreground">↑ 1 from last week</p>
                  </div>

                  <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-success">Retention Rate</span>
                      <span className="text-2xl font-bold text-success">94%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">↑ 2% from last month</p>
                  </div>

                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-primary">Response Rate</span>
                      <span className="text-2xl font-bold text-primary">87%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">↑ 5% vs. manual messages</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Demo CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src={trainerGroupImage} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal>
          <div className="max-w-3xl mx-auto text-center p-12 rounded-2xl backdrop-blur-xl bg-card/90 border-primary/20 shadow-glow">
            <h2 className="text-4xl font-bold mb-4">See It Live</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Book a 15-minute walkthrough with our team or dive in with a free trial
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="outline">
                <Play className="h-5 w-5 mr-2" />
                Watch Demo Video
              </Button>
              <Link to="/login">
                <Button size="lg" className="shadow-glow">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
          </ScrollReveal>
        </div>
      </section>
    </LandingLayout>
  );
}
