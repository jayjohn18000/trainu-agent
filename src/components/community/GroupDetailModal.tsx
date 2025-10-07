import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Users, 
  Calendar, 
  MapPin,
  Clock,
  TrendingUp,
  MessageSquare
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Group {
  name: string;
  members: number;
  description: string;
  schedule?: string;
  location?: string;
  memberList?: { name: string; role?: string }[];
  activities?: string[];
}

interface GroupDetailModalProps {
  group: Group | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isJoined: boolean;
  onToggleJoin: () => void;
}

export function GroupDetailModal({ 
  group, 
  open, 
  onOpenChange,
  isJoined,
  onToggleJoin 
}: GroupDetailModalProps) {
  if (!group) return null;

  const handleMessageGroup = () => {
    toast({
      title: "Opening group chat",
      description: `Starting conversation with ${group.name}`,
    });
    onOpenChange(false);
  };

  const memberList = group.memberList || [
    { name: "Sarah Johnson", role: "Admin" },
    { name: "Mike Chen", role: "Moderator" },
    { name: "Emily Davis" },
    { name: "James Wilson" },
    { name: "Lisa Anderson" },
  ];

  const activities = group.activities || [
    "Group workouts",
    "Nutrition discussions",
    "Progress sharing",
    "Weekly challenges"
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] card-elevated max-h-[85vh]">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Users className="h-8 w-8 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl">{group.name}</DialogTitle>
              <DialogDescription className="mt-2">
                {group.description}
              </DialogDescription>
              <div className="flex items-center gap-4 mt-3">
                <Badge variant="secondary" className="status-success">
                  <Users className="h-3 w-3 mr-1" />
                  {group.members} members
                </Badge>
                {isJoined && (
                  <Badge variant="default" className="bg-primary">
                    Member
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-4">
            {/* Group Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Schedule
                </h4>
                <p className="text-sm text-muted-foreground">
                  {group.schedule || "Mon, Wed, Fri - 6 AM"}
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Location
                </h4>
                <p className="text-sm text-muted-foreground">
                  {group.location || "Main Gym Floor"}
                </p>
              </div>
            </div>

            <Separator />

            {/* Activities */}
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Group Activities
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {activities.map((activity) => (
                  <div 
                    key={activity}
                    className="px-3 py-2 rounded-lg bg-muted/50 text-sm"
                  >
                    {activity}
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Recent Members */}
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Members ({memberList.length})
              </h4>
              <div className="space-y-2">
                {memberList.map((member, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-fast cursor-pointer"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {member.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{member.name}</p>
                      {member.role && (
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        <Separator />

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            onClick={onToggleJoin}
            variant={isJoined ? "outline" : "default"}
            className="flex-1 transition-smooth hover:shadow-glow"
          >
            {isJoined ? "Leave Group" : "Join Group"}
          </Button>
          {isJoined && (
            <Button 
              variant="outline" 
              onClick={handleMessageGroup}
              className="transition-smooth hover:border-primary"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
