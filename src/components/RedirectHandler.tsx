import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface RedirectRule {
  from: string;
  to?: string; // undefined means 410 Gone
  type: "301" | "410";
}

const redirectRules: RedirectRule[] = [
  // 301 Redirects
  { from: "/dashboard/trainer", to: "/today", type: "301" },
  { from: "/inbox", to: "/today#queue", type: "301" },
  { from: "/dashboard/clients", to: "/clients", type: "301" },
  { from: "/dashboard/settings", to: "/settings", type: "301" },
  
  // 410 Gone
  { from: "/dashboard/calendar", type: "410" },
  { from: "/dashboard/messages", type: "410" },
  { from: "/dashboard/progress", type: "410" },
  { from: "/dashboard/programs", type: "410" },
  { from: "/book", type: "410" },
];

export function RedirectHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const rule = redirectRules.find((r) => location.pathname === r.from);
    
    if (rule) {
      if (rule.type === "301" && rule.to) {
        navigate(rule.to, { replace: true });
      } else if (rule.type === "410") {
        navigate("/410", { replace: true });
      }
    }
  }, [location.pathname, navigate]);

  return null;
}
