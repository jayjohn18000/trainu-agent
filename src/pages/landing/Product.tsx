import { LandingLayout } from "@/components/landing/LandingLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, MessageSquare, BarChart3, Zap, Shield, CheckCircle2, Sparkles, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/landing/ScrollReveal";
import { AnimatedCounter } from "@/components/landing/AnimatedCounter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import trainerClientGym from "@/assets/trainer-client-gym.jpg";
import trainerOverhead from "@/assets/trainer-client-overhead.jpg";
import groupTraining from "@/assets/group-training-class.jpg";
import gradientBg from "@/assets/gradient-mesh-bg.svg";
export default function Product() {
  return <LandingLayout>
      {/* Hero */}
      <section className="relative overflow-hidden py-24">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${gradientBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal>
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/30 text-primary text-sm font-semibold mb-8 shadow-glow">
                <Sparkles className="h-4 w-4" />
                <span>Full Platform Overview</span>
              </div>
              <h1 className="text-6xl md:text-7xl font-black mb-8 leading-[1.1]">
                Everything You Need to{" "}
                <span className="bg-gradient-to-r from-primary via-primary-hover to-primary bg-clip-text text-transparent animate-gradient-shift" style={{ backgroundSize: '200% auto' }}>
                  Retain and Grow
                </span>
              </h1>
              <p className="text-2xl text-foreground/80 leading-relaxed font-light max-w-3xl mx-auto">
                Three powerful features working together to automate retention, boost engagement, and maximize revenue.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Features Deep Dive */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-card/50 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Explore Our Features</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Three powerful systems working together to transform your fitness business
              </p>
            </div>
          </ScrollReveal>

          <Tabs defaultValue="ai" className="w-full">
            <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-3 h-auto p-2 mb-16 backdrop-blur-xl bg-card/90 shadow-glow">
              <TabsTrigger 
                value="ai" 
                className="flex flex-col items-center gap-2 py-4 data-[state=active]:bg-primary/10 data-[state=active]:shadow-glow transition-all"
              >
                <Brain className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-semibold">AI Inbox</div>
                  <div className="text-xs text-muted-foreground hidden sm:block">Predictive Engagement</div>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="gamification" 
                className="flex flex-col items-center gap-2 py-4 data-[state=active]:bg-warning/10 data-[state=active]:shadow-glow transition-all"
              >
                <MessageSquare className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-semibold">Gamification</div>
                  <div className="text-xs text-muted-foreground hidden sm:block">Social Accountability</div>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="flex flex-col items-center gap-2 py-4 data-[state=active]:bg-info/10 data-[state=active]:shadow-glow transition-all"
              >
                <BarChart3 className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-semibold">Analytics</div>
                  <div className="text-xs text-muted-foreground hidden sm:block">Data-Driven Insights</div>
                </div>
              </TabsTrigger>
            </TabsList>

            {/* AI Inbox Tab */}
            <TabsContent value="ai" className="animate-fade-in">
              <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-4 mb-12 justify-center">
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 backdrop-blur-sm flex items-center justify-center border border-primary/30 shadow-glow">
                    <Brain className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-4xl md:text-5xl font-bold mb-2">AI Fitness Agent</h3>
                    <p className="text-lg text-muted-foreground">Never lose a client to silence again</p>
                  </div>
                </div>
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="p-8 hover:shadow-glow transition-all duration-300 hover:scale-[1.02] border-primary/20 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all" />
                  <h3 className="text-2xl font-bold mb-4 relative">Predictive At-Risk Detection</h3>
                  <p className="text-foreground/80 mb-6 text-lg leading-relaxed relative">
                    AI analyzes <span className="font-semibold text-primary">15+ engagement signals</span> to catch clients before they ghost. Get alerts 7 days early.
                  </p>
                  <ul className="space-y-3 relative">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-foreground/80">Session attendance tracking</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-foreground/80">Message response rate analysis</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-foreground/80">Booking pattern recognition</span>
                    </li>
                  </ul>
                </Card>

                <Card className="p-8 hover:shadow-glow transition-all duration-300 hover:scale-[1.02] border-primary/20 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all" />
                  <h3 className="text-2xl font-bold mb-4 relative">Context-Aware Message Drafts</h3>
                  <p className="text-foreground/80 mb-6 text-lg leading-relaxed relative">
                    AI reads client history, recent workouts, and engagement to craft personalized check-ins.
                  </p>
                  <ul className="space-y-3 relative">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-foreground/80">References specific client goals</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-foreground/80">Matches your brand voice</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-foreground/80">Suggests optimal send times</span>
                    </li>
                  </ul>
                </Card>

                <Card className="p-8 hover:shadow-glow transition-all duration-300 hover:scale-[1.02] border-primary/20 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-warning/5 rounded-full blur-3xl group-hover:bg-warning/10 transition-all" />
                  <h3 className="text-2xl font-bold mb-4 relative">5-Stage Approval Workflow</h3>
                  <p className="text-foreground/80 mb-6 text-lg leading-relaxed relative">
                    You're in full control. Review, edit, approve, or discard AI drafts with one tap.
                  </p>
                  <div className="flex flex-wrap gap-3 mt-6 relative items-center">
                    <Badge variant="outline" className="text-base px-4 py-2">Draft</Badge>
                    <span className="text-muted-foreground text-xl">→</span>
                    <Badge variant="outline" className="text-base px-4 py-2">Review</Badge>
                    <span className="text-muted-foreground text-xl">→</span>
                    <Badge variant="outline" className="text-base px-4 py-2">Approved</Badge>
                    <span className="text-muted-foreground text-xl">→</span>
                    <Badge variant="outline" className="text-base px-4 py-2">Scheduled</Badge>
                    <span className="text-muted-foreground text-xl">→</span>
                    <Badge className="bg-success text-success-foreground text-base px-4 py-2 shadow-glow">Sent</Badge>
                  </div>
                </Card>

                <Card className="p-8 hover:shadow-glow transition-all duration-300 hover:scale-[1.02] border-primary/20 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-info/5 rounded-full blur-3xl group-hover:bg-info/10 transition-all" />
                  <h3 className="text-2xl font-bold mb-4 relative">Multi-Channel Communication</h3>
                  <p className="text-foreground/80 mb-6 text-lg leading-relaxed relative">
                    Reach clients where they are: SMS, email, in-app. All unified in one inbox.
                  </p>
                  <ul className="space-y-3 relative">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-foreground/80">SMS with TCPA compliance built-in</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-foreground/80">Email templates with tracking</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-foreground/80">Push notifications for urgent alerts</span>
                    </li>
                  </ul>
                </Card>
              </div>

              {/* Feature Image */}
              <div className="mt-12 rounded-3xl overflow-hidden border border-primary/30 shadow-2xl shadow-primary/20 relative group">
                <img 
                  src={trainerClientGym} 
                  alt="Personal Training Session" 
                  className="w-full h-[400px] object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="backdrop-blur-xl bg-card/80 p-6 rounded-2xl border border-primary/30">
                    <div className="flex items-center gap-4 mb-4">
                      <Target className="h-8 w-8 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Early Alert System</p>
                        <p className="text-2xl font-bold text-primary">
                          <AnimatedCounter end={7} /> Days Warning
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-foreground/80">AI predicts churn before clients ghost</p>
                  </div>
                </div>
              </div>
            </div>
            </TabsContent>

            {/* Gamification Tab */}
            <TabsContent value="gamification" className="animate-fade-in">
              <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-4 mb-12 justify-center">
                  <div className="h-16 w-16 rounded-2xl bg-warning/10 backdrop-blur-sm flex items-center justify-center border border-warning/30 shadow-glow">
                    <MessageSquare className="h-8 w-8 text-warning" />
                  </div>
                  <div>
                    <h3 className="text-4xl md:text-5xl font-bold mb-2">Gamified Client Experience</h3>
                    <p className="text-lg text-muted-foreground">Make fitness addictive through social accountability</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mb-12">
                <Card className="p-8 hover:shadow-glow transition-all duration-300 hover:scale-[1.02] text-center group">
                  <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">🔥</div>
                  <h3 className="text-2xl font-bold mb-4">Streak Tracking</h3>
                  <p className="text-foreground/80 leading-relaxed">
                    Visualize workout consistency. Breaking a streak creates powerful motivation.
                  </p>
                </Card>

                <Card className="p-8 hover:shadow-glow transition-all duration-300 hover:scale-[1.02] text-center group">
                  <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">🏆</div>
                  <h3 className="text-2xl font-bold mb-4">Leaderboards</h3>
                  <p className="text-foreground/80 leading-relaxed">
                    Community rankings turn fitness into friendly competition that drives consistency.
                  </p>
                </Card>

                <Card className="p-8 hover:shadow-glow transition-all duration-300 hover:scale-[1.02] text-center group">
                  <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">⭐</div>
                  <h3 className="text-2xl font-bold mb-4">Achievement Badges</h3>
                  <p className="text-foreground/80 leading-relaxed">
                    Unlock milestones for streaks, PRs, and consistency. Clients love collecting them.
                  </p>
                </Card>

                <Card className="p-8 hover:shadow-glow transition-all duration-300 hover:scale-[1.02] text-center group">
                  <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">💪</div>
                  <h3 className="text-2xl font-bold mb-4">Community Challenges</h3>
                  <p className="text-foreground/80 leading-relaxed">
                    Time-bound challenges create group accountability and higher completion rates.
                  </p>
                </Card>

                <Card className="p-8 hover:shadow-glow transition-all duration-300 hover:scale-[1.02] text-center group">
                  <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">📊</div>
                  <h3 className="text-2xl font-bold mb-4">XP & Leveling</h3>
                  <p className="text-foreground/80 leading-relaxed">
                    Every workout earns XP. Level up to unlock rewards and community status.
                  </p>
                </Card>

                <Card className="p-8 hover:shadow-glow transition-all duration-300 hover:scale-[1.02] text-center group">
                  <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">🎯</div>
                  <h3 className="text-2xl font-bold mb-4">Progress Milestones</h3>
                  <p className="text-foreground/80 leading-relaxed">
                    Celebrate wins automatically. Small wins compound into long-term retention.
                  </p>
                </Card>
              </div>

              {/* Gamification Image */}
              <div className="rounded-3xl overflow-hidden border border-warning/30 shadow-2xl shadow-warning/20 relative group">
                <img 
                  src={groupTraining} 
                  alt="Group Training Class" 
                  className="w-full h-[400px] object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="backdrop-blur-xl bg-card/80 p-6 rounded-2xl border border-warning/30">
                    <div className="grid grid-cols-3 gap-6 text-center">
                      <div>
                        <p className="text-3xl font-bold text-warning mb-1">
                          <AnimatedCounter end={3} />x
                        </p>
                        <p className="text-xs text-muted-foreground">More Consistent</p>
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-success mb-1">
                          <AnimatedCounter end={87} />%
                        </p>
                        <p className="text-xs text-muted-foreground">Engagement Rate</p>
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-primary mb-1">
                          <AnimatedCounter end={92} />%
                        </p>
                        <p className="text-xs text-muted-foreground">Retention</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="animate-fade-in">
              <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-4 mb-12 justify-center">
                  <div className="h-16 w-16 rounded-2xl bg-info/10 backdrop-blur-sm flex items-center justify-center border border-info/30 shadow-glow">
                    <BarChart3 className="h-8 w-8 text-info" />
                  </div>
                  <div>
                    <h3 className="text-4xl md:text-5xl font-bold mb-2">Predictive Analytics Dashboard</h3>
                    <p className="text-lg text-muted-foreground">Make data-driven decisions with real-time insights</p>
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
          </TabsContent>
        </Tabs>
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