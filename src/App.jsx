import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Telemetry from "./pages/Telemetry";
import Maintenance from "./pages/Maintenance";
import Anomalies from "./pages/Anomalies";
import Operators from "./pages/Operators";

export default function App() {
  return <Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/telemetry" element={<Telemetry />} />
    <Route path="/maintenance" element={<Maintenance />} />
    <Route path="/operators" element={<Operators />} />
    <Route path="/anomalies" element={<Anomalies />} />
  </Routes>;
}
