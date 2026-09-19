const BASE_URL = "http://localhost:8000";

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const config = {
    headers: { "Content-Type": "application/json" },
    ...options,
  };
  if (options.body && typeof options.body === "object") {
    config.body = JSON.stringify(options.body);
  }
  try {
    const res = await fetch(url, config);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`API ${res.status}: ${text || res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error(`Cannot reach backend at ${BASE_URL}. Is the server running?`);
    }
    throw err;
  }
}

// ---------- Mock data (fallback when backend is offline) ----------
const mockKpis = {
  utilization: { value: 78.5, unit: "%", trend: +3.2, machines: 24, active: 19 },
  downtime: { value: 142, unit: "min", trend: -12.0, incidents: 3 },
  fuel: { value: 1840, unit: "L", trend: -5.8, avgPerMachine: 76.7 },
  overheating: { value: 4, unit: "alerts", trend: +1, critical: 2 },
};

const mockTelemetry = Array.from({ length: 20 }, (_, i) => ({
  machine_code: `MCH-${String(i + 1).padStart(3, "0")}`,
  machine_name: ["Excavator", "Bulldozer", "Crane", "Loader", "Drill Rig"][i % 5],
  temperature: +(35 + Math.random() * 40).toFixed(1),
  fuel_level: +(20 + Math.random() * 80).toFixed(1),
  utilization: +(40 + Math.random() * 55).toFixed(1),
  status: ["RUNNING", "IDLE", "CRITICAL", "MAINTENANCE"][i % 4],
  timestamp: new Date(Date.now() - i * 60000).toISOString(),
}));

const mockCritical = [
  { machine_code: "MCH-003", machine_name: "Crane", temperature: 92.4, status: "CRITICAL", anomaly: "Overheating detected", health_score: 28 },
  { machine_code: "MCH-007", machine_name: "Drill Rig", temperature: 88.1, status: "CRITICAL", anomaly: "Fuel pressure low", health_score: 35 },
];

const mockHealthScores = mockTelemetry.slice(0, 12).map((t) => ({
  machine_code: t.machine_code,
  machine_name: t.machine_name,
  health_score: Math.round(30 + Math.random() * 65),
  status: t.status,
}));

const mockFuelTrend = Array.from({ length: 12 }, (_, i) => ({
  label: `W${i + 1}`,
  fuel: Math.round(1200 + Math.random() * 800),
}));

// ---------- API functions with mock fallback ----------
export async function getKpis() {
  try {
    const [utilization, downtime, fuel, overheating] = await Promise.all([
      request("/kpis/utilization"),
      request("/kpis/downtime"),
      request("/kpis/fuel"),
      request("/kpis/overheating"),
    ]);
    return { utilization, downtime, fuel, overheating };
  } catch {
    return mockKpis;
  }
}

export async function getTelemetryLatest() {
  try {
    return await request("/telemetry/latest");
  } catch {
    return mockTelemetry;
  }
}

export async function getTelemetryActive() {
  try {
    return await request("/telemetry/active");
  } catch {
    return mockTelemetry.filter((t) => t.status === "RUNNING" || t.status === "CRITICAL");
  }
}

export async function predictMaintenance(payload) {
  try {
    return await request("/maintenance/predict-maintenance", {
      method: "POST",
      body: payload,
    });
  } catch {
    await new Promise((r) => setTimeout(r, 1200));
    const base = (payload.planned_hours || 10) * 250 + (payload.actual_hours || 0) * 180;
    const typeMultiplier = { "Engine check": 1.2, "Full overhaul": 2.5, "Hydraulic service": 1.8 }[payload.maintenance_type] || 1.5;
    const cost = Math.round(base * typeMultiplier * (1 + Math.random() * 0.2));
    const level = cost < 2000 ? "LOW" : cost < 6000 ? "MEDIUM" : "HIGH";
    return { estimated_cost: cost, currency: "MAD", risk_level: level, maintenance_type: payload.maintenance_type, machine_code: payload.machine_code };
  }
}

export async function askAssistant(message) {
  try {
    return await request("/assistant", {
      method: "POST",
      body: { message },
    });
  } catch {
    await new Promise((r) => setTimeout(r, 1000));
    const lower = message.toLowerCase();
    let response;
    if (lower.includes("overheat") || lower.includes("temperature")) {
      response = "**Temperature Analysis**\n\nMachine MCH-003 (Crane) is currently at 92.4°C, exceeding the safe threshold of 85°C.\n\n**Recommendation:**\n- Immediate inspection of cooling system\n- Reduce operational load by 30%\n- Schedule hydraulic fluid check within 2 hours";
    } else if (lower.includes("fuel")) {
      response = "**Fuel Optimization**\n\nCurrent fleet fuel consumption averages 76.7L per machine. Three machines are above the 90L benchmark.\n\n**Recommendation:**\n- Review idle-time patterns on MCH-005 and MCH-012\n- Consider route optimization for Loader fleet\n- Estimated savings: 12-15% with adjusted scheduling";
    } else if (lower.includes("maintenance") || lower.includes("cost")) {
      response = "**Maintenance Planning**\n\nBased on recent telemetry, 4 machines are approaching their maintenance window.\n\n**Recommendation:**\n- Prioritize MCH-003 (critical) and MCH-007 (high wear)\n- Schedule preventive maintenance for MCH-015 next week\n- Estimated total cost: 14,500 MAD";
    } else {
      response = `**Operational Summary**\n\nFleet status: 19 of 24 machines active (79% utilization).\nCritical alerts: 2 machines require immediate attention.\nFuel consumption trending down 5.8% week-over-week.\n\nAsk me about specific machines, fuel optimization, maintenance scheduling, or anomaly details.`;
    }
    return { response };
  }
}

export async function getHealthCritical() {
  try {
    return await request("/health/critical");
  } catch {
    return mockCritical;
  }
}

export async function getHealthScores() {
  try {
    return await request("/health/scores");
  } catch {
    return mockHealthScores;
  }
}

export async function getFuelTrend() {
  try {
    return await request("/kpis/fuel");
  } catch {
    return mockFuelTrend;
  }
}
