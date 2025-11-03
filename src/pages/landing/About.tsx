import { LandingLayout } from "@/components/landing/LandingLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Target, Users, TrendingUp, Heart, Zap, Play } from "lucide-react";

const milestones = [
  { year: "2022", event: "Founded", description: "Two frustrated trainers lose 40% of clients to silent churn" },
  { year: "2023", event: "Beta Launch", description: "50 trainers pilot AI-powered retention automation" },
  { year: "2023", event: "Product-Market Fit", description: "92% of beta users renew. Average 30% revenue increase" },
  { year: "2024", event: "GHL Integration", description: "Native GoHighLevel connector for seamless workflows" },
  { year: "2024", event: "100+ Trainers", description: "Crossed 100 active trainers, 3,000+ clients retained" },
  { year: "2025", event: "Series A", description: "Raised $8M to scale AI and expand to studios/gyms" },
];

const values = [
  {
    icon: Heart,
    title: "Human-First AI",
    description: "Technology should amplify relationships, not replace them. We believe in AI-assisted, trainer-approved communication.",
  },
  {
    icon: Target,
    title: "Evidence-Led",
    description: "Every feature backed by data. We A/B test relentlessly and share what works (and what doesn't) with our community.",
  },
  {
    icon: TrendingUp,
    title: "Transparency",
    description: "No hidden fees, no vendor lock-in. We publish our retention benchmarks and product roadmap publicly.",
  },
  {
    icon: Users,
    title: "Trainer Success",
    description: "Our only metric that matters: are trainers growing their businesses and losing fewer clients? Everything else is noise.",
  },
];

export default function About() {
  return (
    <LandingLayout>
      {/* Hero */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">
            We're on a Mission to{" "}
            <span className="bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
              Stop Silent Churn
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Every day, talented trainers lose clients not because they're bad coaches, but because they're drowning in admin work and can't catch warning signs early enough.
          </p>
        </div>
      </section>

      {/* Origin Story */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
              <div>
                <h2 className="text-3xl font-bold mb-4">The Problem We Lived</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    In 2022, our founders Sarah and Marcus were running thriving training businesses in Chicago. Both had waitlists for new clients. Both were working 70-hour weeks.
                  </p>
                  <p>
                    Then they noticed something: despite full schedules, they were losing 30-40% of clients every quarter. Not because of bad training—because clients quietly disengaged and they didn't catch it in time.
                  </p>
                  <p>
                    They'd spend 15+ hours weekly on admin: texting check-ins, tracking no-shows, manually reviewing who needed attention. By the time they noticed a problem, it was too late.
                  </p>
                  <p className="font-semibold text-foreground">
                    The turning point: Sarah lost a VIP client she'd trained for 2 years. Not because the client was unhappy—Sarah just missed the early warning signs while buried in admin work.
                  </p>
                </div>
              </div>
              <Card className="p-8 bg-gradient-to-br from-danger/10 to-danger/5 border-danger/20">
                <h3 className="text-xl font-semibold mb-6">The Real Cost</h3>
                <div className="space-y-6">
                  <div>
                    <p className="text-4xl font-bold text-danger mb-2">40%</p>
                    <p className="text-sm text-muted-foreground">Average annual churn rate for solo trainers</p>
                  </div>
                  <div>
                    <p className="text-4xl font-bold text-warning mb-2">15hrs</p>
                    <p className="text-sm text-muted-foreground">Weekly time wasted on manual admin</p>
                  </div>
                  <div>
                    <p className="text-4xl font-bold text-muted-foreground mb-2">$42k</p>
                    <p className="text-sm text-muted-foreground">Lost revenue per trainer per year</p>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <h3 className="text-xl font-semibold mb-4">The Insight</h3>
              <p className="text-muted-foreground mb-4">
                What if AI could analyze client behavior 24/7, predict churn 7 days early, and draft personalized interventions—while trainers maintained full control?
              </p>
              <p className="text-muted-foreground">
                Not "AI replacing trainers." Not "chatbots pretending to be human." But{" "}
                <span className="font-semibold text-foreground">AI-assisted, trainer-approved automation that scales human relationships.</span>
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Our Journey</h2>
            
            <div className="space-y-6">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex gap-6 items-start">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {milestone.year.slice(-2)}
                    </div>
                  </div>
                  <Card className="flex-1 p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{milestone.event}</h3>
                      <Badge variant="outline">{milestone.year}</Badge>
                    </div>
                    <p className="text-muted-foreground">{milestone.description}</p>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-center">Our Values</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              These aren't buzzwords on a wall. They're the principles that guide every product decision and customer interaction.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {values.map((value, index) => (
                <Card key={index} className="p-6">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Built by Trainers, for Trainers</h2>
            <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">
              Our founding team combines 30+ years of training experience with backgrounds in AI/ML from Google and Meta.
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-6 text-center">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mx-auto mb-4 flex items-center justify-center text-4xl">
                  👩‍💼
                </div>
                <h3 className="font-semibold mb-1">Sarah Mitchell</h3>
                <p className="text-sm text-primary mb-2">Co-Founder & CEO</p>
                <p className="text-xs text-muted-foreground">
                  10 years training, ex-Google AI. Lost too many clients to build this.
                </p>
              </Card>

              <Card className="p-6 text-center">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mx-auto mb-4 flex items-center justify-center text-4xl">
                  👨‍💻
                </div>
                <h3 className="font-semibold mb-1">Marcus Rodriguez</h3>
                <p className="text-sm text-primary mb-2">Co-Founder & CTO</p>
                <p className="text-xs text-muted-foreground">
                  Studio owner, ex-Meta ML. Built AI to scale relationships.
                </p>
              </Card>

              <Card className="p-6 text-center">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mx-auto mb-4 flex items-center justify-center text-4xl">
                  👨‍🔬
                </div>
                <h3 className="font-semibold mb-1">Dr. Alex Chen</h3>
                <p className="text-sm text-primary mb-2">Head of AI/ML</p>
                <p className="text-xs text-muted-foreground">
                  PhD ML, Stanford. Predictive models for human behavior.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Video */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Button size="lg" className="shadow-glow">
                  <Play className="h-6 w-6 mr-2" />
                  Watch Our Story (3 min)
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Impact So Far</h2>
            
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="p-6 text-center">
                <p className="text-4xl font-bold text-primary mb-2">100+</p>
                <p className="text-sm text-muted-foreground">Active Trainers</p>
              </Card>

              <Card className="p-6 text-center">
                <p className="text-4xl font-bold text-success mb-2">3,000+</p>
                <p className="text-sm text-muted-foreground">Clients Retained</p>
              </Card>

              <Card className="p-6 text-center">
                <p className="text-4xl font-bold text-warning mb-2">50k+</p>
                <p className="text-sm text-muted-foreground">AI Messages Drafted</p>
              </Card>

              <Card className="p-6 text-center">
                <p className="text-4xl font-bold text-info mb-2">92%</p>
                <p className="text-sm text-muted-foreground">Satisfaction Rate</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center p-12 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
            <h2 className="text-4xl font-bold mb-4">Join the Movement</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Help us build the future of client retention. Start your free trial or join our team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button size="lg" className="shadow-glow">
                  Start Free Trial
                </Button>
              </Link>
              <Button size="lg" variant="outline">
                <Users className="h-5 w-5 mr-2" />
                We're Hiring
              </Button>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
