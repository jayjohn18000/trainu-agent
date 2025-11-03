import { Link } from "react-router-dom";
import { LandingLayout } from "@/components/landing/LandingLayout";
import { Button } from "@/components/ui/button";
import { ROICalculator } from "@/components/landing/ROICalculator";
import { TestimonialCarousel } from "@/components/landing/TestimonialCarousel";
import { CompetitorTable } from "@/components/landing/CompetitorTable";
import { 
  Brain, 
  TrendingUp, 
  Clock, 
  Users, 
  MessageSquare, 
  Target,
  Zap,
  Shield,
  BarChart3,
  Check
} from "lucide-react";

export default function Home() {
  return (
    <LandingLayout>
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Copy */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Zap className="h-4 w-4" />
              <span>Built for GHL Users</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Stop Losing Clients.{" "}
              <span className="bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
                Start Growing.
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              AI-powered retention automation that catches at-risk clients before they churn. 
              Save 15+ hours weekly while growing revenue by 30%+.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link to="/login">
                <Button size="lg" className="shadow-glow w-full sm:w-auto">
                  Start Free Trial
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  See How It Works
                </Button>
              </Link>
            </div>

            {/* Social Proof Bar */}
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span>100+ Active Trainers</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <span>92% Satisfaction Rate</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span>TCPA Compliant</span>
              </div>
            </div>
          </div>

          {/* Right: Visual */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden border border-primary/20 shadow-2xl shadow-primary/10">
              <div className="bg-gradient-to-br from-card to-background p-8">
                <div className="space-y-4">
                  {/* Mock Dashboard */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-danger/10 border border-danger/20">
                    <div>
                      <p className="text-sm text-muted-foreground">At-Risk Clients</p>
                      <p className="text-2xl font-bold text-danger">3</p>
                    </div>
                    <Target className="h-8 w-8 text-danger" />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <div>
                      <p className="text-sm text-muted-foreground">AI Messages Drafted</p>
                      <p className="text-2xl font-bold text-primary">24</p>
                    </div>
                    <MessageSquare className="h-8 w-8 text-primary" />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg bg-success/10 border border-success/20">
                    <div>
                      <p className="text-sm text-muted-foreground">Retention Rate</p>
                      <p className="text-2xl font-bold text-success">94%</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-success" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating notification */}
            <div className="absolute -bottom-6 -left-6 p-4 rounded-xl bg-card border border-primary/30 shadow-lg shadow-primary/20 animate-float">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  🔥
                </div>
                <div>
                  <p className="text-sm font-semibold">Client saved!</p>
                  <p className="text-xs text-muted-foreground">Ava Reed re-engaged</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="bg-card/50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            The Problems Holding You Back
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg bg-background border border-border">
              <Clock className="h-12 w-12 text-warning mb-4" />
              <h3 className="text-xl font-semibold mb-2">Time Drain</h3>
              <p className="text-muted-foreground">
                Spending 15+ hours weekly on admin tasks, follow-ups, and manual check-ins instead of training.
              </p>
            </div>
            
            <div className="p-6 rounded-lg bg-background border border-border">
              <TrendingUp className="h-12 w-12 text-danger rotate-180 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Silent Churn</h3>
              <p className="text-muted-foreground">
                Clients ghosting without warning. By the time you notice, it's too late to re-engage them.
              </p>
            </div>
            
            <div className="p-6 rounded-lg bg-background border border-border">
              <Users className="h-12 w-12 text-warning mb-4" />
              <h3 className="text-xl font-semibold mb-2">Onboarding Chaos</h3>
              <p className="text-muted-foreground">
                New clients falling through the cracks during the critical first 30 days.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            How TrainU Solves It
          </h2>
          <p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto">
            Three powerful pillars working together to keep your clients engaged and your business growing.
          </p>

          <div className="space-y-16">
            {/* AI Inbox */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
                  <Brain className="h-4 w-4" />
                  <span>AI-Powered</span>
                </div>
                <h3 className="text-3xl font-bold mb-4">Smart AI Inbox</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Your AI assistant analyzes client behavior, drafts personalized messages, and surfaces the ones that need your attention most. You review and approve in seconds.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-4 w-4 text-success" />
                    </div>
                    <span className="text-muted-foreground">Predictive at-risk alerts 7 days before clients churn</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-4 w-4 text-success" />
                    </div>
                    <span className="text-muted-foreground">Context-aware message drafts using client history</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-4 w-4 text-success" />
                    </div>
                    <span className="text-muted-foreground">5-stage approval workflow for full control</span>
                  </li>
                </ul>
              </div>
              <div className="p-8 rounded-2xl bg-gradient-to-br from-card to-background border border-primary/20">
                <div className="space-y-3">
                  <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                    <p className="text-sm font-medium text-warning mb-1">⚠️ High Priority</p>
                    <p className="text-sm text-foreground">Ben Lopez - No response in 5 days</p>
                  </div>
                  <div className="p-4 rounded-lg bg-background border border-border">
                    <p className="text-sm text-muted-foreground mb-2">AI Draft:</p>
                    <p className="text-sm italic">"Hey Ben! Noticed you've been quiet. Everything OK? Want to jump on a quick call this week?"</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Gamification */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1 p-8 rounded-2xl bg-gradient-to-br from-card to-background border border-primary/20">
                <div className="text-center space-y-4">
                  <div className="text-6xl">🔥</div>
                  <p className="text-4xl font-bold text-primary">5 Week Streak</p>
                  <p className="text-muted-foreground">Keep going to unlock Gold Badge!</p>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-warning/10 border border-warning/20 text-warning text-sm font-medium mb-4">
                  <Target className="h-4 w-4" />
                  <span>Engagement</span>
                </div>
                <h3 className="text-3xl font-bold mb-4">Gamified Client Experience</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Turn fitness into a social game. Clients earn XP, compete on leaderboards, and unlock achievements. They stay engaged because it's fun.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-4 w-4 text-success" />
                    </div>
                    <span className="text-muted-foreground">Streak tracking drives 3x more consistency</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-4 w-4 text-success" />
                    </div>
                    <span className="text-muted-foreground">Community challenges create accountability</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-4 w-4 text-success" />
                    </div>
                    <span className="text-muted-foreground">Badges reward milestone behaviors</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Analytics */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-info/10 border border-info/20 text-info text-sm font-medium mb-4">
                  <BarChart3 className="h-4 w-4" />
                  <span>Data-Driven</span>
                </div>
                <h3 className="text-3xl font-bold mb-4">Predictive Analytics Dashboard</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  See exactly what's working. Track engagement trends, identify risk patterns, and optimize your client touchpoints with real-time insights.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-4 w-4 text-success" />
                    </div>
                    <span className="text-muted-foreground">Risk scores updated daily for every client</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-4 w-4 text-success" />
                    </div>
                    <span className="text-muted-foreground">Response rate tracking across all channels</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-4 w-4 text-success" />
                    </div>
                    <span className="text-muted-foreground">Cohort analysis to refine onboarding</span>
                  </li>
                </ul>
              </div>
              <div className="p-8 rounded-2xl bg-gradient-to-br from-card to-background border border-primary/20">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Retention Rate</span>
                    <span className="text-2xl font-bold text-success">94%</span>
                  </div>
                  <div className="h-2 rounded-full bg-success/20">
                    <div className="h-full w-[94%] rounded-full bg-gradient-to-r from-success to-success/80"></div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-muted-foreground">Response Rate</span>
                    <span className="text-2xl font-bold text-primary">87%</span>
                  </div>
                  <div className="h-2 rounded-full bg-primary/20">
                    <div className="h-full w-[87%] rounded-full bg-gradient-to-r from-primary to-primary-hover"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="bg-card/50 py-20">
        <div className="container mx-auto px-4">
          <ROICalculator />
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            Trusted by Trainers Like You
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            Join 100+ trainers who've transformed their client retention
          </p>
          <TestimonialCarousel />
        </div>
      </section>

      {/* Competitor Table */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Trainers Choose TrainU
          </h2>
          <CompetitorTable />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center p-12 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
            <h2 className="text-4xl font-bold mb-4">
              Ready to Stop Losing Clients?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Start your 14-day free trial. No credit card required.
            </p>
            <Link to="/login">
              <Button size="lg" className="shadow-glow">
                Start Free Trial
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-4">
              Setup takes 10 minutes. GHL integration included.
            </p>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
