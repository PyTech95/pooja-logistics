import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Bus, Clock, Users, Snowflake, Bed, IndianRupee, CheckCircle2, ChevronRight, X, QrCode } from "lucide-react";

const TYPE_META = {
  ac:      { label: "AC", icon: Snowflake, color: "text-blue-500" },
  sleeper: { label: "Sleeper", icon: Bed, color: "text-purple-500" },
  volvo:   { label: "Volvo", icon: Bus, color: "text-flame" },
  mini:    { label: "Mini", icon: Bus, color: "text-stone-500" },
  luxury:  { label: "Luxury", icon: Bus, color: "text-amber-500" },
};

const SEATS_LAYOUT = (n) => {
  const rows = Math.ceil(n / 4);
  const out = [];
  for (let r = 1; r <= rows; r++) {
    const row = ["A", "B", null, "C", "D"].map(c => c ? `${c}${r}` : null);
    out.push(row);
  }
  return out;
};

export const BusBooking = () => {
  const nav = useNavigate();
  const [routes, setRoutes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [booked, setBooked] = useState([]);
  const [chosenSeats, setChosenSeats] = useState([]);
  const [pax, setPax] = useState({ name: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState(null);

  useEffect(() => { api.get("/bus/routes").then(r => setRoutes(r.data.routes)); }, []);

  const pickRoute = async (route) => {
    setSelected(route);
    setChosenSeats([]);
    const r = await api.get(`/bus/route/${route.id}/seats`);
    setBooked(r.data.booked || []);
  };

  const toggleSeat = (s) => {
    if (!s) return;
    if (booked.includes(s)) return;
    setChosenSeats(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const confirm = async () => {
    if (!chosenSeats.length) return toast.error("Pick at least one seat");
    if (!pax.name || !pax.phone) return toast.error("Add passenger name & phone");
    setLoading(true);
    try {
      const r = await api.post("/bus/book", {
        route_id: selected.id, seats: chosenSeats,
        passenger_name: pax.name, passenger_phone: pax.phone,
        payment_method: "wallet",
      });
      toast.success(`Booked! Code ${r.data.code}`);
      setTicket(r.data);
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Booking failed");
    } finally { setLoading(false); }
  };

  // ── TICKET VIEW ─────────────────────────────────────────
  if (ticket) {
    return (
      <div className="px-5 pt-6 pb-10 animate-fade-in" data-testid="bus-ticket-view">
        <Button variant="ghost" size="sm" onClick={() => nav("/app")} className="mb-3"><ArrowLeft className="h-4 w-4 mr-1"/>Done</Button>
        <div className="label-eyebrow">Booking confirmed</div>
        <h1 className="font-display font-black text-3xl tracking-tight mt-1">Your e-ticket</h1>

        <div className="mt-6 border border-border rounded-3xl bg-card overflow-hidden">
          {/* header */}
          <div className="bg-brand text-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="label-eyebrow text-white/60">PNR</div>
                <div className="font-display font-black text-2xl mono">{ticket.code}</div>
              </div>
              <div className="text-right">
                <div className="label-eyebrow text-white/60">Status</div>
                <div className="inline-flex items-center gap-1 text-success-foreground bg-success/90 px-2 py-1 rounded-full text-xs font-bold mt-1">
                  <CheckCircle2 className="h-3 w-3"/>CONFIRMED
                </div>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-4">
              <div className="flex-1">
                <div className="font-display font-bold text-2xl">{ticket.route.from}</div>
                <div className="text-xs text-white/60">{ticket.route.departure}</div>
              </div>
              <div className="text-white/50 text-2xl">→</div>
              <div className="flex-1 text-right">
                <div className="font-display font-bold text-2xl">{ticket.route.to}</div>
                <div className="text-xs text-white/60">{ticket.route.arrival}</div>
              </div>
            </div>
            <div className="mt-3 text-xs text-white/70">{ticket.route.operator} · {ticket.route.duration}</div>
          </div>
          {/* perforation */}
          <div className="relative">
            <div className="border-b-2 border-dashed border-border mx-5"/>
            <div className="absolute -left-2 -top-2 h-4 w-4 rounded-full bg-background border border-border"/>
            <div className="absolute -right-2 -top-2 h-4 w-4 rounded-full bg-background border border-border"/>
          </div>
          {/* body */}
          <div className="p-5 grid grid-cols-2 gap-3 text-sm">
            <div><div className="label-eyebrow">Passenger</div><div className="font-bold mt-1">{ticket.passenger_name}</div></div>
            <div><div className="label-eyebrow">Phone</div><div className="font-bold mt-1 mono">{ticket.passenger_phone}</div></div>
            <div><div className="label-eyebrow">Seats</div><div className="font-bold mt-1 mono">{ticket.seats.join(", ")}</div></div>
            <div><div className="label-eyebrow">Fare</div><div className="font-display font-black mt-1">₹{ticket.fare_total}</div></div>
          </div>
          {/* QR */}
          <div className="p-5 border-t border-border flex items-center gap-4">
            <div className="h-24 w-24 rounded-xl bg-foreground p-2 grid place-items-center" data-testid="bus-qr">
              {/* faux QR */}
              <div className="grid grid-cols-8 gap-px">
                {Array.from({length: 64}).map((_, i) => {
                  const seed = (i * 17 + ticket.code.charCodeAt((i % ticket.code.length))) % 7;
                  return <div key={i} className="h-2 w-2" style={{ background: seed < 3 ? "#fff" : "transparent" }}/>;
                })}
              </div>
            </div>
            <div className="flex-1">
              <QrCode className="h-4 w-4 text-flame mb-1"/>
              <div className="font-display font-bold">Scan at boarding</div>
              <div className="text-xs text-muted-foreground mt-0.5 mono break-all">{ticket.qr}</div>
            </div>
          </div>
        </div>

        <Button className="w-full mt-6 bg-flame hover:bg-flame-dark text-white" onClick={() => nav("/app/trips")} data-testid="view-trips-btn">View all bookings</Button>
      </div>
    );
  }

  // ── SEAT SELECT ─────────────────────────────────────────
  if (selected) {
    const layout = SEATS_LAYOUT(selected.seats_total);
    const total = selected.price * chosenSeats.length;
    return (
      <div className="px-5 pt-6 pb-32 animate-fade-in">
        <Button variant="ghost" size="sm" onClick={() => setSelected(null)} className="mb-3"><ArrowLeft className="h-4 w-4 mr-1"/>Change bus</Button>
        <div className="border border-border rounded-2xl p-4 bg-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-display font-bold text-lg">{selected.from} → {selected.to}</div>
              <div className="text-xs text-muted-foreground">{selected.operator} · {selected.departure} → {selected.arrival}</div>
            </div>
            <div className="text-right"><div className="font-display font-black text-xl">₹{selected.price}</div><div className="text-[10px] text-muted-foreground">per seat</div></div>
          </div>
        </div>

        <div className="label-eyebrow mt-6 mb-3">Pick your seats</div>
        <div className="border border-border rounded-2xl p-4 bg-card" data-testid="seat-map">
          <div className="text-center mb-3">
            <div className="inline-block px-3 py-1 rounded-lg bg-muted text-xs font-bold uppercase tracking-wider">Driver</div>
          </div>
          <div className="space-y-2">
            {layout.map((row, r) => (
              <div key={r} className="flex items-center gap-2 justify-center">
                {row.map((s, i) => s === null ? (
                  <div key={i} className="w-6"/>
                ) : (
                  <button key={s} onClick={() => toggleSeat(s)} disabled={booked.includes(s)} data-testid={`seat-${s}`}
                    className={`h-10 w-10 rounded-lg text-xs font-mono font-bold transition-all
                      ${booked.includes(s) ? "bg-muted text-muted-foreground line-through cursor-not-allowed" :
                        chosenSeats.includes(s) ? "bg-flame text-white shadow-md scale-110" :
                        "border border-border bg-card hover:border-flame"}`}>
                    {s}
                  </button>
                ))}
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1"><div className="h-3 w-3 rounded-sm border border-border"/>Available</div>
            <div className="flex items-center gap-1"><div className="h-3 w-3 rounded-sm bg-flame"/>Selected</div>
            <div className="flex items-center gap-1"><div className="h-3 w-3 rounded-sm bg-muted"/>Booked</div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <input className="w-full h-12 px-3 rounded-md border border-border bg-card" placeholder="Passenger name"
            value={pax.name} onChange={(e) => setPax({...pax, name: e.target.value})} data-testid="pax-name-input"/>
          <input className="w-full h-12 px-3 rounded-md border border-border bg-card mono" placeholder="+91 phone"
            value={pax.phone} onChange={(e) => setPax({...pax, phone: e.target.value})} data-testid="pax-phone-input"/>
        </div>

        <div className="fixed bottom-0 inset-x-0 z-20 border-t border-border bg-card p-4">
          <div className="max-w-md mx-auto flex items-center gap-3">
            <div className="flex-1">
              <div className="label-eyebrow">{chosenSeats.length} seat{chosenSeats.length !== 1 ? 's' : ''}</div>
              <div className="font-display font-black text-xl">₹{total}</div>
            </div>
            <Button className="bg-flame hover:bg-flame-dark text-white h-12 px-7" disabled={loading || !chosenSeats.length} onClick={confirm} data-testid="bus-confirm-btn">
              Confirm
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── ROUTE LIST ──────────────────────────────────────────
  return (
    <div className="px-5 pt-6 pb-10 animate-fade-in">
      <Button variant="ghost" size="sm" onClick={() => nav("/app")} className="mb-3"><ArrowLeft className="h-4 w-4 mr-1"/>Back</Button>
      <div className="label-eyebrow">Bus booking</div>
      <h1 className="font-display font-black text-3xl tracking-tight mt-1">Book your bus</h1>
      <p className="text-sm text-muted-foreground mt-1">{routes.length} routes available from Patna today</p>

      <div className="mt-5 space-y-3" data-testid="bus-routes-list">
        {routes.map(r => {
          const meta = TYPE_META[r.type] || TYPE_META.ac;
          const filled = Math.round((r.seats_booked / r.seats_total) * 100);
          return (
            <button key={r.id} onClick={() => pickRoute(r)} data-testid={`bus-route-${r.id}`}
              className="w-full text-left border border-border rounded-2xl p-4 bg-card hover:border-flame hover:-translate-y-0.5 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted ${meta.color}`}>
                  <meta.icon className="h-3 w-3"/><span className="text-[10px] font-bold uppercase">{meta.label}</span>
                </div>
                <div className="text-xs text-muted-foreground">{r.operator}</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="font-display font-bold text-lg">{r.from}</div>
                  <div className="text-xs text-muted-foreground">{r.departure}</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] text-muted-foreground"><Clock className="h-3 w-3 inline"/> {r.duration}</div>
                  <div className="border-t border-dashed border-border w-16 my-1"/>
                  <div className="text-[10px] text-flame uppercase tracking-wider font-bold">Direct</div>
                </div>
                <div className="flex-1 text-right">
                  <div className="font-display font-bold text-lg">{r.to}</div>
                  <div className="text-xs text-muted-foreground">{r.arrival}</div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <div className="h-1.5 w-20 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-flame" style={{ width: `${filled}%` }}/>
                  </div>
                  <span className="text-muted-foreground">{r.seats_total - r.seats_booked} seats left</span>
                </div>
                <div className="font-display font-black text-xl">₹{r.price}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
