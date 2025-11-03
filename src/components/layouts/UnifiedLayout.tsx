import { Outlet } from "react-router-dom";
import { TrainerSidebar } from "@/components/navigation/TrainerSidebar";
import { ChatBar } from "@/components/agent/ChatBar";
import { useAgentStore } from "@/lib/store/useAgentStore";
import { useState } from "react";

export function UnifiedLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { setInput, runNL, loading } = useAgentStore();

  const handleSubmit = async (message: string) => {
    setInput(message);
    await runNL();
  };

  return (
    <div className="flex min-h-screen bg-background">
      <TrainerSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      <main className={`flex-1 pl-0 transition-all duration-200 pb-20 md:pb-24 ${
        sidebarCollapsed ? 'ml-14' : 'ml-60'
      }`}>
        <Outlet />
      </main>
      
      {/* Persistent bottom chat bar */}
      <ChatBar onSubmit={handleSubmit} disabled={loading} sidebarCollapsed={sidebarCollapsed} />
    </div>
  );
}
