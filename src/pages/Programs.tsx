import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { usePrograms, Program } from "@/hooks/queries/usePrograms";
import { ProgramCardSkeletonList } from "@/components/skeletons/ProgramCardSkeleton";
import { ProgramBuilderCard } from "@/components/agent/ProgramBuilderCard";
import { ProgramAssignDialog } from "@/components/programs/ProgramAssignDialog";
import { Folder, Plus, Calendar, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getFlags } from "@/lib/flags";
import { EmptyState } from "@/components/ui/EmptyState";

export default function Programs() {
  const { user } = useAuthStore();
  const { data: programs, isLoading } = usePrograms();
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  // Trainers and admins see the trainer view
  const isTrainerView = user?.role === "trainer" || user?.role === "admin";

  const handleAssignClick = (program: Program) => {
    setSelectedProgram(program);
    setAssignDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Programs</h1>
          <p className="text-muted-foreground">
            {user?.role === "client" && "Your personalized training programs"}
            {isTrainerView && "Create and manage program templates"}
            {user?.role === "gym_admin" && "View all gym programs"}
          </p>
        </div>
        {isTrainerView && (
          <div className="flex gap-2">
            {/* Import button placeholder for future integrations */}
            <Button
              variant="outline"
              onClick={() =>
                toast({ 
                  title: "Coming Soon", 
                  description: "Import from Trainerize and other platforms coming soon!", 
                })
              }
            >
              <Download className="h-4 w-4 mr-2" />
              Import
            </Button>
            {(() => {
              const flags = getFlags();
              const enabled = !!flags.PROGRAMS_SHELL_ENABLED;
              return (
                <Button
                  onClick={() =>
                    toast({ title: "Not Available", description: "This feature is not available in the demo.", variant: "destructive" })
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
        )}
      </div>

      {user?.role === "client" && (
        <>
          {/* Active Programs - client view with mock data for now */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Active Programs</h2>
            {isLoading ? (
              <ProgramCardSkeletonList />
            ) : (
              <EmptyState
                icon={Folder}
                title="No Programs Yet"
                description="Book a session with a trainer to get started with a personalized program"
                action={{
                  label: "Find a Trainer",
                  onClick: () => toast({ title: "Not Available", description: "This feature is not available in the demo.", variant: "destructive" })
                }}
              />
            )}
          </div>
        </>
      )}

      {isTrainerView && (
        <>
          {/* Program Templates */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Your Templates</h2>
            {isLoading ? (
              <div className="grid md:grid-cols-2 gap-4">
                <ProgramCardSkeletonList count={3} />
              </div>
            ) : programs && programs.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                <ProgramBuilderCard />
                {programs.map((program) => (
                  <Card key={program.id} className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <Folder className="h-10 w-10 text-primary" />
                      {program.duration_weeks && (
                        <Badge variant="secondary">{program.duration_weeks} weeks</Badge>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold mb-2">{program.name}</h3>
                    
                    {program.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {program.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      {program.total_sessions && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {program.total_sessions} sessions
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() =>
                          toast({ title: "Not Available", description: "This feature is not available in the demo.", variant: "destructive" })
                        }
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAssignClick(program)}
                      >
                        Assign
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Folder}
                title="No Programs Yet"
                description="Create your first program template to assign to clients, or import from other platforms."
                action={{
                  label: "Create Program",
                  onClick: () => toast({ title: "Not Available", description: "This feature is not available in the demo.", variant: "destructive" })
                }}
              />
            )}
          </div>
        </>
      )}

      <ProgramAssignDialog
        program={selectedProgram}
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
      />
    </div>
  );
}
