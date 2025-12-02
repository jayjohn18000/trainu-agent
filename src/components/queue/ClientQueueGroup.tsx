import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, User } from "lucide-react";
import { QueueCard } from "@/components/agent/QueueCard";
import { AutoApprovalCountdown } from "@/components/agent/AutoApprovalCountdown";
import type { Message } from "@/lib/api/messages";

interface ClientQueueGroupProps {
  clientId: string;
  clientName: string;
  messages: Message[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onEdit: (id: string) => void;
  onSendNow: (id: string) => void;
  onRefresh: () => void;
}

export function ClientQueueGroup({
  clientId,
  clientName,
  messages,
  onApprove,
  onReject,
  onEdit,
  onSendNow,
  onRefresh,
}: ClientQueueGroupProps) {
  const [isExpanded, setIsExpanded] = useState(messages.length === 1);

  const avgConfidence = messages.reduce((sum, m) => sum + (m.confidence || 0.8), 0) / messages.length;
  const highConfidenceCount = messages.filter(m => (m.confidence || 0.8) >= 0.8).length;

  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          )}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <span className="font-semibold">{clientName}</span>
          </div>
          <Badge variant="secondary">
            {messages.length} message{messages.length > 1 ? 's' : ''}
          </Badge>
          {highConfidenceCount > 0 && (
            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
              {highConfidenceCount} safe
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Avg confidence: {Math.round(avgConfidence * 100)}%
          </span>
        </div>
      </button>

      {isExpanded && (
        <div className="px-6 pb-4 space-y-3 border-t">
          {messages.map((msg) => (
            <div key={msg.id} className="pt-3 space-y-2">
              {msg.auto_approval_at && (
                <AutoApprovalCountdown
                  messageId={msg.id}
                  autoApprovalAt={msg.auto_approval_at}
                  onCancel={onRefresh}
                />
              )}
              <QueueCard
                item={{
                  id: msg.id,
                  clientId: msg.contact_id,
                  clientName,
                  preview: msg.content,
                  confidence: msg.confidence || 0.8,
                  status: msg.status as any,
                  why: msg.why_reasons || [],
                  createdAt: msg.created_at,
                }}
                onApprove={() => onApprove(msg.id)}
                onReject={() => onReject(msg.id)}
                onEdit={() => onEdit(msg.id)}
                onSendNow={() => onSendNow(msg.id)}
              />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
