import { NavLink } from "react-router-dom";
import { LayoutDashboard, Activity, Wrench, AlertTriangle, Factory } from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/telemetry", label: "Telemetry", icon: Activity },
  { to: "/maintenance", label: "Maintenance", icon: Wrench },
  { to: "/anomalies", label: "Anomalies", icon: AlertTriangle },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-slate-960 border-r border-slate-800 flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-800">
          <div className="w-10 h-10 rounded-lg bg-primary-600/20 flex items-center justify-center border border-primary-500/30">
            <Factory className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-slate-100 leading-tight">Industrial IoT</h1>
            <p className="text-xs text-slate-500">Fleet Monitor</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-primary-600/15 text-primary-400 border border-primary-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-semibold">
              OP
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">Operations</p>
              <p className="text-xs text-slate-500 truncate">admin@fleet.io</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
