import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { MapCanvas } from "@/components/MapCanvas";
import {
  ArrowRight, Car, Bike, Truck, Bus, Plane, Sparkles, Shield, Globe, Zap,
  CheckCircle2, MapPin, Phone, Star, ChevronRight, Mic, Wallet, Smartphone, Headphones, Quote,
} from "lucide-react";

const services = [
  { icon: Car,   label: "Local Car",    sub: "Mini · Sedan · SUV · EV" },
  { icon: MapPin,label: "Outstation",   sub: "One way · Round trip" },
  { icon: Car,   label: "Auto",         sub: "Quick rickshaw" },
  { icon: Bike,  label: "Bike",         sub: "Beat the traffic" },
  { icon: Bus,   label: "Tempo",        sub: "9 – 26 seater" },
  { icon: Bus,   label: "Bus",          sub: "Volvo · Sleeper · AC" },
  { icon: Truck, label: "Porter",       sub: "Parcels & delivery" },
  { icon: Truck, label: "Goods",        sub: "Truck · Container" },
  { icon: Plane, label: "Airport",      sub: "Flight-tracked" },
];

const features = [
  { icon: Sparkles, title: "AI Voice Booking",     text: "Just speak — our assistant fills your booking in any Indian language." },
  { icon: Shield,   title: "Verified Drivers",     text: "Aadhaar + DL + background-check on every partner." },
  { icon: Globe,    title: "12 Indian Languages",  text: "Hindi, Marathi, Tamil, Telugu, Bengali, Punjabi & more." },
  { icon: Zap,      title: "Live Tracking",        text: "Real-time GPS on every ride and delivery." },
  { icon: Wallet,   title: "Universal Wallet",     text: "UPI, cards, cash — one balance across all services." },
  { icon: Headphones,title:"24×7 Indian Support",  text: "Real humans answer in under 30 seconds, in your language." },
];

const steps = [
  { n: "01", title: "Open & choose", text: "Pick your service — car, bike, bus, porter or 6 more." },
  { n: "02", title: "Confirm in seconds", text: "AI estimates fare and matches the nearest verified driver." },
  { n: "03", title: "Track & pay", text: "Live GPS, in-trip SOS, then pay via wallet or UPI." },
];

const testimonials = [
  { name: "Priya, Patna",      role: "Daily commuter", quote: "I cancelled 3 apps after switching to RK POOJA. Auto in the morning, parcel at noon, bus on weekends — all in one." },
  { name: "Rajesh, Delhi",     role: "Driver partner",  quote: "Best earnings I've had. Trips come in fast and weekly payout never delays. The driver app is dead simple." },
  { name: "Anita, Bengaluru",  role: "Small business",  quote: "Send invoices via porter, book Tempo for site visits, and cabs for client meetings. RK POOJA replaced 4 vendors." },
];

const stats = [
  { v: "10+", l: "services" },
  { v: "12",  l: "languages" },
  { v: "₹1Cr+", l: "in driver earnings" },
  { v: "4.9", l: "avg rating" },
];

