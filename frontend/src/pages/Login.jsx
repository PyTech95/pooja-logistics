import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Car, Bus, Bike, Truck, Plane, MapPin } from "lucide-react";

const DEMO_ACCOUNTS = [
  { email: "customer@rkpooja.test", label: "Customer", color: "bg-brand",       icon: Car,    testId: "demo-customer" },
  { email: "driver@rkpooja.test",   label: "Driver",   color: "bg-flame",       icon: Car,    testId: "demo-driver" },
  { email: "admin@rkpooja.test",    label: "Admin",    color: "bg-foreground",  icon: MapPin, testId: "demo-admin" },
  { email: "fleet@rkpooja.test",    label: "Fleet",    color: "bg-success",     icon: Truck,  testId: "demo-fleet" },
];

const FLOATING_ICONS = [
  { Icon: Car, top: "15%", left: "10%", delay: "0s",   size: 36 },
  { Icon: Bus, top: "70%", left: "15%", delay: "1.2s", size: 32 },
  { Icon: Bike,top: "40%", left: "85%", delay: "0.6s", size: 28 },
  { Icon: Plane,top:"20%", left: "75%", delay: "1.8s", size: 30 },
  { Icon: Truck,top:"80%", left: "70%", delay: "0.9s", size: 34 },
];

