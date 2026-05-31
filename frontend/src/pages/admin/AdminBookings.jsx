import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const AdminBookings = () => {
  const [status, setStatus] = useState("all");
  const [bookings, setBookings] = useState([]);
  useEffect(() => {
    const q = status === "all" ? "" : `?status=${status}`;
    api.get(`/admin/bookings${q}`).then(r => setBookings(r.data));
  }, [status]);

  return (
    <div className="p-6 animate-fade-in">
      <div className="label-eyebrow">Live ops</div>
      <h1 className="font-display font-black text-3xl tracking-tight mt-1">All Bookings</h1>

      <Tabs value={status} onValueChange={setStatus} className="mt-5">
        <TabsList className="flex-wrap h-auto">
          {["all","requested","accepted","started","completed","cancelled"].map(s => (
            <TabsTrigger key={s} value={s} className="capitalize" data-testid={`booking-filter-${s}`}>{s}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="mt-5 border border-border rounded-2xl overflow-hidden bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left">
            <tr>
              <th className="p-3 label-eyebrow">Code</th>
              <th className="p-3 label-eyebrow">Service</th>
              <th className="p-3 label-eyebrow">Customer</th>
              <th className="p-3 label-eyebrow">Driver</th>
              <th className="p-3 label-eyebrow text-right">Fare</th>
              <th className="p-3 label-eyebrow">Status</th>
              <th className="p-3 label-eyebrow">When</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b.id} className="border-t border-border" data-testid={`admin-booking-${b.id}`}>
                <td className="p-3 mono text-xs">{b.code}</td>
                <td className="p-3 uppercase font-bold text-xs">{b.service_type}/{b.vehicle_category}</td>
                <td className="p-3">{b.customer_name}</td>
                <td className="p-3 text-muted-foreground">{b.driver_name || "—"}</td>
                <td className="p-3 text-right font-display font-black">₹{b.fare?.total}</td>
                <td className="p-3 text-xs uppercase font-bold">{b.status}</td>
                <td className="p-3 text-xs text-muted-foreground">{new Date(b.created_at).toLocaleString()}</td>
              </tr>
            ))}
            {bookings.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No bookings</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};
