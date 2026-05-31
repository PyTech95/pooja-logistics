import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { BadgeCheck, Upload } from "lucide-react";

export const DriverKYC = () => {
  const { user, refresh } = useAuth();
  const [form, setForm] = useState({
    aadhaar: user?.kyc?.aadhaar || "",
    pan: user?.kyc?.pan || "",
    driving_license: user?.kyc?.driving_license || "",
    vehicle_make: user?.vehicle?.make || "",
    vehicle_model: user?.vehicle?.model || "",
    vehicle_number: user?.vehicle?.number || "",
    vehicle_type: user?.vehicle?.type || "car",
  });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    try {
      await api.post("/driver/kyc", form);
      await refresh();
      toast.success("KYC submitted for review");
    } catch { toast.error("Submit failed"); } finally { setSaving(false); }
  };

  const set = (k) => (e) => setForm(s => ({ ...s, [k]: e.target.value }));

  return (
    <div className="max-w-3xl mx-auto px-5 py-6 animate-fade-in">
      <div className="label-eyebrow">Onboarding</div>
      <h1 className="font-display font-black text-3xl tracking-tight mt-1">Driver KYC</h1>

      <div className="mt-5 border border-border rounded-2xl p-4 bg-card flex items-center gap-3" data-testid="kyc-status-banner">
        <BadgeCheck className={`h-6 w-6 ${user?.kyc_status === "verified" ? "text-success" : "text-flame"}`} />
        <div className="flex-1">
          <div className="font-bold capitalize">{user?.kyc_status || "pending"}</div>
          <div className="text-xs text-muted-foreground">Submit all documents to start receiving trips.</div>
        </div>
      </div>

      <div className="mt-6 grid sm:grid-cols-2 gap-4">
        <div>
          <Label className="label-eyebrow">Aadhaar</Label>
          <Input value={form.aadhaar} onChange={set("aadhaar")} placeholder="XXXX-XXXX-XXXX" className="h-11 mt-1" data-testid="kyc-aadhaar"/>
        </div>
        <div>
          <Label className="label-eyebrow">PAN</Label>
          <Input value={form.pan} onChange={set("pan")} placeholder="ABCDE1234F" className="h-11 mt-1" data-testid="kyc-pan"/>
        </div>
        <div>
          <Label className="label-eyebrow">Driving license</Label>
          <Input value={form.driving_license} onChange={set("driving_license")} className="h-11 mt-1" data-testid="kyc-dl"/>
        </div>
        <div>
          <Label className="label-eyebrow">Vehicle type</Label>
          <Select value={form.vehicle_type} onValueChange={(v) => setForm(s => ({ ...s, vehicle_type: v }))}>
            <SelectTrigger className="h-11 mt-1" data-testid="kyc-vehicle-type"><SelectValue/></SelectTrigger>
            <SelectContent>
              {["car","auto","bike","tempo","bus","porter","goods"].map(t => <SelectItem key={t} value={t}>{t.toUpperCase()}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="label-eyebrow">Vehicle make</Label>
          <Input value={form.vehicle_make} onChange={set("vehicle_make")} placeholder="Maruti / Hero / Tata" className="h-11 mt-1" data-testid="kyc-make"/>
        </div>
        <div>
          <Label className="label-eyebrow">Vehicle model</Label>
          <Input value={form.vehicle_model} onChange={set("vehicle_model")} placeholder="Swift Dzire" className="h-11 mt-1" data-testid="kyc-model"/>
        </div>
        <div className="sm:col-span-2">
          <Label className="label-eyebrow">Vehicle number</Label>
          <Input value={form.vehicle_number} onChange={set("vehicle_number")} placeholder="BR01AB1234" className="h-11 mt-1 uppercase font-mono" data-testid="kyc-number"/>
        </div>
      </div>

      <div className="mt-6 border-2 border-dashed border-border rounded-2xl p-6 text-center text-muted-foreground" data-testid="kyc-upload-area">
        <Upload className="h-7 w-7 mx-auto mb-2"/>
        <div className="text-sm">Document uploads coming soon — RC, insurance, selfie verification.</div>
      </div>

      <Button className="w-full h-12 mt-6 bg-brand hover:bg-brand-light text-white" onClick={submit} disabled={saving} data-testid="submit-kyc-btn">
        {saving ? "Submitting…" : "Submit KYC"}
      </Button>
    </div>
  );
};
