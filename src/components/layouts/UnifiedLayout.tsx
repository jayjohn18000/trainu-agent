import { Outlet } from "react-router-dom";
import { TrainerSidebar } from "@/components/navigation/TrainerSidebar";
import { ChatBar } from "@/components/agent/ChatBar";
import { useAgentStore } from "@/lib/store/useAgentStore";
import { useState, useEffect } from "react";

export function UnifiedLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { messages, loading, sendMessage, loadHistory } = useAgentStore();

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

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
      <ChatBar 
        messages={messages} 
        onSubmit={sendMessage} 
        loading={loading} 
        sidebarCollapsed={sidebarCollapsed} 
      />
    </div>
  );
}
