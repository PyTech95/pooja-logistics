import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Car, ArrowRight, Calendar } from "lucide-react";

const StatusBadge = ({ s }) => {
  const map = {
    requested: { c: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400", t: "Searching" },
    accepted:  { c: "bg-blue-500/10 text-blue-700 dark:text-blue-400", t: "Accepted" },
    arrived:   { c: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400", t: "Arrived" },
    started:   { c: "bg-flame/10 text-flame", t: "Ongoing" },
    completed: { c: "bg-success/10 text-success", t: "Completed" },
    cancelled: { c: "bg-red-500/10 text-red-700 dark:text-red-400", t: "Cancelled" },
  };
  const m = map[s] || { c: "bg-muted", t: s };
  return <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${m.c}`}>{m.t}</span>;
};

export const Trips = () => {
  const nav = useNavigate();
  const [trips, setTrips] = useState([]);
  useEffect(() => { api.get("/bookings").then(r => setTrips(r.data)); }, []);

  return (
    <div className="px-5 pt-8 animate-fade-in">
      <div className="label-eyebrow">Your history</div>
      <h1 className="font-display font-black text-3xl tracking-tight mt-1">Trips</h1>

      {trips.length === 0 && (
        <div className="mt-10 text-center text-muted-foreground" data-testid="no-trips">
          <Car className="h-10 w-10 mx-auto mb-3 opacity-40"/>
          No trips yet. Book your first ride to see it here.
        </div>
      )}

      <div className="mt-6 space-y-3" data-testid="trips-list">
        {trips.map(t => (
          <button key={t.id} onClick={() => nav(`/app/track/${t.id}`)}
            className="w-full text-left border border-border rounded-2xl p-4 bg-card hover:border-flame transition-colors">
            <div className="flex items-center justify-between">
              <span className="label-eyebrow">{t.service_type} · {t.vehicle_category}</span>
              <StatusBadge s={t.status} />
            </div>
            <div className="mt-3 flex items-start gap-3">
              <div className="flex flex-col items-center pt-1">
                <div className="h-2 w-2 rounded-full bg-brand"/>
                <div className="w-px h-6 bg-border my-0.5"/>
                <div className="h-2 w-2 rounded-sm bg-flame"/>
              </div>
              <div className="flex-1 text-sm">
                <div className="font-medium leading-tight">{t.pickup?.address}</div>
                <div className="text-muted-foreground text-xs leading-tight mt-1.5">to {t.drop?.address}</div>
              </div>
              <div className="text-right">
                <div className="font-display font-black text-lg">₹{t.fare?.total}</div>
                <div className="text-[10px] text-muted-foreground flex items-center gap-1 justify-end mt-0.5">
                  <Calendar className="h-3 w-3"/> {new Date(t.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
