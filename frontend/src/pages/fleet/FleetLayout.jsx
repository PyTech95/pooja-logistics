import { Outlet } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { LogOut } from "lucide-react";

export const FleetLayout = () => {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm"/>
            <span className="hidden sm:inline label-eyebrow border-l border-border pl-3">Fleet portal</span>
          </div>
          <Button variant="ghost" size="icon" onClick={logout} data-testid="fleet-logout"><LogOut className="h-4 w-4"/></Button>
        </div>
      </header>
      <main className="max-w-6xl mx-auto"><Outlet/></main>
    </div>
  );
};
