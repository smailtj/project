import { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Telemetry from "./pages/Telemetry";
import Maintenance from "./pages/Maintenance";
import Anomalies from "./pages/Anomalies";

const titles = {
  "/": "Dashboard",
  "/telemetry": "Telemetry",
  "/maintenance": "Maintenance & AI Assistant",
  "/anomalies": "Anomaly Detection",
};

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = titles[location.pathname] || "Dashboard";

  return (
    <div className="flex h-screen bg-slate-960 overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/telemetry" element={<Telemetry />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/anomalies" element={<Anomalies />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
