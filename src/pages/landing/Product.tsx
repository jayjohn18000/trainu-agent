import { LandingLayout } from "@/components/landing/LandingLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, MessageSquare, BarChart3, Zap, Shield, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
export default function Product() {
  return <LandingLayout>
      {/* Hero */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
Retain and Grow</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Three powerful features working together to automate retention, boost engagement, and maximize revenue.
          </p>
        </div>
      </section>

      {/* Features Deep Dive */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4 space-y-24">
          {/* AI Inbox */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Leverage our AI Fitness Agent</h2>
                <p className="text-muted-foreground">Never lose a client to silence again</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-3">Predictive At-Risk Detection</h3>
                <p className="text-muted-foreground mb-4">
                  AI analyzes 15+ engagement signals to catch clients before they ghost. Get alerts 7 days early.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span>Session attendance tracking</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span>Message response rate analysis</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span>Booking pattern recognition</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-3">Context-Aware Message Drafts</h3>
                <p className="text-muted-foreground mb-4">
                  AI reads client history, recent workouts, and engagement to craft personalized check-ins.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span>References specific client goals</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span>Matches your brand voice</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span>Suggests optimal send times</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-3">5-Stage Approval Workflow</h3>
                <p className="text-muted-foreground mb-4">
                  You're in full control. Review, edit, approve, or discard AI drafts with one tap.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge variant="outline">Draft</Badge>
                  <span className="text-muted-foreground">→</span>
                  <Badge variant="outline">Review</Badge>
                  <span className="text-muted-foreground">→</span>
                  <Badge variant="outline">Approved</Badge>
                  <span className="text-muted-foreground">→</span>
                  <Badge variant="outline">Scheduled</Badge>
                  <span className="text-muted-foreground">→</span>
                  <Badge className="bg-success text-success-foreground">Sent</Badge>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-3">Multi-Channel Communication</h3>
                <p className="text-muted-foreground mb-4">
                  Reach clients where they are: SMS, email, in-app notifications. All unified in one inbox.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span>SMS with TCPA compliance built-in</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span>Email templates with tracking</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span>Push notifications for urgent alerts</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>

          {/* Gamification */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-warning" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Gamified Client Experience</h2>
                <p className="text-muted-foreground">Make fitness addictive through social accountability</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-6">
                <div className="text-4xl mb-4">🔥</div>
                <h3 className="text-xl font-semibold mb-3">Streak Tracking</h3>
                <p className="text-muted-foreground">
                  Clients see their workout consistency visualized. Breaking a streak creates powerful motivation to keep going.
                </p>
              </Card>

              <Card className="p-6">
                <div className="text-4xl mb-4">🏆</div>
                <h3 className="text-xl font-semibold mb-3">Leaderboards</h3>
                <p className="text-muted-foreground">
                  Community-wide or private group rankings. Turn fitness into friendly competition that drives consistency.
                </p>
              </Card>

              <Card className="p-6">
                <div className="text-4xl mb-4">⭐</div>
                <h3 className="text-xl font-semibold mb-3">Achievement Badges</h3>
                <p className="text-muted-foreground">
                  Unlock milestones for streaks, PRs, and consistency. Clients love collecting them and showing them off.
                </p>
              </Card>

              <Card className="p-6">
                <div className="text-4xl mb-4">💪</div>
                <h3 className="text-xl font-semibold mb-3">Community Challenges</h3>
                <p className="text-muted-foreground">
                  Create time-bound challenges (7-day streak, 10k steps daily). Group accountability = higher completion rates.
                </p>
              </Card>

              <Card className="p-6">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-semibold mb-3">XP & Leveling</h3>
                <p className="text-muted-foreground">
                  Every workout earns XP. Level up to unlock rewards, recognition, and status within your training community.
                </p>
              </Card>

              <Card className="p-6">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold mb-3">Progress Milestones</h3>
                <p className="text-muted-foreground">
                  Celebrate wins automatically: first month, 10 sessions, 50 workouts. Small wins compound into long-term retention.
                </p>
              </Card>
            </div>
          </div>

          {/* Analytics */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-xl bg-info/10 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-info" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Predictive Analytics Dashboard</h2>
                <p className="text-muted-foreground">Make data-driven decisions with real-time insights</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-3">Client Risk Scoring</h3>
                <p className="text-muted-foreground mb-4">
                  Every client gets a 0-100 risk score updated daily. See who needs attention at a glance.
                </p>
                <div className="space-y-2 mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Low Risk (0-33)</span>
                    <Badge className="bg-success/10 text-success border-success/20">Healthy</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Medium Risk (34-66)</span>
                    <Badge className="bg-warning/10 text-warning border-warning/20">Watch</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">High Risk (67-100)</span>
                    <Badge className="bg-danger/10 text-danger border-danger/20">Urgent</Badge>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-3">Engagement Trends</h3>
                <p className="text-muted-foreground mb-4">
                  Track response rates, session attendance, and app activity over time. Spot patterns early.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span>Week-over-week comparison</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span>Cohort-based analysis</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span>Drop-off point identification</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-3">Revenue Analytics</h3>
                <p className="text-muted-foreground mb-4">
                  See how retention impacts your bottom line. Track MRR, churn rate, and LTV per client.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span>Monthly recurring revenue tracking</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span>Churn rate by cohort</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span>Client lifetime value projections</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-3">Performance Benchmarking</h3>
                <p className="text-muted-foreground mb-4">
                  Compare your metrics against industry averages and top performers. Know where you stand.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span>Retention rate vs. industry avg</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span>Response rate benchmarks</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span>Growth trajectory forecasting</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Zap className="h-4 w-4" />
              <span>Seamless Integration</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">Works With Your Tools</h2>
            <p className="text-muted-foreground">
              Connect your existing systems in minutes. No data migration headaches.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">GoHighLevel</h3>
              <p className="text-sm text-muted-foreground">
                Native integration. Sync contacts, automate workflows, track campaigns.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="h-16 w-16 rounded-xl bg-success/10 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-success" />
              </div>
              <h3 className="font-semibold mb-2">SMS & Email</h3>
              <p className="text-sm text-muted-foreground">
                TCPA-compliant messaging with built-in consent tracking.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="h-16 w-16 rounded-xl bg-info/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-info" />
              </div>
              <h3 className="font-semibold mb-2">Zapier / Webhooks</h3>
              <p className="text-sm text-muted-foreground">
                Connect to 5,000+ apps or build custom integrations via API.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Compliance */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 border border-success/20 text-success text-sm font-medium mb-6">
                <Shield className="h-4 w-4" />
                <span>Enterprise Security</span>
              </div>
              <h2 className="text-3xl font-bold mb-4">Built for Compliance & Security</h2>
              <p className="text-muted-foreground">
                We handle the legal and technical complexities so you can focus on training.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-success" />
                  TCPA Compliance
                </h3>
                <p className="text-sm text-muted-foreground">
                  Built-in opt-in/opt-out tracking, consent management, and quiet hours enforcement.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-success" />
                  10DLC Registration
                </h3>
                <p className="text-sm text-muted-foreground">
                  We handle A2P 10DLC setup and management for SMS campaigns at scale.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-success" />
                  SOC 2 Compliant
                </h3>
                <p className="text-sm text-muted-foreground">
                  Enterprise-grade data security and privacy controls audited annually.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-success" />
                  Data Encryption
                </h3>
                <p className="text-sm text-muted-foreground">
                  All client data encrypted at rest and in transit with AES-256.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center p-12 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
            <h2 className="text-4xl font-bold mb-4">Ready to See It in Action?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Book a 15-minute demo or start your free trial today
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button size="lg" variant="outline">
                  Book a Demo
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" className="shadow-glow">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>;
}