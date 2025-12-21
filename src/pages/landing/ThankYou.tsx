import { Link } from "react-router-dom";
import { LandingLayout } from "@/components/landing/LandingLayout";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail, FileText, Calendar } from "lucide-react";
import { ScrollReveal } from "@/components/landing/ScrollReveal";

export default function ThankYou() {
  return (
    <LandingLayout>
      <section className="min-h-[80vh] flex items-center justify-center py-20">
        <div className="container mx-auto px-4">
          <ScrollReveal className="max-w-2xl mx-auto text-center">
            {/* Success Icon */}
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                  <CheckCircle className="h-14 w-14 text-primary" />
                </div>
                <div className="absolute inset-0 h-24 w-24 rounded-full bg-primary/10 animate-ping" />
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Thanks—You're{" "}
              <span className="bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
                Booked!
              </span>
            </h1>

            {/* Reassuring Subtext */}
            <p className="text-xl text-muted-foreground mb-12">
              You'll get a confirmation, reminders, and a quick pre-call questionnaire.
            </p>

            {/* What Happens Next */}
            <div className="bg-card/50 border border-border rounded-2xl p-8 mb-10">
              <h2 className="text-lg font-semibold mb-6 text-foreground">What happens next?</h2>
              <div className="grid gap-6 text-left">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Check your inbox</p>
                    <p className="text-sm text-muted-foreground">
                      Confirmation with calendar invite is on its way
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Fill out the quick questionnaire</p>
                    <p className="text-sm text-muted-foreground">
                      We'll send a short form so we can prep for your call
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">We'll see you on the call</p>
                    <p className="text-sm text-muted-foreground">
                      15 minutes to get you set up and answer any questions
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <Button asChild variant="outline" size="lg">
              <Link to="/">Back to Home</Link>
            </Button>
          </ScrollReveal>
        </div>
      </section>
    </LandingLayout>
  );
}
