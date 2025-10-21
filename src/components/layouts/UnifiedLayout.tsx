import { Outlet } from "react-router-dom";
import { TrainerSidebar } from "@/components/navigation/TrainerSidebar";
import { useState } from "react";

export function UnifiedLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <TrainerSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      <main className={`flex-1 pl-0 transition-all duration-200 ${
        sidebarCollapsed ? 'ml-14' : 'ml-60'
      }`}>
        <Outlet />
      </main>
    </div>
  );
}
