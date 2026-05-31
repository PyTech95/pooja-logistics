import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapCanvas } from "@/components/MapCanvas";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft, MapPin, Navigation2, Users, IndianRupee, Loader2, CheckCircle2 } from "lucide-react";

// Sample popular Indian city coordinates
const PLACES = [
  { name: "Patna Junction",      lat: 25.6093, lng: 85.1376 },
  { name: "Gaya Railway Station",lat: 24.7914, lng: 85.0002 },
  { name: "Bodh Gaya",           lat: 24.6961, lng: 84.9912 },
  { name: "Patna Airport",       lat: 25.5913, lng: 85.0879 },
  { name: "Boring Road",         lat: 25.6093, lng: 85.1235 },
  { name: "Bailey Road",         lat: 25.6125, lng: 85.1131 },
  { name: "Hajipur",             lat: 25.6885, lng: 85.2080 },
  { name: "Rajgir",              lat: 25.0270, lng: 85.4204 },
];

export const BookRide = () => {
  const { service } = useParams();
  const nav = useNavigate();
  const loc = useLocation();
  const [services, setServices] = useState(null);
  const [pickup, setPickup] = useState(PLACES[0]);
  const [drop, setDrop] = useState(PLACES[1]);
  const [pickupQ, setPickupQ] = useState("");
  const [dropQ, setDropQ] = useState("");
  const [estimates, setEstimates] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [step, setStep] = useState("location"); // location -> vehicle -> confirm
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("wallet");

  useEffect(() => {
    api.get("/services").then(r => setServices(r.data.services));
    // honor AI parsed result
    const ai = loc.state?.aiParsed;
    if (ai?.pickup_text) {
      const p = PLACES.find(pl => pl.name.toLowerCase().includes((ai.pickup_text || "").toLowerCase().split(" ")[0])) ;
      if (p) setPickup(p);
    }
    if (ai?.drop_text) {
      const d = PLACES.find(pl => pl.name.toLowerCase().includes((ai.drop_text || "").toLowerCase().split(" ")[0])) ;
      if (d) setDrop(d);
    }
    // eslint-disable-next-line
  }, []);

  const svcMeta = useMemo(() => services?.[service], [services, service]);

  const filteredPickup = PLACES.filter(p => !pickupQ || p.name.toLowerCase().includes(pickupQ.toLowerCase()));
  const filteredDrop = PLACES.filter(p => !dropQ || p.name.toLowerCase().includes(dropQ.toLowerCase()));

  const getEstimates = async () => {
    setLoading(true);
    try {
      const r = await api.post("/fare/estimate", {
        service_type: service,
        pickup_lat: pickup.lat, pickup_lng: pickup.lng,
        drop_lat: drop.lat, drop_lng: drop.lng,
      });
      setEstimates(r.data.estimates || []);
      setSelectedCat((r.data.estimates || [])[0]?.category);
      setStep("vehicle");
    } catch (e) {
      toast.error("Could not fetch estimates");
    } finally { setLoading(false); }
  };

  const confirmBooking = async () => {
    setLoading(true);
    try {
      const r = await api.post("/bookings", {
        service_type: service,
        vehicle_category: selectedCat,
        pickup: { lat: pickup.lat, lng: pickup.lng, address: pickup.name },
        drop:   { lat: drop.lat,   lng: drop.lng,   address: drop.name },
        payment_method: paymentMethod,
      });
      toast.success("Booking confirmed — finding driver");
      nav(`/app/track/${r.data.id}`, { replace: true });
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Booking failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Map background */}
      <div className="relative h-[40vh] bg-secondary">
        <MapCanvas pickup drop />
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <Button size="icon" variant="secondary" className="rounded-full shadow" onClick={() => nav("/app")} data-testid="back-btn">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="glass rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider">
            {svcMeta?.name || service}
          </div>
        </div>
      </div>

      {/* Sheet */}
      <div className="flex-1 rounded-t-3xl bg-card border-t border-border -mt-6 relative z-10 p-5 pb-10">
        {step === "location" && (
          <>
            <div className="label-eyebrow">Step 1 of 3</div>
            <h2 className="font-display font-bold text-2xl mt-1">Where to?</h2>

            <div className="mt-6 space-y-3">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-brand" />
                <Input
                  placeholder={`Pickup · ${pickup.name}`}
                  value={pickupQ} onChange={(e) => setPickupQ(e.target.value)}
                  className="h-12 pl-10" data-testid="pickup-input"
                />
                {pickupQ && (
                  <div className="absolute z-20 top-12 left-0 right-0 bg-card border border-border rounded-xl shadow-lg max-h-48 overflow-auto">
                    {filteredPickup.map(p => (
                      <button key={p.name} onClick={() => { setPickup(p); setPickupQ(""); }}
                        className="w-full text-left px-4 py-3 hover:bg-muted text-sm" data-testid={`pickup-opt-${p.name}`}>
                        <MapPin className="inline h-3 w-3 mr-2 text-brand"/>{p.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-sm bg-flame" />
                <Input
                  placeholder={`Destination · ${drop.name}`}
                  value={dropQ} onChange={(e) => setDropQ(e.target.value)}
                  className="h-12 pl-10" data-testid="drop-input"
                />
                {dropQ && (
                  <div className="absolute z-20 top-12 left-0 right-0 bg-card border border-border rounded-xl shadow-lg max-h-48 overflow-auto">
                    {filteredDrop.map(p => (
                      <button key={p.name} onClick={() => { setDrop(p); setDropQ(""); }}
                        className="w-full text-left px-4 py-3 hover:bg-muted text-sm" data-testid={`drop-opt-${p.name}`}>
                        <Navigation2 className="inline h-3 w-3 mr-2 text-flame"/>{p.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="label-eyebrow mt-6 mb-3">Popular places</div>
            <div className="flex flex-wrap gap-2">
              {PLACES.slice(0, 6).map(p => (
                <button key={p.name} className="px-3 py-2 text-xs rounded-full border border-border hover:border-flame"
                  onClick={() => setDrop(p)} data-testid={`quick-${p.name}`}>
                  {p.name}
                </button>
              ))}
            </div>

            <Button className="w-full h-12 mt-7 bg-flame hover:bg-flame-dark text-white" disabled={loading} onClick={getEstimates} data-testid="get-estimates-btn">
              {loading ? <Loader2 className="h-4 w-4 animate-spin"/> : "See vehicles & fares"}
            </Button>
          </>
        )}

        {step === "vehicle" && (
          <>
            <div className="label-eyebrow">Step 2 of 3</div>
            <h2 className="font-display font-bold text-2xl mt-1">Choose a vehicle</h2>

            <div className="mt-5 space-y-2 max-h-[40vh] overflow-auto" data-testid="vehicle-list">
              {estimates.map(e => (
                <button key={e.category} onClick={() => setSelectedCat(e.category)} data-testid={`vehicle-opt-${e.category}`}
                  className={`w-full flex items-center gap-4 p-4 border rounded-2xl transition-colors text-left ${selectedCat === e.category ? "border-flame bg-flame/5" : "border-border hover:border-flame/50"}`}>
                  <div className="h-12 w-12 rounded-xl bg-muted grid place-items-center">
                    <Users className="h-5 w-5 text-brand dark:text-white"/>
                  </div>
                  <div className="flex-1">
                    <div className="font-display font-bold">{e.category_name}</div>
                    <div className="text-xs text-muted-foreground">{e.distance_km} km · {e.eta_min} min · surge ×{e.surge}</div>
                  </div>
                  <div className="font-display font-black text-xl">₹{e.total}</div>
                </button>
              ))}
            </div>

            <div className="label-eyebrow mt-5 mb-2">Payment</div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "wallet", label: "Wallet" },
                { id: "upi",    label: "UPI" },
                { id: "cash",   label: "Cash" },
              ].map(p => (
                <button key={p.id} onClick={() => setPaymentMethod(p.id)} data-testid={`pay-${p.id}`}
                  className={`p-3 rounded-xl border text-sm font-bold ${paymentMethod === p.id ? "border-flame bg-flame/5 text-flame" : "border-border"}`}>
                  {p.label}
                </button>
              ))}
            </div>

            <Button className="w-full h-12 mt-6 bg-brand hover:bg-brand-light text-white" disabled={loading || !selectedCat} onClick={confirmBooking} data-testid="confirm-booking-btn">
              {loading ? <Loader2 className="h-4 w-4 animate-spin"/> : <><CheckCircle2 className="mr-2 h-5 w-5"/> Confirm Booking</>}
            </Button>
            <Button variant="ghost" className="w-full mt-1" onClick={() => setStep("location")}>Back</Button>
          </>
        )}
      </div>
    </div>
  );
};
