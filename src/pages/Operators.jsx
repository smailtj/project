import { useMemo, useState } from "react";
import { Activity, BadgeCheck, Clock3, Search, ShieldCheck, UserRound } from "lucide-react";
import PageShell, { IconFrame, panel } from "../components/PageShell";

const operators = [
  { name: "Youssef El Amrani", id: "OP-2041", machine: "KOM 303", shift: "Matin", hours: "07.25", safety: 98, status: "ON DUTY" },
  { name: "Samira Benaissa", id: "OP-1988", machine: "CAT 211", shift: "Matin", hours: "06.80", safety: 96, status: "ON DUTY" },
  { name: "Adil Rahmani", id: "OP-2110", machine: "D11-709", shift: "Soir", hours: "04.50", safety: 91, status: "BREAK" },
  { name: "Nadia Tazi", id: "OP-1872", machine: "PELLE 1", shift: "Nuit", hours: "00.00", safety: 100, status: "OFF SHIFT" },
];

export default function Operators() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => operators.filter((operator) => `${operator.name} ${operator.id} ${operator.machine}`.toLowerCase().includes(query.toLowerCase())), [query]);
  return <PageShell><div className="h-full flex flex-col gap-5">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[#d4ff00] text-xs font-mono uppercase tracking-[0.22em]">OCP Zone 4 / PERSONNEL</p><h1 className="text-white font-bold tracking-tight text-3xl">Operator Control</h1><p className="text-zinc-500 text-sm mt-1">Shift assignments, certifications, and live operator status.</p></div><div className="flex items-center gap-2 text-xs font-mono text-zinc-400"><span className="h-2 w-2 rounded-full bg-[#d4ff00]" />24 ON SHIFT · 68 CERTIFIED</div></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <div className={panel}><div className="flex items-center gap-3"><IconFrame><UserRound className="w-5 h-5" /></IconFrame><div><p className="text-zinc-500 text-xs">ACTIVE OPERATORS</p><p className="text-white text-3xl font-mono font-bold">24</p></div></div></div>
      <div className={panel}><div className="flex items-center gap-3"><IconFrame><ShieldCheck className="w-5 h-5" /></IconFrame><div><p className="text-zinc-500 text-xs">SAFETY COMPLIANCE</p><p className="text-white text-3xl font-mono font-bold">96.4%</p></div></div></div>
      <div className={panel}><div className="flex items-center gap-3"><IconFrame className="text-rose-400"><Clock3 className="w-5 h-5" /></IconFrame><div><p className="text-zinc-500 text-xs">NEXT HANDOVER</p><p className="text-white text-3xl font-mono font-bold">18:00</p></div></div></div>
    </div>
    <section className={`${panel} flex-1 min-h-0 overflow-hidden flex flex-col`}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4"><div className="flex items-center gap-3"><IconFrame><BadgeCheck className="w-5 h-5" /></IconFrame><div><h2 className="text-white font-bold tracking-tight text-lg">Shift roster</h2><p className="text-zinc-500 text-xs">Verified personnel assigned to Zone 4 assets</p></div></div><label className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2"><IconFrame className="p-1.5 text-zinc-500"><Search className="w-3.5 h-3.5" /></IconFrame><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search operator or SAP" className="w-40 bg-transparent text-sm text-white outline-none placeholder:text-zinc-600" /></label></div>
      <div className="overflow-auto"><table className="w-full min-w-[760px] text-sm"><thead><tr className="border-b border-white/10 text-left text-[10px] uppercase tracking-widest text-zinc-500"><th className="px-3 py-3">Operator</th><th className="px-3 py-3">Assigned asset</th><th className="px-3 py-3">Shift</th><th className="px-3 py-3">Operating hours</th><th className="px-3 py-3">Safety score</th><th className="px-3 py-3">Status</th></tr></thead><tbody>{filtered.map((operator) => <tr key={operator.id} className="border-b border-white/5 hover:bg-white/10 hover:border-white/20 transition-all"><td className="px-3 py-4"><div className="flex items-center gap-3"><IconFrame className="text-zinc-300"><UserRound className="w-4 h-4" /></IconFrame><div><div className="text-white font-semibold">{operator.name}</div><div className="text-zinc-500 text-xs font-mono">{operator.id}</div></div></div></td><td className="px-3 py-4 text-white font-mono">{operator.machine}</td><td className="px-3 py-4 text-zinc-300">{operator.shift}</td><td className="px-3 py-4 text-zinc-300 font-mono">{operator.hours} HM</td><td className="px-3 py-4"><span className="font-mono text-[#d4ff00]">{operator.safety}%</span></td><td className="px-3 py-4"><span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${operator.status === "ON DUTY" ? "bg-[#d4ff00]/10 border-[#d4ff00]/20 text-[#d4ff00]" : "bg-white/5 border-white/10 text-zinc-400"}`}><IconFrame className="p-0.5 border-0 shadow-none text-current"><Activity className="w-3 h-3" /></IconFrame>{operator.status}</span></td></tr>)}</tbody></table></div>
    </section>
  </div></PageShell>;
}
