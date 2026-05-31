import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="h-screen w-full grid place-items-center bg-background">
      <div className="text-muted-foreground text-sm">Loading...</div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    const map = { customer: "/app", driver: "/driver", admin: "/admin", fleet: "/fleet" };
    return <Navigate to={map[user.role] || "/"} replace />;
  }
  return children;
};
