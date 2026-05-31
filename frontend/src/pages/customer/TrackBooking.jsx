import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LeafletMap } from "@/components/LeafletMap";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft, Phone, MessageSquare, ShieldAlert, Star, X, Share2, Radio } from "lucide-react";

export const TrackBooking = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const [booking, setBooking] = useState(null);
  const [rating, setRating] = useState(0);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef(null);

  const load = async () => {
    try {
      const r = await api.get(`/bookings/${id}`);
      setBooking(r.data);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    load();
    // WebSocket live tracking
    const wsUrl = (process.env.REACT_APP_BACKEND_URL || "").replace(/^http/, "ws") + `/api/ws/track/${id}`;
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      ws.onopen  = () => setWsConnected(true);
      ws.onclose = () => setWsConnected(false);
      ws.onerror = () => setWsConnected(false);
      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          if (msg.type === "snapshot" || msg.type === "status") setBooking(msg.booking);
          else if (msg.type === "location") {
            setBooking((b) => b ? { ...b, live_lat: msg.lat, live_lng: msg.lng } : b);
          }
        } catch {}
      };
    } catch {}
    // Fallback polling (less frequent now that WS is on)
    const t = setInterval(load, 8000);
    return () => { clearInterval(t); try { wsRef.current?.close(); } catch {} };
  }, [id]);

  const sos = async () => {
    await api.post(`/bookings/${id}/sos`);
    toast.success("SOS sent — emergency contacts notified");
  };

  const cancel = async () => {
    await api.patch(`/bookings/${id}/status`, { status: "cancelled" });
    toast("Booking cancelled");
    nav("/app/trips", { replace: true });
  };

  const submitRating = async () => {
    if (!rating) return;
    await api.post(`/bookings/${id}/rate`, { rating, review: "" });
    toast.success("Thanks for your feedback");
    nav("/app/trips", { replace: true });
  };

  const shareTrip = async () => {
    const text = `Track my ride on RK POOJA · ${booking.code} · ${booking.pickup?.address} → ${booking.drop?.address}`;
    const url = `${window.location.origin}/app/track/${id}`;
    if (navigator.share) {
      try { await navigator.share({ title: "RK POOJA Trip", text, url }); } catch {}
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Trip link copied — share with anyone");
    }
  };

  if (!booking) return <div className="p-6 text-muted-foreground">Loading…</div>;

  const statusLabel = {
    requested: "Finding driver…",
    accepted:  "Driver is on the way",
    arrived:   "Driver has arrived",
    started:   "Trip in progress",
    completed: "Trip completed",
    cancelled: "Cancelled",
  }[booking.status] || booking.status;

  const isLive = ["accepted", "arrived", "started"].includes(booking.status);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="relative h-[50vh]">
        <LeafletMap
          pickup={booking.pickup}
          drop={booking.drop}
          driver={isLive && booking.live_lat ? { lat: booking.live_lat, lng: booking.live_lng } : null}
        />
        <Button size="icon" variant="secondary" className="absolute top-4 left-4 rounded-full z-[500]" onClick={() => nav("/app")} data-testid="back-btn">
          <ArrowLeft className="h-5 w-5"/>
        </Button>
        <div className="absolute top-4 right-4 left-16 glass rounded-2xl p-3 z-[500]">
          <div className="flex items-center justify-between">
            <div>
              <div className="label-eyebrow">{booking.code}</div>
              <div className="font-display font-bold text-sm">{statusLabel}</div>
            </div>
            {wsConnected && (
              <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-success" data-testid="ws-indicator">
                <Radio className="h-3 w-3 animate-pulse"/> Live
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 -mt-6 rounded-t-3xl bg-card border-t border-border p-5 pb-10 relative z-10">
        {booking.status === "requested" && (
          <>
            <div className="label-eyebrow">Searching…</div>
            <h2 className="font-display font-bold text-2xl mt-1">Finding your nearest driver</h2>
            <p className="text-sm text-muted-foreground mt-2">We're matching you with the best nearby partner.</p>
            <div className="mt-6 h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full w-1/3 bg-flame shimmer rounded-full" />
            </div>
            <Button variant="outline" className="w-full mt-6" onClick={cancel} data-testid="cancel-booking-btn">
              <X className="h-4 w-4 mr-2"/> Cancel booking
            </Button>
          </>
        )}

        {isLive && (
          <>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-success grid place-items-center text-white font-display font-black">
                {(booking.driver_name || "D").charAt(0)}
              </div>
              <div className="flex-1">
                <div className="font-display font-bold">{booking.driver_name || "Driver"} · ★ 4.8</div>
                <div className="text-xs text-muted-foreground mono">
                  {booking.vehicle?.make} {booking.vehicle?.model} · {booking.vehicle?.number}
                </div>
              </div>
              <div className="font-display font-black text-2xl text-flame">PIN {booking.otp}</div>
            </div>

            <div className="mt-5 grid grid-cols-4 gap-2">
              <Button variant="outline" className="h-12" data-testid="call-driver-btn"><Phone className="h-4 w-4"/></Button>
              <Button variant="outline" className="h-12" data-testid="msg-driver-btn"><MessageSquare className="h-4 w-4"/></Button>
              <Button variant="outline" className="h-12" onClick={shareTrip} data-testid="share-trip-btn"><Share2 className="h-4 w-4"/></Button>
              <Button variant="outline" className="h-12 border-destructive text-destructive" onClick={sos} data-testid="sos-btn"><ShieldAlert className="h-4 w-4"/></Button>
            </div>

            <div className="mt-5 border border-border rounded-2xl p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Pickup</span><span className="font-medium text-right">{booking.pickup?.address}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Drop</span><span className="font-medium text-right">{booking.drop?.address}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Fare</span><span className="font-display font-black">₹{booking.fare?.total}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Payment</span><span className="uppercase font-bold">{booking.payment_method}</span></div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={cancel} data-testid="cancel-btn">Cancel</Button>
              <Button className="bg-flame hover:bg-flame-dark text-white" onClick={async () => {
                await api.patch(`/bookings/${id}/status`, { status: "completed" });
                toast.success("Marked completed");
                load();
              }} data-testid="complete-btn">Mark Complete</Button>
            </div>
          </>
        )}

        {booking.status === "completed" && (
          <>
            <div className="label-eyebrow">Trip complete</div>
            <h2 className="font-display font-bold text-2xl mt-1">How was your ride?</h2>
            <div className="mt-5 flex justify-center gap-2">
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setRating(n)} data-testid={`star-${n}`}>
                  <Star className={`h-10 w-10 ${rating >= n ? "fill-flame text-flame" : "text-muted-foreground"}`} />
                </button>
              ))}
            </div>
            <Button className="w-full mt-6 bg-brand text-white hover:bg-brand-light" disabled={!rating} onClick={submitRating} data-testid="submit-rating-btn">
              Submit rating
            </Button>
          </>
        )}

        {booking.status === "cancelled" && (
          <>
            <div className="label-eyebrow">Cancelled</div>
            <h2 className="font-display font-bold text-2xl mt-1">Booking cancelled</h2>
            <Button className="w-full mt-6" onClick={() => nav("/app")}>Back home</Button>
          </>
        )}
      </div>
    </div>
  );
};
