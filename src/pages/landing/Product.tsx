import { LandingLayout } from "@/components/landing/LandingLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MonitorSmartphone, BookOpen, Inbox, CalendarClock, Zap, Shield, CheckCircle2, Sparkles, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/landing/ScrollReveal";
import { AnimatedCounter } from "@/components/landing/AnimatedCounter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
                  Launch and Sell Online
                </span>
              </h1>
              <p className="text-2xl text-foreground/80 leading-relaxed font-light max-w-3xl mx-auto">
                A done-for-you website, program catalog, high-converting lead capture, and booking built to convert clients fast.
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
                Four conversion-ready systems that launch your online presence and keep revenue flowing
              </p>
            </div>
          </ScrollReveal>

          <Tabs defaultValue="website" className="w-full">
            <TabsList className="grid w-full max-w-4xl mx-auto grid-cols-2 md:grid-cols-4 h-auto p-2 mb-16 backdrop-blur-xl bg-card/90 shadow-glow">
              <TabsTrigger
                value="website"
                className="flex flex-col items-center gap-2 py-4 data-[state=active]:bg-primary/10 data-[state=active]:shadow-glow transition-all"
              >
                <MonitorSmartphone className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-semibold">Done-for-you Site</div>
                  <div className="text-xs text-muted-foreground hidden sm:block">Launch-ready design</div>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="catalog"
                className="flex flex-col items-center gap-2 py-4 data-[state=active]:bg-info/10 data-[state=active]:shadow-glow transition-all"
              >
                <BookOpen className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-semibold">Program Catalog</div>
                  <div className="text-xs text-muted-foreground hidden sm:block">Sell every offer</div>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="leads"
                className="flex flex-col items-center gap-2 py-4 data-[state=active]:bg-success/10 data-[state=active]:shadow-glow transition-all"
              >
                <Inbox className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-semibold">Lead Capture</div>
                  <div className="text-xs text-muted-foreground hidden sm:block">Forms & nurturing</div>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="booking"
                className="flex flex-col items-center gap-2 py-4 data-[state=active]:bg-warning/10 data-[state=active]:shadow-glow transition-all"
              >
                <CalendarClock className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-semibold">Booking & Payments</div>
                  <div className="text-xs text-muted-foreground hidden sm:block">Calendar-ready</div>
                </div>
              </TabsTrigger>
            </TabsList>

            {/* Website Tab */}
            <TabsContent value="website" className="animate-fade-in">
              <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-4 mb-12 justify-center">
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 backdrop-blur-sm flex items-center justify-center border border-primary/30 shadow-glow">
                    <MonitorSmartphone className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-4xl md:text-5xl font-bold mb-2">Done-for-you Website</h3>
                    <p className="text-lg text-muted-foreground">Launch a modern site without design or dev work</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  <Card className="p-8 hover:shadow-glow transition-all duration-300 hover:scale-[1.02]">
                    <h3 className="text-2xl font-bold mb-3">Brand-ready layout</h3>
                    <p className="text-foreground/80 mb-4 leading-relaxed">
                      Hero, testimonials, pricing, FAQs, and CTAs pre-built for fitness offers. Just swap in your copy.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">SEO tuned</Badge>
                      <Badge variant="outline">Accessibility</Badge>
                      <Badge variant="outline">Lightning fast</Badge>
                    </div>
                  </Card>
                  <Card className="p-8 hover:shadow-glow transition-all duration-300 hover:scale-[1.02]">
                    <h3 className="text-2xl font-bold mb-3">Mobile perfected</h3>
                    <p className="text-foreground/80 mb-4 leading-relaxed">
                      Responsive sections adapt automatically. Buttons, forms, and pricing tables always stay tap-friendly.
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex gap-2 items-start"><CheckCircle2 className="h-4 w-4 text-success mt-0.5" />Device previews included</li>
                      <li className="flex gap-2 items-start"><CheckCircle2 className="h-4 w-4 text-success mt-0.5" />Performance budget baked in</li>
                      <li className="flex gap-2 items-start"><CheckCircle2 className="h-4 w-4 text-success mt-0.5" />One-click publish</li>
                    </ul>
                  </Card>
                  <Card className="p-8 hover:shadow-glow transition-all duration-300 hover:scale-[1.02]">
                    <h3 className="text-2xl font-bold mb-3">Guided setup</h3>
                    <p className="text-foreground/80 mb-4 leading-relaxed">
                      We preload your services, brand colors, and CTA flows so you can go live in days, not weeks.
                    </p>
                    <div className="text-3xl font-bold text-primary"><AnimatedCounter end={10} />x faster launch</div>
                    <p className="text-sm text-muted-foreground">Average time compared to custom builds</p>
                  </Card>
                </div>

                <div className="mt-12 grid md:grid-cols-5 gap-8 items-center">
                  <div className="md:col-span-3 rounded-3xl border border-primary/30 shadow-2xl shadow-primary/20 bg-gradient-to-br from-primary/10 via-background to-background p-6">
                    <div className="rounded-2xl bg-white/90 dark:bg-card/80 p-6 space-y-4">
                      <div className="flex gap-3 items-center">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">TU</div>
                        <div>
                          <p className="text-sm text-muted-foreground">trainu.site</p>
                          <p className="font-semibold">Your studio landing page</p>
                        </div>
                      </div>
                      <div className="h-40 rounded-xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border border-primary/20" />
                      <div className="grid grid-cols-3 gap-4">
                        <div className="h-24 rounded-xl bg-muted/50" />
                        <div className="h-24 rounded-xl bg-muted/50" />
                        <div className="h-24 rounded-xl bg-muted/50" />
                      </div>
                      <div className="h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">Book a Session</div>
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-4">
                    <Card className="p-6">
                      <p className="text-sm text-muted-foreground">Publishing</p>
                      <p className="text-2xl font-bold">Custom domain + SSL handled for you</p>
                    </Card>
                    <Card className="p-6">
                      <p className="text-sm text-muted-foreground">CMS</p>
                      <p className="text-2xl font-bold">Edit copy & offers without touching code</p>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Catalog Tab */}
            <TabsContent value="catalog" className="animate-fade-in">
              <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-4 mb-12 justify-center">
                  <div className="h-16 w-16 rounded-2xl bg-info/10 backdrop-blur-sm flex items-center justify-center border border-info/30 shadow-glow">
                    <BookOpen className="h-8 w-8 text-info" />
                  </div>
                  <div>
                    <h3 className="text-4xl md:text-5xl font-bold mb-2">Program Catalog</h3>
                    <p className="text-lg text-muted-foreground">Show every package, membership, and add-on beautifully</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mb-12">
                  <Card className="p-8 hover:shadow-glow transition-all duration-300 hover:scale-[1.02]">
                    <h3 className="text-2xl font-bold mb-3">Offer templates</h3>
                    <p className="text-foreground/80 leading-relaxed mb-4">Group programs, 1:1 coaching, nutrition add-ons, and trials are pre-modeled.</p>
                    <Badge className="bg-info/10 text-info border-info/30">Tiered pricing built-in</Badge>
                  </Card>
                  <Card className="p-8 hover:shadow-glow transition-all duration-300 hover:scale-[1.02]">
                    <h3 className="text-2xl font-bold mb-3">Media-rich pages</h3>
                    <p className="text-foreground/80 leading-relaxed mb-4">Embed video previews, before/after galleries, and curriculum outlines with drag-and-drop blocks.</p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex gap-2 items-start"><CheckCircle2 className="h-4 w-4 text-success mt-0.5" />FAQ and social proof sections</li>
                      <li className="flex gap-2 items-start"><CheckCircle2 className="h-4 w-4 text-success mt-0.5" />Upsell callouts and add-to-cart</li>
                    </ul>
                  </Card>
                  <Card className="p-8 hover:shadow-glow transition-all duration-300 hover:scale-[1.02]">
                    <h3 className="text-2xl font-bold mb-3">Instant updates</h3>
                    <p className="text-foreground/80 leading-relaxed mb-4">Publish seasonal offers or flash sales in seconds and keep pricing synced everywhere.</p>
                    <div className="flex gap-2">
                      <Badge variant="outline">Inventory limits</Badge>
                      <Badge variant="outline">Promo codes</Badge>
                    </div>
                  </Card>
                </div>

                <div className="rounded-3xl border border-info/30 shadow-2xl shadow-info/20 bg-gradient-to-br from-info/10 via-background to-background p-6">
                  <div className="rounded-2xl bg-white/90 dark:bg-card/80 p-6 grid md:grid-cols-3 gap-6">
                    <div className="space-y-3 md:col-span-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Catalog</p>
                          <p className="text-2xl font-bold">Featured programs</p>
                        </div>
                        <Badge className="bg-info text-info-foreground">Live</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl border border-border bg-muted/50 p-4 space-y-2">
                          <div className="h-24 rounded-lg bg-gradient-to-br from-info/20 to-info/10" />
                          <p className="font-semibold">8-week Lean Build</p>
                          <p className="text-sm text-muted-foreground">$199 · Includes weekly check-ins</p>
                          <div className="flex gap-2 text-xs">
                            <Badge variant="outline">Hybrid</Badge>
                            <Badge variant="outline">Nutrition</Badge>
                          </div>
                        </div>
                        <div className="rounded-xl border border-border bg-muted/50 p-4 space-y-2">
                          <div className="h-24 rounded-lg bg-gradient-to-br from-info/20 to-info/10" />
                          <p className="font-semibold">Small Group Strength</p>
                          <p className="text-sm text-muted-foreground">$35/session · 10 spots</p>
                          <div className="flex gap-2 text-xs">
                            <Badge variant="outline">In-person</Badge>
                            <Badge variant="outline">Limited</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">Add-ons & Bundles</p>
                      <div className="rounded-xl border border-border bg-muted/50 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold">Nutrition Coaching</p>
                          <Badge variant="outline">+$99</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="font-semibold">InBody Scan</p>
                          <Badge variant="outline">+$25</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="font-semibold">Merch Pack</p>
                          <Badge variant="outline">+$45</Badge>
                        </div>
                        <div className="h-10 rounded-full bg-info text-info-foreground flex items-center justify-center font-semibold">Add to checkout</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Lead Capture Tab */}
            <TabsContent value="leads" className="animate-fade-in">
              <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-4 mb-12 justify-center">
                  <div className="h-16 w-16 rounded-2xl bg-success/10 backdrop-blur-sm flex items-center justify-center border border-success/30 shadow-glow">
                    <Inbox className="h-8 w-8 text-success" />
                  </div>
                  <div>
                    <h3 className="text-4xl md:text-5xl font-bold mb-2">Lead Capture & Nurture</h3>
                    <p className="text-lg text-muted-foreground">Convert visitors with forms, quizzes, and automated follow-up</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mb-12">
                  <Card className="p-8 hover:shadow-glow transition-all duration-300 hover:scale-[1.02]">
                    <h3 className="text-2xl font-bold mb-3">High-intent forms</h3>
                    <p className="text-foreground/80 leading-relaxed mb-4">Multi-step forms and goal quizzes segment prospects automatically.</p>
                    <div className="flex gap-2">
                      <Badge variant="outline">Calendly-style UX</Badge>
                      <Badge variant="outline">Abandon save</Badge>
                    </div>
                  </Card>
                  <Card className="p-8 hover:shadow-glow transition-all duration-300 hover:scale-[1.02]">
                    <h3 className="text-2xl font-bold mb-3">Smart routing</h3>
                    <p className="text-foreground/80 leading-relaxed mb-4">Auto-assign leads to locations or trainers based on goals, timezones, and budget.</p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex gap-2 items-start"><CheckCircle2 className="h-4 w-4 text-success mt-0.5" />Round robin or priority rules</li>
                      <li className="flex gap-2 items-start"><CheckCircle2 className="h-4 w-4 text-success mt-0.5" />Instant notifications</li>
                    </ul>
                  </Card>
                  <Card className="p-8 hover:shadow-glow transition-all duration-300 hover:scale-[1.02]">
                    <h3 className="text-2xl font-bold mb-3">Nurture that feels human</h3>
                    <p className="text-foreground/80 leading-relaxed mb-4">Prebuilt email/SMS sequences keep leads warm until they book.</p>
                    <Badge className="bg-success/10 text-success border-success/30">Behavior-based triggers</Badge>
                  </Card>
                </div>

                <div className="rounded-3xl border border-success/30 shadow-2xl shadow-success/20 bg-gradient-to-br from-success/10 via-background to-background p-6">
                  <div className="grid md:grid-cols-2 gap-6 items-center">
                    <div className="rounded-2xl bg-white/90 dark:bg-card/80 p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">Lead capture form</p>
                        <Badge variant="outline">Embed-ready</Badge>
                      </div>
                      <div className="space-y-3">
                        <div className="h-12 rounded-xl border border-border bg-muted/50" />
                        <div className="h-12 rounded-xl border border-border bg-muted/50" />
                        <div className="h-24 rounded-xl border border-border bg-muted/50" />
                      </div>
                      <div className="h-10 rounded-full bg-success text-success-foreground flex items-center justify-center font-semibold">Submit &amp; auto-text</div>
                    </div>
                    <div className="space-y-4">
                      <Card className="p-6">
                        <p className="text-sm text-muted-foreground">Follow-up</p>
                        <p className="text-2xl font-bold">Instant confirmation + day 1-7 nurture</p>
                      </Card>
                      <Card className="p-6">
                        <p className="text-sm text-muted-foreground">Conversion</p>
                        <p className="text-2xl font-bold"><AnimatedCounter end={43} />% average form-to-book rate</p>
                      </Card>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Booking Tab */}
            <TabsContent value="booking" className="animate-fade-in">
              <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-4 mb-12 justify-center">
                  <div className="h-16 w-16 rounded-2xl bg-warning/10 backdrop-blur-sm flex items-center justify-center border border-warning/30 shadow-glow">
                    <CalendarClock className="h-8 w-8 text-warning" />
                  </div>
                  <div>
                    <h3 className="text-4xl md:text-5xl font-bold mb-2">Booking & Payments</h3>
                    <p className="text-lg text-muted-foreground">Scheduling, deposits, and reminders built into your site</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mb-12">
                  <Card className="p-8 hover:shadow-glow transition-all duration-300 hover:scale-[1.02]">
                    <h3 className="text-2xl font-bold mb-3">Calendar integrated</h3>
                    <p className="text-foreground/80 leading-relaxed mb-4">Syncs with Google, Outlook, or your studio calendar to prevent double booking.</p>
                    <Badge variant="outline">Timezone aware</Badge>
                  </Card>
                  <Card className="p-8 hover:shadow-glow transition-all duration-300 hover:scale-[1.02]">
                    <h3 className="text-2xl font-bold mb-3">Collect payments</h3>
                    <p className="text-foreground/80 leading-relaxed mb-4">Require deposits, sell packs, or take subscriptions at checkout.</p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex gap-2 items-start"><CheckCircle2 className="h-4 w-4 text-success mt-0.5" />Tax & fees automatically calculated</li>
                      <li className="flex gap-2 items-start"><CheckCircle2 className="h-4 w-4 text-success mt-0.5" />Save cards on file</li>
                    </ul>
                  </Card>
                  <Card className="p-8 hover:shadow-glow transition-all duration-300 hover:scale-[1.02]">
                    <h3 className="text-2xl font-bold mb-3">Reminders that convert</h3>
                    <p className="text-foreground/80 leading-relaxed mb-4">Automated confirmations, reschedule links, and upsell prompts keep calendars full.</p>
                    <Badge className="bg-warning/10 text-warning border-warning/30">No-show reduction</Badge>
                  </Card>
                </div>

                <div className="rounded-3xl border border-warning/30 shadow-2xl shadow-warning/20 bg-gradient-to-br from-warning/10 via-background to-background p-6">
                  <div className="grid md:grid-cols-3 gap-6 items-center">
                    <div className="md:col-span-2 rounded-2xl bg-white/90 dark:bg-card/80 p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">Booking widget</p>
                        <Badge variant="outline">Embed or standalone</Badge>
                      </div>
                      <div className="h-12 rounded-xl border border-border bg-muted/50" />
                      <div className="grid grid-cols-2 gap-3">
                        <div className="h-20 rounded-xl border border-border bg-muted/50" />
                        <div className="h-20 rounded-xl border border-border bg-muted/50" />
                      </div>
                      <div className="h-10 rounded-full bg-warning text-warning-foreground flex items-center justify-center font-semibold">Complete Booking</div>
                    </div>
                    <div className="space-y-4">
                      <Card className="p-6">
                        <p className="text-sm text-muted-foreground">Automation</p>
                        <p className="text-2xl font-bold">Auto-add bookings to CRM and program access</p>
                      </Card>
                      <Card className="p-6">
                        <p className="text-sm text-muted-foreground">Performance</p>
                        <p className="text-2xl font-bold"><AnimatedCounter end={12} />%+ lift in show-up rate</p>
                      </Card>
                    </div>
                  </div>
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