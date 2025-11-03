import { LandingLayout } from "@/components/landing/LandingLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MessageSquare, Phone, MapPin } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How long does setup take?",
    answer: "Most trainers are fully operational within 30 minutes. Connect your GHL account (2 min), customize AI settings (5 min), and you're live. Our team provides hands-on onboarding for all new users.",
  },
  {
    question: "Do I need technical knowledge?",
    answer: "No! If you can use GoHighLevel, you can use TrainU. Our interface is designed for non-technical trainers. Plus, we offer live chat support and video tutorials.",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes. No long-term contracts. Cancel from your account settings and it takes effect at the end of your billing cycle. We'll even help export your data.",
  },
  {
    question: "What if my clients don't use the app?",
    answer: "They don't have to! AI drafts work via SMS and email too. The gamification features are opt-in bonuses that boost engagement when clients do download the app.",
  },
  {
    question: "How accurate is the churn prediction?",
    answer: "Our AI correctly identifies 78% of at-risk clients 7 days before they churn, based on analysis of 50,000+ trainer-client relationships. Accuracy improves as the AI learns your specific patterns.",
  },
];

export default function Contact() {
  return (
    <LandingLayout>
      {/* Hero */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">
            Let's{" "}
            <span className="bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
              Talk
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Whether you need a demo, have questions, or want custom pricing—we're here to help.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Form */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
              <Card className="p-6">
                <form className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="Sarah Mitchell" className="mt-2" />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="sarah@example.com" className="mt-2" />
                  </div>

                  <div>
                    <Label htmlFor="business">Business Type</Label>
                    <select 
                      id="business" 
                      className="w-full mt-2 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">Select one...</option>
                      <option value="solo">Solo Trainer (1-15 clients)</option>
                      <option value="growing">Growing Business (16-50 clients)</option>
                      <option value="studio">Studio/Multi-Trainer (50+ clients)</option>
                      <option value="ghl">GoHighLevel Agency</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Tell us what you need help with..." 
                      className="mt-2 min-h-[120px]"
                    />
                  </div>

                  <Button type="submit" className="w-full shadow-glow">
                    Send Message
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    We typically respond within 24 hours during business days
                  </p>
                </form>
              </Card>
            </div>

            {/* Right Side */}
            <div className="space-y-8">
              {/* Calendly Embed */}
              <div>
                <h2 className="text-2xl font-bold mb-6">Book a Demo</h2>
                <Card className="p-6">
                  <p className="text-muted-foreground mb-4">
                    Schedule a 15-minute walkthrough with our team. We'll show you the platform live and answer your questions.
                  </p>
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center mb-4">
                    <p className="text-sm text-muted-foreground">[Calendly Embed]</p>
                  </div>
                  <Button variant="outline" className="w-full">
                    Schedule Demo
                  </Button>
                </Card>
              </div>

              {/* Contact Info */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Other Ways to Reach Us</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Email</p>
                      <a href="mailto:hello@trainu.com" className="text-sm text-muted-foreground hover:text-primary">
                        hello@trainu.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Live Chat</p>
                      <p className="text-sm text-muted-foreground">
                        Mon-Fri, 9am-6pm CT
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Phone</p>
                      <a href="tel:+1-555-TRAINU" className="text-sm text-muted-foreground hover:text-primary">
                        +1 (555) TRAINU
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Office</p>
                      <p className="text-sm text-muted-foreground">
                        Chicago, IL<br />
                        Remote-first team
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Social */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Connect With Us</h3>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" className="flex-1">
                    Twitter
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    LinkedIn
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Instagram
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Quick Answers</h2>
            <p className="text-center text-muted-foreground mb-12">
              Common questions we hear from trainers considering TrainU
            </p>
            
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border border-border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="text-center mt-8">
              <p className="text-muted-foreground mb-4">
                Don't see your question? We're happy to help.
              </p>
              <Button variant="outline">
                View All FAQs
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Support */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Need Support?</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 text-center">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Live Chat</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get instant help from our team during business hours
                </p>
                <Button size="sm" variant="outline" className="w-full">
                  Start Chat
                </Button>
              </Card>

              <Card className="p-6 text-center">
                <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-6 w-6 text-success" />
                </div>
                <h3 className="font-semibold mb-2">Help Center</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Browse our knowledge base and video tutorials
                </p>
                <Button size="sm" variant="outline" className="w-full">
                  Visit Help Center
                </Button>
              </Card>

              <Card className="p-6 text-center">
                <div className="h-12 w-12 rounded-xl bg-info/10 flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-6 w-6 text-info" />
                </div>
                <h3 className="font-semibold mb-2">Priority Support</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Growth & Pro plans get phone support
                </p>
                <Button size="sm" variant="outline" className="w-full">
                  Upgrade Plan
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
