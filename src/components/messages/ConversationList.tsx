import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

type Conversation = {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
};

type Props = {
  conversations: Conversation[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export function ConversationList({ conversations, selectedId, onSelect }: Props) {
  const [search, setSearch] = useState("");

  const filtered = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {filtered.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={`w-full text-left p-4 border-b transition-colors ${
              selectedId === conv.id
                ? "bg-accent"
                : "hover:bg-accent/50"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="relative">
                <Avatar>
                  <AvatarImage src={conv.avatar} alt={conv.name} />
                  <AvatarFallback>{conv.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                {conv.online && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-background rounded-full" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold truncate">{conv.name}</h4>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                    {conv.timestamp}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-muted-foreground truncate">
                    {conv.lastMessage}
                  </p>
                  {conv.unread > 0 && (
                    <Badge variant="default" className="rounded-full h-5 min-w-5 px-1.5">
                      {conv.unread}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}

        {filtered.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            No conversations found
          </div>
        )}
      </div>
    </div>
  );
}
