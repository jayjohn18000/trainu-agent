import { useAuthStore } from "@/lib/store/useAuthStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

// SECURITY: RoleSwitcher disabled - roles are now managed server-side only
// This component previously allowed client-side role manipulation which was a critical security vulnerability

export function RoleSwitcher() {
  const { user } = useAuthStore();

  if (!user) return null;

  // Display user info only - no role switching allowed
  return (
    <Button variant="ghost" className="gap-2 cursor-default" disabled>
      <Avatar className="h-8 w-8">
        <AvatarImage src={user.avatarUrl} alt={user.name} />
        <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col items-start text-left">
        <span className="text-sm font-medium">{user.name}</span>
        <span className="text-xs text-muted-foreground">{user.role}</span>
      </div>
    </Button>
  );
}
