import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Mail, 
  MapPin, 
  Calendar, 
  Dumbbell, 
  Target,
  MessageSquare,
  UserPlus
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Person {
  id: string;
  name: string;
  gym: string;
  location: string;
  joinedDate?: string;
  goals?: string[];
  interests?: string[];
}

interface PersonProfileModalProps {
  person: Person | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PersonProfileModal({ person, open, onOpenChange }: PersonProfileModalProps) {
  if (!person) return null;

  const handleSendMessage = () => {
    toast({
      title: "Message sent",
      description: `Your message to ${person.name} has been sent.`,
    });
    onOpenChange(false);
  };

  const handleConnect = () => {
    toast({
      title: "Connection request sent",
      description: `Your request to connect with ${person.name} has been sent.`,
    });
  };

  const initials = person.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] card-elevated">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <DialogTitle className="text-2xl">{person.name}</DialogTitle>
              <DialogDescription className="flex flex-col gap-1 mt-2">
                <span className="flex items-center gap-2 text-foreground/80">
                  <Dumbbell className="h-4 w-4" />
                  {person.gym}
                </span>
                <span className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {person.location}
                </span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        <div className="space-y-4">
          {/* Member Info */}
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Member Since
            </h4>
            <p className="text-sm text-muted-foreground">
              {person.joinedDate || "January 2024"}
            </p>
          </div>

          {/* Goals */}
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Fitness Goals
            </h4>
            <div className="flex flex-wrap gap-2">
              {(person.goals || ["Strength Training", "Weight Loss"]).map((goal) => (
                <Badge key={goal} variant="secondary" className="status-info">
                  {goal}
                </Badge>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div>
            <h4 className="text-sm font-semibold mb-2">Interests</h4>
            <div className="flex flex-wrap gap-2">
              {(person.interests || ["Powerlifting", "CrossFit", "Nutrition"]).map(
                (interest) => (
                  <Badge key={interest} variant="outline">
                    {interest}
                  </Badge>
                )
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            onClick={handleSendMessage} 
            className="flex-1 transition-smooth hover:shadow-glow"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Send Message
          </Button>
          <Button 
            variant="outline" 
            onClick={handleConnect}
            className="transition-smooth hover:border-primary"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Connect
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
