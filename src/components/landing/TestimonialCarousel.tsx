import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "Personal Trainer, Chicago",
    image: "/placeholder.svg",
    rating: 5,
    text: "TrainU saved me 15 hours a week. The AI knows exactly when to reach out to clients, and they actually respond. My retention rate went from 65% to 92% in 3 months.",
  },
  {
    name: "Marcus Rodriguez",
    role: "Studio Owner, 4 Trainers",
    image: "/placeholder.svg",
    rating: 5,
    text: "We were drowning in no-shows and cancellations. TrainU's predictive alerts caught at-risk clients before they ghosted. Revenue up 34% this quarter.",
  },
  {
    name: "Jessica Lee",
    role: "Fitness Coach, GHL User",
    image: "/placeholder.svg",
    rating: 5,
    text: "The GHL integration is seamless. Setup took 10 minutes. Now my clients are engaged, my schedule is full, and I'm not chasing people down anymore.",
  },
];

export function TestimonialCarousel() {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {testimonials.map((testimonial, index) => (
        <Card key={index} className="p-6 bg-card border-border hover:border-primary/30 transition-all">
          <div className="flex items-center gap-1 mb-4">
            {[...Array(testimonial.rating)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-warning text-warning" />
            ))}
          </div>
          
          <p className="text-muted-foreground mb-6 italic">
            "{testimonial.text}"
          </p>

          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={testimonial.image} />
              <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{testimonial.name}</p>
              <p className="text-xs text-muted-foreground">{testimonial.role}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
