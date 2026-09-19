const statusConfig = {
  RUNNING: { dot: "bg-success-500", text: "text-success-400", bg: "bg-success-500/10", animate: "animate-pulse-dot" },
  IDLE: { dot: "bg-slate-500", text: "text-slate-400", bg: "bg-slate-500/10", animate: "" },
  CRITICAL: { dot: "bg-error-500", text: "text-error-400", bg: "bg-error-500/10", animate: "animate-flash" },
  MAINTENANCE: { dot: "bg-warning-500", text: "text-warning-400", bg: "bg-warning-500/10", animate: "" },
  LOW: { dot: "bg-success-500", text: "text-success-400", bg: "bg-success-500/10", animate: "" },
  MEDIUM: { dot: "bg-warning-500", text: "text-warning-400", bg: "bg-warning-500/10", animate: "" },
  HIGH: { dot: "bg-error-500", text: "text-error-400", bg: "bg-error-500/10", animate: "animate-flash" },
};

export default function StatusBadge({ status, size = "sm" }) {
  const config = statusConfig[status] || statusConfig.IDLE;
  const sizeClasses = size === "lg" ? "px-3 py-1.5 text-sm" : "px-2.5 py-1 text-xs";

  return (
    <span className={`inline-flex items-center gap-2 rounded-full font-medium ${config.bg} ${config.text} ${sizeClasses}`}>
      <span className={`w-2 h-2 rounded-full ${config.dot} ${config.animate}`} />
      {status}
    </span>
  );
}
