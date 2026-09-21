import { useState } from "react";
import { Bot, CircleDollarSign, Send, Sparkles, Truck, Wrench } from "lucide-react";
import PageShell, { IconFrame, panel } from "../components/PageShell";
import { askAssistant, predictMaintenance } from "../services/api";

const machines = [
  { code: "KOM 303", name: "Komatsu 730E", health: 92, hm: "20.25 HM", next: "48 HM" },
  { code: "CAT 211", name: "Caterpillar 777", health: 68, hm: "17.25 HM", next: "12 HM" },
  { code: "D11-709", name: "Bull CAT D11", health: 41, hm: "18.00 HM", next: "Due now" },
  { code: "PELLE 1", name: "Pelle CAT 6040", health: 84, hm: "11.00 HM", next: "96 HM" },
];

function HealthBar({ value }) { return <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden"><div className={`h-full rounded-full ${value < 50 ? "bg-rose-500" : value < 75 ? "bg-amber-400" : "bg-[#d4ff00]"}`} style={{ width: `${value}%` }} /></div>; }

export default function Maintenance() {
  const [selected, setSelected] = useState(machines[0]);
  const [service, setService] = useState("Hydraulic service");
  const [estimate, setEstimate] = useState(null);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([{ role: "assistant", text: "Diagnostic ready. Ask about a machine, service window, or anomaly." }]);

  const estimateCost = async (event) => {
    event.preventDefault();
    try { setEstimate(await predictMaintenance({ machine_code: selected.code, maintenance_type: service, planned_hours: 8, actual_hours: 0 })); } catch { setEstimate({ estimated_cost: 18400, currency: "MAD" }); }
  };
  const sendQuestion = async (event) => {
    event.preventDefault();
    if (!question.trim()) return;
    const prompt = question.trim(); setQuestion(""); setMessages((current) => [...current, { role: "user", text: prompt }]);
    try { const result = await askAssistant(prompt); setMessages((current) => [...current, { role: "assistant", text: result.response }]); } catch { setMessages((current) => [...current, { role: "assistant", text: "Telemetry context unavailable. Review the latest hydraulic readings before dispatch." }]); }
  };

  return <PageShell><div className="h-full flex flex-col gap-5">
    <div><p className="text-[#d4ff00] text-xs font-mono uppercase tracking-[0.22em]">OCP Zone 4 / WORK ORDERS</p><h1 className="text-white font-bold tracking-tight text-3xl">Maintenance Control Room</h1><p className="text-zinc-500 text-sm mt-1">Predict service demand and keep the active fleet moving through the next shift.</p></div>
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0">
      <section className={`${panel} lg:col-span-7 flex flex-col`}><div className="flex items-center gap-3 mb-5"><IconFrame><Wrench className="w-5 h-5" /></IconFrame><div><h2 className="text-white font-bold tracking-tight text-lg">Service forecast</h2><p className="text-zinc-500 text-xs">AI-assisted maintenance planning</p></div></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><label className="text-[10px] uppercase tracking-widest text-zinc-500">Equipment<select value={selected.code} onChange={(event) => setSelected(machines.find((machine) => machine.code === event.target.value))} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white font-mono outline-none"><option>KOM 303</option><option>CAT 211</option><option>D11-709</option><option>PELLE 1</option></select></label><label className="text-[10px] uppercase tracking-widest text-zinc-500">Service type<select value={service} onChange={(event) => setService(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none"><option>Hydraulic service</option><option>Engine check</option><option>Full overhaul</option></select></label></div><div className="grid grid-cols-3 gap-3 my-5"><div className="rounded-2xl border border-white/5 bg-black/20 p-4"><p className="text-[10px] text-zinc-500">HEALTH</p><p className="mt-1 text-2xl text-white font-mono">{selected.health}<span className="text-sm text-zinc-500">/100</span></p></div><div className="rounded-2xl border border-white/5 bg-black/20 p-4"><p className="text-[10px] text-zinc-500">CURRENT HM</p><p className="mt-1 text-2xl text-white font-mono">{selected.hm.split(" ")[0]}</p></div><div className="rounded-2xl border border-white/5 bg-black/20 p-4"><p className="text-[10px] text-zinc-500">NEXT WINDOW</p><p className="mt-1 text-2xl text-[#d4ff00] font-mono">{selected.next.split(" ")[0]}</p></div></div><button type="button" onClick={estimateCost} className="self-start flex items-center gap-2 rounded-xl bg-[#d4ff00] px-4 py-3 text-sm font-bold text-black hover:bg-white/10 hover:border-white/20 transition-all"><span className="rounded-lg bg-black/10 p-1"><Sparkles className="w-4 h-4" /></span>Predict service cost</button>{estimate && <p className="mt-3 text-sm text-zinc-400">Estimated: <span className="font-mono text-white">{Number(estimate.estimated_cost).toLocaleString()} {estimate.currency || "MAD"}</span></p>}</section>
      <section className={`${panel} lg:col-span-5 min-h-0 overflow-auto`}><div className="flex items-center justify-between mb-4"><div className="flex items-center gap-3"><IconFrame><Truck className="w-5 h-5" /></IconFrame><div><h2 className="text-white font-bold tracking-tight text-lg">Fleet health queue</h2><p className="text-zinc-500 text-xs">Predicted service need</p></div></div><span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-rose-500/10 border border-rose-500/20 text-rose-400">3 DUE</span></div><div className="space-y-3">{machines.map((machine) => <button type="button" key={machine.code} onClick={() => setSelected(machine)} className={`w-full text-left rounded-2xl border p-3 hover:bg-white/10 hover:border-white/20 transition-all ${selected.code === machine.code ? "bg-[#d4ff00]/10 border-[#d4ff00]/30" : "bg-black/20 border-white/5"}`}><div className="flex justify-between mb-2"><span className="text-white font-mono font-bold">{machine.code}</span><span className={`font-mono text-xs ${machine.health < 50 ? "text-rose-400" : "text-zinc-400"}`}>{machine.health}/100 · {machine.next}</span></div><p className="text-xs text-zinc-500 mb-2">{machine.name} · {machine.hm}</p><HealthBar value={machine.health} /></button>)}</div></section>
      <section className={`${panel} lg:col-span-7 min-h-0`}><div className="flex items-center gap-3 mb-4"><IconFrame><Bot className="w-5 h-5" /></IconFrame><div><h2 className="text-white font-bold tracking-tight text-lg">AI supervisor</h2><p className="text-zinc-500 text-xs">OCP Zone 4 diagnostics</p></div></div><div className="h-36 overflow-auto space-y-2">{messages.map((message, index) => <p key={index} className={`max-w-[85%] rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm ${message.role === "user" ? "ml-auto text-[#d4ff00]" : "text-zinc-300"}`}>{message.text}</p>)}</div><form onSubmit={sendQuestion} className="mt-3 flex gap-2"><input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask about KOM 303..." className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600" /><button type="submit" aria-label="Send question" className="p-2 rounded-xl bg-gradient-to-br from-white/10 to-transparent backdrop-blur-md border border-white/10 shadow-lg flex items-center justify-center bg-[#d4ff00]/20 text-[#d4ff00]"><Send className="w-4 h-4" /></button></form></section>
      <section className={`${panel} lg:col-span-5`}><div className="flex items-center gap-3"><IconFrame className="text-rose-400"><CircleDollarSign className="w-5 h-5" /></IconFrame><div><p className="text-xs text-zinc-500">PROJECTED COST / TONNE</p><p className="text-3xl text-white font-mono font-bold">$140.21</p><p className="text-sm text-rose-400 mt-1">+8.4% vs last shift</p></div></div></section>
    </div>
  </div></PageShell>;
}
