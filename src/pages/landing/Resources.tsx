import { LandingLayout } from "@/components/landing/LandingLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { BookOpen, TrendingUp, Users, Brain, Download, Mail } from "lucide-react";
import { ScrollReveal } from "@/components/landing/ScrollReveal";
import { AnimatedCounter } from "@/components/landing/AnimatedCounter";
import trainerYogaImage from "@/assets/trainer-home-yoga.jpg";
import gradientBg from "@/assets/gradient-mesh-bg.svg";

const articles = [
  {
    title: "The Silent Churn Crisis: Why 30% of Trainers Lose Clients Without Warning",
    excerpt: "Research shows most trainers don't realize a client is gone until 2 weeks after they've mentally checked out. Learn the early warning signs.",
    category: "Retention",
    readTime: "8 min read",
    date: "Dec 15, 2024",
    icon: TrendingUp,
  },
  {
    title: "AI vs. Human Touch: Finding the Balance in Client Communication",
    excerpt: "AI drafts 95% of messages, but trainers still approve 100%. How to maintain authentic relationships while automating follow-up.",
    category: "AI Strategy",
    readTime: "6 min read",
    date: "Dec 10, 2024",
    icon: Brain,
  },
  {
    title: "The First 30 Days: Onboarding Strategies That Drive 90%+ Retention",
    excerpt: "New clients who complete 3+ sessions in their first month have 8x higher LTV. Here's the exact workflow top trainers use.",
    category: "Growth",
    readTime: "10 min read",
    date: "Dec 5, 2024",
    icon: Users,
  },
  {
    title: "Gamification Psychology: Why Streaks Work Better Than Discounts",
    excerpt: "Loss aversion is a powerful motivator. How fitness gamification taps into behavioral economics to drive consistency.",
    category: "Engagement",
    readTime: "7 min read",
    date: "Nov 28, 2024",
    icon: TrendingUp,
  },
  {
    title: "TCPA Compliance for Fitness Professionals: What You MUST Know",
    excerpt: "SMS marketing laws are strict. Avoid $500-$1500 fines per message with this compliance checklist.",
    category: "Legal",
    readTime: "5 min read",
    date: "Nov 20, 2024",
    icon: BookOpen,
  },
  {
    title: "GoHighLevel Integration Guide: 10-Minute Setup Walkthrough",
    excerpt: "Step-by-step OAuth connection, contact sync, and workflow automation for GHL users.",
    category: "Technical",
    readTime: "12 min read",
    date: "Nov 15, 2024",
    icon: Brain,
  },
];

const resources = [
  {
    title: "2025 Fitness Industry Retention Benchmark Report",
    description: "Analysis of 10,000+ trainer-client relationships across 500+ businesses. Download the data.",
    type: "PDF Report",
    icon: Download,
  },
  {
    title: "At-Risk Client Intervention Playbook",
    description: "12 proven message templates for re-engaging clients at different risk levels.",
    type: "Template Pack",
    icon: Download,
  },
  {
    title: "ROI Calculator Spreadsheet",
    description: "Model your potential revenue impact from improved retention rates.",
    type: "Excel Template",
    icon: Download,
  },
];

export default function Resources() {
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
            Learn How to{" "}
            <span className="bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
              Retain More Clients
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Evidence-based strategies, case studies, and tools to grow your training business.
          </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Featured Article */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal>
            <Card className="overflow-hidden border-primary/20 hover:shadow-glow transition-all">
              <div className="grid md:grid-cols-2">
                <div className="p-8 md:p-12">
                  <Badge className="mb-4">Featured</Badge>
                  <h2 className="text-3xl font-bold mb-4">
                    The Science of Client Retention: 2025 Industry Report
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    We analyzed 50,000+ trainer-client interactions to identify the exact patterns that predict churn 7 days before it happens. Plus: ROI analysis showing trainers save $42,000 annually with AI-powered retention.
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                    <span>15 min read</span>
                    <span>•</span>
                    <span>Dec 18, 2024</span>
                  </div>
                  <Button>Read Article</Button>
                </div>
                <div className="bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center p-12">
                  <TrendingUp className="h-32 w-32 text-primary" />
                </div>
              </div>
            </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Article Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <h2 className="text-3xl font-bold mb-12">Latest Articles</h2>
          </ScrollReveal>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, index) => (
              <ScrollReveal key={index} delay={index * 100}>
              <Card className="p-6 hover:border-primary/30 transition-all group cursor-pointer hover:scale-[1.02]">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <article.icon className="h-6 w-6 text-primary" />
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="text-xs">{article.category}</Badge>
                  <span className="text-xs text-muted-foreground">{article.readTime}</span>
                </div>

                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
                
                <p className="text-sm text-muted-foreground mb-4">
                  {article.excerpt}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="text-xs text-muted-foreground">{article.date}</span>
                  <Button variant="ghost" size="sm" className="group-hover:text-primary">
                    Read →
                  </Button>
                </div>
              </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Downloadable Resources */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-center">Free Resources</h2>
            <p className="text-center text-muted-foreground mb-12">
              Templates, calculators, and guides to implement retention strategies today
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {resources.map((resource, index) => (
                <Card key={index} className="p-6 text-center hover:border-primary/30 transition-all">
                  <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <resource.icon className="h-8 w-8 text-primary" />
                  </div>
                  <Badge variant="outline" className="mb-3">{resource.type}</Badge>
                  <h3 className="font-semibold mb-2">{resource.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{resource.description}</p>
                  <Button size="sm" variant="outline" className="w-full">
                    Download
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src={trainerYogaImage} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal>
          <Card className="max-w-3xl mx-auto p-12 backdrop-blur-xl bg-card/90 border-primary/20 shadow-glow">
            <div className="text-center mb-8">
              <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Get Weekly Retention Insights</h2>
              <p className="text-muted-foreground">
                Join <AnimatedCounter end={1200} suffix="+" duration={1500} /> trainers getting actionable tips, case studies, and industry data every Tuesday.
              </p>
            </div>

            <form className="flex flex-col sm:flex-row gap-3">
              <Input 
                type="email" 
                placeholder="your.email@example.com" 
                className="flex-1"
              />
              <Button type="submit" className="shadow-glow">
                Subscribe
              </Button>
            </form>

            <p className="text-xs text-muted-foreground text-center mt-4">
              No spam. Unsubscribe anytime. We respect your inbox.
            </p>
          </Card>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to Implement These Strategies?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              TrainU automates everything you just read about. Start your 14-day free trial.
            </p>
            <Link to="/login">
              <Button size="lg" className="shadow-glow">
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
