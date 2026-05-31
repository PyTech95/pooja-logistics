import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Copy, Share2, Gift, Users, IndianRupee, Sparkles, MessageCircle } from "lucide-react";

export const Referral = () => {
  const nav = useNavigate();
  const { refresh } = useAuth();
  const [data, setData] = useState(null);
  const [code, setCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);

  const load = () => api.get("/referral").then(r => setData(r.data));
  useEffect(() => { load(); }, []);

  const copy = () => {
    navigator.clipboard.writeText(data.code);
    toast.success("Code copied!");
  };

  const share = async () => {
    const text = data.share_text + "\n" + data.share_url;
    if (navigator.share) {
      try { await navigator.share({ title: "RK POOJA", text, url: data.share_url }); } catch {}
    } else {
      navigator.clipboard.writeText(text);
      toast.success("Share text copied!");
    }
  };

  const whatsapp = () => {
    const text = encodeURIComponent(data.share_text + " " + data.share_url);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const redeem = async () => {
    if (!code.trim()) return toast.error("Enter a code");
    setRedeeming(true);
    try {
      const r = await api.post("/referral/redeem", { code });
      toast.success(`+₹${r.data.bonus} added to wallet!`);
      setCode("");
      await refresh();
      load();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Could not redeem");
    } finally { setRedeeming(false); }
  };

  if (!data) return <div className="p-6 text-muted-foreground">Loading…</div>;

  return (
    <div className="px-5 pt-6 pb-10 animate-fade-in">
      <Button variant="ghost" size="sm" onClick={() => nav(-1)} className="mb-3"><ArrowLeft className="h-4 w-4 mr-1"/>Back</Button>
      <div className="label-eyebrow">Earn together</div>
      <h1 className="font-display font-black text-3xl tracking-tight mt-1">Refer & earn</h1>
      <p className="text-sm text-muted-foreground mt-1">Get ₹100 instantly — your friend gets ₹100 too.</p>

      {/* Code card */}
      <div className="mt-6 border border-border rounded-3xl p-6 bg-brand text-white relative overflow-hidden">
        <Gift className="absolute -right-4 -top-4 h-32 w-32 text-flame/20"/>
        <div className="relative">
          <div className="label-eyebrow text-white/60">Your code</div>
          <div className="font-display font-black text-4xl mt-2 mono tracking-[0.05em]" data-testid="referral-code">{data.code}</div>
          <div className="text-sm text-white/70 mt-2 break-all">{data.share_url}</div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button onClick={copy} className="bg-white text-brand hover:bg-white/90" data-testid="copy-code-btn"><Copy className="h-4 w-4 mr-1"/>Copy</Button>
            <Button onClick={whatsapp} className="bg-success hover:bg-success/90 text-white" data-testid="whatsapp-btn"><MessageCircle className="h-4 w-4 mr-1"/>WhatsApp</Button>
            <Button onClick={share} className="bg-flame hover:bg-flame-dark text-white" data-testid="share-btn"><Share2 className="h-4 w-4 mr-1"/>Share</Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="border border-border rounded-2xl p-4 bg-card">
          <Users className="h-5 w-5 text-flame mb-2"/>
          <div className="font-display font-black text-3xl" data-testid="referral-invites">{data.successful_invites}</div>
          <div className="text-xs text-muted-foreground mt-1">invites converted</div>
        </div>
        <div className="border border-border rounded-2xl p-4 bg-card">
          <IndianRupee className="h-5 w-5 text-flame mb-2"/>
          <div className="font-display font-black text-3xl" data-testid="referral-earned">₹{data.earned.toFixed(0)}</div>
          <div className="text-xs text-muted-foreground mt-1">total earned</div>
        </div>
      </div>

      {/* Redeem code */}
      <div className="mt-7 border border-border rounded-2xl p-5 bg-card">
        <div className="flex items-center gap-2 mb-2"><Sparkles className="h-4 w-4 text-flame"/><div className="font-display font-bold">Got a code from a friend?</div></div>
        <div className="text-xs text-muted-foreground mb-3">Redeem to get ₹100 in your wallet, free.</div>
        <div className="flex gap-2">
          <Input placeholder="RK123ABC" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="h-11 mono uppercase" data-testid="redeem-input"/>
          <Button onClick={redeem} disabled={redeeming || !code} className="h-11 bg-brand hover:bg-brand-light text-white" data-testid="redeem-btn">
            Redeem
          </Button>
        </div>
      </div>

      {/* History */}
      <div className="mt-7">
        <div className="label-eyebrow mb-2">Your invites</div>
        {data.history.length === 0 ? (
          <div className="border border-dashed border-border rounded-xl p-6 text-center text-sm text-muted-foreground">
            No invites yet. Share your code to start earning.
          </div>
        ) : (
          <div className="space-y-2" data-testid="referral-history">
            {data.history.map(h => (
              <div key={h.id} className="flex items-center gap-3 border border-border rounded-xl p-3 bg-card">
                <div className="h-9 w-9 rounded-full bg-success/10 text-success grid place-items-center font-display font-black">
                  {(h.invitee_name || "?").charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm">{h.invitee_name}</div>
                  <div className="text-[11px] text-muted-foreground">{new Date(h.created_at).toLocaleDateString()}</div>
                </div>
                <div className="font-display font-black text-success">+₹{h.bonus}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
