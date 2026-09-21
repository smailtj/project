import { Link, useLocation } from "react-router-dom";
import { Bell, LayoutDashboard, User } from "lucide-react";

export const iconFrame = "p-2 rounded-xl bg-gradient-to-br from-white/10 to-transparent backdrop-blur-md border border-white/10 shadow-lg flex items-center justify-center";
export const panel = "bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg rounded-[28px] p-5";

const navItems = [
  ["/", "Dashboard"],
  ["/telemetry", "Véhicules"],
  ["/maintenance", "Maintenance"],
  ["/operators", "Opérateurs"],
  ["/anomalies", "Rapports"],
];

export function IconFrame({ children, className = "text-[#d4ff00]" }) {
  return <div className={`${iconFrame} ${className}`}>{children}</div>;
}

export default function PageShell({ children }) {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-[#07090e] p-4 lg:p-8 font-sans text-zinc-300 relative overflow-hidden flex items-center justify-center">
      <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-[#d4ff00]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[10%] w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="w-full max-w-[1400px] h-[calc(100vh-4rem)] relative z-10 bg-zinc-900/40 backdrop-blur-3xl rounded-[40px] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.6)] border border-white/10 flex flex-col gap-5 overflow-hidden">
        <header className={`${panel} shrink-0 flex items-center justify-between !p-4 lg:!px-6`}>
          <Link to="/" className="flex items-center gap-3"><IconFrame><LayoutDashboard className="w-5 h-5" /></IconFrame><span className="text-white text-lg font-bold tracking-tight">IntelliMine<span className="text-[#d4ff00]">.OCP</span></span></Link>
          <nav className="hidden lg:flex items-center gap-1 bg-black/20 p-1.5 rounded-full border border-white/5 backdrop-blur-md">
            {navItems.map(([to, label]) => <Link key={to} to={to} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${location.pathname === to ? "bg-[#d4ff00] text-black font-semibold shadow-[0_0_10px_rgba(212,255,0,0.2)]" : "text-zinc-400 hover:text-white hover:bg-white/10"}`}>{label}</Link>)}
          </nav>
          <div className="flex items-center gap-3"><button type="button" aria-label="Notifications" className={`${iconFrame} text-zinc-300 hover:bg-white/10 hover:border-white/20 transition-all`}><Bell className="w-4 h-4" /></button><div className={`${iconFrame} text-zinc-300`}><User className="w-4 h-4" /></div></div>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto pr-1">{children}</main>
      </div>
    </div>
  );
}
