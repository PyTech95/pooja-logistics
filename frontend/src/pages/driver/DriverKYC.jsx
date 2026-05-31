import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { BadgeCheck, Upload, FileText, CheckCircle2, Loader2, X, Image as ImageIcon } from "lucide-react";

const DOC_KINDS = [
  { id: "aadhaar", label: "Aadhaar", desc: "Front + back / e-Aadhaar PDF" },
  { id: "pan",     label: "PAN card", desc: "Photo of your PAN" },
  { id: "dl",      label: "Driving License", desc: "Front + back" },
  { id: "rc",      label: "Vehicle RC", desc: "Registration certificate" },
  { id: "insurance",label:"Insurance", desc: "Valid insurance copy" },
  { id: "selfie",  label: "Live selfie", desc: "Clear face photo" },
];

const FilePreview = ({ id }) => {
  const [blobUrl, setBlobUrl] = useState(null);
  useEffect(() => {
    let revoke;
    const token = localStorage.getItem("rk_token");
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/uploads/file/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.blob()).then(b => {
      const u = URL.createObjectURL(b);
      revoke = u;
      setBlobUrl(u);
    }).catch(() => {});
    return () => { if (revoke) URL.revokeObjectURL(revoke); };
  }, [id]);
  if (!blobUrl) return <div className="h-14 w-14 rounded-lg bg-muted animate-pulse"/>;
  return <img src={blobUrl} alt="" className="h-14 w-14 rounded-lg object-cover border border-border"/>;
};

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
  const [uploads, setUploads] = useState([]);
  const [uploadingKind, setUploadingKind] = useState(null);
  const fileInputs = useRef({});

  const loadUploads = async () => {
    try {
      const r = await api.get("/uploads/my");
      setUploads(r.data || []);
    } catch {}
  };

  useEffect(() => { loadUploads(); }, []);

  const submit = async () => {
    setSaving(true);
    try {
      await api.post("/driver/kyc", form);
      await refresh();
      toast.success("KYC submitted for review");
    } catch { toast.error("Submit failed"); } finally { setSaving(false); }
  };

  const set = (k) => (e) => setForm(s => ({ ...s, [k]: e.target.value }));

  const onFile = async (kind, file) => {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) return toast.error("Max 8 MB");
    setUploadingKind(kind);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/uploads/kyc?kind=${kind}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("rk_token")}` },
        body: fd,
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      toast.success(`${kind.toUpperCase()} uploaded`);
      await loadUploads();
    } catch (e) {
      toast.error("Upload failed");
    } finally { setUploadingKind(null); }
  };

  const deleteUpload = async (id) => {
    await api.delete(`/uploads/${id}`);
    toast("Removed");
    loadUploads();
  };

  const docsByKind = (kind) => uploads.filter(u => u.kind === kind);

  return (
    <div className="max-w-3xl mx-auto px-5 py-6 animate-fade-in">
      <div className="label-eyebrow">Onboarding</div>
      <h1 className="font-display font-black text-3xl tracking-tight mt-1">Driver KYC</h1>

      <div className="mt-5 border border-border rounded-2xl p-4 bg-card flex items-center gap-3" data-testid="kyc-status-banner">
        <BadgeCheck className={`h-6 w-6 ${user?.kyc_status === "verified" ? "text-success" : "text-flame"}`} />
        <div className="flex-1">
          <div className="font-bold capitalize">{user?.kyc_status || "pending"}</div>
          <div className="text-xs text-muted-foreground">Submit all documents and details to start receiving trips.</div>
        </div>
      </div>

      {/* Document uploads */}
      <div className="mt-6">
        <div className="label-eyebrow mb-3">Documents</div>
        <div className="space-y-3">
          {DOC_KINDS.map(k => {
            const docs = docsByKind(k.id);
            return (
              <div key={k.id} className="border border-border rounded-2xl p-4 bg-card" data-testid={`doc-block-${k.id}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-display font-bold flex items-center gap-2">
                      {k.label}
                      {docs.length > 0 && <CheckCircle2 className="h-4 w-4 text-success"/>}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{k.desc}</div>
                  </div>
                  <input
                    ref={el => fileInputs.current[k.id] = el}
                    type="file" accept="image/*,application/pdf" hidden
                    onChange={(e) => onFile(k.id, e.target.files?.[0])}
                    data-testid={`file-input-${k.id}`}
                  />
                  <Button size="sm" variant="outline" onClick={() => fileInputs.current[k.id]?.click()} disabled={uploadingKind === k.id}
                    data-testid={`upload-${k.id}-btn`}>
                    {uploadingKind === k.id ? <Loader2 className="h-3 w-3 animate-spin"/> : <><Upload className="h-3 w-3 mr-1"/>Upload</>}
                  </Button>
                </div>
                {docs.length > 0 && (
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {docs.map(d => (
                      <div key={d.id} className="relative group" data-testid={`doc-${d.id}`}>
                        {d.content_type?.startsWith("image/") ? <FilePreview id={d.id}/> : (
                          <div className="h-14 w-14 rounded-lg border border-border bg-muted grid place-items-center"><FileText className="h-5 w-5 text-flame"/></div>
                        )}
                        <button onClick={() => deleteUpload(d.id)} className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-white grid place-items-center opacity-0 group-hover:opacity-100 transition" data-testid={`delete-${d.id}`}>
                          <X className="h-3 w-3"/>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-7 grid sm:grid-cols-2 gap-4">
        <div>
          <Label className="label-eyebrow">Aadhaar number</Label>
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

      <Button className="w-full h-12 mt-6 bg-brand hover:bg-brand-light text-white" onClick={submit} disabled={saving} data-testid="submit-kyc-btn">
        {saving ? "Submitting…" : "Submit KYC"}
      </Button>
    </div>
  );
};
