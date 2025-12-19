import { LandingLayout } from "@/components/landing/LandingLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Settings, Brain, MessageSquare, TrendingUp, Play, Mail, Layout, Rocket, ArrowLeftRight, Tag, Users } from "lucide-react";
import { OnboardingTimeline } from "@/components/landing/OnboardingTimeline";
import { CRMIntegrationFlow } from "@/components/landing/CRMIntegrationFlow";
import { ScrollReveal } from "@/components/landing/ScrollReveal";
import { AnimatedCounter } from "@/components/landing/AnimatedCounter";
import trainerGroupImage from "@/assets/group-training-class.jpg";
import gradientBg from "@/assets/gradient-mesh-bg.svg";
const onboardingSteps = [{
  number: 1,
  title: "Subscribe & Automated Provisioning",
  description: "Select your plan, complete GHL checkout, and our system instantly creates your sub-account with pre-configured automations, tags, pipelines, and calendar setups via snapshots.",
  duration: "1-2 min",
  icon: Zap
}, {
  number: 2,
  title: "Welcome Message with Login Credentials",
  description: "Receive a welcome email/SMS with your login link (app.trainu.us), credentials, and first-login setup checklist. No manual setup required.",
  duration: "Instant",
  icon: Mail
}, {
  number: 3,
  title: "Dashboard Walkthrough & Setup Checklist",
  description: "Log in for the first time and see an interactive walkthrough highlighting key features. Follow the optional setup checklist to customize your preferences.",
  duration: "5 min",
  icon: Layout
}, {
  number: 4,
  title: "Start Using All Features Immediately",
  description: "All SaaS features, CRM automations, and AI capabilities are ready to use. Connect your GHL account if desired, or start managing clients right away.",
  duration: "Instant",
  icon: Rocket
}];
const crmIntegrationSteps = [{
  number: 1,
  title: "OAuth Connection",
  description: "Click 'Connect GHL' in settings, authorize TrainU in GHL, system verifies permissions.",
  duration: "1 min",
  icon: Zap
}, {
  number: 2,
  title: "Automatic Contact Sync",
  description: "Existing contacts imported instantly. Tags, notes, and history preserved. Real-time sync begins.",
  duration: "Auto",
  icon: Users
}, {
  number: 3,
  title: "Unified Messaging",
  description: "All GHL message history appears in TrainU. Send from either platform - stays synced. Complete conversation context.",
  duration: "Instant",
  icon: MessageSquare
}, {
  number: 4,
  title: "Automated Tagging",
  description: "AI applies engagement tags (at-risk, high-engagement). Tags sync back to GHL for workflows. No manual categorization needed.",
  duration: "Ongoing",
  icon: Tag
}];
const dailyWorkflow = [{
  time: "8:00 AM",
  event: "Check Today View",
  description: "See at-risk clients, AI drafts ready for review, and today's session reminders.",
  action: "Review 3 AI drafts"
}, {
  time: "8:05 AM",
  event: "Approve Messages",
  description: "Edit tone if needed, schedule send times, approve with one tap.",
  action: "2 min total"
}, {
  time: "Throughout Day",
  event: "AI Monitors Engagement",
  description: "TrainU tracks client responses, session check-ins, and app activity in real-time.",
  action: "No action needed"
}, {
  time: "6:00 PM",
  event: "End-of-Day Insights",
  description: "See who responded, who's trending at-risk, and tomorrow's priority clients.",
  action: "1 min review"
}];
export default function HowItWorks() {
  return <LandingLayout>
      {/* Hero */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 opacity-30">
          <img src={gradientBg} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
            From Signup to{" "}
            <span className="bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
Active Use in 10 Minutes</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Automated onboarding eliminates setup time. Our system handles account creation, configuration, and provisioning so you can start retaining clients immediately.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://my.trainu.us/claim"
              target="_blank"
              rel="noreferrer"
            >
              <Button size="lg" className="shadow-glow">
                Book Setup Call
              </Button>
            </a>
            <Button size="lg" variant="outline">
              <Play className="h-5 w-5 mr-2" />
              Watch Demo Video
            </Button>
          </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Automated Onboarding Flow */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-center mb-4">
              Automated Onboarding - How It Works
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Every step is automated. No manual configuration. No waiting.
            </p>
          </ScrollReveal>

          <div className="max-w-4xl mx-auto">
            <OnboardingTimeline steps={onboardingSteps} />
          </div>
        </div>
      </section>

      {/* CRM Integration Section */}
      

      {/* Custom App/Layers Section */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-center mb-4">
              Add Your Custom TrainU App Layers
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Brand your client experience with custom menu links via GHL's SaaS Configurator
            </p>
          </ScrollReveal>

          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
            <ScrollReveal>
              <Card className="p-8">
                <h3 className="text-xl font-bold mb-4">Features</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-sm">Custom menu links in left sidebar</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-sm">Link to training videos, support, analytics</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-sm">Open your proprietary features</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-sm">Maintain brand consistency</span>
                  </li>
                </ul>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <Card className="p-8">
                <h3 className="text-xl font-bold mb-4">Use Cases</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-success mt-2 flex-shrink-0" />
                    <span className="text-sm">Training video libraries</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-success mt-2 flex-shrink-0" />
                    <span className="text-sm">Custom analytics dashboards</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-success mt-2 flex-shrink-0" />
                    <span className="text-sm">Support chat integrations</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-success mt-2 flex-shrink-0" />
                    <span className="text-sm">Booking widgets</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-success mt-2 flex-shrink-0" />
                    <span className="text-sm">Your own app features</span>
                  </li>
                </ul>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Visual Reference Flow */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-center mb-4">
              The Complete Customer Journey
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              From landing page to active use - every step is automated
            </p>
          </ScrollReveal>

          <div className="max-w-3xl mx-auto">
            <Card className="p-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <div>
                    <h3 className="font-bold mb-1">Landing Page (trainu.us)</h3>
                    <p className="text-sm text-muted-foreground">User browses pricing, features, and clicks "Book Setup Call" to schedule onboarding</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <div>
                    <h3 className="font-bold mb-1">GHL Order Form / Checkout</h3>
                    <p className="text-sm text-muted-foreground">Redirected to secure GHL funnel. Stripe processes payment. GHL receives order confirmation.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <div>
                    <h3 className="font-bold mb-1">Automated Provisioning (GHL SaaS Mode)</h3>
                    <p className="text-sm text-muted-foreground">New sub-account created automatically. Snapshots install best-practice automations. Tags, pipelines, calendars configured. Billing automation activated.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">4</div>
                  <div>
                    <h3 className="font-bold mb-1">Welcome Messages</h3>
                    <p className="text-sm text-muted-foreground">Email: Login link + credentials. SMS: Quick start guide. Both include app.trainu.us login URL.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">5</div>
                  <div>
                    <h3 className="font-bold mb-1">First Login at app.trainu.us</h3>
                    <p className="text-sm text-muted-foreground">Dashboard walkthrough appears. Setup checklist highlights key features. Optional GHL connection prompt.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-success text-success-foreground flex items-center justify-center font-bold flex-shrink-0">✓</div>
                  <div>
                    <h3 className="font-bold mb-1">Ready to Use</h3>
                    <p className="text-sm text-muted-foreground">All SaaS features active. CRM automations running. AI learning client patterns. Support accessible via menu.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold flex-shrink-0">∞</div>
                  <div>
                    <h3 className="font-bold mb-1">Ongoing Operations</h3>
                    <p className="text-sm text-muted-foreground">Billing automation handles renewals. Failed payment recovery (native to SaaS Mode). Account lockouts if needed. Custom menu links always accessible.</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-center text-muted-foreground mt-8">
                Powered by GHL SaaS Mode and TrainU's automated onboarding system
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Daily Workflow */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-center mb-4">Your Daily Workflow</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              See how TrainU fits seamlessly into your day - saving time while keeping clients engaged
            </p>
          </ScrollReveal>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              {dailyWorkflow.map((item, index) => <ScrollReveal key={index} delay={index * 100}>
                  <Card className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-sm font-mono text-primary">{item.time}</div>
                      <Badge variant="outline" className="text-xs">{item.action}</Badge>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold mb-2">{item.event}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-primary">{item.action}</span>
                        <Badge variant="outline" className="text-xs">All plans</Badge>
                      </div>
                    </div>
                  </Card>
                </ScrollReveal>)}
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
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-center mb-12">
              How Each Feature Works
            </h2>
          </ScrollReveal>

          <div className="max-w-4xl mx-auto space-y-12">
            {/* AI Inbox */}
            <ScrollReveal>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MessageSquare className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold mb-1">AI Inbox</h4>
                        <p className="text-sm text-muted-foreground mb-2">Review AI-drafted check-ins, approve with one tap, edit tone if needed.</p>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <Badge variant="secondary">⏱️ Saves 10 hours/week</Badge>
                          <Badge variant="secondary">💰 Worth $800/month</Badge>
                          <Badge variant="secondary">📈 90% faster communication</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold mb-1">Gamification</h4>
                        <p className="text-sm text-muted-foreground mb-2">Clients see streaks, milestones, leaderboards. Friendly competition drives consistency.</p>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <Badge variant="secondary">📊 43% longer tenure</Badge>
                          <Badge variant="secondary">🎯 67% higher completion</Badge>
                          <Badge variant="secondary">🏆 85% faster milestones</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Brain className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold mb-1">Analytics</h4>
                        <p className="text-sm text-muted-foreground mb-2">See at-risk clients before they cancel. Get AI recommendations to re-engage.</p>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <Badge variant="secondary">⚠️ 70% fewer surprise cancellations</Badge>
                          <Badge variant="secondary">📉 Proactive risk detection</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <Card className="p-6 bg-card border-border">
                  <h4 className="text-lg font-semibold mb-6 text-center">Feature Highlights</h4>
                  <div className="space-y-6">
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                      <div className="flex items-center gap-3 mb-3">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        <span className="font-semibold">AI Inbox</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">AI drafts personalized messages, you approve in seconds</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="text-xs">10 hrs saved/week</Badge>
                        <Badge variant="secondary" className="text-xs">90% faster</Badge>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-warning/5 border border-warning/10">
                      <div className="flex items-center gap-3 mb-3">
                        <TrendingUp className="h-5 w-5 text-warning" />
                        <span className="font-semibold">Gamification</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">Streaks, badges, and leaderboards keep clients engaged</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="text-xs">43% longer tenure</Badge>
                        <Badge variant="secondary" className="text-xs">67% completion</Badge>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-info/5 border border-info/10">
                      <div className="flex items-center gap-3 mb-3">
                        <Brain className="h-5 w-5 text-info" />
                        <span className="font-semibold">Analytics</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">Identify at-risk clients before they cancel</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="text-xs">70% fewer cancellations</Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </ScrollReveal>
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
              Book a 15-minute walkthrough with our team and launch with a configured account
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="outline">
                <Play className="h-5 w-5 mr-2" />
                Watch Demo Video
              </Button>
              <a
                href="https://my.trainu.us/claim"
                target="_blank"
                rel="noreferrer"
              >
                <Button size="lg" className="shadow-glow">
                  Book Setup Call
                </Button>
              </a>
            </div>
          </div>
          </ScrollReveal>
        </div>
      </section>
    </LandingLayout>;
}