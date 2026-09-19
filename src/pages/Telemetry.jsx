import { useState, useEffect, useMemo } from "react";
import { Search, ArrowUpDown, ArrowUp, ArrowDown, Thermometer, Fuel, Gauge } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import { PageContainer, SectionCard, LoadingSpinner, EmptyState } from "../components/UI";
import { getTelemetryLatest } from "../services/api";

function SortIcon({ active, direction }) {
  if (!active) return <ArrowUpDown className="w-3.5 h-3.5 text-slate-600" />;
  return direction === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-primary-400" /> : <ArrowDown className="w-3.5 h-3.5 text-primary-400" />;
}

function TempCell({ value }) {
  const isCritical = value >= 80;
  const isWarning = value >= 65 && value < 80;
  const color = isCritical ? "text-error-400" : isWarning ? "text-warning-400" : "text-slate-300";
  return (
    <span className={`flex items-center gap-1.5 ${color}`}>
      <Thermometer className="w-3.5 h-3.5" />
      {value}°C
    </span>
  );
}

function FuelCell({ value }) {
  const color = value < 30 ? "text-error-400" : value < 50 ? "text-warning-400" : "text-slate-300";
  return (
    <span className={`flex items-center gap-1.5 ${color}`}>
      <Fuel className="w-3.5 h-3.5" />
      {value}%
    </span>
  );
}

export default function Telemetry() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sort, setSort] = useState({ key: "machine_code", direction: "asc" });

  useEffect(() => {
    getTelemetryLatest()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = [...data];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.machine_code?.toLowerCase().includes(q) ||
          t.machine_name?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "ALL") {
      result = result.filter((t) => t.status === statusFilter);
    }
    result.sort((a, b) => {
      const aVal = a[sort.key];
      const bVal = b[sort.key];
      const mul = sort.direction === "asc" ? 1 : -1;
      if (typeof aVal === "number") return (aVal - bVal) * mul;
      return String(aVal).localeCompare(String(bVal)) * mul;
    });
    return result;
  }, [data, search, statusFilter, sort]);

  const toggleSort = (key) => {
    setSort((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  };

  const columns = [
    { key: "machine_code", label: "Machine Code" },
    { key: "machine_name", label: "Type" },
    { key: "temperature", label: "Temperature" },
    { key: "fuel_level", label: "Fuel Level" },
    { key: "utilization", label: "Utilization" },
    { key: "status", label: "Status" },
  ];

  if (loading) {
    return (
      <PageContainer>
        <LoadingSpinner size="lg" label="Loading telemetry data..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <SectionCard
        title="Live Telemetry"
        subtitle={`${filtered.length} machines — real-time sensor readings`}
        action={
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700">
              <Search className="w-4 h-4 text-slate-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search machines..."
                className="bg-transparent text-sm text-slate-300 placeholder-slate-600 outline-none w-40"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-300 outline-none cursor-pointer hover:border-slate-600"
            >
              <option value="ALL">All Status</option>
              <option value="RUNNING">Running</option>
              <option value="IDLE">Idle</option>
              <option value="CRITICAL">Critical</option>
              <option value="MAINTENANCE">Maintenance</option>
            </select>
          </div>
        }
      >
        {filtered.length === 0 ? (
          <EmptyState message="No machines match your filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      onClick={() => col.key !== "status" && toggleSort(col.key)}
                      className={`text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider ${
                        col.key !== "status" ? "cursor-pointer hover:text-slate-200 select-none" : ""
                      }`}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        {col.label}
                        {col.key !== "status" && <SortIcon active={sort.key === col.key} direction={sort.direction} />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm font-medium text-slate-200">{row.machine_code}</td>
                    <td className="py-3 px-4 text-sm text-slate-400">{row.machine_name}</td>
                    <td className="py-3 px-4 text-sm"><TempCell value={row.temperature} /></td>
                    <td className="py-3 px-4 text-sm"><FuelCell value={row.fuel_level} /></td>
                    <td className="py-3 px-4 text-sm">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <Gauge className="w-3.5 h-3.5" />
                        {row.utilization}%
                      </span>
                    </td>
                    <td className="py-3 px-4"><StatusBadge status={row.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </PageContainer>
  );
}
