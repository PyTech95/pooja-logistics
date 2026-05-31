import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Car, IndianRupee, Users, MapPin, Plus } from "lucide-react";

export const FleetDashboard = () => {
  const [stats, setStats] = useState(null);
  const [form, setForm] = useState({ make: "", model: "", number: "", type: "car", capacity: 4, driver_email: "" });

  const load = () => api.get("/fleet/stats").then(r => setStats(r.data));
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!form.make || !form.model || !form.number) return toast.error("Fill make, model & number");
    await api.post("/fleet/vehicles", form);
    toast.success("Vehicle added");
    setForm({ make: "", model: "", number: "", type: "car", capacity: 4, driver_email: "" });
    load();
  };

  if (!stats) return <div className="p-6 text-muted-foreground">Loading…</div>;

  return (
    <div className="p-6 animate-fade-in">
      <div className="label-eyebrow">Fleet overview</div>
      <h1 className="font-display font-black text-3xl tracking-tight mt-1">Your operations</h1>

      <div className="mt-6 grid sm:grid-cols-4 gap-3">
        {[
          { l: "Vehicles", v: stats.vehicles, i: Car, t: "fleet-stat-vehicles" },
          { l: "Drivers", v: stats.drivers, i: Users, t: "fleet-stat-drivers" },
          { l: "Trips", v: stats.trips, i: MapPin, t: "fleet-stat-trips" },
          { l: "Earnings", v: `₹${stats.revenue.toFixed(0)}`, i: IndianRupee, t: "fleet-stat-revenue" },
        ].map(c => (
          <div key={c.l} className="border border-border rounded-2xl p-5 bg-card" data-testid={c.t}>
            <div className="flex items-center justify-between"><div className="label-eyebrow">{c.l}</div><c.i className="h-4 w-4 text-flame"/></div>
            <div className="font-display font-black text-3xl mt-2">{c.v}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1 border border-border rounded-2xl p-5 bg-card">
          <div className="label-eyebrow">Add vehicle</div>
          <h3 className="font-display font-bold text-xl mt-1">New entry</h3>
          <div className="mt-4 space-y-3">
            <div><Label className="label-eyebrow">Make</Label><Input value={form.make} onChange={(e) => setForm({...form, make: e.target.value})} className="h-10 mt-1" data-testid="fleet-make"/></div>
            <div><Label className="label-eyebrow">Model</Label><Input value={form.model} onChange={(e) => setForm({...form, model: e.target.value})} className="h-10 mt-1" data-testid="fleet-model"/></div>
            <div><Label className="label-eyebrow">Number plate</Label><Input value={form.number} onChange={(e) => setForm({...form, number: e.target.value.toUpperCase()})} className="h-10 mt-1 mono uppercase" data-testid="fleet-number"/></div>
            <div><Label className="label-eyebrow">Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({...form, type: v})}>
                <SelectTrigger className="h-10 mt-1" data-testid="fleet-type"><SelectValue/></SelectTrigger>
                <SelectContent>
                  {["car","auto","bike","tempo","bus","porter","goods"].map(t => <SelectItem key={t} value={t}>{t.toUpperCase()}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label className="label-eyebrow">Driver email (optional)</Label><Input value={form.driver_email} onChange={(e) => setForm({...form, driver_email: e.target.value})} className="h-10 mt-1 mono" data-testid="fleet-driver-email"/></div>
            <Button onClick={add} className="w-full bg-flame hover:bg-flame-dark text-white" data-testid="fleet-add-btn"><Plus className="h-4 w-4 mr-1"/> Add vehicle</Button>
          </div>
        </div>

        <div className="lg:col-span-2 border border-border rounded-2xl bg-card overflow-hidden">
          <div className="p-5 border-b border-border">
            <div className="label-eyebrow">Your fleet</div>
            <h3 className="font-display font-bold text-xl mt-1">Vehicles</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="p-3 label-eyebrow">Vehicle</th>
                <th className="p-3 label-eyebrow">Number</th>
                <th className="p-3 label-eyebrow">Type</th>
                <th className="p-3 label-eyebrow">Driver</th>
              </tr>
            </thead>
            <tbody>
              {stats.vehicles_list.map(v => (
                <tr key={v.id} className="border-t border-border" data-testid={`fleet-veh-${v.id}`}>
                  <td className="p-3 font-bold">{v.make} {v.model}</td>
                  <td className="p-3 mono">{v.number}</td>
                  <td className="p-3 uppercase font-bold text-xs">{v.type}</td>
                  <td className="p-3 text-muted-foreground text-xs">{v.driver_email || "Unassigned"}</td>
                </tr>
              ))}
              {stats.vehicles_list.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No vehicles yet — add your first above.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
