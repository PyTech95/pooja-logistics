import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { Sparkles, Send, Loader2 } from "lucide-react";

const SUGGESTIONS = [
  "Plan a 3-day trip from Patna to Bodh Gaya",
  "What's the cheapest way to send a 5kg parcel?",
  "Translate 'Where is the railway station?' to Tamil",
  "Best vehicle for a family of 8 to Rajgir",
];

export const AIAssistant = () => {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Namaste 🙏 I'm your RK POOJA AI Assistant. Ask me anything about rides, deliveries, fares, or trip planning." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg) return;
    setMessages(m => [...m, { role: "user", content: msg }]);
    setInput("");
    setLoading(true);
    try {
      const r = await api.post("/ai/chat", { session_id: sessionId, message: msg });
      setSessionId(r.data.session_id);
      setMessages(m => [...m, { role: "assistant", content: r.data.reply }]);
    } catch (e) {
      setMessages(m => [...m, { role: "assistant", content: "Sorry, I couldn't respond. Please try again." }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] px-5 pt-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-flame/10 grid place-items-center"><Sparkles className="h-5 w-5 text-flame"/></div>
        <div>
          <div className="label-eyebrow">AI</div>
          <h1 className="font-display font-bold text-xl leading-none">RK POOJA Assistant</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mt-5 space-y-3 pb-4 no-scrollbar" data-testid="ai-chat-list">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
              m.role === "user" ? "bg-brand text-white rounded-tr-sm" : "bg-card border border-border rounded-tl-sm"
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start"><div className="bg-card border border-border px-4 py-2.5 rounded-2xl rounded-tl-sm text-sm flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" /> typing…
          </div></div>
        )}
        <div ref={endRef} />
      </div>

      {messages.length <= 1 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map(s => (
            <button key={s} className="px-3 py-2 text-[11px] rounded-full border border-border hover:border-flame text-left max-w-full"
              onClick={() => send(s)} data-testid={`ai-suggest-${s.slice(0,8)}`}>
              {s}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2 pb-2">
        <Input
          placeholder="Type your question…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="h-12"
          data-testid="ai-input"
        />
        <Button type="submit" className="h-12 px-4 bg-flame hover:bg-flame-dark text-white" disabled={loading} data-testid="ai-send-btn">
          <Send className="h-4 w-4"/>
        </Button>
      </form>
    </div>
  );
};
