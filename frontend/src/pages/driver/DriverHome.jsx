import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MapPin, Navigation2, Clock, IndianRupee, Car, Check, X, Star } from "lucide-react";

export const DriverHome = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [active, setActive] = useState(null);
  const [earnings, setEarnings] = useState({ today: 0, week: 0, trips_today: 0 });

  const load = async () => {
    try {
      const [reqs, mine, er] = await Promise.all([
        api.get("/driver/requests"),
        api.get("/bookings"),
        api.get("/driver/earnings"),
      ]);
      setRequests(reqs.data || []);
      setEarnings(er.data || {});
      const live = (mine.data || []).find(b => ["accepted","arrived","started"].includes(b.status));
      setActive(live || null);
    } catch { /* ignore */ }
  };

  useEffect(() => { load(); const t = setInterval(load, 5000); return () => clearInterval(t); }, []);

  const accept = async (b) => {
    await api.patch(`/bookings/${b.id}/status`, { status: "accepted" });
    toast.success("Trip accepted");
    load();
  };

  const advance = async (next) => {
    if (!active) return;
    await api.patch(`/bookings/${active.id}/status`, { status: next });
    toast.success("Status updated");
    load();
  };

  return (
    <div className="max-w-6xl mx-auto px-5 py-6 animate-fade-in">
      <div className="grid lg:grid-cols-3 gap-4 mb-5">
        <div className="border border-border rounded-2xl p-5 bg-card">
          <div className="label-eyebrow">Today</div>
          <div className="font-display font-black text-3xl mt-2" data-testid="drv-today-earn">₹{earnings.today?.toFixed(0) || 0}</div>
          <div className="text-xs text-muted-foreground mt-1">{earnings.trips_today || 0} trips</div>
        </div>
        <div className="border border-border rounded-2xl p-5 bg-card">
          <div className="label-eyebrow">This week</div>
          <div className="font-display font-black text-3xl mt-2" data-testid="drv-week-earn">₹{earnings.week?.toFixed(0) || 0}</div>
          <div className="text-xs text-muted-foreground mt-1">{earnings.trips_week || 0} trips</div>
        </div>
        <div className="border border-border rounded-2xl p-5 bg-brand text-white">
          <div className="label-eyebrow text-white/60">Driver score</div>
          <div className="flex items-center gap-2 mt-2">
            <Star className="h-7 w-7 fill-flame text-flame"/>
            <div className="font-display font-black text-3xl">{(user?.rating || 5).toFixed(1)}</div>
          </div>
          <div className="text-xs text-white/60 mt-1">{user?.trips || 0} lifetime trips</div>
        </div>
      </div>

      {active && (
        <div className="border-2 border-flame rounded-2xl p-5 bg-flame/5 mb-5" data-testid="active-trip-card">
          <div className="flex items-center justify-between">
            <span className="label-eyebrow text-flame">Active trip · {active.code}</span>
            <span className="text-xs font-bold uppercase">{active.status}</span>
          </div>
          <div className="mt-3 grid sm:grid-cols-2 gap-4">
            <div>
              <div className="text-xs label-eyebrow">Pickup</div>
              <div className="font-bold">{active.pickup?.address}</div>
            </div>
            <div>
              <div className="text-xs label-eyebrow">Drop</div>
              <div className="font-bold">{active.drop?.address}</div>
            </div>
            <div>
              <div className="text-xs label-eyebrow">Customer</div>
              <div className="font-bold">{active.customer_name}</div>
            </div>
            <div>
              <div className="text-xs label-eyebrow">Fare</div>
              <div className="font-display font-black text-2xl">₹{active.fare?.total}</div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {active.status === "accepted" && <Button onClick={() => advance("arrived")} className="bg-brand text-white" data-testid="mark-arrived-btn">Mark arrived</Button>}
            {active.status === "arrived"  && <Button onClick={() => advance("started")} className="bg-brand text-white" data-testid="start-trip-btn">Start trip</Button>}
            {active.status === "started"  && <Button onClick={() => advance("completed")} className="bg-success text-white" data-testid="complete-trip-btn">Complete trip</Button>}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-bold text-xl">Nearby requests</h2>
        <span className="label-eyebrow">{requests.length} open</span>
      </div>

      {!user?.online && (
        <div className="border border-dashed border-border rounded-2xl p-6 text-center text-muted-foreground">
          You're offline. Toggle online to receive new requests.
        </div>
      )}

      {user?.online && requests.length === 0 && (
        <div className="border border-dashed border-border rounded-2xl p-6 text-center text-muted-foreground" data-testid="no-requests">
          No open requests right now. Sit tight — they'll come in soon.
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-3" data-testid="requests-list">
        {requests.map(b => (
          <div key={b.id} className="border border-border rounded-2xl p-4 bg-card">
            <div className="flex items-center justify-between">
              <span className="label-eyebrow">{b.service_type} · {b.vehicle_category}</span>
              <span className="font-display font-black text-2xl">₹{b.fare?.total}</span>
            </div>
            <div className="mt-3 flex items-start gap-3">
              <div className="flex flex-col items-center pt-1">
                <div className="h-2 w-2 rounded-full bg-brand"/>
                <div className="w-px h-6 bg-border my-0.5"/>
                <div className="h-2 w-2 rounded-sm bg-flame"/>
              </div>
              <div className="flex-1 text-sm">
                <div className="font-medium leading-tight">{b.pickup?.address}</div>
                <div className="text-muted-foreground text-xs mt-1">to {b.drop?.address}</div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <span><Clock className="h-3 w-3 inline mr-1"/>{b.fare?.eta_min} min</span>
              <span><Navigation2 className="h-3 w-3 inline mr-1"/>{b.fare?.distance_km} km</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button variant="outline" data-testid={`reject-${b.id}`}><X className="h-4 w-4 mr-1"/>Skip</Button>
              <Button onClick={() => accept(b)} className="bg-flame hover:bg-flame-dark text-white" data-testid={`accept-${b.id}`}><Check className="h-4 w-4 mr-1"/>Accept</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
