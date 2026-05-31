import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const AdminPromos = () => {
  const [promos, setPromos] = useState([]);
  const [form, setForm] = useState({ code: "", discount_percent: 10, max_discount: 100 });

  const load = () => api.get("/admin/promos").then(r => setPromos(r.data));
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.code) return toast.error("Enter a code");
    await api.post("/admin/promo", form);
    toast.success("Promo created");
    setForm({ code: "", discount_percent: 10, max_discount: 100 });
    load();
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="label-eyebrow">Marketing</div>
      <h1 className="font-display font-black text-3xl tracking-tight mt-1">Promo Codes</h1>

      <div className="mt-6 border border-border rounded-2xl p-5 bg-card grid sm:grid-cols-4 gap-3 items-end">
        <div>
          <Label className="label-eyebrow">Code</Label>
          <Input value={form.code} onChange={(e) => setForm(s => ({...s, code: e.target.value.toUpperCase()}))} placeholder="WELCOME50" className="h-11 mt-1 mono uppercase" data-testid="promo-code-input"/>
        </div>
        <div>
          <Label className="label-eyebrow">Discount %</Label>
          <Input type="number" value={form.discount_percent} onChange={(e) => setForm(s => ({...s, discount_percent: Number(e.target.value)}))} className="h-11 mt-1" data-testid="promo-pct-input"/>
        </div>
        <div>
          <Label className="label-eyebrow">Max discount ₹</Label>
          <Input type="number" value={form.max_discount} onChange={(e) => setForm(s => ({...s, max_discount: Number(e.target.value)}))} className="h-11 mt-1" data-testid="promo-max-input"/>
        </div>
        <Button onClick={create} className="h-11 bg-flame hover:bg-flame-dark text-white" data-testid="create-promo-btn">Create</Button>
      </div>

      <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {promos.map(p => (
          <div key={p.id} className="border border-border rounded-2xl p-5 bg-card" data-testid={`promo-${p.code}`}>
            <div className="label-eyebrow">Promo</div>
            <div className="font-display font-black text-2xl mt-1 mono">{p.code}</div>
            <div className="text-sm text-muted-foreground mt-2">{p.discount_percent}% off · up to ₹{p.max_discount}</div>
          </div>
        ))}
        {promos.length === 0 && <div className="text-muted-foreground text-sm">No promos yet — create one above.</div>}
      </div>
    </div>
  );
};
