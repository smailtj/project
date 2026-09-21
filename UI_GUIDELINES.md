# IntelliMine OCP - Global UI Design System

## 1. Core Aesthetic
* **Theme:** Dark Mode, Heavy Glassmorphism, Industrial Command Center.
* **Density:** Compact and data-dense. Use single-screen layouts (no scrolling the whole page if possible). Use `text-xs` or `text-sm` for tables and logs.
* **Typography:** `font-sans` globally. MUST use `font-mono` for all numerical data, SAP IDs, timestamps, and telemetry readouts.
* **Colors:**
  * Background: `#07090e` (Pitch Black)
  * Primary Accent: `#d4ff00` (Neon Lime)
  * Alert Accent: `#f43f5e` (Laser Rose)
  * Warning Accent: `#f59e0b` (Amber)

## 2. The Universal Page Chassis
Every single page MUST use this exact outer wrapper to maintain the exact same shape, padding, and ambient background glow:

```jsx
<div className="min-h-screen bg-[#07090e] p-4 lg:p-8 font-sans text-zinc-300 relative overflow-hidden flex items-center justify-center">
  {/* Ambient Glows */}
  <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-[#d4ff00]/10 rounded-full blur-[140px] pointer-events-none" />
  <div className="absolute bottom-[-10%] right-[10%] w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
  
  {/* Main App Container */}
  <div className="w-full max-w-[1400px] h-[calc(100vh-4rem)] relative z-10 bg-zinc-900/40 backdrop-blur-3xl rounded-[40px] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.6)] border border-white/10 flex flex-col gap-5">
    
    {/* 1. TOP NAVBAR GOES HERE (Copy exact navbar from DashboardTemplate.jsx) */}
    
    {/* 2. PAGE CONTENT GOES HERE */}

  </div>
</div>
3. Strict Glassmorphism Tokens
Never use flat, solid background colors for inner cards or icons.

Inner Panels/Cards: bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg rounded-[28px] p-5

Universal Icon Containers: Every lucide-react icon MUST be wrapped in this exact div:
<div className="p-2 rounded-xl bg-gradient-to-br from-white/10 to-transparent backdrop-blur-md border border-white/10 shadow-lg flex items-center justify-center">

Hover States (Buttons/Lists): hover:bg-white/10 hover:border-white/20 transition-all

Data Pills/Badges: px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-white/5 border border-white/10 (Adjust colors for status, e.g., bg-[#d4ff00]/10 border-[#d4ff00]/20 text-[#d4ff00]).