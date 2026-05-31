import { useEffect } from "react";
import "@/index.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { api } from "@/lib/api";

import { Landing } from "@/pages/Landing";
import { Login } from "@/pages/Login";

import { CustomerLayout } from "@/pages/customer/CustomerLayout";
import { CustomerHome } from "@/pages/customer/CustomerHome";
import { BookRide } from "@/pages/customer/BookRide";
import { TrackBooking } from "@/pages/customer/TrackBooking";
import { Trips } from "@/pages/customer/Trips";
import { Wallet } from "@/pages/customer/Wallet";
import { AIAssistant } from "@/pages/customer/AIAssistant";
import { Profile } from "@/pages/customer/Profile";

import { DriverLayout } from "@/pages/driver/DriverLayout";
import { DriverHome } from "@/pages/driver/DriverHome";
import { DriverEarnings } from "@/pages/driver/DriverEarnings";
import { DriverKYC } from "@/pages/driver/DriverKYC";
import { DriverTrips } from "@/pages/driver/DriverTrips";

import { AdminLayout } from "@/pages/admin/AdminLayout";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { AdminUsers } from "@/pages/admin/AdminUsers";
import { AdminBookings } from "@/pages/admin/AdminBookings";
import { AdminPromos } from "@/pages/admin/AdminPromos";

import { FleetLayout } from "@/pages/fleet/FleetLayout";
import { FleetDashboard } from "@/pages/fleet/FleetDashboard";

const RoleRouter = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const map = { customer: "/app", driver: "/driver", admin: "/admin", fleet: "/fleet" };
  return <Navigate to={map[user.role] || "/app"} replace />;
};

function App() {
  useEffect(() => {
    // Best-effort: seed demo accounts on first load. Idempotent on backend.
    api.post("/seed/demo").catch(() => {});
    // Apply theme preference
    const t = localStorage.getItem("rk_theme");
    if (t === "dark") document.documentElement.classList.add("dark");
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-center" richColors />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/me" element={<RoleRouter />} />

          {/* Customer */}
          <Route path="/app" element={<ProtectedRoute roles={["customer"]}><CustomerLayout /></ProtectedRoute>}>
            <Route index element={<CustomerHome />} />
            <Route path="book/:service" element={<BookRide />} />
            <Route path="track/:id" element={<TrackBooking />} />
            <Route path="trips" element={<Trips />} />
            <Route path="wallet" element={<Wallet />} />
            <Route path="ai" element={<AIAssistant />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Driver */}
          <Route path="/driver" element={<ProtectedRoute roles={["driver"]}><DriverLayout /></ProtectedRoute>}>
            <Route index element={<DriverHome />} />
            <Route path="earnings" element={<DriverEarnings />} />
            <Route path="kyc" element={<DriverKYC />} />
            <Route path="trips" element={<DriverTrips />} />
          </Route>

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="promos" element={<AdminPromos />} />
          </Route>

          {/* Fleet */}
          <Route path="/fleet" element={<ProtectedRoute roles={["fleet"]}><FleetLayout /></ProtectedRoute>}>
            <Route index element={<FleetDashboard />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
