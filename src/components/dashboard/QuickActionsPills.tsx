import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Users, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAtRiskClients } from "@/hooks/queries/useAtRiskClients";

export function QuickActionsPills() {
  const navigate = useNavigate();
  const { data: atRiskClients = [] } = useAtRiskClients();

  if (atRiskClients.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <Badge 
        variant="outline" 
        className="px-3 py-1.5 cursor-pointer border-danger/30 bg-danger/10 text-danger hover:bg-danger/20 transition-colors"
        onClick={() => navigate('/clients?filter=at-risk')}
      >
        <AlertTriangle className="h-3 w-3 mr-1.5" />
        {atRiskClients.length} at risk
      </Badge>
      <Badge 
        variant="outline" 
        className="px-3 py-1.5 cursor-pointer border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        onClick={() => navigate('/clients')}
      >
        <Users className="h-3 w-3 mr-1.5" />
        View all clients
      </Badge>
      <Badge 
        variant="outline" 
        className="px-3 py-1.5 cursor-pointer border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        onClick={() => navigate('/queue')}
      >
        <MessageSquare className="h-3 w-3 mr-1.5" />
        Review queue
      </Badge>
    </div>
  );
}
