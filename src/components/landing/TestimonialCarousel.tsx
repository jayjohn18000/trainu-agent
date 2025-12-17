import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "Personal Trainer, Chicago",
    image: "/placeholder.svg",
    rating: 5,
    text: "TrainU added $1,400/mo to my income through the affiliate store alone. Plus my retention rate went from 65% to 92%—that's another $2k I'm not losing.",
  },
  {
    name: "Marcus Rodriguez",
    role: "Studio Owner, 4 Trainers",
    image: "/placeholder.svg",
    rating: 5,
    text: "My starter program sold 47 copies on autopilot last month. TrainU's no-show recovery pays for itself—revenue up 34% this quarter.",
  },
  {
    name: "Jessica Lee",
    role: "Online Coach",
    image: "/placeholder.svg",
    rating: 5,
    text: "I set up my affiliate store in 10 minutes. Now I earn while I sleep. The automated follow-ups keep clients engaged so they keep buying.",
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
