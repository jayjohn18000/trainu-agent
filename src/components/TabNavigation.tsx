import { useNavigate, useLocation } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { cn } from "@/lib/utils";
import { 
  Home,
  Sparkles,
  Users,
  Settings as SettingsIcon
} from "lucide-react";
import { ScreenReaderOnly } from "./system/ScreenReaderOnly";

type MainTab = "home" | "inbox" | "community" | "settings";

interface SubTab {
  label: string;
  path: string;
  roles?: string[];
}

interface TabNavigationProps {
  isMobile?: boolean;
  onNavigate?: () => void;
}

// Main tabs configuration - conditionally shown based on role
const getMainTabs = (userRole?: string) => {
  const tabs: { value: MainTab; label: string; icon: typeof Home; roles?: string[] }[] = [
    { value: "home", label: "Home", icon: Home },
    { value: "inbox", label: "Nudges", icon: Sparkles, roles: ["trainer", "gym_admin"] },
    { value: "community", label: "Community", icon: Users },
    { value: "settings", label: "Settings", icon: SettingsIcon },
  ];
  
  return tabs.filter(tab => !tab.roles || tab.roles.includes(userRole || ''));
};

const subTabs: Record<MainTab, SubTab[]> = {
  home: [
    { label: "Dashboard", path: "/me", roles: ["client"] },
    { label: "Discover", path: "/discover", roles: ["client"] },
    { label: "Dashboard", path: "/dashboard/trainer", roles: ["trainer"] },
    { label: "My Clients", path: "/dashboard/clients", roles: ["trainer"] },
    { label: "Dashboard", path: "/dashboard/gym-admin", roles: ["gym_admin"] },
  ],
  inbox: [
    { label: "Nudges", path: "/inbox", roles: ["trainer", "gym_admin"] },
    { label: "Activity", path: "/inbox/activity", roles: ["client"] },
  ],
  community: [
    { label: "Feed", path: "/community" },
    { label: "Events", path: "/events" },
    { label: "People", path: "/community/people" },
    { label: "Store", path: "/store" },
  ],
  settings: [
    { label: "Profile", path: "/settings" },
    { label: "Dev Tools", path: "/dev/flags", roles: ["gym_admin"] },
  ],
};

export function TabNavigation({ isMobile = false, onNavigate }: TabNavigationProps = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  // Determine active main tab based on current path
  const getActiveMainTab = (): MainTab => {
    const path = location.pathname;
    if (path.startsWith("/inbox")) return "inbox";
    if (path.startsWith("/community") || path.startsWith("/events") || path.startsWith("/store")) return "community";
    if (path.startsWith("/settings") || path.startsWith("/dev/flags")) return "settings";
    return "home";
  };

  const activeMainTab = getActiveMainTab();

  // Get visible subtabs for current main tab and user role
  const getVisibleSubTabs = (tab: MainTab): SubTab[] => {
    return subTabs[tab].filter(
      (subTab) => !subTab.roles || subTab.roles.includes(user?.role || "client")
    );
  };

  const visibleSubTabs = getVisibleSubTabs(activeMainTab);
  const isActiveSubTab = (path: string) => location.pathname === path;

  const handleMainTabChange = (value: string) => {
    const mainTab = value as MainTab;
    const firstSubTab = getVisibleSubTabs(mainTab)[0];
    if (firstSubTab) {
      navigate(firstSubTab.path);
      onNavigate?.();
    }
  };

  const handleSubTabClick = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  const mainTabsToShow = getMainTabs(user?.role);
  const filteredSubTabs = subTabs[activeMainTab].filter(
    (tab) => !tab.roles || tab.roles.includes(user?.role || "")
  );

  // Mobile bottom navigation
  if (isMobile) {
    return (
      <nav 
        className="flex justify-around items-center h-16 px-2"
        role="navigation"
        aria-label="Main navigation"
      >
        {mainTabsToShow.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeMainTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => handleMainTabChange(tab.value)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all min-h-[44px] min-w-[44px]",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    );
  }

  // Desktop navigation
  return (
    <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="px-4 sm:px-6">
        {/* Main Tabs */}
        <Tabs value={activeMainTab} onValueChange={handleMainTabChange}>
          <TabsList className="h-12 bg-transparent border-0 rounded-none p-0 gap-4 sm:gap-6">
            {mainTabsToShow.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 pt-3 font-semibold min-h-[44px]"
                aria-label={tab.label}
              >
                {tab.label}
                <ScreenReaderOnly>
                  {activeMainTab === tab.value ? " (current)" : ""}
                </ScreenReaderOnly>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Sub Tabs */}
        <div className="flex gap-4 sm:gap-6 mt-2 pb-2 overflow-x-auto">
          {visibleSubTabs.map((subTab) => (
            <button
              key={subTab.path}
              onClick={() => handleSubTabClick(subTab.path)}
              className={cn(
                "text-sm font-medium transition-colors pb-2 border-b-2 border-transparent whitespace-nowrap min-h-[44px]",
                isActiveSubTab(subTab.path)
                  ? "text-primary border-primary"
                  : "text-muted-foreground hover:text-foreground focus-visible:text-foreground"
              )}
              aria-label={subTab.label}
              aria-current={isActiveSubTab(subTab.path) ? "page" : undefined}
            >
              {subTab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
