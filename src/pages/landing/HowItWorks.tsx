import { LandingLayout } from "@/components/landing/LandingLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, PhoneCall, Upload, Rocket, ThumbsUp, Play, MessageSquare, FileText, Clock3 } from "lucide-react";
import { ScrollReveal } from "@/components/landing/ScrollReveal";
import gradientBg from "@/assets/gradient-mesh-bg.svg";
import groupTrainingImage from "@/assets/group-training-class.jpg";
const steps = [{
  title: "Ad or lead opts in",
  description: "Prospects claim the offer from your ad or funnel. We capture intent and route them instantly.",
  duration: "Instant",
  icon: Zap
}, {
  title: "15-min setup call",
  description: "We book a quick alignment call to lock messaging, offer positioning, and the follow-up plan.",
  duration: "15 min",
  icon: PhoneCall
}, {
  title: "Upload your assets",
  description: "Drop brand voice notes, testimonials, and offer details. We use them to personalize every touchpoint.",
  duration: "Same day",
  icon: Upload
}, {
  title: "24-hour draft build",
  description: "We draft the full outreach sequence (SMS, email, DMs) plus landing copy and automations within 24 hours.",
  duration: "24 hours",
  icon: Rocket
}, {
  title: "Approve and launch",
  description: "Review the draft, request tweaks, and go live. We handle sending, routing, and attribution tracking.",
  duration: "Go live",
  icon: ThumbsUp
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
            <a href="https://my.trainu.us/claim" target="_blank" rel="noreferrer">
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

      {/* How it works steps */}
      <section className="py-16 bg-card/50">
        <div className="container mx-auto px-4">
          <ScrollReveal className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
              <Clock3 className="h-4 w-4" />
              24-hour build
            </div>
            <h2 className="text-3xl font-bold mb-3">The new launch flow</h2>
            <p className="text-muted-foreground">
              Simple, compressed, and fully managed. You stay in approvals; we handle execution.
            </p>
          </ScrollReveal>

          <div className="grid lg:grid-cols-5 gap-6">
            {steps.map((step, index) => <ScrollReveal key={step.title} delay={index * 80}>
                <Card className="p-5 h-full flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <step.icon className="h-5 w-5" />
                    </div>
                    <div className="text-sm font-semibold text-muted-foreground">Step {index + 1}</div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg leading-tight">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                  <Badge variant="outline" className="w-fit text-xs">{step.duration}</Badge>
                </Card>
              </ScrollReveal>)}
          </div>
        </div>
      </section>

      {/* Booking / VSL embed */}
      <section id="booking" className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <ScrollReveal>
              <div className="space-y-4">
                <h2 className="text-3xl font-bold">Claim your setup call</h2>
                <p className="text-muted-foreground text-lg">
                  Pick a time for your 15-minute setup call or watch the VSL. We only need brand voice notes and your current offer to build the first draft.
                </p>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <MessageSquare className="h-4 w-4 text-primary mt-0.5" />
                    <span>Live walkthrough of the ad/lead handoff, follow-up script, and routing.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FileText className="h-4 w-4 text-primary mt-0.5" />
                    <span>Checklist of assets to drop (brand voice, offers, testimonials, calendar links).</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Rocket className="h-4 w-4 text-primary mt-0.5" />
                    <span>24-hour draft promise with approval-ready copy for SMS, email, and DMs.</span>
                  </li>
                </ul>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={150}>
              <Card className="p-4 bg-muted/40 border-dashed h-full flex items-center justify-center">
                <div className="w-full aspect-video rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-sm text-center px-6">
                  Embed your booking widget or VSL here (Calendly, GHL calendar, or video player)
                </div>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Visual Reference Flow */}
      

      {/* Demo CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src={groupTrainingImage} alt="" className="w-full h-full object-cover" />
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
              <a href="https://my.trainu.us/claim" target="_blank" rel="noreferrer">
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