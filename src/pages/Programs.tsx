import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { ProgramCardSkeletonList } from "@/components/skeletons/ProgramCardSkeleton";
import { ProgramBuilderCard } from "@/components/agent/ProgramBuilderCard";
import { Folder, Plus, User, Calendar, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getFlags } from "@/lib/flags";

export default function Programs() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading programs
    const timer = setTimeout(() => setIsLoading(false), 900);
    return () => clearTimeout(timer);
  }, []);

  const clientPrograms = [
    {
      id: "1",
      title: "12-Week Strength Building",
      trainer: "Alex Carter",
      startDate: "2025-09-15",
      progress: 4,
      totalWeeks: 12,
      status: "active",
    },
    {
      id: "2",
      title: "Mobility & Recovery",
      trainer: "Alex Carter",
      startDate: "2025-10-01",
      progress: 1,
      totalWeeks: 6,
      status: "active",
    },
  ];

  const trainerTemplates = [
    {
      id: "t1",
      title: "Beginner Strength Foundations",
      weeks: 8,
      assignedTo: 5,
      lastUpdated: "2025-09-28",
    },
    {
      id: "t2",
      title: "Advanced Powerlifting Program",
      weeks: 12,
      assignedTo: 3,
      lastUpdated: "2025-09-20",
    },
    {
      id: "t3",
      title: "Fat Loss & Conditioning",
      weeks: 10,
      assignedTo: 8,
      lastUpdated: "2025-09-15",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Programs</h1>
          <p className="text-muted-foreground">
            {user?.role === "client" && "Your personalized training programs"}
            {user?.role === "trainer" && "Create and manage program templates"}
            {user?.role === "gym_admin" && "View all gym programs"}
          </p>
        </div>
        {user?.role === "trainer" && (() => {
          const flags = getFlags();
          const enabled = !!flags.PROGRAMS_SHELL_ENABLED;
          return (
            <Button
              onClick={() =>
                enabled
                  ? toast({ title: "Create Program", description: "Opening program builder..." })
                  : toast({ title: "Coming soon", description: "Enable Programs shell in Dev Flags", variant: "destructive" })
              }
              variant={enabled ? "default" : "outline"}
              disabled={!enabled}
              title={enabled ? "Create via Agent" : "Programs shell disabled"}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create via Agent
            </Button>
          );
        })()}
      </div>

      {user?.role === "client" && (
        <>
          {/* Active Programs */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Active Programs</h2>
            {isLoading ? (
              <ProgramCardSkeletonList />
            ) : (
              clientPrograms.map((program) => (
              <Card key={program.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{program.title}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <User className="h-3 w-3" />
                      {program.trainer}
                    </p>
                  </div>
                  <Badge variant={program.status === "active" ? "default" : "secondary"}>
                    {program.status}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">
                      Week {program.progress} of {program.totalWeeks}
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${(program.progress / program.totalWeeks) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() =>
                      toast({ title: "View Program", description: "Loading program details..." })
                    }
                  >
                    View Program
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      toast({ title: "Mark Complete", description: "Marking workout as complete..." })
                    }
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Log Today's Workout
                  </Button>
                </div>
              </Card>
              ))
            )}
          </div>
        </>
      )}

      {user?.role === "trainer" && (
        <>
          {/* Program Templates */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Your Templates</h2>
            {isLoading ? (
              <div className="grid md:grid-cols-2 gap-4">
                <ProgramCardSkeletonList count={3} />
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                <ProgramBuilderCard />
                {trainerTemplates.map((template) => (
                <Card key={template.id} className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <Folder className="h-10 w-10 text-primary" />
                    <Badge variant="secondary">{template.weeks} weeks</Badge>
                  </div>

                  <h3 className="text-lg font-semibold mb-2">{template.title}</h3>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {template.assignedTo} clients
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Updated {template.lastUpdated}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        toast({ title: "Edit Template", description: "Opening program editor..." })
                      }
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        toast({ title: "Assign Program", description: "Select clients to assign..." })
                      }
                    >
                      Assign
                    </Button>
                  </div>
                </Card>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Empty State */}
      {user?.role === "client" && clientPrograms.length === 0 && (
        <Card className="p-12 text-center">
          <Folder className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Programs Yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Book a session with a trainer to get started with a personalized program
          </p>
          <Button onClick={() => toast({ title: "Find Trainer", description: "Redirecting..." })}>
            Find a Trainer
          </Button>
        </Card>
      )}
    </div>
  );
}
