import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, MapPin, Video } from "lucide-react";
import sessionTypes from "@/fixtures/sessionTypes.json";
import trainers from "@/fixtures/trainers.json";
import { BookingData } from "./BookingWizard";

type Props = {
  onNext: () => void;
  onSelect: (data: Partial<BookingData>) => void;
  selected?: any;
};

export function SessionTypeStep({ onNext, onSelect, selected }: Props) {
  const handleSelect = (sessionType: any) => {
    const trainer = trainers.find((t) => t.id === sessionType.trainerId);
    onSelect({ sessionType, trainer });
    onNext();
  };

  return (
    <div className="space-y-4 py-4">
      <p className="text-sm text-muted-foreground">
        Select the type of session you'd like to book
      </p>

      <div className="grid gap-3 max-h-[60vh] overflow-y-auto pr-2">
        {sessionTypes.map((session) => {
          const trainer = trainers.find((t) => t.id === session.trainerId);
          
          return (
            <Card
              key={session.id}
              className="p-4 cursor-pointer hover:border-primary transition-all hover-scale"
              onClick={() => handleSelect(session)}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold">{session.title}</h3>
                  <p className="text-sm text-muted-foreground">with {trainer?.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">${(session.price / 100).toFixed(0)}</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-3">{session.description}</p>

              <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {session.duration} min
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {session.capacity === 1 ? "1-on-1" : `Up to ${session.capacity}`}
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  {session.mode === "virtual" ? (
                    <><Video className="h-3 w-3" /> Virtual</>
                  ) : (
                    <><MapPin className="h-3 w-3" /> In-Person</>
                  )}
                </Badge>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
