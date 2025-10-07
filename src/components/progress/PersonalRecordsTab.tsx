import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Plus, Dumbbell } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type PersonalRecord = {
  id: string;
  exercise: string;
  weight: number;
  reps: number;
  date: string;
  category: "strength" | "endurance" | "cardio";
};

export function PersonalRecordsTab() {
  const [records, setRecords] = useState<PersonalRecord[]>([
    { id: "1", exercise: "Barbell Bench Press", weight: 225, reps: 5, date: "2025-10-01", category: "strength" },
    { id: "2", exercise: "Barbell Squat", weight: 315, reps: 5, date: "2025-09-28", category: "strength" },
    { id: "3", exercise: "Deadlift", weight: 405, reps: 3, date: "2025-09-25", category: "strength" },
    { id: "4", exercise: "Pull-ups", weight: 0, reps: 20, date: "2025-09-20", category: "endurance" },
    { id: "5", exercise: "5K Run", weight: 0, reps: 0, date: "2025-09-15", category: "cardio" },
  ]);

  const [newRecord, setNewRecord] = useState({
    exercise: "",
    weight: "",
    reps: "",
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddRecord = () => {
    if (!newRecord.exercise || (!newRecord.weight && !newRecord.reps)) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const record: PersonalRecord = {
      id: Date.now().toString(),
      exercise: newRecord.exercise,
      weight: Number(newRecord.weight) || 0,
      reps: Number(newRecord.reps) || 0,
      date: new Date().toISOString().split("T")[0],
      category: "strength",
    };

    setRecords(prev => [record, ...prev]);
    setNewRecord({ exercise: "", weight: "", reps: "" });
    setIsDialogOpen(false);
    
    toast({
      title: "Personal Record Added! 🎉",
      description: `New PR for ${record.exercise}`,
    });
  };

  const groupedRecords = records.reduce((acc, record) => {
    if (!acc[record.category]) {
      acc[record.category] = [];
    }
    acc[record.category].push(record);
    return acc;
  }, {} as Record<string, PersonalRecord[]>);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "strength": return <Dumbbell className="h-5 w-5" />;
      case "endurance": return <TrendingUp className="h-5 w-5" />;
      case "cardio": return <Trophy className="h-5 w-5" />;
      default: return <Trophy className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">Personal Records</h3>
            <p className="text-sm text-muted-foreground">Track your best lifts and achievements</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add PR
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Personal Record</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="exercise">Exercise Name</Label>
                  <Input
                    id="exercise"
                    placeholder="e.g., Barbell Bench Press"
                    value={newRecord.exercise}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, exercise: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="weight">Weight (lbs)</Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="225"
                      value={newRecord.weight}
                      onChange={(e) => setNewRecord(prev => ({ ...prev, weight: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="reps">Reps</Label>
                    <Input
                      id="reps"
                      type="number"
                      placeholder="5"
                      value={newRecord.reps}
                      onChange={(e) => setNewRecord(prev => ({ ...prev, reps: e.target.value }))}
                    />
                  </div>
                </div>
                <Button onClick={handleAddRecord} className="w-full">
                  Add Record
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total PRs</p>
              <p className="text-2xl font-bold">{records.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-chart-3/10">
              <Dumbbell className="h-5 w-5 text-chart-3" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Strength PRs</p>
              <p className="text-2xl font-bold">{groupedRecords.strength?.length || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-chart-2/10">
              <TrendingUp className="h-5 w-5 text-chart-2" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Recent PRs</p>
              <p className="text-2xl font-bold">
                {records.filter(r => {
                  const recordDate = new Date(r.date);
                  const thirtyDaysAgo = new Date();
                  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                  return recordDate >= thirtyDaysAgo;
                }).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {Object.entries(groupedRecords).map(([category, categoryRecords]) => (
        <Card key={category} className="p-6">
          <div className="flex items-center gap-2 mb-4">
            {getCategoryIcon(category)}
            <h3 className="text-lg font-semibold capitalize">{category}</h3>
            <Badge variant="secondary" className="ml-auto">
              {categoryRecords.length} records
            </Badge>
          </div>
          <div className="space-y-3">
            {categoryRecords.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium mb-1">{record.exercise}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {record.weight > 0 && (
                      <span>{record.weight} lbs</span>
                    )}
                    {record.reps > 0 && (
                      <span>{record.reps} reps</span>
                    )}
                    <span>•</span>
                    <span>{record.date}</span>
                  </div>
                </div>
                <Trophy className="h-5 w-5 text-primary" />
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
