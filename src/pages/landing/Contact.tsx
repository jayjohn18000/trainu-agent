import { useState } from "react";
import { Link } from "react-router-dom";
import { LandingLayout } from "@/components/landing/LandingLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, MessageSquare, Phone, MapPin, Instagram, Facebook } from "lucide-react";
import { FaXTwitter, FaTiktok } from "react-icons/fa6";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollReveal } from "@/components/landing/ScrollReveal";
import trainerOverheadImage from "@/assets/trainer-client-overhead.jpg";

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
  const [transactionalConsent, setTransactionalConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  return (
    <LandingLayout>
      {/* Hero */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover object-[center_35%]"
          >
            <source src="/contact-hero-video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/70" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
            Let's{" "}
            <span className="bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
              Talk
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Whether you need a demo, have questions, or want custom pricing—we're here to help.
          </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Left Column */}
            <div className="space-y-8">
              {/* Connect With Us */}
              <ScrollReveal>
                <Card className="p-6 hover:shadow-glow transition-all">
                  <h3 className="font-semibold mb-4">Connect With Us</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => window.open('https://twitter.com/official_trainu', '_blank')}
                      className="gap-2"
                    >
                      <FaXTwitter className="h-4 w-4" />
                      X (Twitter)
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open('https://instagram.com/official.trainu', '_blank')}
                      className="gap-2"
                    >
                      <Instagram className="h-4 w-4" />
                      Instagram
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open('https://tiktok.com/@trainu8', '_blank')}
                      className="gap-2"
                    >
                      <FaTiktok className="h-4 w-4" />
                      TikTok
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open('https://facebook.com/TrainU', '_blank')}
                      className="gap-2"
                    >
                      <Facebook className="h-4 w-4" />
                      Facebook
                    </Button>
                  </div>
                </Card>
              </ScrollReveal>

              {/* Form */}
              <ScrollReveal delay={100}>
              <div>
                <h2 className="text-2xl font-bold mb-6">Book Your 15-Minute Setup Call</h2>
                <Card className="p-6 hover:shadow-glow transition-all">
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
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" placeholder="(555) 123-4567" className="mt-2" />
                  </div>

                  <div>
                    <Label htmlFor="instagram">Instagram Handle</Label>
                    <Input id="instagram" placeholder="@yourhandle" className="mt-2" />
                  </div>

                  <div>
                    <Label htmlFor="niche">Niche</Label>
                    <Input id="niche" placeholder="Online fitness, yoga studio, etc." className="mt-2" />
                  </div>

                  <div>
                    <Label htmlFor="programs">Top Programs You Want to Sell</Label>
                    <Textarea
                      id="programs"
                      placeholder="8-week shred, nutrition coaching, hybrid memberships, etc."
                      className="mt-2 min-h-[120px]"
                    />
                  </div>

                  {/* Consent Checkboxes */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Checkbox 
                        id="transactional" 
                        checked={transactionalConsent}
                        onCheckedChange={(checked) => setTransactionalConsent(checked as boolean)}
                        className="mt-1"
                      />
                      <Label htmlFor="transactional" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                        By checking this box, I consent to receive transactional messages related to my account, orders, or services I have requested. These messages may include appointment reminders, order confirmations, and account notifications among others. Message frequency may vary. Message & Data rates may apply. Reply HELP for help or STOP to opt-out.
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <Checkbox 
                        id="marketing" 
                        checked={marketingConsent}
                        onCheckedChange={(checked) => setMarketingConsent(checked as boolean)}
                        className="mt-1"
                      />
                      <Label htmlFor="marketing" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                        By checking this box, I consent to receive marketing and promotional messages, including special offers, discounts, new product updates among others. Message frequency may vary. Message & Data rates may apply. Reply HELP for help or STOP to opt-out.
                      </Label>
                    </div>
                  </div>

                  <Button type="submit" className="w-full shadow-glow">
                    Book Your 15-Minute Setup Call
                  </Button>

                  {/* Privacy & Terms Links */}
                  <p className="text-xs text-muted-foreground text-center">
                    <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                    {" | "}
                    <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
                  </p>

                  <p className="text-xs text-muted-foreground text-center">
                    We typically respond within 24 hours during business days
                  </p>
                </form>
              </Card>
              </div>
              </ScrollReveal>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Calendly Embed */}
              <ScrollReveal>
              <div>
                <h2 className="text-2xl font-bold mb-6">Book a Demo</h2>
                <Card className="p-6 hover:shadow-glow transition-all">
                  <p className="text-muted-foreground mb-4">
                    Schedule a 15-minute walkthrough with our team. We'll show you the platform live and answer your questions.
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open('https://api.leadconnectorhq.com/widget/booking/PPgbXZSX9ehklDQVyd8Q', '_blank')}
                  >
                    Schedule Demo
                  </Button>
                </Card>
              </div>
              </ScrollReveal>

              {/* Contact Info */}
              <ScrollReveal delay={100}>
              <Card className="p-6 hover:shadow-glow transition-all">
                <h3 className="font-semibold mb-4">Other Ways to Reach Us</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Email</p>
                      <a href="mailto:hello@trainu.us" className="text-sm text-muted-foreground hover:text-primary">
                        hello@trainu.us
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
                      <a href="tel:+18474570782" className="text-sm text-muted-foreground hover:text-primary">
                        +1 847-457-0782
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
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <ScrollReveal>
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
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Support */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src={trainerOverheadImage} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal>
              <h2 className="text-3xl font-bold text-center mb-12">Need Support?</h2>
            </ScrollReveal>
            
            <div className="grid md:grid-cols-3 gap-6">
              <ScrollReveal delay={100}>
              <Card className="p-6 text-center backdrop-blur-xl bg-card/90 hover:shadow-glow transition-all">
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
              </ScrollReveal>

              <ScrollReveal delay={200}>
              <Card className="p-6 text-center backdrop-blur-xl bg-card/90 hover:shadow-glow transition-all">
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
              </ScrollReveal>

              <ScrollReveal delay={300}>
              <Card className="p-6 text-center backdrop-blur-xl bg-card/90 hover:shadow-glow transition-all">
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
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