export const Landing = () => {
  const nav = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* HEADER */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/75 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Logo size="md" />
          <nav className="hidden md:flex items-center gap-7 text-sm font-bold">
            <a href="#services"     className="hover:text-flame transition-colors">Services</a>
            <a href="#how"          className="hover:text-flame transition-colors">How it works</a>
            <a href="#why"          className="hover:text-flame transition-colors">Why RK POOJA</a>
            <a href="#drivers"      className="hover:text-flame transition-colors">For Drivers</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" data-testid="header-login-btn" onClick={() => nav("/login")}>Sign in</Button>
            <Button className="bg-brand hover:bg-brand-light text-white" data-testid="header-cta" onClick={() => nav("/login")}>
              Get the App <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative">
        {/* Decorative background */}
        <div className="absolute inset-0 grid-lines opacity-40 pointer-events-none" />
        <div className="absolute top-0 right-0 h-96 w-96 bg-flame/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-72 w-72 bg-brand/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-24 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card text-xs font-bold">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse"/> Now live in 25+ cities
            </div>
            <h1 className="mt-6 font-display font-black text-5xl sm:text-6xl lg:text-7xl tracking-[-0.04em] leading-[0.95]">
              ONE APP.<br/>
              <span className="text-flame">ALL RIDES.</span>
            </h1>
            <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
              Book a ride, hire a tempo, ship a parcel, or reserve a Volvo — RK POOJA brings every wheel in India under one roof. Powered by AI, built for Bharat.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" className="bg-flame hover:bg-flame-dark text-white h-12 px-7 rounded-full shadow-lg shadow-flame/20" data-testid="hero-cta-book" onClick={() => nav("/login")}>
                Book a Ride <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-7 rounded-full border-2" data-testid="hero-cta-driver" onClick={() => nav("/login")}>
                Drive with RK POOJA
              </Button>
            </div>
            <div className="mt-10 flex items-center gap-6 text-xs text-muted-foreground">
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-8 w-8 rounded-full border-2 border-background grid place-items-center text-white text-[10px] font-bold"
                    style={{background: ["#0A2E6D","#FF7A00","#16A34A","#1E4A96"][i-1]}}>{["A","R","P","S"][i-1]}</div>
                ))}
              </div>
              <div>
                <div className="flex text-flame"><Star className="h-3 w-3 fill-flame"/><Star className="h-3 w-3 fill-flame"/><Star className="h-3 w-3 fill-flame"/><Star className="h-3 w-3 fill-flame"/><Star className="h-3 w-3 fill-flame"/></div>
                <div>Loved by 1.2M+ Indians</div>
              </div>
            </div>
          </div>

          {/* Visual: phone mockup */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto w-full max-w-sm">
              {/* glow */}
              <div className="absolute inset-0 -m-10 bg-gradient-to-tr from-flame/20 via-transparent to-brand/20 blur-2xl rounded-[3rem]" />
              {/* phone frame */}
              <div className="relative aspect-[9/19] bg-card border-[10px] border-foreground/90 rounded-[2.5rem] overflow-hidden shadow-2xl">
                {/* notch */}
                <div className="absolute top-1.5 left-1/2 -translate-x-1/2 h-5 w-24 bg-foreground/90 rounded-b-2xl z-20" />
                {/* status bar */}
                <div className="absolute top-1.5 left-4 text-[10px] font-bold z-10">9:41</div>
                <div className="absolute top-1.5 right-4 text-[10px] z-10">●●●●</div>
                {/* map */}
                <div className="absolute inset-0">
                  <MapCanvas pickup drop driver />
                </div>
                {/* top sheet */}
                <div className="absolute top-10 left-3 right-3 glass rounded-2xl p-3">
                  <div className="label-eyebrow">Live ride · RK183204</div>
                  <div className="mt-0.5 font-display font-bold text-sm">Sedan · 4.2 km · ₹186</div>
                </div>
                {/* bottom sheet */}
                <div className="absolute bottom-2 left-3 right-3 glass rounded-2xl p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-success grid place-items-center text-white font-display font-black text-sm">R</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold">Rajesh K. · ★ 4.8</div>
                      <div className="text-[10px] text-muted-foreground mono truncate">BR01AB1234 · Swift Dzire</div>
                    </div>
                    <div className="text-xl font-display font-black text-flame">2'</div>
                  </div>
                </div>
              </div>
              {/* floating chip — booking confirmed */}
              <div className="absolute -left-6 top-1/3 glass rounded-2xl px-3 py-2 hidden sm:flex items-center gap-2 shadow-lg animate-fade-in">
                <CheckCircle2 className="h-4 w-4 text-success"/>
                <div className="text-xs"><div className="font-bold">Driver matched</div><div className="text-muted-foreground text-[10px]">in 8 seconds</div></div>
              </div>
              {/* floating chip — AI */}
              <div className="absolute -right-4 bottom-1/4 glass rounded-2xl px-3 py-2 hidden sm:flex items-center gap-2 shadow-lg animate-fade-in">
                <Mic className="h-4 w-4 text-flame"/>
                <div className="text-xs"><div className="font-bold">"Auto to airport"</div><div className="text-muted-foreground text-[10px]">AI voice booking</div></div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="relative border-y border-border bg-card/50 backdrop-blur">
          <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(s => (
              <div key={s.l} className="text-center md:text-left">
                <div className="font-display font-black text-3xl">{s.v}</div>
                <div className="label-eyebrow mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-12 items-start">
          <div className="md:col-span-1">
            <div className="label-eyebrow mb-4">10+ services</div>
            <h2 className="font-display font-black text-4xl sm:text-5xl tracking-tight leading-[0.95]">Every wheel.<br/>One app.</h2>
            <p className="mt-4 text-muted-foreground">From a daily auto to a Volvo to Manali — find the exact ride you need without juggling 5 apps.</p>
            <Button className="mt-6 bg-brand hover:bg-brand-light text-white" data-testid="services-explore-btn" onClick={() => nav("/login")}>
              Explore all <ChevronRight className="ml-1 h-4 w-4"/>
            </Button>
          </div>
          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {services.map((s, i) => (
              <div key={s.label} className="group border border-border rounded-2xl p-5 bg-card hover:border-flame hover:-translate-y-0.5 transition-all" style={{ animationDelay: `${i * 40}ms` }}>
                <div className="h-10 w-10 rounded-xl bg-brand/5 grid place-items-center border border-border group-hover:bg-flame/10 group-hover:border-flame transition-colors">
                  <s.icon className="h-5 w-5 text-brand dark:text-white group-hover:text-flame" strokeWidth={2.2}/>
                </div>
                <div className="mt-3 font-display font-bold">{s.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="border-y border-border bg-secondary/40">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="label-eyebrow mb-4">How it works</div>
          <h2 className="font-display font-black text-4xl sm:text-5xl tracking-tight">3 taps. You're moving.</h2>
          <div className="mt-12 grid md:grid-cols-3 gap-6 relative">
            <div className="hidden md:block absolute top-9 left-[16%] right-[16%] h-px border-t-2 border-dashed border-flame/40"/>
            {steps.map((s, i) => (
              <div key={s.n} className="relative bg-card border border-border rounded-3xl p-7" style={{ animationDelay: `${i*100}ms`}}>
                <div className="absolute -top-5 left-7 h-10 w-10 rounded-full bg-flame text-white grid place-items-center font-display font-black shadow-lg shadow-flame/30">{s.n}</div>
                <div className="mt-5 font-display font-bold text-xl">{s.title}</div>
                <div className="mt-2 text-sm text-muted-foreground">{s.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY RK POOJA */}
      <section id="why" className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <div className="label-eyebrow mb-4">Why RK POOJA</div>
            <h2 className="font-display font-black text-4xl sm:text-5xl tracking-tight">Built smart.<br/>Built for India.</h2>
            <p className="mt-5 text-muted-foreground">From AI-powered surge pricing to live SOS — every detail engineered to keep you moving safely.</p>
            <div className="mt-7 p-5 border border-border rounded-2xl bg-brand text-white">
              <div className="label-eyebrow text-white/60">Sign-up bonus</div>
              <div className="font-display font-black text-3xl mt-2">₹100 in wallet</div>
              <div className="text-sm text-white/70 mt-1">Free, instant, no card required.</div>
            </div>
          </div>
          <div className="lg:col-span-8 grid sm:grid-cols-2 gap-4">
            {features.map((f, i) => (
              <div key={f.title} className="border border-border bg-card rounded-2xl p-6 hover:border-flame transition-colors" style={{ animationDelay: `${i*60}ms`}}>
                <f.icon className="h-6 w-6 text-flame mb-4" strokeWidth={2.2} />
                <div className="font-display font-bold text-lg">{f.title}</div>
                <div className="text-sm text-muted-foreground mt-1">{f.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="border-y border-border bg-card/40">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="label-eyebrow mb-4">Loved across India</div>
          <h2 className="font-display font-black text-4xl sm:text-5xl tracking-tight">Real people. Real trips.</h2>
          <div className="mt-12 grid md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <div key={t.name} className="border border-border bg-card rounded-3xl p-7 relative" style={{ animationDelay: `${i*80}ms`}}>
                <Quote className="h-6 w-6 text-flame mb-3" />
                <p className="text-sm leading-relaxed">"{t.quote}"</p>
                <div className="mt-5 pt-4 border-t border-border flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-brand text-white grid place-items-center font-display font-black">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DRIVER PARTNERS */}
      <section id="drivers" className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="label-eyebrow mb-4">For driver partners</div>
            <h2 className="font-display font-black text-4xl sm:text-5xl tracking-tight">Earn more.<br/>Drive smarter.</h2>
            <p className="mt-5 text-muted-foreground max-w-md">Lowest commission in India. Weekly settlements. Health insurance for full-time partners. Trips matched by AI in &lt;10 seconds.</p>
            <div className="mt-7 space-y-3">
              {[
                "20% commission flat — no surprise cuts",
                "Earnings dashboard with real-time payouts",
                "Free KYC verification in under 2 days",
                "24×7 driver support in your language",
              ].map(p => (
                <div key={p} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0"/>
                  <span className="text-sm">{p}</span>
                </div>
              ))}
            </div>
            <Button size="lg" className="mt-8 bg-flame hover:bg-flame-dark text-white rounded-full px-7" data-testid="drivers-cta" onClick={() => nav("/login")}>
              Apply in 2 minutes <ArrowRight className="ml-2 h-4 w-4"/>
            </Button>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-flame/20 to-brand/20 blur-3xl rounded-3xl"/>
            <div className="relative grid grid-cols-2 gap-4">
              <div className="border border-border rounded-3xl p-6 bg-card">
                <div className="label-eyebrow">Today</div>
                <div className="font-display font-black text-3xl mt-2">₹2,840</div>
                <div className="text-xs text-muted-foreground mt-1">12 trips · 7h online</div>
              </div>
              <div className="border border-border rounded-3xl p-6 bg-brand text-white">
                <div className="label-eyebrow text-white/60">This week</div>
                <div className="font-display font-black text-3xl mt-2">₹19,650</div>
                <div className="text-xs text-white/60 mt-1">+12% vs last week</div>
              </div>
              <div className="border border-border rounded-3xl p-6 bg-card col-span-2">
                <div className="label-eyebrow">Active driver</div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-success text-white grid place-items-center font-display font-black">R</div>
                  <div>
                    <div className="font-display font-bold">Rajesh K.</div>
                    <div className="text-xs text-muted-foreground">★ 4.92 · 2,840 trips · 14 months</div>
                  </div>
                  <div className="ml-auto px-2 py-1 rounded-full bg-success/10 text-success text-[10px] font-bold uppercase">Online</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand text-white relative overflow-hidden">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-flame/20 blur-3xl"/>
        <div className="absolute -left-32 -bottom-32 h-96 w-96 rounded-full bg-flame/20 blur-3xl"/>
        <div className="relative max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 items-center gap-10">
          <div>
            <div className="label-eyebrow text-white/70 mb-3">Demo Ready</div>
            <h3 className="font-display font-black text-4xl sm:text-5xl tracking-tight">Try all 4 portals in under 30 seconds.</h3>
            <p className="text-white/70 mt-4 max-w-md">Sign in with any of our test accounts to explore the customer app, driver app, admin console and fleet dashboard.</p>
            <Button size="lg" className="bg-flame hover:bg-flame-dark text-white mt-6 rounded-full px-7 shadow-xl shadow-black/20" data-testid="cta-try-demo" onClick={() => nav("/login")}>
              Launch demo <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-col gap-2 text-sm bg-white/5 border border-white/10 rounded-3xl p-6 mono">
            <div className="label-eyebrow text-white/60 mb-2">Demo credentials</div>
            {[
              ["customer@rkpooja.test", "Customer"],
              ["driver@rkpooja.test",   "Driver"],
              ["admin@rkpooja.test",    "Admin"],
              ["fleet@rkpooja.test",    "Fleet"],
            ].map(([e, r]) => (
              <div key={e} className="flex items-center justify-between border-b border-white/10 py-2 last:border-0">
                <div>
                  <div className="text-white/70 text-[10px] uppercase tracking-wider font-sans">{r}</div>
                  <div>{e}</div>
                </div>
                <div className="text-flame font-bold">OTP: 123456</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border bg-background">
        <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-10">
          <div>
            <Logo size="sm"/>
            <p className="text-sm text-muted-foreground mt-4 max-w-xs">India's mobility super app — cars, autos, bikes, tempos, buses, porter and goods.</p>
          </div>
          <div>
            <div className="label-eyebrow mb-3">Services</div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Local Car</li><li>Outstation</li><li>Bike & Auto</li><li>Bus Booking</li><li>Porter & Goods</li>
            </ul>
          </div>
          <div>
            <div className="label-eyebrow mb-3">Company</div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>About</li><li>Press</li><li>Careers</li><li>Contact</li>
            </ul>
          </div>
          <div>
            <div className="label-eyebrow mb-3">Get the app</div>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2 border border-border rounded-lg p-2"><Smartphone className="h-4 w-4"/> iOS App</div>
              <div className="flex items-center gap-2 border border-border rounded-lg p-2"><Smartphone className="h-4 w-4"/> Android App</div>
              <div className="flex items-center gap-2 border border-border rounded-lg p-2"><Globe className="h-4 w-4"/> Web PWA</div>
            </div>
          </div>
        </div>
        <div className="border-t border-border">
          <div className="max-w-7xl mx-auto px-6 py-5 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
            <div>© 2026 RK POOJA Mobility Pvt. Ltd. · One App. All Rides.</div>
            <div className="flex gap-4"><span>Privacy</span><span>Terms</span><span>Refunds</span></div>
          </div>
        </div>
      </footer>
    </div>
  );
};
