import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgentSheet } from "@/components/agent/AgentSheet";

import { useIsMobile } from "@/hooks/use-mobile";

export function AgentFAB() {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  
  return (
    <>
      <div 
        className={`fixed right-4 z-40 ${
          isMobile ? 'bottom-20' : 'bottom-6'
        }`}
      >
        <Button
          variant="default"
          size="icon"
          className="rounded-full shadow-lg h-12 w-12"
          onClick={() => setOpen(true)}
          aria-label="Open Agent"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>
      <AgentSheet open={open} onOpenChange={setOpen} />
    </>
  );
}


