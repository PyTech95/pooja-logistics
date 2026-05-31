import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Car, Bike, Truck, Bus, Plane, MapPin, Search, Mic,
  Sparkles, Wallet as WalletIcon, Bell, Map as MapIcon, Package, Globe, Sun, Moon, Gift,
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

const SERVICE_TILES = [
  { id: "car",        label: "Car",        icon: Car,     desc: "Mini · Sedan · SUV",        accent: "from-blue-500/10 to-blue-500/0" },
  { id: "auto",       label: "Auto",       icon: Car,     desc: "Quick rickshaw",            accent: "from-yellow-500/10 to-yellow-500/0" },
  { id: "bike",       label: "Bike",       icon: Bike,    desc: "Beat the traffic",          accent: "from-red-500/10 to-red-500/0" },
  { id: "tempo",      label: "Tempo",      icon: Bus,     desc: "9 – 26 seater",             accent: "from-purple-500/10 to-purple-500/0" },
  { id: "bus",        label: "Bus",        icon: Bus,     desc: "Volvo · Sleeper · AC",      accent: "from-emerald-500/10 to-emerald-500/0" },
  { id: "porter",     label: "Porter",     icon: Package, desc: "Send a parcel",             accent: "from-orange-500/10 to-orange-500/0" },
  { id: "goods",      label: "Goods",      icon: Truck,   desc: "Truck · Container",         accent: "from-stone-500/10 to-stone-500/0" },
  { id: "outstation", label: "Outstation", icon: MapIcon, desc: "One way · Round trip",      accent: "from-cyan-500/10 to-cyan-500/0" },
  { id: "airport",    label: "Airport",    icon: Plane,   desc: "Flight-tracked pickup",     accent: "from-indigo-500/10 to-indigo-500/0" },
];

