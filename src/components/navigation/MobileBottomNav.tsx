import { Link, useLocation } from "react-router-dom";
import { Home, Users, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

const navItems = [
  { label: 'Today', path: '/today', icon: Home },
  { label: 'Clients', path: '/clients', icon: Users },
  { label: 'Programs', path: '/programs', icon: Folder },
];

export function MobileBottomNav() {
  const location = useLocation();
  const lastScrollY = useRef(0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY;
      if (current > lastScrollY.current && current > 24) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      lastScrollY.current = current;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 border-t md:hidden transition-transform duration-200",
        "bg-card/80 backdrop-blur-md border-border/50",
        hidden ? 'translate-y-full' : 'translate-y-0'
      )}
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around px-2 py-2 safe-bottom">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link 
              key={item.path} 
              to={item.path}
              className="flex-1"
            >
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full flex flex-col items-center gap-1 h-auto py-2 px-1",
                  isActive && "text-primary"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className={cn(
                  "h-5 w-5",
                  isActive && "fill-primary/20"
                )} />
                <span className="text-xs">{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
