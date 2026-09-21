import { useMemo, useState } from "react";
import { Activity, ArrowDown, ArrowUp, Gauge, Search, Thermometer, Zap } from "lucide-react";
import PageShell, { IconFrame, panel } from "../components/PageShell";

const telemetry = [
  { code: "KOM 303", name: "Komatsu 730E", temp: 92, pressure: 286, speed: 24, payload: 186.4, status: "RUNNING" },
  { code: "CAT 211", name: "Caterpillar 777", temp: 76, pressure: 264, speed: 19, payload: 190.1, status: "RUNNING" },
  { code: "D11-709", name: "Bull CAT D11", temp: 84, pressure: 221, speed: 8, payload: 0, status: "WARNING" },
  { code: "PELLE 1", name: "Pelle CAT 6040", temp: 64, pressure: 302, speed: 0, payload: 0, status: "MAINTENANCE" },
  { code: "KOM 318", name: "Komatsu 930E", temp: 71, pressure: 278, speed: 21, payload: 221.7, status: "RUNNING" },
];

function Metric({ icon, value, tone = "text-zinc-300" }) {
  return <span className={`flex items-center gap-2 font-mono ${tone}`}><IconFrame className="p-1.5 text-zinc-400"><span className="flex">{icon}</span></IconFrame>{value}</span>;
}

export default function Telemetry() {
  const [query, setQuery] = useState("");
  const [sortDesc, setSortDesc] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const rows = useMemo(() => telemetry.filter((item) => `${item.code} ${item.name}`.toLowerCase().includes(query.toLowerCase())).filter((item) => filter === "ALL" || item.status === filter).sort((a, b) => sortDesc ? b.temp - a.temp : a.temp - b.temp), [query, filter, sortDesc]);

  return <PageShell><div className="h-full flex flex-col gap-5">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[#d4ff00] text-xs font-mono uppercase tracking-[0.22em]">OCP Zone 4 / LIVE BUS</p><h1 className="text-white font-bold tracking-tight text-3xl">Telemetry Monitor</h1><p className="text-zinc-500 text-sm mt-1">High-frequency sensor readings across the active fleet.</p></div><div className="flex items-center gap-2 text-xs font-mono text-[#d4ff00]"><span className="h-2 w-2 rounded-full bg-[#d4ff00] shadow-[0_0_8px_#d4ff00]" />STREAM ACTIVE · 68 ASSETS</div></div>
    <div className={`${panel} flex-1 min-h-0 overflow-hidden flex flex-col`}><div className="flex flex-wrap items-center justify-between gap-3 mb-4"><div className="flex items-center gap-3"><IconFrame><Activity className="w-5 h-5" /></IconFrame><div><h2 className="text-white font-bold tracking-tight text-lg">Current readings</h2><p className="text-zinc-500 text-xs">Updated 15:42:18 UTC · 2.4 second latency</p></div></div><div className="flex items-center gap-2"><label className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2"><Search className="w-4 h-4 text-zinc-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search SAP or code" className="w-36 bg-transparent text-sm text-white outline-none placeholder:text-zinc-600" /></label><select value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-zinc-300 outline-none"><option value="ALL">All states</option><option value="RUNNING">Running</option><option value="WARNING">Warning</option><option value="MAINTENANCE">Maintenance</option></select></div></div><div className="overflow-auto"><table className="w-full min-w-[760px] text-sm"><thead><tr className="border-b border-white/10 text-left text-[10px] uppercase tracking-widest text-zinc-500"><th className="px-3 py-3">Equipment</th><th className="px-3 py-3 cursor-pointer" onClick={() => setSortDesc(!sortDesc)}>Temperature {sortDesc ? <ArrowDown className="inline w-3 h-3" /> : <ArrowUp className="inline w-3 h-3" />}</th><th className="px-3 py-3">Hydraulic pressure</th><th className="px-3 py-3">Speed</th><th className="px-3 py-3">Payload</th><th className="px-3 py-3">State</th></tr></thead><tbody>{rows.map((row) => <tr key={row.code} className="border-b border-white/5 hover:bg-white/10 hover:border-white/20 transition-all"><td className="px-3 py-4"><div className="flex items-center gap-3"><IconFrame className="p-1.5 text-zinc-300"><Gauge className="w-4 h-4" /></IconFrame><div><div className="text-white font-mono font-bold">{row.code}</div><div className="text-xs text-zinc-500">{row.name}</div></div></div></td><td className="px-3 py-4"><Metric icon={<Thermometer className="w-3.5 h-3.5" />} value={`${row.temp}°C`} tone={row.temp >= 80 ? "text-rose-400" : row.temp >= 75 ? "text-amber-400" : "text-zinc-300"} /></td><td className="px-3 py-4"><Metric icon={<Zap className="w-3.5 h-3.5" />} value={`${row.pressure} bar`} /></td><td className="px-3 py-4 font-mono text-zinc-300">{row.speed} km/h</td><td className="px-3 py-4 font-mono text-zinc-300">{row.payload.toFixed(1)} T</td><td className="px-3 py-4"><span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${row.status === "RUNNING" ? "bg-[#d4ff00]/10 border-[#d4ff00]/20 text-[#d4ff00]" : row.status === "WARNING" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"}`}>{row.status}</span></td></tr>)}</tbody></table></div></div>
  </div></PageShell>;
}
