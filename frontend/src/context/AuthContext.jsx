import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";

const AuthCtx = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("rk_user") || "null"); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("rk_token");
    if (!token) { setLoading(false); return; }
    api.get("/auth/me").then((r) => {
      setUser(r.data);
      localStorage.setItem("rk_user", JSON.stringify(r.data));
    }).catch(() => {
      localStorage.removeItem("rk_token");
      localStorage.removeItem("rk_user");
      setUser(null);
    }).finally(() => setLoading(false));
  }, []);

  const login = (token, u) => {
    localStorage.setItem("rk_token", token);
    localStorage.setItem("rk_user", JSON.stringify(u));
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem("rk_token");
    localStorage.removeItem("rk_user");
    setUser(null);
  };

  const refresh = async () => {
    const r = await api.get("/auth/me");
    setUser(r.data);
    localStorage.setItem("rk_user", JSON.stringify(r.data));
    return r.data;
  };

  return (
    <AuthCtx.Provider value={{ user, loading, login, logout, refresh }}>
      {children}
    </AuthCtx.Provider>
  );
};

export const useAuth = () => useContext(AuthCtx);
