import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const AdminUsers = () => {
  const [role, setRole] = useState("customer");
  const [users, setUsers] = useState([]);
  const load = () => api.get(`/admin/users?role=${role}`).then(r => setUsers(r.data));
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [role]);

  const verify = async (id) => {
    await api.patch(`/admin/users/${id}/verify`, { status: "verified" });
    toast.success("Verified");
    load();
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="label-eyebrow">User management</div>
      <h1 className="font-display font-black text-3xl tracking-tight mt-1">Users</h1>

      <Tabs value={role} onValueChange={setRole} className="mt-5">
        <TabsList>
          <TabsTrigger value="customer" data-testid="admin-tab-customers">Customers</TabsTrigger>
          <TabsTrigger value="driver" data-testid="admin-tab-drivers">Drivers</TabsTrigger>
          <TabsTrigger value="fleet" data-testid="admin-tab-fleets">Fleet</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-5 border border-border rounded-2xl overflow-hidden bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left">
            <tr>
              <th className="p-3 label-eyebrow">Name</th>
              <th className="p-3 label-eyebrow">Email</th>
              <th className="p-3 label-eyebrow">Phone</th>
              <th className="p-3 label-eyebrow">Trips</th>
              <th className="p-3 label-eyebrow">Wallet</th>
              <th className="p-3 label-eyebrow">KYC</th>
              {role === "driver" && <th className="p-3"></th>}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t border-border" data-testid={`admin-user-${u.id}`}>
                <td className="p-3 font-bold">{u.name}</td>
                <td className="p-3 text-muted-foreground mono text-xs">{u.email}</td>
                <td className="p-3 text-muted-foreground">{u.phone || "—"}</td>
                <td className="p-3">{u.trips || 0}</td>
                <td className="p-3 font-display font-black">₹{(u.wallet_balance || 0).toFixed(0)}</td>
                <td className="p-3 text-xs uppercase font-bold">{u.kyc_status || "—"}</td>
                {role === "driver" && (
                  <td className="p-3">
                    {u.kyc_status !== "verified" && (
                      <Button size="sm" onClick={() => verify(u.id)} className="bg-success text-white hover:bg-success" data-testid={`verify-${u.id}`}>Verify</Button>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {users.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No {role}s found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};
