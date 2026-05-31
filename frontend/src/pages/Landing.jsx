import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { MapCanvas } from "@/components/MapCanvas";
import { ArrowRight, Car, Bike, Truck, Bus, Plane, Sparkles, Shield, Globe, Zap } from "lucide-react";

const services = [
  { icon: Car,   label: "Car Rides" },
  { icon: Bike,  label: "Bike" },
  { icon: Truck, label: "Porter" },
  { icon: Bus,   label: "Bus" },
  { icon: Plane, label: "Airport" },
];

const features = [
  { icon: Sparkles, title: "AI Voice Booking", text: "Just speak — our assistant fills your booking." },
  { icon: Shield,   title: "Verified Drivers", text: "KYC + background checks for every partner." },
  { icon: Globe,    title: "12 Indian Languages", text: "Hindi, Marathi, Tamil, Telugu, Bengali & more." },
  { icon: Zap,      title: "Live Tracking",   text: "Real-time GPS on every ride and delivery." },
];

export const Landing = () => {
  const nav = useNavigate();
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* HEADER */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/70 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center gap-2">
            <Button variant="ghost" data-testid="header-login-btn" onClick={() => nav("/login")}>Sign in</Button>
            <Button className="bg-brand hover:bg-brand-light text-white" data-testid="header-cta" onClick={() => nav("/login")}>
              Get the App <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-24 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 animate-slide-up">
            <div className="label-eyebrow mb-5" data-testid="hero-eyebrow">India's Mobility Super App</div>
            <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-7xl tracking-[-0.04em] leading-[0.95]">
              ONE APP.<br/>
              <span className="text-flame">ALL RIDES.</span>
            </h1>
            <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
              Book a ride, hire a tempo, ship a parcel, or reserve a Volvo — RK POOJA brings every wheel in India under one roof. Powered by AI, built for Bharat.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" className="bg-flame hover:bg-flame-dark text-white h-12 px-7 rounded-full" data-testid="hero-cta-book" onClick={() => nav("/login")}>
                Book a Ride <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-7 rounded-full border-2" data-testid="hero-cta-driver" onClick={() => nav("/login")}>
                Drive with RK POOJA
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted-foreground">
              <div><span className="font-display font-black text-2xl text-foreground">10+</span> services</div>
              <div><span className="font-display font-black text-2xl text-foreground">12</span> languages</div>
              <div><span className="font-display font-black text-2xl text-foreground">24/7</span> support</div>
            </div>
          </div>

          {/* Visual: map + booking card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border border-border shadow-2xl shadow-brand/10 h-[520px]">
              <MapCanvas pickup drop driver />
              <div className="absolute top-4 left-4 right-4 glass rounded-2xl p-4">
                <div className="label-eyebrow">Live ride</div>
                <div className="mt-1 font-display font-bold text-lg">Sedan · 4.2 km · ₹186</div>
                <div className="mt-1 text-xs text-muted-foreground">Driver arriving in 2 min</div>
              </div>
              <div className="absolute bottom-4 left-4 right-4 glass rounded-2xl p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-success grid place-items-center text-white font-bold">R</div>
                <div className="flex-1">
                  <div className="text-sm font-bold">Rajesh K. · ★ 4.8</div>
                  <div className="text-xs text-muted-foreground mono">BR01AB1234 · Swift Dzire</div>
                </div>
                <div className="text-2xl font-display font-black text-flame">2'</div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[120%] h-40 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      </section>

      {/* SERVICES STRIP */}
      <section className="border-y border-border bg-secondary/40">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="label-eyebrow mb-6">Every wheel · one app</div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { icon: Car, label: "Local Car" },
              { icon: Car, label: "Outstation" },
              { icon: Bike, label: "Auto / Bike" },
              { icon: Bus, label: "Bus / Tempo" },
              { icon: Truck, label: "Porter / Goods" },
            ].map((s) => (
              <div key={s.label} className="border border-border bg-card rounded-xl p-5 hover:border-flame hover:-translate-y-0.5 transition-all">
                <s.icon className="h-7 w-7 text-brand mb-3" strokeWidth={2} />
                <div className="font-display font-bold">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <div className="label-eyebrow mb-4">Why RK POOJA</div>
            <h2 className="font-display font-black text-4xl sm:text-5xl tracking-tight">Built smart.<br/>Built for India.</h2>
            <p className="mt-5 text-muted-foreground">From AI-powered surge pricing to live SOS — every detail engineered to keep you moving safely.</p>
          </div>
          <div className="lg:col-span-8 grid sm:grid-cols-2 gap-4">
            {features.map((f) => (
              <div key={f.title} className="border border-border bg-card rounded-2xl p-6 hover:border-flame transition-colors">
                <f.icon className="h-6 w-6 text-flame mb-4" strokeWidth={2.2} />
                <div className="font-display font-bold text-lg">{f.title}</div>
                <div className="text-sm text-muted-foreground mt-1">{f.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand text-white">
        <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 items-center gap-8">
          <div>
            <div className="label-eyebrow text-white/70 mb-3">Demo Ready</div>
            <h3 className="font-display font-black text-4xl">Try the live demo in under 30 seconds.</h3>
            <p className="text-white/70 mt-3 max-w-md">Sign in with any of our test accounts — Customer, Driver, Admin or Fleet — to explore all four apps.</p>
          </div>
          <div className="flex flex-col gap-3 text-sm bg-white/5 border border-white/10 rounded-2xl p-6 mono">
            <div>customer@rkpooja.test &nbsp; · OTP <span className="text-flame font-bold">123456</span></div>
            <div>driver@rkpooja.test &nbsp;&nbsp;&nbsp; · OTP <span className="text-flame font-bold">123456</span></div>
            <div>admin@rkpooja.test &nbsp;&nbsp;&nbsp;&nbsp; · OTP <span className="text-flame font-bold">123456</span></div>
            <div>fleet@rkpooja.test &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; · OTP <span className="text-flame font-bold">123456</span></div>
            <Button size="lg" className="bg-flame hover:bg-flame-dark text-white mt-3" data-testid="cta-try-demo" onClick={() => nav("/login")}>
              Launch demo <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-wrap items-center justify-between gap-6">
          <Logo size="sm" />
          <div className="text-xs text-muted-foreground">© 2026 RK POOJA Mobility Pvt. Ltd. · One App. All Rides.</div>
        </div>
      </footer>
    </div>
  );
};
