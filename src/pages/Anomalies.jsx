import { useState, useEffect } from "react";
import {
  AlertTriangle, ShieldAlert, Activity, Thermometer, Heart,
} from "lucide-react";
import {
  RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer,
} from "recharts";
import StatusBadge from "../components/StatusBadge";
import { PageContainer, SectionCard, LoadingSpinner, EmptyState } from "../components/UI";
import { getHealthCritical, getHealthScores } from "../services/api";

function CriticalCard({ machine }) {
  return (
    <div className="card p-5 border-error-500/30 bg-gradient-to-br from-error-500/10 to-slate-900 card-hover animate-slide-up">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-error-500/20 flex items-center justify-center border border-error-500/30">
            <ShieldAlert className="w-6 h-6 text-error-400" />
          </div>
          <div>
            <p className="text-base font-semibold text-slate-100">{machine.machine_code}</p>
            <p className="text-sm text-slate-500">{machine.machine_name}</p>
          </div>
        </div>
        <StatusBadge status={machine.status} />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-800/60">
          <Thermometer className="w-4 h-4 text-error-400 shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-slate-500">Temperature</p>
            <p className="text-sm font-semibold text-error-400">{machine.temperature}°C</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-800/60">
          <AlertTriangle className="w-4 h-4 text-warning-400 shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-slate-500">Anomaly</p>
            <p className="text-sm font-medium text-slate-200">{machine.anomaly || "Abnormal readings detected"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-800/60">
          <Heart className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-slate-500">Health Score</p>
            <p className="text-sm font-semibold text-slate-200">{machine.health_score}/100</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function HealthScoreChart({ scores }) {
  const data = scores.slice(0, 8).map((s) => ({
    name: s.machine_code,
    score: s.health_score,
    fill: s.health_score >= 70 ? "#22c55e" : s.health_score >= 40 ? "#f59e0b" : "#f43f5e",
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadialBarChart
        innerRadius="20%"
        outerRadius="100%"
        data={data}
        startAngle={90}
        endAngle={-270}
      >
        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
        <RadialBar background={{ fill: "#1e293b" }} dataKey="score" cornerRadius={6} angleAxisId={0} />
      </RadialBarChart>
    </ResponsiveContainer>
  );
}

function healthColor(score) {
  if (score >= 70) return { text: "text-success-400", bg: "bg-success-500", bar: "bg-success-500" };
  if (score >= 40) return { text: "text-warning-400", bg: "bg-warning-500", bar: "bg-warning-500" };
  return { text: "text-error-400", bg: "bg-error-500", bar: "bg-error-500" };
}

export default function Anomalies() {
  const [critical, setCritical] = useState([]);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getHealthCritical(), getHealthScores()])
      .then(([c, s]) => {
        setCritical(c);
        setScores(s);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <LoadingSpinner size="lg" label="Loading anomaly data..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4 flex items-center gap-3 border-error-500/20">
          <div className="w-10 h-10 rounded-lg bg-error-500/15 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-error-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-50">{critical.length}</p>
            <p className="text-xs text-slate-500">Critical Machines</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3 border-warning-500/20">
          <div className="w-10 h-10 rounded-lg bg-warning-500/15 flex items-center justify-center">
            <Activity className="w-5 h-5 text-warning-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-50">
              {scores.filter((s) => s.health_score >= 40 && s.health_score < 70).length}
            </p>
            <p className="text-xs text-slate-500">At Risk</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3 border-success-500/20">
          <div className="w-10 h-10 rounded-lg bg-success-500/15 flex items-center justify-center">
            <Heart className="w-5 h-5 text-success-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-50">
              {scores.filter((s) => s.health_score >= 70).length}
            </p>
            <p className="text-xs text-slate-500">Healthy</p>
          </div>
        </div>
      </div>

      <SectionCard
        title="Critical Alerts"
        subtitle="Machines requiring immediate attention"
      >
        {critical.length === 0 ? (
          <EmptyState message="No critical anomalies detected. All systems nominal." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {critical.map((m, i) => (
              <CriticalCard key={i} machine={m} />
            ))}
          </div>
        )}
      </SectionCard>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <SectionCard
          title="Health Score Distribution"
          subtitle="Radial view of fleet health scores"
          className="xl:col-span-1"
        >
          <HealthScoreChart scores={scores} />
          <div className="flex items-center justify-center gap-4 mt-2 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-3 h-3 rounded-sm bg-success-500" /> Healthy (70+)
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-3 h-3 rounded-sm bg-warning-500" /> At Risk (40-69)
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-3 h-3 rounded-sm bg-error-500" /> Critical (&lt;40)
            </span>
          </div>
        </SectionCard>

        <SectionCard
          title="Machine Health Scores"
          subtitle="Detailed breakdown per machine"
          className="xl:col-span-2"
        >
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {scores.map((s, i) => {
              const colors = healthColor(s.health_score);
              return (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-24 shrink-0">
                    <p className="text-sm font-medium text-slate-200">{s.machine_code}</p>
                    <p className="text-xs text-slate-500 truncate">{s.machine_name}</p>
                  </div>
                  <div className="flex-1 h-6 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full ${colors.bar} rounded-full transition-all duration-500`}
                      style={{ width: `${s.health_score}%` }}
                    />
                  </div>
                  <div className="w-16 text-right">
                    <span className={`text-sm font-bold ${colors.text}`}>{s.health_score}</span>
                    <span className="text-xs text-slate-600">/100</span>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>
    </PageContainer>
  );
}
