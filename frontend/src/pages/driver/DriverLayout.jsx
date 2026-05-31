import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Home, IndianRupee, FileBadge, ListChecks, LogOut } from "lucide-react";

const tabs = [
  { to: "/driver", end: true, icon: Home, label: "Dashboard", testId: "drv-tab-home" },
  { to: "/driver/trips", icon: ListChecks, label: "Trips", testId: "drv-tab-trips" },
  { to: "/driver/earnings", icon: IndianRupee, label: "Earnings", testId: "drv-tab-earnings" },
  { to: "/driver/kyc", icon: FileBadge, label: "KYC", testId: "drv-tab-kyc" },
];

export const DriverLayout = () => {
  const { user, logout, refresh } = useAuth();
  const nav = useNavigate();
  const [online, setOnline] = useState(user?.online || false);

  useEffect(() => { setOnline(user?.online || false); }, [user]);

  const toggleOnline = async (v) => {
    setOnline(v);
    try {
      await api.post("/driver/online", { online: v, lat: 25.6093, lng: 85.1235 });
      await refresh();
      toast.success(v ? "You're online — receiving requests" : "You're offline");
    } catch { toast.error("Failed to update"); setOnline(!v); }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background pb-16">
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${online ? "bg-success animate-pulse" : "bg-muted"}`} />
              <span className="text-xs font-bold uppercase tracking-wider">{online ? "Online" : "Offline"}</span>
            </div>
            <Switch checked={online} onCheckedChange={toggleOnline} data-testid="driver-online-toggle" />
            <Button variant="ghost" size="icon" onClick={logout} data-testid="driver-logout"><LogOut className="h-4 w-4"/></Button>
          </div>
        </div>
      </header>

      <main className="flex-1"><Outlet /></main>

      <nav className="fixed bottom-0 inset-x-0 z-30 glass border-t border-border">
        <div className="max-w-md mx-auto grid grid-cols-4">
          {tabs.map(t => (
            <NavLink key={t.to} to={t.to} end={t.end} data-testid={t.testId}
              className={({isActive}) => `flex flex-col items-center py-3 gap-1 ${isActive ? "text-flame" : "text-muted-foreground"}`}>
              <t.icon className="h-5 w-5"/>
              <span className="text-[10px] uppercase font-bold tracking-wider">{t.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};
