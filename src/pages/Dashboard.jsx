import { useState, useEffect } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, ReferenceLine,
} from "recharts";
import { Gauge, Clock, Fuel, Thermometer, Cpu, TrendingUp } from "lucide-react";
import KPICard from "../components/KPICard";
import { PageContainer, SectionCard, LoadingSpinner } from "../components/UI";
import { getKpis, getTelemetryLatest, getFuelTrend } from "../services/api";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold text-slate-100">
          {entry.value} {entry.unit || "L"}
        </p>
      ))}
    </div>
  );
}

function utilizationColor(value) {
  if (value >= 75) return "#22c55e";
  if (value >= 50) return "#f59e0b";
  return "#f43f5e";
}

export default function Dashboard() {
  const [kpis, setKpis] = useState(null);
  const [telemetry, setTelemetry] = useState([]);
  const [fuelTrend, setFuelTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getKpis(), getTelemetryLatest(), getFuelTrend()])
      .then(([k, t, f]) => {
        setKpis(k);
        setTelemetry(t);
        setFuelTrend(Array.isArray(f) ? f : [
          { label: "W1", fuel: 1450 }, { label: "W2", fuel: 1620 }, { label: "W3", fuel: 1380 },
          { label: "W4", fuel: 1750 }, { label: "W5", fuel: 1540 }, { label: "W6", fuel: 1680 },
          { label: "W7", fuel: 1490 }, { label: "W8", fuel: 1840 },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !kpis) {
    return (
      <PageContainer>
        <LoadingSpinner size="lg" label="Loading dashboard data..." />
      </PageContainer>
    );
  }

  const utilizationData = telemetry.slice(0, 10).map((t) => ({
    name: t.machine_code,
    utilization: +t.utilization,
  }));

  return (
    <PageContainer>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard
          title="Machine Utilization"
          value={kpis.utilization.value}
          unit={kpis.utilization.unit}
          trend={kpis.utilization.trend}
          icon={Gauge}
          accent="primary"
          subtitle={`${kpis.utilization.active} of ${kpis.utilization.machines} machines active`}
        />
        <KPICard
          title="Downtime"
          value={kpis.downtime.value}
          unit={kpis.downtime.unit}
          trend={kpis.downtime.trend}
          icon={Clock}
          accent="warning"
          subtitle={`${kpis.downtime.incidents} incidents today`}
        />
        <KPICard
          title="Fuel Consumption"
          value={kpis.fuel.value}
          unit={kpis.fuel.unit}
          trend={kpis.fuel.trend}
          icon={Fuel}
          accent="accent"
          subtitle={`Avg ${kpis.fuel.avgPerMachine}L per machine`}
        />
        <KPICard
          title="Overheating Alerts"
          value={kpis.overheating.value}
          unit={kpis.overheating.unit}
          trend={kpis.overheating.trend}
          icon={Thermometer}
          accent="error"
          subtitle={`${kpis.overheating.critical} critical warnings`}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <SectionCard
          title="Fuel Consumption Trend"
          subtitle="Weekly fuel usage across fleet (liters)"
          className="xl:col-span-2"
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={fuelTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="fuelGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="label" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="fuel"
                stroke="#2563eb"
                strokeWidth={2.5}
                fill="url(#fuelGradient)"
                activeDot={{ r: 5, fill: "#2563eb", stroke: "#1e3a8a", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard
          title="System Status"
          subtitle="Real-time fleet overview"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success-500/15 flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-success-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">Active Machines</p>
                  <p className="text-xs text-slate-500">Currently running</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-success-400">{kpis.utilization.active}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning-500/15 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-warning-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">In Maintenance</p>
                  <p className="text-xs text-slate-500">Under repair</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-warning-400">
                {telemetry.filter((t) => t.status === "MAINTENANCE").length}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-error-500/15 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-error-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">Critical Alerts</p>
                  <p className="text-xs text-slate-500">Need attention</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-error-400">{kpis.overheating.value}</span>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Machine Utilization"
        subtitle="Operational efficiency per machine — green >75%, amber 50-74%, rose <50%"
      >
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={utilizationData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} angle={-20} textAnchor="end" height={60} />
            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} unit="%" />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#1e293b40" }} />
            <ReferenceLine y={75} stroke="#22c55e" strokeDasharray="5 5" strokeOpacity={0.4} />
            <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="5 5" strokeOpacity={0.4} />
            <Bar dataKey="utilization" radius={[6, 6, 0, 0]} unit="%">
              {utilizationData.map((entry, i) => (
                <Cell key={i} fill={utilizationColor(entry.utilization)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>
    </PageContainer>
  );
}
