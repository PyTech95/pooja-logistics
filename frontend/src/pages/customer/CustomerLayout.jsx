import { Outlet, useLocation } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";

export const CustomerLayout = () => {
  const loc = useLocation();
  // Hide bottom nav on full-screen booking & track pages
  const hideNav = /\/app\/(book|track|notifications|referral)/.test(loc.pathname);
  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <main className="max-w-md mx-auto">
        <Outlet />
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
};
