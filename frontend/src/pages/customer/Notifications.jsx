import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bell, Sparkles, Ticket, Car, Gift, CheckCheck } from "lucide-react";

const KIND_ICON = {
  booking: Car,
  reward:  Gift,
  ticket:  Ticket,
  info:    Bell,
};

export const Notifications = () => {
  const nav = useNavigate();
  const [items, setItems] = useState([]);

  const load = () => api.get("/notifications").then(r => setItems(r.data));
  useEffect(() => { load(); }, []);

  const markAll = async () => {
    await api.post("/notifications/read-all");
    load();
  };

  return (
    <div className="px-5 pt-6 pb-10 animate-fade-in">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => nav(-1)}><ArrowLeft className="h-4 w-4 mr-1"/>Back</Button>
        <Button variant="ghost" size="sm" onClick={markAll} data-testid="mark-all-read-btn"><CheckCheck className="h-4 w-4 mr-1"/>Mark all read</Button>
      </div>

      <div className="label-eyebrow mt-3">Inbox</div>
      <h1 className="font-display font-black text-3xl tracking-tight mt-1">Notifications</h1>

      {items.length === 0 ? (
        <div className="mt-12 text-center text-muted-foreground" data-testid="no-notifications">
          <Bell className="h-10 w-10 mx-auto mb-3 opacity-40"/>
          You're all caught up.
        </div>
      ) : (
        <div className="mt-6 space-y-2" data-testid="notifications-list">
          {items.map(n => {
            const Icon = KIND_ICON[n.kind] || Bell;
            return (
              <div key={n.id} className={`flex gap-3 border rounded-2xl p-4 ${n.read ? "border-border bg-card" : "border-flame/30 bg-flame/5"}`}>
                <div className="h-9 w-9 rounded-full bg-flame/10 grid place-items-center shrink-0">
                  <Icon className="h-4 w-4 text-flame"/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-display font-bold text-sm">{n.title}</div>
                    {!n.read && <div className="h-2 w-2 rounded-full bg-flame shrink-0"/>}
                  </div>
                  <div className="text-sm text-muted-foreground mt-0.5">{n.body}</div>
                  <div className="text-[10px] text-muted-foreground mt-1.5 uppercase tracking-wider">{new Date(n.created_at).toLocaleString()}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
