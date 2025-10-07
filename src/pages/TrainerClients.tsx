import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, TrendingUp, AlertCircle, Trophy } from "lucide-react";
import { listSessions, listGoals, listGoalEntries, getUser } from "@/lib/mock/api-extended";
import type { Session, Goal, GoalEntry, User } from "@/lib/mock/types";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { EmptyState } from "@/components/ui/EmptyState";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { Ring } from "@/components/ui/Ring";

interface ClientProgress {
  userId: string;
  user: User | null;
  weeklyTarget: number;
  completedThisWeek: number;
  streak: number;
  nextSession: Session | null;
}

export default function TrainerClients() {
  const { user } = useAuthStore();
  const [clients, setClients] = useState<ClientProgress[]>([]);
  const [filter, setFilter] = useState<'all' | 'behind' | 'at_risk' | 'milestones'>('all');

  const isTrainer = user?.role === 'trainer';

  useEffect(() => {
    if (isTrainer) loadClients();
  }, [isTrainer]);

  const loadClients = async () => {
    const sessions = await listSessions();
    const goals = await listGoals();
    const entries = await listGoalEntries();

    // Get unique client IDs from sessions
    const clientIds = new Set(sessions.map(s => s.clientId));
    
    const progressData: ClientProgress[] = [];
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);

    for (const clientId of clientIds) {
      const clientUser = await getUser(clientId);
      const clientGoals = goals.filter(g => g.userId === clientId && g.isActive);
      const primaryGoal = clientGoals[0];
      
      if (primaryGoal) {
        const thisWeekEntries = entries.filter(e => 
          e.goalId === primaryGoal.id && 
          new Date(e.date) >= weekStart && 
          new Date(e.date) <= weekEnd
        );
        
        const completed = thisWeekEntries.filter(e => e.type === 'completed').length;
        
        // Calculate streak
        let streak = 0;
        const sortedEntries = entries
          .filter(e => e.goalId === primaryGoal.id)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        for (const entry of sortedEntries) {
          if (entry.type === 'completed') streak++;
          else break;
        }

        // Find next session
        const upcomingSessions = sessions
          .filter(s => s.clientId === clientId && new Date(s.date) >= now && s.status === 'scheduled')
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        progressData.push({
          userId: clientId,
          user: clientUser,
          weeklyTarget: Math.floor(primaryGoal.target) || 3,
          completedThisWeek: completed,
          streak,
          nextSession: upcomingSessions[0] || null
        });
      }
    }

    setClients(progressData);
  };

  const filteredClients = clients.filter(client => {
    if (filter === 'behind') {
      return client.completedThisWeek < client.weeklyTarget;
    }
    if (filter === 'at_risk') {
      return client.streak === 0;
    }
    if (filter === 'milestones') {
      return client.streak >= 4;
    }
    return true;
  });

  if (!isTrainer) {
    return (
      <div className="max-w-3xl mx-auto">
        <EmptyState
          icon={AlertCircle}
          title="Access restricted"
          description="This view is only available for trainers"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Clients</h1>
          <p className="text-muted-foreground">Monitor progress and engagement</p>
        </div>
        <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter clients" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clients</SelectItem>
            <SelectItem value="behind">Behind Target</SelectItem>
            <SelectItem value="at_risk">At Risk</SelectItem>
            <SelectItem value="milestones">Milestones Reached</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredClients.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="No clients found"
          description="No clients match the selected filter"
        />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>This Week</TableHead>
                <TableHead>Streak</TableHead>
                <TableHead>Next Session</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map(client => {
                const percentage = Math.round((client.completedThisWeek / client.weeklyTarget) * 100);
                const isBehind = client.completedThisWeek < client.weeklyTarget;
                
                return (
                  <TableRow key={client.userId}>
                    <TableCell className="font-medium">
                      {client.user?.name || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12">
                          <Ring 
                            percentage={percentage}
                            size={48}
                            strokeWidth={4}
                          />
                        </div>
                        <span className="text-sm">
                          {client.completedThisWeek} / {client.weeklyTarget}
                        </span>
                        {isBehind && (
                          <Badge variant="destructive" className="text-xs">
                            Behind
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {client.streak > 0 ? (
                          <>
                            <span className="text-2xl">🔥</span>
                            <span className="font-bold">{client.streak}</span>
                            {client.streak >= 4 && (
                              <Badge variant="default" className="gap-1">
                                <Trophy className="h-3 w-3" />
                                Milestone
                              </Badge>
                            )}
                          </>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {client.nextSession ? (
                        <div>
                          <div>{format(new Date(client.nextSession.date), "MMM d")}</div>
                          <div className="text-muted-foreground">{client.nextSession.time}</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">None scheduled</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" className="gap-2">
                        <Bell className="h-3 w-3" />
                        Nudge
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
