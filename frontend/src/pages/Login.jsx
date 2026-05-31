import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const DEMO_ACCOUNTS = [
  { email: "customer@rkpooja.test", label: "Customer", color: "bg-brand", testId: "demo-customer" },
  { email: "driver@rkpooja.test",   label: "Driver",   color: "bg-flame", testId: "demo-driver" },
  { email: "admin@rkpooja.test",    label: "Admin",    color: "bg-foreground", testId: "demo-admin" },
  { email: "fleet@rkpooja.test",    label: "Fleet",    color: "bg-success", testId: "demo-fleet" },
];

export const Login = () => {
  const nav = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [role, setRole] = useState("customer");
  const [step, setStep] = useState("email");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e?.preventDefault?.();
    if (!email) return toast.error("Enter your email");
    setLoading(true);
    try {
      const r = await api.post("/auth/request-otp", { email, role });
      toast.success(`OTP sent: ${r.data.otp}`, { description: "Demo mode — OTP shown for testing." });
      setStep("otp");
    } catch (err) {
      toast.error("Failed to send OTP");
    } finally { setLoading(false); }
  };

  const handleVerify = async (e) => {
    e?.preventDefault?.();
    if (otp.length < 4) return toast.error("Enter the 6-digit OTP");
    setLoading(true);
    try {
      const r = await api.post("/auth/verify-otp", { email, otp });
      login(r.data.token, r.data.user);
      toast.success(`Welcome, ${r.data.user.name}`);
      const map = { customer: "/app", driver: "/driver", admin: "/admin", fleet: "/fleet" };
      nav(map[r.data.user.role] || "/app", { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Invalid OTP");
    } finally { setLoading(false); }
  };

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
    } catch (err) {
      toast.error("Demo login failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left brand panel */}
      <div className="hidden lg:flex relative overflow-hidden bg-brand text-white flex-col justify-between p-12">
        <Logo size="lg" inverted />
        <div>
          <div className="label-eyebrow text-white/60">India's mobility super app</div>
          <h2 className="font-display font-black text-5xl xl:text-6xl mt-4 leading-[1] tracking-[-0.03em]">
            ONE APP.<br/><span className="text-flame">ALL RIDES.</span>
          </h2>
          <p className="text-white/70 mt-6 max-w-md">Car · Auto · Bike · Tempo · Bus · Porter · Goods · Outstation · Airport. All in one tap.</p>
        </div>
        <div className="text-xs text-white/40 mono">© 2026 RK POOJA Mobility</div>
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-flame/10 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-96 w-96 rounded-full bg-flame/20 blur-3xl" />
      </div>

      {/* Right form */}
      <div className="flex flex-col justify-center p-6 sm:p-12">
        <div className="lg:hidden mb-8"><Logo /></div>
        <div className="max-w-md w-full mx-auto">
          <div className="label-eyebrow mb-3">{step === "email" ? "Sign in / Sign up" : "Verify"}</div>
          <h1 className="font-display font-black text-4xl tracking-tight">{step === "email" ? "Let's get moving." : "Enter your OTP"}</h1>
          <p className="text-muted-foreground text-sm mt-2">{step === "email" ? "Use your email — we'll send a 6-digit OTP." : `OTP sent to ${email}`}</p>

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
                {loading ? <Loader2 className="h-4 w-4 animate-spin"/> : "Send OTP"}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center text-xs"><span className="bg-background px-3 label-eyebrow">or quick demo</span></div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {DEMO_ACCOUNTS.map((a) => (
                  <button type="button" key={a.email} onClick={() => loginWithDemo(a)} data-testid={a.testId}
                    className="border border-border rounded-lg p-3 text-left hover:border-flame transition-colors">
                    <div className={`h-2 w-8 rounded-full ${a.color} mb-2`} />
                    <div className="font-bold text-sm">{a.label}</div>
                    <div className="text-[10px] text-muted-foreground mono mt-0.5 truncate">{a.email}</div>
                  </button>
                ))}
              </div>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerify} className="mt-8 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="otp" className="label-eyebrow">OTP</Label>
                <Input id="otp" inputMode="numeric" maxLength={6} placeholder="123456"
                  value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="h-14 text-2xl tracking-[0.5em] text-center font-mono" data-testid="otp-input" />
              </div>
              <Button type="submit" className="w-full h-12 bg-brand hover:bg-brand-light text-white" disabled={loading} data-testid="verify-otp-btn">
                {loading ? <Loader2 className="h-4 w-4 animate-spin"/> : "Verify & Continue"}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => setStep("email")} data-testid="back-to-email-btn">Change email</Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
