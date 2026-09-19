import { Menu, Bell, Search } from "lucide-react";

export default function Navbar({ onMenuClick, title }) {
  return (
    <header className="sticky top-0 z-20 h-16 bg-slate-960/80 backdrop-blur border-b border-slate-800 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 w-64">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search machines..."
            className="bg-transparent text-sm text-slate-300 placeholder-slate-600 outline-none flex-1"
          />
        </div>
        <button className="relative p-2 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error-500 rounded-full" />
        </button>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-semibold">
          OP
        </div>
      </div>
    </header>
  );
}
