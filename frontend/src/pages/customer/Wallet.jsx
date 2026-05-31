import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Plus, ArrowUpRight, ArrowDownRight } from "lucide-react";

const QUICK = [100, 200, 500, 1000, 2000];

export const Wallet = () => {
  const { refresh } = useAuth();
  const [data, setData] = useState({ balance: 0, transactions: [] });

  const load = async () => {
    const r = await api.get("/wallet");
    setData(r.data);
  };

  useEffect(() => { load(); }, []);

  const topup = async (amount) => {
    await api.post("/wallet/topup", { amount });
    toast.success(`₹${amount} added to wallet`);
    await refresh();
    load();
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
        <div className="label-eyebrow mb-2">Add money</div>
        <div className="flex flex-wrap gap-2">
          {QUICK.map(q => (
            <Button key={q} variant="outline" onClick={() => topup(q)} data-testid={`topup-${q}`} className="rounded-full h-10">
              <Plus className="h-3 w-3 mr-1" /> ₹{q}
            </Button>
          ))}
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
