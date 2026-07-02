import React, { useState, useEffect } from "react";
import { Compass, Satellite, Database, Activity, Map, RefreshCw } from "lucide-react";
import { ScenarioParameters } from "../types";

interface SidebarProps {
  selectedRegion: string;
  onSelectRegion: (region: string) => void;
  scenario: ScenarioParameters;
  onChangeScenario: (updater: (prev: ScenarioParameters) => ScenarioParameters) => void;
  activeFeedCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  selectedRegion,
  onSelectRegion,
  onChangeScenario,
  activeFeedCount,
}) => {
  const [logs, setLogs] = useState<string[]>([
    "System booted. Initializing EnKF assimilation matrix...",
    "INSAT-3R LST thermal channel online. Resolution: 4km.",
    "Ingesting IMD daily gridded precipitation dataset...",
    "Vite live data-bridge compiled successfully.",
  ]);

  // Rolling simulation log telemetry
  useEffect(() => {
    const rawFeeds = [
      "Assimilating MOSDAC SST raster stream (0.1 degree)...",
      "Bhuvan landcover profile synchronized with grid coordinate system.",
      "Downscaling ERA5 boundary layer wind vectors...",
      "IMD station records fused with Bayesian prior probability...",
      "Re-calculating local Lapse-Rates across Western Ghats...",
      "Aerosol optical depth (NICES) matched to particulate filters...",
      "monsoon stream converged. AI skill confidence: 91.2%",
    ];

    const interval = setInterval(() => {
      const randomFeed = rawFeeds[Math.floor(Math.random() * rawFeeds.length)];
      const timestamp = new Date().toLocaleTimeString();
      setLogs((prev) => [`[${timestamp}] ${randomFeed}`, ...prev.slice(0, 5)]);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const handleRegionChange = (region: string) => {
    onSelectRegion(region);

    // Apply typical climate offsets based on selected region
    if (region === "northeast") {
      onChangeScenario(() => ({
        tempAnomaly: -0.5,
        rainChange: 45,
        monsoonShift: -3,
        sstChange: 0.5,
        aerosols: 1.0,
      }));
    } else if (region === "northwest") {
      onChangeScenario(() => ({
        tempAnomaly: 3.5,
        rainChange: -35,
        monsoonShift: 5,
        sstChange: 1.2,
        aerosols: 1.8,
      }));
    } else if (region === "westghats") {
      onChangeScenario(() => ({
        tempAnomaly: -0.2,
        rainChange: 65,
        monsoonShift: -5,
        sstChange: 0.8,
        aerosols: 0.8,
      }));
    } else if (region === "ganges") {
      onChangeScenario(() => ({
        tempAnomaly: 1.8,
        rainChange: -10,
        monsoonShift: 2,
        sstChange: 0.4,
        aerosols: 2.2,
      }));
    } else {
      onChangeScenario(() => ({
        tempAnomaly: 0.0,
        rainChange: 0,
        monsoonShift: 0,
        sstChange: 0.0,
        aerosols: 1.0,
      }));
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 border-r border-slate-900 p-4 space-y-5">
      {/* Pilot Regions Selection */}
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
          <Map className="w-3.5 h-3.5 text-cyan-400" />
          PILOT MONITOR ZONE
        </label>
        <select
          value={selectedRegion}
          onChange={(e) => handleRegionChange(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all font-sans cursor-pointer"
        >
          <option value="india">All India Matrix</option>
          <option value="northwest">Northwest Desert (Ext. Heat)</option>
          <option value="westghats">Western Ghats (Ext. Rain)</option>
          <option value="ganges">Indo-Gangetic Plain (Particulate)</option>
          <option value="northeast">Northeast Hills (High Precip)</option>
        </select>
      </div>

      {/* Sensor Data Ingestion Feeds */}
      <div className="space-y-3">
        <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
          <Satellite className="w-3.5 h-3.5 text-sky-400" />
          Ingestion Sources ({activeFeedCount}/4)
        </label>
        <div className="space-y-2">
          {/* Feed 1 */}
          <div className="flex items-center justify-between p-2 bg-slate-900/60 border border-slate-800/80 rounded-lg">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-200">INSAT-3D/3R Radiometers</span>
              <span className="text-[9px] text-cyan-400/80 font-mono">LST / SST / IMC channels</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50"></span>
          </div>

          {/* Feed 2 */}
          <div className="flex items-center justify-between p-2 bg-slate-900/60 border border-slate-800/80 rounded-lg">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-200">IMD Gridded Obs</span>
              <span className="text-[9px] text-cyan-400/80 font-mono">Rain 0.25° | Max-Min Temp 1°</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50"></span>
          </div>

          {/* Feed 3 */}
          <div className="flex items-center justify-between p-2 bg-slate-900/60 border border-slate-800/80 rounded-lg">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-200">Bhuvan / NICES Ground</span>
              <span className="text-[9px] text-cyan-400/80 font-mono">Soil Moisture | Albedo</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50 animate-pulse"></span>
          </div>

          {/* Feed 4 */}
          <div className="flex items-center justify-between p-2 bg-slate-900/60 border border-slate-800/80 rounded-lg">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-200">ERA5 Reanalysis</span>
              <span className="text-[9px] text-cyan-400/80 font-mono">Upper-air boundary layers</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50"></span>
          </div>
        </div>
      </div>

      {/* Telemetry Logger */}
      <div className="flex-1 flex flex-col min-h-[140px] space-y-2">
        <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          Telemetry stream logs
        </label>
        <div className="flex-1 p-2 bg-slate-950 border border-slate-800/80 rounded-lg overflow-y-auto space-y-1.5 custom-scrollbar h-[120px]">
          {logs.map((log, idx) => (
            <div key={idx} className="text-[9px] font-mono leading-relaxed text-slate-400 border-b border-slate-800/40 pb-1 last:border-b-0">
              <span className="text-[#00d4aa]">❯</span> {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default Sidebar;
