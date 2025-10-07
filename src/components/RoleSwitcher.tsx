import { UserRole } from "@/config/app";
import { useAuthStore } from "@/lib/store/useAuthStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Dumbbell, Building2, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const roleIcons: Record<UserRole, typeof User> = {
  owner: Crown,
  client: User,
  trainer: Dumbbell,
  gym_admin: Building2,
};

const roleLabels: Record<UserRole, string> = {
  owner: "Owner",
  client: "Client",
  trainer: "Trainer",
  gym_admin: "Gym Admin",
};

export function RoleSwitcher() {
  const { user, setRole } = useAuthStore();
  const navigate = useNavigate();

  if (!user) return null;

  const handleRoleSwitch = (role: UserRole) => {
    setRole(role);
    // Navigate to the appropriate dashboard
    if (role === "owner") navigate("/dashboard/owner");
    else if (role === "client") navigate("/dashboard/client");
    else if (role === "trainer") navigate("/dashboard/trainer");
    else if (role === "gym_admin") navigate("/dashboard/gym-admin");
  };

  const RoleIcon = roleIcons[user.role];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start text-left">
            <span className="text-sm font-medium">{user.name}</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <RoleIcon className="h-3 w-3" />
              {roleLabels[user.role]}
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Switch Role (Demo)</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {(Object.keys(roleLabels) as UserRole[]).map((role) => {
          const Icon = roleIcons[role];
          return (
            <DropdownMenuItem
              key={role}
              onClick={() => handleRoleSwitch(role)}
              className={user.role === role ? "bg-accent" : ""}
            >
              <Icon className="mr-2 h-4 w-4" />
              <span>{roleLabels[role]}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
