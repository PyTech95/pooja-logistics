import { NavLink, Outlet } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, Users, ListChecks, Tag, LogOut } from "lucide-react";

const items = [
  { to: "/admin", end: true, icon: LayoutDashboard, label: "Overview", testId: "admin-tab-home" },
  { to: "/admin/users", icon: Users, label: "Users", testId: "admin-tab-users" },
  { to: "/admin/bookings", icon: ListChecks, label: "Bookings", testId: "admin-tab-bookings" },
  { to: "/admin/promos", icon: Tag, label: "Promos", testId: "admin-tab-promos" },
];

export const AdminLayout = () => {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen flex bg-background">
      <aside className="hidden md:flex w-60 flex-col border-r border-border bg-card">
        <div className="px-5 py-5 border-b border-border"><Logo size="sm"/></div>
        <nav className="flex-1 py-4">
          {items.map(i => (
            <NavLink key={i.to} to={i.to} end={i.end} data-testid={i.testId}
              className={({isActive}) => `flex items-center gap-3 px-5 py-3 text-sm font-bold ${isActive ? "text-flame bg-flame/5 border-l-2 border-flame" : "text-muted-foreground hover:bg-muted"}`}>
              <i.icon className="h-4 w-4"/> {i.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={logout} data-testid="admin-logout">
            <LogOut className="h-4 w-4 mr-2"/> Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile top nav */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 bg-card border-b border-border">
        <div className="flex items-center justify-between px-4 py-3"><Logo size="sm"/>
          <Button variant="ghost" size="icon" onClick={logout}><LogOut className="h-4 w-4"/></Button>
        </div>
        <div className="flex overflow-x-auto no-scrollbar border-t border-border">
          {items.map(i => (
            <NavLink key={i.to} to={i.to} end={i.end} className={({isActive}) => `flex-1 text-center py-2 text-xs font-bold whitespace-nowrap px-4 ${isActive ? "text-flame border-b-2 border-flame" : "text-muted-foreground"}`}>
              {i.label}
            </NavLink>
          ))}
        </div>
      </div>

      <main className="flex-1 md:pt-0 pt-24"><Outlet /></main>
    </div>
  );
};
