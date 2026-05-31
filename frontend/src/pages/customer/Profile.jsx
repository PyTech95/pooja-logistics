import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { LogOut, Globe, Bell, Star, Gift } from "lucide-react";

const LANGS = [
  ["en","English"], ["hi","हिन्दी"], ["mr","मराठी"], ["gu","ગુજરાતી"], ["pa","ਪੰਜਾਬੀ"],
  ["bn","বাংলা"], ["ta","தமிழ்"], ["te","తెలుగు"], ["kn","ಕನ್ನಡ"], ["ml","മലയാളം"],
  ["or","ଓଡ଼ିଆ"], ["as","অসমীয়া"],
];

export const Profile = () => {
  const { user, logout, refresh } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [lang, setLang] = useState(user?.preferred_language || "en");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await api.patch("/auth/profile", { name, phone, preferred_language: lang });
      await refresh();
      toast.success("Profile updated");
    } catch { toast.error("Update failed"); }
    finally { setSaving(false); }
  };

  return (
    <div className="px-5 pt-8 pb-10 animate-fade-in">
      <div className="label-eyebrow">Your account</div>
      <h1 className="font-display font-black text-3xl tracking-tight mt-1">Profile</h1>

      <div className="mt-6 border border-border rounded-2xl p-5 bg-card flex items-center gap-4">
        <div className="h-16 w-16 rounded-2xl bg-brand text-white grid place-items-center font-display font-black text-2xl">
          {(user?.name || "U").charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="font-display font-bold text-lg">{user?.name}</div>
          <div className="text-xs text-muted-foreground mono">{user?.email}</div>
          <div className="flex items-center gap-3 mt-2 text-xs">
            <span className="flex items-center gap-1"><Star className="h-3 w-3 text-flame fill-flame"/> {(user?.rating || 5).toFixed(1)}</span>
            <span className="text-muted-foreground">{user?.trips || 0} trips</span>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <div className="space-y-1.5">
          <Label className="label-eyebrow">Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="h-11" data-testid="profile-name-input" />
        </div>
        <div className="space-y-1.5">
          <Label className="label-eyebrow">Phone</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-11" data-testid="profile-phone-input"/>
        </div>
        <div className="space-y-1.5">
          <Label className="label-eyebrow flex items-center gap-1"><Globe className="h-3 w-3"/>Preferred language</Label>
          <Select value={lang} onValueChange={setLang}>
            <SelectTrigger className="h-11" data-testid="profile-lang-select"><SelectValue/></SelectTrigger>
            <SelectContent>
              {LANGS.map(([k, label]) => <SelectItem key={k} value={k}>{label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={save} className="w-full h-12 bg-brand hover:bg-brand-light text-white" disabled={saving} data-testid="save-profile-btn">
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>

      <div className="mt-7 grid grid-cols-3 gap-2">
        <div className="border border-border rounded-xl p-3 text-center">
          <Bell className="h-5 w-5 mx-auto text-flame mb-1"/>
          <div className="text-[11px] label-eyebrow">Alerts</div>
        </div>
        <div className="border border-border rounded-xl p-3 text-center">
          <Gift className="h-5 w-5 mx-auto text-flame mb-1"/>
          <div className="text-[11px] label-eyebrow">Refer</div>
        </div>
        <div className="border border-border rounded-xl p-3 text-center">
          <Star className="h-5 w-5 mx-auto text-flame mb-1"/>
          <div className="text-[11px] label-eyebrow">Rewards</div>
        </div>
      </div>

      <Button variant="outline" className="w-full mt-7 border-destructive text-destructive" onClick={logout} data-testid="logout-btn">
        <LogOut className="h-4 w-4 mr-2"/> Sign out
      </Button>
    </div>
  );
};