export const CustomerHome = () => {
  const { user, refresh } = useAuth();
  const nav = useNavigate();
  const [voice, setVoice] = useState("");
  const [parsing, setParsing] = useState(false);
  const [dark, setDark] = useState(document.documentElement.classList.contains("dark"));
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    refresh().catch(() => {});
    api.get("/notifications").then(r => setUnread((r.data || []).filter(n => !n.read).length)).catch(() => {});
    /* eslint-disable-next-line */
  }, []);

  const toggleDark = () => {
    const next = !dark; setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("rk_theme", next ? "dark" : "light");
  };

  const handleVoiceParse = async () => {
    if (!voice.trim()) return toast.error("Type or speak what you need");
    setParsing(true);
    try {
      const r = await api.post("/ai/parse-booking", { transcript: voice });
      const svc = r.data?.service_type || "car";
      toast.success(`Booking parsed: ${svc.toUpperCase()}`);
      nav(`/app/book/${svc}`, { state: { aiParsed: r.data, transcript: voice } });
    } catch {
      toast.error("Could not understand. Try again.");
    } finally { setParsing(false); }
  };

  return (
    <div className="px-5 pt-6 animate-fade-in">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Logo size="sm" />
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={toggleDark} data-testid="theme-toggle">
            {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => nav("/app/notifications")} data-testid="notifications-btn" className="relative">
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 h-4 min-w-4 px-1 rounded-full bg-flame text-white text-[9px] font-bold grid place-items-center">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Greeting */}
      <div className="mt-6">
        <div className="label-eyebrow">{new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening"}</div>
        <h1 className="font-display font-black text-3xl tracking-tight mt-1" data-testid="customer-greeting">
          {(user?.name || "Friend").split(" ")[0]} 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Where would you like to go?</p>
      </div>

      {/* Wallet + AI + Referral cards */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        <button onClick={() => nav("/app/wallet")} className="text-left border border-border rounded-2xl p-4 bg-card hover:-translate-y-0.5 transition-all" data-testid="quick-wallet">
          <WalletIcon className="h-5 w-5 text-flame" />
          <div className="label-eyebrow mt-3">Wallet</div>
          <div className="font-display font-black text-xl mt-1" data-testid="home-wallet-balance">₹{(user?.wallet_balance || 0).toFixed(0)}</div>
        </button>
        <button onClick={() => nav("/app/ai")} className="text-left border border-border rounded-2xl p-4 bg-card relative overflow-hidden hover:-translate-y-0.5 transition-all" data-testid="quick-ai">
          <Sparkles className="h-5 w-5 text-flame" />
          <div className="label-eyebrow mt-3">AI Assist</div>
          <div className="font-display font-bold text-sm mt-1">Ask me</div>
          <div className="absolute -right-4 -bottom-4 h-16 w-16 rounded-full bg-flame/10 blur-xl" />
        </button>
        <button onClick={() => nav("/app/referral")} className="text-left border border-border rounded-2xl p-4 bg-brand text-white relative overflow-hidden hover:-translate-y-0.5 transition-all" data-testid="quick-referral">
          <Gift className="h-5 w-5 text-flame" />
          <div className="label-eyebrow text-white/60 mt-3">Earn</div>
          <div className="font-display font-bold text-sm mt-1">₹100/invite</div>
          <div className="absolute -right-4 -bottom-4 h-16 w-16 rounded-full bg-flame/20 blur-xl" />
        </button>
      </div>

      {/* AI Voice booking */}
      <div className="mt-5 border border-border rounded-2xl p-4 bg-card">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-full bg-flame/10 grid place-items-center"><Mic className="h-4 w-4 text-flame" /></div>
          <div className="flex-1">
            <div className="font-display font-bold text-sm">AI Voice Booking</div>
            <div className="text-[11px] text-muted-foreground">Eg: "Sedan from Patna to Gaya tomorrow"</div>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <Input
            placeholder="Type or speak your request…"
            value={voice}
            onChange={(e) => setVoice(e.target.value)}
            className="h-11"
            data-testid="ai-voice-input"
          />
          <Button onClick={handleVoiceParse} disabled={parsing} className="h-11 bg-brand hover:bg-brand-light text-white" data-testid="ai-voice-go">
            {parsing ? "..." : "Go"}
          </Button>
        </div>
      </div>

      {/* Services grid */}
      <div className="mt-7">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg">All services</h2>
          <span className="label-eyebrow">10+</span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3" data-testid="services-grid">
          {SERVICE_TILES.map((s) => (
            <button
              key={s.id}
              onClick={() => nav(`/app/book/${s.id}`)}
              data-testid={`service-tile-${s.id}`}
              className="group relative border border-border rounded-2xl p-3 bg-card hover:border-flame hover:-translate-y-0.5 transition-all text-left overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${s.accent} opacity-0 group-hover:opacity-100 transition-opacity`} />
              <div className="relative">
                <div className="h-10 w-10 rounded-xl bg-brand/5 grid place-items-center border border-border">
                  <s.icon className="h-5 w-5 text-brand dark:text-white" strokeWidth={2.2}/>
                </div>
                <div className="mt-3 font-display font-bold text-sm leading-tight">{s.label}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{s.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick search row */}
      <div className="mt-7 mb-6 border border-border rounded-2xl p-4 bg-card">
        <div className="label-eyebrow flex items-center gap-1"><Globe className="h-3 w-3"/> 12 languages supported</div>
        <div className="mt-2 flex gap-1 flex-wrap text-xs text-muted-foreground">
          {["English", "हिन्दी", "मराठी", "தமிழ்", "తెలుగు", "বাংলা", "ગુજરાતી", "ಕನ್ನಡ", "മലയാളം", "ਪੰਜਾਬੀ", "ଓଡ଼ିଆ", "অসমীয়া"].map(l => (
            <span key={l} className="px-2 py-1 rounded-full bg-muted">{l}</span>
          ))}
        </div>
      </div>
    </div>
  );
};
