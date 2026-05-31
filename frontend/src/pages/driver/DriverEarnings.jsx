import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

export const DriverEarnings = () => {
  const [e, setE] = useState({ today: 0, week: 0, total: 0, wallet: 0 });
  const [trips, setTrips] = useState([]);
  useEffect(() => {
    api.get("/driver/earnings").then(r => setE(r.data));
    api.get("/bookings").then(r => setTrips(r.data));
  }, []);

  // build last 7 day chart from completed bookings
  const dayMap = {};
  trips.filter(t => t.status === "completed").forEach(t => {
    const d = (t.updated_at || "").slice(0,10);
    dayMap[d] = (dayMap[d] || 0) + (t.fare?.total || 0) * 0.8;
  });
  const series = Object.entries(dayMap).sort().slice(-7).map(([date, value]) => ({ date: date.slice(5), value: Math.round(value) }));

  return (
    <div className="max-w-6xl mx-auto px-5 py-6 animate-fade-in">
      <div className="label-eyebrow">Earnings overview</div>
      <h1 className="font-display font-black text-3xl tracking-tight mt-1">Earnings</h1>

      <div className="grid sm:grid-cols-4 gap-3 mt-6">
        {[
          { l: "Today", v: e.today, t: "earn-today" },
          { l: "This week", v: e.week, t: "earn-week" },
          { l: "Lifetime", v: e.total, t: "earn-total" },
          { l: "Wallet", v: e.wallet, t: "earn-wallet" },
        ].map(c => (
          <div key={c.l} className="border border-border rounded-2xl p-4 bg-card">
            <div className="label-eyebrow">{c.l}</div>
            <div className="font-display font-black text-2xl mt-2" data-testid={c.t}>₹{(c.v || 0).toFixed(0)}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 border border-border rounded-2xl p-5 bg-card">
        <div className="label-eyebrow">Last 7 days</div>
        <div className="h-56 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series.length ? series : [{date:"",value:0}]}>
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11}/>
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11}/>
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}/>
              <Line type="monotone" dataKey="value" stroke="#FF7A00" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6">
        <div className="label-eyebrow mb-2">Recent completed trips</div>
        <div className="space-y-2">
          {trips.filter(t => t.status === "completed").slice(0, 10).map(t => (
            <div key={t.id} className="flex justify-between items-center border border-border rounded-xl p-3 bg-card text-sm">
              <div>
                <div className="font-bold">{t.pickup?.address} → {t.drop?.address}</div>
                <div className="text-xs text-muted-foreground">{new Date(t.updated_at).toLocaleString()}</div>
              </div>
              <div className="font-display font-black text-lg">₹{((t.fare?.total || 0) * 0.8).toFixed(0)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
