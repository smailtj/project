import { useState } from "react";
import { Wrench, Sparkles, Send, Bot, User, Loader2, CircleDollarSign } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import { PageContainer, SectionCard } from "../components/UI";
import { predictMaintenance, askAssistant } from "../services/api";

const machineOptions = [
  "MCH-001", "MCH-002", "MCH-003", "MCH-004", "MCH-005",
  "MCH-006", "MCH-007", "MCH-008", "MCH-009", "MCH-010",
];

const maintenanceTypes = ["Engine check", "Full overhaul", "Hydraulic service"];

function CostResult({ result }) {
  return (
    <div className="mt-6 animate-slide-up">
      <div className="card p-6 border-primary-500/30 bg-gradient-to-br from-primary-500/10 to-slate-900">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center border border-primary-500/30">
            <CircleDollarSign className="w-6 h-6 text-primary-400" />
          </div>
          <div>
            <p className="text-sm text-slate-400">Estimated Maintenance Cost</p>
            <p className="text-3xl font-bold text-slate-50 tabular-nums">
              {result.estimated_cost?.toLocaleString()}{" "}
              <span className="text-lg text-slate-400">{result.currency || "MAD"}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <StatusBadge status={result.risk_level} size="lg" />
          <span className="text-sm text-slate-500">
            {result.maintenance_type} — {result.machine_code}
          </span>
        </div>
      </div>
    </div>
  );
}

function renderMarkdown(text) {
  if (!text) return null;
  const lines = text.split("\n");
  return lines.map((line, i) => {
    if (line.startsWith("**") && line.endsWith("**")) {
      return (
        <p key={i} className="font-semibold text-slate-100 mt-3 mb-1">
          {line.replace(/\*\*/g, "")}
        </p>
      );
    }
    if (line.startsWith("- ")) {
      return (
        <p key={i} className="text-sm text-slate-400 pl-4 py-0.5">
          {line.replace(/^- /, "• ")}
        </p>
      );
    }
    if (line.trim() === "") return <div key={i} className="h-2" />;
    return (
      <p key={i} className="text-sm text-slate-300 py-0.5">
        {line}
      </p>
    );
  });
}

function MaintenanceForm() {
  const [form, setForm] = useState({
    machine_code: machineOptions[0],
    maintenance_type: maintenanceTypes[0],
    planned_hours: 8,
    actual_hours: 0,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await predictMaintenance(form);
      setResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-200 outline-none focus:border-primary-500 transition-colors";

  return (
    <SectionCard
      title="Predictive Maintenance Calculator"
      subtitle="Estimate maintenance costs based on machine data and service type"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Machine Code</label>
            <select
              value={form.machine_code}
              onChange={(e) => setForm({ ...form, machine_code: e.target.value })}
              className={inputClass + " cursor-pointer"}
            >
              {machineOptions.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Maintenance Type</label>
            <select
              value={form.maintenance_type}
              onChange={(e) => setForm({ ...form, maintenance_type: e.target.value })}
              className={inputClass + " cursor-pointer"}
            >
              {maintenanceTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Planned Hours</label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={form.planned_hours}
              onChange={(e) => setForm({ ...form, planned_hours: +e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Actual Hours</label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={form.actual_hours}
              onChange={(e) => setForm({ ...form, actual_hours: +e.target.value })}
              className={inputClass}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary-600 hover:bg-primary-700 disabled:bg-slate-700 text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-primary-600/20 disabled:shadow-none"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing machine data...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Predict Maintenance Cost
            </>
          )}
        </button>

        {error && (
          <div className="p-3 rounded-lg bg-error-500/10 border border-error-500/30 text-sm text-error-400">
            {error}
          </div>
        )}
      </form>

      {result && <CostResult result={result} />}
    </SectionCard>
  );
}

function AssistantPanel() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "**Assistant Ready**\n\nI can help you analyze machine performance, fuel consumption, maintenance scheduling, and anomaly detection. Ask me anything about your fleet operations.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await askAssistant(input);
      setMessages((prev) => [...prev, { role: "assistant", content: res.response }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn't process your request. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SectionCard
      title="AI Assistant"
      subtitle="Powered by GPT-4o-mini — ask about operations, maintenance, or anomalies"
      action={
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-500/10 border border-accent-500/20">
          <span className="w-2 h-2 rounded-full bg-accent-500 animate-pulse-dot" />
          <span className="text-xs text-accent-400 font-medium">Online</span>
        </div>
      }
    >
      <div className="h-80 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                msg.role === "user"
                  ? "bg-primary-600/20 border border-primary-500/30"
                  : "bg-accent-500/20 border border-accent-500/30"
              }`}
            >
              {msg.role === "user" ? (
                <User className="w-4 h-4 text-primary-400" />
              ) : (
                <Bot className="w-4 h-4 text-accent-400" />
              )}
            </div>
            <div
              className={`flex-1 max-w-[85%] p-3 rounded-xl text-sm ${
                msg.role === "user"
                  ? "bg-primary-600/15 border border-primary-500/20"
                  : "bg-slate-800/60 border border-slate-700"
              }`}
            >
              {renderMarkdown(msg.content)}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent-500/20 border border-accent-500/30 flex items-center justify-center">
              <Bot className="w-4 h-4 text-accent-400" />
            </div>
            <div className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-slate-500 animate-pulse-dot" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 rounded-full bg-slate-500 animate-pulse-dot" style={{ animationDelay: "200ms" }} />
              <span className="w-2 h-2 rounded-full bg-slate-500 animate-pulse-dot" style={{ animationDelay: "400ms" }} />
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about machine performance, fuel, maintenance..."
          className="flex-1 px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-primary-500 transition-colors"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-3 rounded-lg bg-accent-600 hover:bg-accent-500 disabled:bg-slate-700 text-white transition-all duration-200"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </SectionCard>
  );
}

export default function Maintenance() {
  return (
    <PageContainer>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <MaintenanceForm />
        <AssistantPanel />
      </div>
    </PageContainer>
  );
}