export const Login = () => {
  const nav = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [role, setRole] = useState("customer");
  const [step, setStep] = useState("email");
  const [loading, setLoading] = useState(false);
  const [sentOtp, setSentOtp] = useState("");

  const handleSendOtp = async (e) => {
    e?.preventDefault?.();
    if (!email) return toast.error("Enter your email");
    setLoading(true);
    try {
      const r = await api.post("/auth/request-otp", { email, role });
      setSentOtp(r.data.otp);
      toast.success(`OTP sent: ${r.data.otp}`, { description: "Demo mode — OTP shown for testing." });
      setStep("otp");
    } catch {
      toast.error("Failed to send OTP");
    } finally { setLoading(false); }
  };

  const handleVerify = async (val) => {
    const code = val || otp;
    if (code.length < 6) return toast.error("Enter the 6-digit OTP");
    setLoading(true);
    try {
      const r = await api.post("/auth/verify-otp", { email, otp: code });
      login(r.data.token, r.data.user);
      toast.success(`Welcome, ${r.data.user.name}`);
      const map = { customer: "/app", driver: "/driver", admin: "/admin", fleet: "/fleet" };
      nav(map[r.data.user.role] || "/app", { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Invalid OTP");
      setOtp("");
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (otp.length === 6) handleVerify(otp);
    // eslint-disable-next-line
  }, [otp]);

  const loginWithDemo = async (acc) => {
    setEmail(acc.email);
    setRole(acc.label.toLowerCase());
    setLoading(true);
    try {
      const r = await api.post("/auth/request-otp", { email: acc.email, role: acc.label.toLowerCase() });
      const r2 = await api.post("/auth/verify-otp", { email: acc.email, otp: r.data.otp });
      login(r2.data.token, r2.data.user);
      toast.success(`Logged in as ${acc.label}`);
      const map = { customer: "/app", driver: "/driver", admin: "/admin", fleet: "/fleet" };
      nav(map[r2.data.user.role] || "/app", { replace: true });
    } catch {
      toast.error("Demo login failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* LEFT — Brand splash */}
      <div className="hidden lg:flex relative overflow-hidden bg-brand text-white flex-col justify-between p-12">
        <Logo size="lg" inverted />

        {/* Floating service icons */}
        {FLOATING_ICONS.map((f, i) => (
          <div key={i} className="absolute opacity-15 animate-fade-in" style={{ top: f.top, left: f.left, animationDelay: f.delay }}>
            <f.Icon style={{ width: f.size, height: f.size }} className="text-white" />
          </div>
        ))}

        {/* Logo card */}
        <div className="relative z-10 max-w-md">
          <div className="bg-white rounded-3xl p-6 inline-block shadow-2xl shadow-black/30 -rotate-2 hover:rotate-0 transition-transform">
            <Logo variant="full" size="md" />
          </div>
          <div className="label-eyebrow text-white/60 mt-10">India's mobility super app</div>
          <h2 className="font-display font-black text-5xl xl:text-6xl mt-3 leading-[1] tracking-[-0.03em]">
            ONE APP.<br/><span className="text-flame">ALL RIDES.</span>
          </h2>
          <p className="text-white/70 mt-6 max-w-md text-sm">Car · Auto · Bike · Tempo · Bus · Porter · Goods · Outstation · Airport. All in one tap.</p>

          <div className="mt-8 grid grid-cols-3 gap-3 max-w-sm">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3">
              <div className="font-display font-black text-2xl">10+</div>
              <div className="text-[10px] uppercase tracking-wider text-white/60 mt-0.5">services</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3">
              <div className="font-display font-black text-2xl">12</div>
              <div className="text-[10px] uppercase tracking-wider text-white/60 mt-0.5">languages</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3">
              <div className="font-display font-black text-2xl">25+</div>
              <div className="text-[10px] uppercase tracking-wider text-white/60 mt-0.5">cities</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-white/40 mono">© 2026 RK POOJA Mobility</div>

        {/* Decorative glows */}
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-flame/15 blur-3xl" />
        <div className="absolute -left-32 -bottom-32 h-96 w-96 rounded-full bg-flame/25 blur-3xl" />
      </div>

      {/* RIGHT — form */}
      <div className="flex flex-col justify-center p-6 sm:p-12 relative">
        <button onClick={() => nav("/")} className="absolute top-6 left-6 text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1" data-testid="back-to-home">
          <ArrowLeft className="h-3 w-3"/> Back to home
        </button>

        <div className="lg:hidden mb-8 flex justify-center"><Logo /></div>

        <div className="max-w-md w-full mx-auto animate-fade-in">
          <div className="label-eyebrow mb-3">{step === "email" ? "Sign in / Sign up" : "Verify"}</div>
          <h1 className="font-display font-black text-4xl tracking-[-0.02em]">{step === "email" ? "Let's get moving." : "One last step."}</h1>
          <p className="text-muted-foreground text-sm mt-2">
            {step === "email" ? "Use your email — we'll send a 6-digit OTP. No passwords." : <>Enter the code we sent to <span className="font-mono text-foreground">{email}</span></>}
          </p>

          {step === "email" && (
            <form onSubmit={handleSendOtp} className="mt-8 space-y-5">
              <Tabs value={role} onValueChange={setRole} data-testid="role-tabs">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="customer" data-testid="role-customer">Customer</TabsTrigger>
                  <TabsTrigger value="driver" data-testid="role-driver">Driver</TabsTrigger>
                  <TabsTrigger value="fleet" data-testid="role-fleet">Fleet</TabsTrigger>
                  <TabsTrigger value="admin" data-testid="role-admin">Admin</TabsTrigger>
                </TabsList>
                <TabsContent value={role} />
              </Tabs>
              <div className="space-y-2">
                <Label htmlFor="email" className="label-eyebrow">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className="h-12" data-testid="login-email-input" />
              </div>
              <Button type="submit" className="w-full h-12 bg-flame hover:bg-flame-dark text-white" disabled={loading} data-testid="send-otp-btn">
                {loading ? <Loader2 className="h-4 w-4 animate-spin"/> : "Continue with email →"}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center text-xs"><span className="bg-background px-3 label-eyebrow">or quick demo</span></div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {DEMO_ACCOUNTS.map((a) => (
                  <button type="button" key={a.email} onClick={() => loginWithDemo(a)} data-testid={a.testId}
                    className="border border-border rounded-xl p-3 text-left hover:border-flame hover:-translate-y-0.5 transition-all bg-card group">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`h-8 w-8 rounded-lg ${a.color} grid place-items-center`}>
                        <a.icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="text-[9px] font-bold text-muted-foreground group-hover:text-flame">→</div>
                    </div>
                    <div className="font-display font-bold text-sm">{a.label}</div>
                    <div className="text-[10px] text-muted-foreground mono mt-0.5 truncate">{a.email}</div>
                  </button>
                ))}
              </div>

              <p className="text-[11px] text-muted-foreground text-center mt-5">
                By continuing, you agree to RK POOJA's <span className="underline">Terms</span> & <span className="underline">Privacy</span>.
              </p>
            </form>
          )}

          {step === "otp" && (
            <div className="mt-8 space-y-6">
              {sentOtp && (
                <div className="text-center bg-flame/5 border border-flame/30 rounded-xl py-3 text-sm">
                  <span className="text-muted-foreground">Demo OTP — </span>
                  <span className="font-mono font-black text-2xl text-flame tracking-[0.4em]">{sentOtp}</span>
                </div>
              )}
              <div className="flex justify-center" data-testid="otp-slots">
                <InputOTP maxLength={6} value={otp} onChange={setOtp} disabled={loading}>
                  <InputOTPGroup>
                    {[0,1,2,3,4,5].map(i => (
                      <InputOTPSlot key={i} index={i} className="h-14 w-12 text-2xl font-mono font-black border-r-0 last:border-r"/>
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button onClick={() => handleVerify()} className="w-full h-12 bg-brand hover:bg-brand-light text-white" disabled={loading || otp.length < 6} data-testid="verify-otp-btn">
                {loading ? <Loader2 className="h-4 w-4 animate-spin"/> : "Verify & continue"}
              </Button>
              <div className="flex items-center justify-between text-sm">
                <Button type="button" variant="ghost" size="sm" onClick={() => { setStep("email"); setOtp(""); setSentOtp(""); }} data-testid="back-to-email-btn">
                  <ArrowLeft className="h-3 w-3 mr-1"/> Change email
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={handleSendOtp} data-testid="resend-otp-btn">
                  Resend OTP
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
