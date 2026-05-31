import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const Badge = ({ s }) => {
  const m = {
    requested: "bg-yellow-500/10 text-yellow-600",
    accepted: "bg-blue-500/10 text-blue-600",
    arrived: "bg-indigo-500/10 text-indigo-600",
    started: "bg-flame/10 text-flame",
    completed: "bg-success/10 text-success",
    cancelled: "bg-red-500/10 text-red-600",
  };
  return <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${m[s] || "bg-muted"}`}>{s}</span>;
};

export const DriverTrips = () => {
  const [trips, setTrips] = useState([]);
  useEffect(() => { api.get("/bookings").then(r => setTrips(r.data)); }, []);
  return (
    <div className="max-w-6xl mx-auto px-5 py-6 animate-fade-in">
      <div className="label-eyebrow">History</div>
      <h1 className="font-display font-black text-3xl tracking-tight mt-1">My Trips</h1>

      <div className="mt-6 border border-border rounded-2xl overflow-hidden bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr className="text-left">
              <th className="p-3 label-eyebrow">Code</th>
              <th className="p-3 label-eyebrow">Customer</th>
              <th className="p-3 label-eyebrow hidden md:table-cell">Pickup → Drop</th>
              <th className="p-3 label-eyebrow text-right">Fare</th>
              <th className="p-3 label-eyebrow">Status</th>
            </tr>
          </thead>
          <tbody>
            {trips.map(t => (
              <tr key={t.id} className="border-t border-border" data-testid={`drv-trip-${t.id}`}>
                <td className="p-3 mono">{t.code}</td>
                <td className="p-3">{t.customer_name}</td>
                <td className="p-3 hidden md:table-cell text-muted-foreground text-xs">{t.pickup?.address} → {t.drop?.address}</td>
                <td className="p-3 text-right font-display font-black">₹{t.fare?.total}</td>
                <td className="p-3"><Badge s={t.status}/></td>
              </tr>
            ))}
            {trips.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No trips yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};
