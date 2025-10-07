import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Plus, DollarSign, TrendingUp } from "lucide-react";
import { 
  listCreators, 
  listBriefs, 
  createBrief,
  listProposals,
  updateProposalStatus
} from "@/lib/mock/api-extended";
import type { Creator, Brief, Proposal } from "@/lib/mock/types";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { toast } from "@/hooks/use-toast";
import { EmptyState } from "@/components/ui/EmptyState";
import { Link } from "react-router-dom";

export default function Creators() {
  const { user } = useAuthStore();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [showNewBrief, setShowNewBrief] = useState(false);
  const [newBrief, setNewBrief] = useState({
    title: "",
    goals: [] as string[],
    budgetMin: 0,
    budgetMax: 0,
    dueBy: ""
  });

  const isAdmin = user?.role === 'gym_admin';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [creatorsData, briefsData] = await Promise.all([
      listCreators(),
      listBriefs()
    ]);
    setCreators(creatorsData);
    setBriefs(briefsData);
  };

  const handleCreateBrief = async () => {
    if (!newBrief.title || newBrief.goals.length === 0) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    await createBrief({
      title: newBrief.title,
      goals: newBrief.goals,
      budgetMin: newBrief.budgetMin,
      budgetMax: newBrief.budgetMax,
      dueBy: newBrief.dueBy,
      status: 'active'
    });

    setNewBrief({ title: "", goals: [], budgetMin: 0, budgetMax: 0, dueBy: "" });
    setShowNewBrief(false);
    loadData();
    toast({
      title: "Brief created",
      description: "Creators can now submit proposals"
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Creators & UGC</h1>
          <p className="text-muted-foreground">Connect with content creators for marketing campaigns</p>
        </div>
        {isAdmin && (
          <Dialog open={showNewBrief} onOpenChange={setShowNewBrief}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Brief
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Brief</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="Brief title"
                  value={newBrief.title}
                  onChange={(e) => setNewBrief({ ...newBrief, title: e.target.value })}
                />
                <Textarea
                  placeholder="Goals (comma-separated)"
                  value={newBrief.goals.join(', ')}
                  onChange={(e) => setNewBrief({ 
                    ...newBrief, 
                    goals: e.target.value.split(',').map(g => g.trim()).filter(Boolean)
                  })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="number"
                    placeholder="Min budget"
                    value={newBrief.budgetMin || ''}
                    onChange={(e) => setNewBrief({ ...newBrief, budgetMin: parseInt(e.target.value) || 0 })}
                  />
                  <Input
                    type="number"
                    placeholder="Max budget"
                    value={newBrief.budgetMax || ''}
                    onChange={(e) => setNewBrief({ ...newBrief, budgetMax: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <Input
                  type="date"
                  value={newBrief.dueBy}
                  onChange={(e) => setNewBrief({ ...newBrief, dueBy: e.target.value })}
                />
                <Button onClick={handleCreateBrief} className="w-full">
                  Create Brief
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isAdmin && briefs.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Active Briefs</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {briefs.filter(b => b.status === 'active').map(brief => (
              <Link key={brief.id} to={`/creators/briefs/${brief.id}`}>
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-lg">{brief.title}</h3>
                      <Badge>{brief.status}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {brief.goals.map((goal, i) => (
                        <Badge key={i} variant="secondary">{goal}</Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        ${brief.budgetMin} - ${brief.budgetMax}
                      </span>
                      <span>Due: {brief.dueBy}</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Creator Roster</h2>
        {creators.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No creators available"
            description="Check back soon for our creator network"
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {creators.map(creator => (
              <Card key={creator.id} className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarImage src={creator.avatarUrl} />
                    <AvatarFallback>{creator.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold">{creator.name}</h3>
                    <p className="text-sm text-muted-foreground">@{creator.handle}</p>
                  </div>
                </div>
                {creator.bio && (
                  <p className="text-sm text-muted-foreground">{creator.bio}</p>
                )}
                <div className="flex flex-wrap gap-1">
                  {creator.niches.map((niche, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{niche}</Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-2 border-t text-sm">
                  <span className="text-muted-foreground">Rate range</span>
                  <span className="font-medium">${creator.minRate} - ${creator.maxRate}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
