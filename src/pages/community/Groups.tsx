import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Users as UsersIcon, Users2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { GroupDetailModal } from "@/components/community/GroupDetailModal";

const groups = [
  { name: "Morning Warriors", members: 24, description: "6 AM workout crew" },
  { name: "Strength Athletes", members: 18, description: "Powerlifting & Olympic lifting" },
  { name: "Yoga Flow", members: 32, description: "Weekly yoga sessions" },
];

export default function CommunityGroups() {
  const [joinedGroups, setJoinedGroups] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<typeof groups[0] | null>(null);

  const handleJoinGroup = (groupName: string) => {
    if (joinedGroups.includes(groupName)) {
      setJoinedGroups(joinedGroups.filter((g) => g !== groupName));
      toast({ title: "Left group", description: `You've left ${groupName}.` });
    } else {
      setJoinedGroups([...joinedGroups, groupName]);
      toast({ title: "Joined group!", description: `Welcome to ${groupName}!` });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Community Groups</h1>
        <p className="text-muted-foreground mt-1">
          Join groups to train with like-minded members.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((group) => (
          <div 
            key={group.name} 
            className="metric-card transition-smooth hover:shadow-lg hover:-translate-y-1 cursor-pointer group"
            onClick={() => setSelectedGroup(group)}
          >
            <div className="space-y-3">
              <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-smooth">
                <Users2 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-fast">{group.name}</h3>
                <p className="text-sm text-muted-foreground">{group.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <UsersIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {group.members} members
                </span>
              </div>
              <Button
                variant={joinedGroups.includes(group.name) ? "default" : "outline"}
                className="w-full transition-smooth hover:shadow-glow"
                onClick={(e) => {
                  e.stopPropagation();
                  handleJoinGroup(group.name);
                }}
              >
                {joinedGroups.includes(group.name) ? "Leave Group" : "Join Group"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <GroupDetailModal
        group={selectedGroup}
        open={!!selectedGroup}
        onOpenChange={(open) => !open && setSelectedGroup(null)}
        isJoined={selectedGroup ? joinedGroups.includes(selectedGroup.name) : false}
        onToggleJoin={() => {
          if (selectedGroup) {
            handleJoinGroup(selectedGroup.name);
          }
        }}
      />
    </div>
  );
}
