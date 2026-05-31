import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Plus, ArrowUpRight, ArrowDownRight, CreditCard, Loader2, ShieldCheck } from "lucide-react";

export const Wallet = () => {
  const { refresh } = useAuth();
  const [data, setData] = useState({ balance: 0, transactions: [] });
  const [packages, setPackages] = useState([]);
  const [paying, setPaying] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const load = async () => {
    const [w, p] = await Promise.all([api.get("/wallet"), api.get("/payments/packages")]);
    setData(w.data);
    setPackages(p.data);
  };

  useEffect(() => { load(); }, []);

  // Handle return from Stripe (poll status)
  useEffect(() => {
    const sid = searchParams.get("session_id");
    const cancelled = searchParams.get("cancelled");
    if (cancelled) {
      toast("Payment cancelled");
      setSearchParams({}, { replace: true });
      return;
    }
    if (!sid) return;
    let attempts = 0;
    const max = 6;
    const tick = async () => {
      attempts++;
      try {
        const r = await api.get(`/payments/status/${sid}`);
        if (r.data.payment_status === "paid") {
          toast.success("Payment successful — wallet credited!");
          setSearchParams({}, { replace: true });
          await refresh();
          load();
          return;
        }
        if (r.data.status === "expired") {
          toast.error("Payment session expired");
          setSearchParams({}, { replace: true });
          return;
        }
        if (attempts < max) setTimeout(tick, 2000);
        else { toast("Payment status pending — check again shortly"); setSearchParams({}, { replace: true }); }
      } catch {
        if (attempts < max) setTimeout(tick, 2000);
      }
    };
    toast.loading("Confirming payment…", { id: "pay-poll" });
    tick();
    return () => toast.dismiss("pay-poll");
    // eslint-disable-next-line
  }, []);

  const buyPackage = async (pkg) => {
    setPaying(pkg.id);
    try {
      const r = await api.post("/payments/checkout", {
        package_id: pkg.id,
        origin_url: window.location.origin,
      });
      window.location.href = r.data.url;
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Could not start checkout");
      setPaying(null);
    }
  };

  return (
    <div className="px-5 pt-8 animate-fade-in">
      <div className="label-eyebrow">Your money</div>
      <h1 className="font-display font-black text-3xl tracking-tight mt-1">Wallet</h1>

      <div className="mt-6 border border-border rounded-3xl p-6 bg-brand text-white relative overflow-hidden">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-flame/20 blur-2xl" />
        <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="label-eyebrow text-white/60">Available balance</div>
        <div className="mt-2 font-display font-black text-5xl" data-testid="wallet-balance">₹{(data.balance || 0).toFixed(0)}</div>
        <div className="mt-1 text-xs text-white/60 mono">RK POOJA Wallet · ****1234</div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <div className="label-eyebrow">Add money</div>
          <div className="inline-flex items-center gap-1 text-[10px] text-success font-bold uppercase tracking-wider">
            <ShieldCheck className="h-3 w-3"/> Secured by Stripe
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {packages.map(p => (
            <Button key={p.id} variant="outline" onClick={() => buyPackage(p)} disabled={paying === p.id}
              data-testid={`topup-${p.id}`} className="h-14 flex-col gap-0.5 rounded-2xl hover:border-flame">
              {paying === p.id
                ? <Loader2 className="h-4 w-4 animate-spin text-flame"/>
                : <><span className="font-display font-black text-base">{p.label}</span><span className="text-[10px] text-muted-foreground">Pay</span></>}
            </Button>
          ))}
        </div>
        <div className="mt-3 text-[11px] text-muted-foreground inline-flex items-center gap-1">
          <CreditCard className="h-3 w-3"/> UPI, Cards, Net Banking, Wallets supported
        </div>
      </div>

      <div className="mt-7 mb-6">
        <div className="label-eyebrow mb-2">Recent activity</div>
        {(data.transactions || []).length === 0 ? (
          <div className="text-sm text-muted-foreground border border-dashed border-border rounded-xl p-6 text-center">No transactions yet</div>
        ) : (
          <div className="space-y-2" data-testid="wallet-txns">
            {data.transactions.map((t) => (
              <div key={t.id} className="flex items-center gap-3 border border-border rounded-xl p-3 bg-card">
                <div className={`h-9 w-9 rounded-full grid place-items-center ${t.type === "topup" ? "bg-success/10 text-success" : "bg-flame/10 text-flame"}`}>
                  {t.type === "topup" ? <ArrowDownRight className="h-4 w-4"/> : <ArrowUpRight className="h-4 w-4"/>}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm capitalize">{t.type}</div>
                  <div className="text-[11px] text-muted-foreground">{new Date(t.created_at).toLocaleString()}</div>
                </div>
                <div className={`font-display font-black ${t.type === "topup" ? "text-success" : "text-foreground"}`}>
                  {t.type === "topup" ? "+" : "-"}₹{t.amount}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
