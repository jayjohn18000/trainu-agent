import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MessageSquare, Eye, Users, SlidersHorizontal } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { ClientDetailModal } from "@/components/clients/ClientDetailModal";
import { useNavigate } from "react-router-dom";
import { ClientCardSkeletonList } from "@/components/skeletons/ClientCardSkeleton";
import { EmptyState } from "@/components/ui/empty-state";

export default function Clients() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<typeof clients[0] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "at_risk" | "prospect">("all");
  const [sortBy, setSortBy] = useState<"name" | "progress" | "revenue">("name");
  const navigate = useNavigate();

  const clients = [
    {
      id: "c1",
      name: "John Doe",
      avatar: "https://i.pravatar.cc/150?img=10",
      program: "12-Week Strength Building",
      lastSession: "2025-10-01",
      nextSession: "2025-10-05",
      progress: 85,
      status: "active" as const,
      revenue: 1200,
    },
    {
      id: "c2",
      name: "Jane Smith",
      avatar: "https://i.pravatar.cc/150?img=11",
      program: "Fat Loss & Conditioning",
      lastSession: "2025-09-30",
      nextSession: "2025-10-04",
      progress: 72,
      status: "active" as const,
      revenue: 980,
    },
    {
      id: "c3",
      name: "Mike Johnson",
      avatar: "https://i.pravatar.cc/150?img=12",
      program: "Beginner Strength",
      lastSession: "2025-09-15",
      nextSession: null,
      progress: 45,
      status: "at_risk" as const,
      revenue: 450,
    },
    {
      id: "c4",
      name: "Sarah Williams",
      avatar: "https://i.pravatar.cc/150?img=13",
      program: "Advanced Powerlifting",
      lastSession: "2025-10-02",
      nextSession: "2025-10-06",
      progress: 92,
      status: "active" as const,
      revenue: 1500,
    },
    {
      id: "c5",
      name: "David Chen",
      avatar: "https://i.pravatar.cc/150?img=14",
      program: "Consultation Requested",
      lastSession: null,
      nextSession: "2025-10-07",
      progress: 0,
      status: "prospect" as const,
      revenue: 0,
      rating: 4.5,
      goal: "Weight Loss",
    },
    {
      id: "c6",
      name: "Emily Rodriguez",
      avatar: "https://i.pravatar.cc/150?img=15",
      program: "Initial Assessment Booked",
      lastSession: null,
      nextSession: "2025-10-08",
      progress: 0,
      status: "prospect" as const,
      revenue: 0,
      rating: 5.0,
      goal: "Strength Building",
    },
  ];

  const filteredClients = clients
    .filter((client) => {
      const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || client.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "progress":
          return b.progress - a.progress;
        case "revenue":
          return b.revenue - a.revenue;
        default:
          return 0;
      }
    });

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">{/* ... keep existing code */}
      <div>
        <h1 className="text-3xl font-bold mb-2">My Clients</h1>
        <p className="text-muted-foreground">Manage your client roster and track their progress</p>
      </div>

      {/* Search & Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="at_risk">Needs Attention</SelectItem>
              <SelectItem value="prospect">Prospects</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name (A-Z)</SelectItem>
              <SelectItem value="progress">Progress (High-Low)</SelectItem>
              <SelectItem value="revenue">Revenue (High-Low)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Clients</p>
          <p className="text-2xl font-bold">{clients.filter((c) => c.status !== "prospect").length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Active Programs</p>
          <p className="text-2xl font-bold">{clients.filter((c) => c.status === "active").length}</p>
        </Card>
        <Card className="p-4 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50">
          <p className="text-sm text-muted-foreground mb-1">⚠️ Needs Attention</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-500">
            {clients.filter((c) => c.status === "at_risk").length}
          </p>
        </Card>
        <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/50">
          <p className="text-sm text-muted-foreground mb-1">New Prospects</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-500">
            {clients.filter((c) => c.status === "prospect").length}
          </p>
        </Card>
      </div>

      {/* Client List */}
      {isLoading ? (
        <ClientCardSkeletonList count={4} />
      ) : (
        <div className="grid gap-4">
          {filteredClients.map((client) => (
            <Card 
              key={client.id} 
              className={`p-6 transition-smooth hover:shadow-lg hover:-translate-y-0.5 cursor-pointer ${
                client.status === "prospect" 
                  ? "bg-blue-200 dark:bg-blue-800/50 border-blue-400 dark:border-blue-600" 
                  : client.status === "at_risk"
                  ? "bg-amber-100 dark:bg-amber-900/40 border-amber-400 dark:border-amber-600"
                  : ""
              }`}
            >
            <div className="flex items-start gap-4">
              <Avatar className={`h-12 w-12 ${
                client.status === "at_risk" 
                  ? "ring-2 ring-amber-400 dark:ring-amber-600" 
                  : client.status === "prospect"
                  ? "ring-2 ring-blue-300 dark:ring-blue-700"
                  : ""
              }`}>
                <AvatarImage src={client.avatar} alt={client.name} />
                <AvatarFallback>{client.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-semibold ${
                      client.status === "at_risk"
                        ? "text-amber-600 dark:text-amber-500"
                        : client.status === "prospect"
                        ? "text-blue-600 dark:text-blue-400"
                        : ""
                    }`}>{client.name}</h3>
                    <Badge 
                      variant={
                        client.status === "active" 
                          ? "default" 
                          : "outline"
                      }
                      className={
                        client.status === "prospect"
                          ? "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700"
                          : client.status === "at_risk"
                          ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700"
                          : ""
                      }
                    >
                      {client.status === "at_risk" 
                        ? "⚠️ Needs Attention" 
                        : client.status === "prospect"
                        ? "New Prospect"
                        : "Active"}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate("/messages")}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setSelectedClient(client)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-3">{client.program}</p>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  {client.status === "prospect" ? (
                    <>
                      <div>
                        <p className="text-muted-foreground">Rating</p>
                        <p className="font-medium text-blue-600 dark:text-blue-400">
                          {"rating" in client ? `⭐ ${client.rating}` : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Goal</p>
                        <p className="font-medium text-blue-600 dark:text-blue-400">
                          {"goal" in client ? client.goal : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Inquiry Date</p>
                        <p className="font-medium text-blue-600 dark:text-blue-400">2025-10-03</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="text-muted-foreground">Last Session</p>
                        <p className={`font-medium ${
                          client.status === "at_risk" ? "text-amber-600 dark:text-amber-500" : ""
                        }`}>{client.lastSession || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Next Session</p>
                        <p className={`font-medium ${
                          client.status === "at_risk" ? "text-amber-600 dark:text-amber-500" : ""
                        }`}>{client.nextSession || "Not scheduled"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Progress</p>
                        <p className={`font-medium ${
                          client.status === "at_risk" ? "text-amber-600 dark:text-amber-500" : ""
                        }`}>{client.progress}%</p>
                      </div>
                    </>
                  )}
                </div>

                {client.status !== "prospect" && (
                  <div className="mt-3">
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          client.status === "at_risk"
                            ? "bg-amber-500 dark:bg-amber-600"
                            : "bg-primary"
                        }`}
                        style={{ width: `${client.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {client.revenue > 0 && (
                  <div className="mt-3 text-sm">
                    <span className="text-muted-foreground">Lifetime Revenue: </span>
                    <span className="font-semibold">${client.revenue.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
      )}

      {!isLoading && filteredClients.length === 0 && (
        <EmptyState
          icon={Users}
          title="No clients found"
          description={searchQuery ? "Try adjusting your search terms" : "Start by adding your first client"}
          action={
            searchQuery
              ? {
                  label: "Clear search",
                  onClick: () => setSearchQuery(""),
                }
              : undefined
          }
        />
      )}

      <ClientDetailModal
        client={selectedClient}
        open={!!selectedClient}
        onOpenChange={(open) => !open && setSelectedClient(null)}
      />
    </div>
  );
}
