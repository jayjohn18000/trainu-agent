import { ScrollReveal } from "@/components/landing/ScrollReveal";
import { Globe, ShoppingBag, BarChart3 } from "lucide-react";

const pathwaySteps = [
  {
    icon: Globe,
    title: "Revenue-Ready Website",
    description: "Your branded site powered by my.trainu.us. Professional, mobile-optimized, and built to convert.",
    features: ["Your brand, your clients", "Mobile-optimized checkout", "Built-in booking system"],
    color: "primary",
  },
  {
    icon: ShoppingBag,
    title: "Affiliate & Digital Offers",
    description: "One-click storefront setup. Sell programs and earn from product recommendations automatically.",
    features: ["Affiliate store in minutes", "Sell digital programs", "Passive product income"],
    color: "success",
  },
  {
    icon: BarChart3,
    title: "Automated Follow-Up",
    description: "Recover no-shows while you sleep. Retention becomes recurring revenue.",
    features: ["Smart client check-ins", "At-risk alerts", "Analytics that matter"],
    color: "primary",
  },
];

export function RevenuePathwaySection() {
  return (
    <section className="py-24 bg-gradient-to-b from-card/50 to-transparent">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Your Online Revenue Pathway
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Three pillars that turn your expertise into automated income
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pathwaySteps.map((step, index) => (
            <ScrollReveal key={index} delay={index * 150}>
              <div className={`p-8 rounded-2xl bg-card border border-${step.color}/20 hover:border-${step.color}/40 transition-all h-full flex flex-col`}>
                <div className={`h-16 w-16 rounded-2xl bg-${step.color}/10 flex items-center justify-center mb-6`}>
                  <step.icon className={`h-8 w-8 text-${step.color}`} />
                </div>
                
                <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground mb-6 flex-grow">{step.description}</p>
                
                <ul className="space-y-2">
                  {step.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <div className={`h-1.5 w-1.5 rounded-full bg-${step.color}`} />
                      <span className="text-foreground/80">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
