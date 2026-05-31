import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Users, Car, MapPin, IndianRupee, Activity } from "lucide-react";

const Stat = ({ icon: Icon, label, value, sub, testId, accent = "text-flame" }) => (
  <div className="border border-border rounded-2xl p-5 bg-card" data-testid={testId}>
    <div className="flex items-center justify-between">
      <div className="label-eyebrow">{label}</div>
      <Icon className={`h-4 w-4 ${accent}`}/>
    </div>
    <div className="font-display font-black text-3xl mt-2">{value}</div>
    {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
  </div>
);

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  useEffect(() => { api.get("/admin/stats").then(r => setStats(r.data)); }, []);
  if (!stats) return <div className="p-6 text-muted-foreground">Loading…</div>;

  return (
    <div className="p-6 animate-fade-in">
      <div className="label-eyebrow">Live operations</div>
      <h1 className="font-display font-black text-3xl tracking-tight mt-1">Mission Control</h1>

      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <Stat icon={Users} label="Customers" value={stats.total_users} testId="stat-customers"/>
        <Stat icon={Car} label="Drivers" value={stats.total_drivers} sub={`${stats.online_drivers} online`} testId="stat-drivers"/>
        <Stat icon={Activity} label="Active rides" value={stats.active_bookings} testId="stat-active"/>
        <Stat icon={MapPin} label="Total trips" value={stats.total_bookings} sub={`${stats.completed_bookings} completed`} testId="stat-total-trips"/>
        <Stat icon={IndianRupee} label="Gross GMV" value={`₹${stats.gross_revenue.toFixed(0)}`} sub={`Platform: ₹${stats.platform_revenue.toFixed(0)}`} testId="stat-gmv"/>
      </div>

      <div className="mt-6 border border-border rounded-2xl p-5 bg-card">
        <div className="label-eyebrow">Revenue · last 7 days</div>
        <div className="h-72 mt-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.series.length ? stats.series : [{date:"",gross:0}]}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))"/>
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11}/>
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11}/>
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}/>
              <Bar dataKey="gross" fill="#FF7A00" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
