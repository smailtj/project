import { TrendingUp, TrendingDown } from "lucide-react";

export default function KPICard({ title, value, unit, trend, icon: Icon, accent = "primary", subtitle }) {
  const accentColors = {
    primary: "from-primary-500/20 to-primary-600/5 border-primary-500/20 text-primary-400",
    success: "from-success-500/20 to-success-600/5 border-success-500/20 text-success-400",
    warning: "from-warning-500/20 to-warning-600/5 border-warning-500/20 text-warning-400",
    error: "from-error-500/20 to-error-600/5 border-error-500/20 text-error-400",
    accent: "from-accent-500/20 to-accent-600/5 border-accent-500/20 text-accent-400",
  };

  const isPositiveTrend = trend >= 0;

  return (
    <div className={`card card-hover p-5 bg-gradient-to-br ${accentColors[accent]} animate-fade-in`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-400">{title}</p>
        </div>
        {Icon && (
          <div className={`p-2 rounded-lg bg-slate-900/60 ${accentColors[accent].split(" ").pop()}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-1.5 mb-2">
        <span className="text-3xl font-bold text-slate-50 tabular-nums">
          {typeof value === "number" ? value.toLocaleString() : value}
        </span>
        {unit && <span className="text-sm font-medium text-slate-500">{unit}</span>}
      </div>

      {subtitle && <p className="text-xs text-slate-500 mb-2">{subtitle}</p>}

      {trend !== undefined && trend !== null && (
        <div className="flex items-center gap-1.5">
          <span
            className={`flex items-center gap-1 text-xs font-semibold ${
              isPositiveTrend ? "text-success-400" : "text-error-400"
            }`}
          >
            {isPositiveTrend ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {Math.abs(trend)}%
          </span>
          <span className="text-xs text-slate-600">vs last period</span>
        </div>
      )}
    </div>
  );
}
