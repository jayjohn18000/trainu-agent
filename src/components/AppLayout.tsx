import { RoleSwitcher } from "./RoleSwitcher";
import { TabNavigation } from "./TabNavigation";
import { Button } from "./ui/button";
import { ArrowLeft, Settings, Menu, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ScreenReaderOnly } from "./system/ScreenReaderOnly";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { NotificationCenter } from "./NotificationCenter";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col w-full">
      {/* Skip to main content link for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mobile menu button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" aria-label="Open navigation menu">
                <Menu className="h-5 w-5" />
                <ScreenReaderOnly>Menu</ScreenReaderOnly>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <div className="py-6">
                <h2 className="text-xl font-bold text-primary px-6 mb-6">TrainU</h2>
                <TabNavigation isMobile onNavigate={() => setMobileMenuOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>

          <h2 className="text-lg sm:text-xl font-bold text-primary">TrainU</h2>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <NotificationCenter />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/calendar")}
            aria-label="Open calendar"
          >
            <Calendar className="h-5 w-5" />
            <ScreenReaderOnly>Calendar</ScreenReaderOnly>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/settings")}
            aria-label="Open settings"
          >
            <Settings className="h-5 w-5" />
            <ScreenReaderOnly>Settings</ScreenReaderOnly>
          </Button>
          <RoleSwitcher />
        </div>
      </header>

      {/* Desktop navigation */}
      <div className="hidden lg:block">
        <TabNavigation />
      </div>

      <main id="main-content" className="flex-1 overflow-auto pb-20 lg:pb-6">
        <div className="p-4 sm:p-6">{children}</div>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-20 left-4 z-40 shadow-lg lg:bottom-6 lg:left-6 min-h-[44px] min-w-[44px]"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
          <ScreenReaderOnly>Back</ScreenReaderOnly>
        </Button>
      </main>

      {/* Mobile bottom navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <TabNavigation isMobile />
      </div>
    </div>
  );
}
