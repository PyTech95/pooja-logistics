import { NavLink } from "react-router-dom";
import { Home, Compass, Wallet, User, Sparkles } from "lucide-react";

const tabs = [
  { to: "/app", icon: Home, label: "Home", end: true, testId: "tab-home" },
  { to: "/app/trips", icon: Compass, label: "Trips", testId: "tab-trips" },
  { to: "/app/ai", icon: Sparkles, label: "AI", testId: "tab-ai" },
  { to: "/app/wallet", icon: Wallet, label: "Wallet", testId: "tab-wallet" },
  { to: "/app/profile", icon: User, label: "Profile", testId: "tab-profile" },
];

export const BottomNav = () => {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 glass border-t border-border"
      data-testid="customer-bottom-nav"
    >
      <div className="max-w-md mx-auto grid grid-cols-5">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            data-testid={t.testId}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-3 transition-colors ${
                isActive ? "text-flame" : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            <t.icon className="h-5 w-5" strokeWidth={2.2} />
            <span className="text-[10px] font-semibold tracking-wide uppercase">{t.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
