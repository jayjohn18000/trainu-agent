import { ReactNode } from "react";
import { LandingNav } from "./LandingNav";
import { LandingFooter } from "./LandingFooter";

interface LandingLayoutProps {
  children: ReactNode;
}

export function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingNav />
      <main className="pt-16">
        {children}
      </main>
      <LandingFooter />
    </div>
  );
}
