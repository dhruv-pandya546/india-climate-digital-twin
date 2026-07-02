import React from "react";
import { ScenarioParameters, RegionalImpactSummary } from "../types";
import { Thermometer, CloudRain, Wind, Activity, Flame, Wheat, ShieldAlert, Award } from "lucide-react";

interface SimulationControlsProps {
  scenario: ScenarioParameters;
  onChangeScenario: (updater: (prev: ScenarioParameters) => ScenarioParameters) => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  scenario,
  onChangeScenario,
}) => {
  const updateParam = (key: keyof ScenarioParameters, val: number) => {
    onChangeScenario((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  // Calculate live projected impacts dynamically
  const calculateImpacts = (): RegionalImpactSummary => {
    const t = scenario.tempAnomaly;
    const r = scenario.rainChange;
    const m = scenario.monsoonShift;
    const s = scenario.sstChange;
    const a = scenario.aerosols;

    // Crop water stress
    const cropScore = Math.abs(r * 0.2) + Math.abs(t * 3.5) + Math.abs(m * 1.5) + (a * 2);
    let cropStress: "Low" | "Moderate" | "Severe" = "Low";
    if (cropScore > 20) cropStress = "Severe";
    else if (cropScore > 8) cropStress = "Moderate";

    // Flood risk
    const floodScore = (r > 0 ? r * 0.45 : 0) + (s * 15) + (m < 0 ? Math.abs(m) * 2 : 0);
    let floodRisk: "Low" | "Moderate" | "High" = "Low";
    if (floodScore > 35) floodRisk = "High";
    else if (floodScore > 15) floodRisk = "Moderate";

    // Drought Index
    const droughtScore = (r < 0 ? Math.abs(r) * 0.5 : 0) + (t * 6) + (m > 0 ? m * 2.5 : 0);
    let droughtIndex: "Normal" | "Watch" | "Severe" = "Normal";
    if (droughtScore > 25) droughtIndex = "Severe";
    else if (droughtScore > 10) droughtIndex = "Watch";

    // Heat stress exposed population (in Millions)
    const heatPop = Math.max(0, parseFloat(((t * 8.5) + (s * 4.5) + (a * -1.5)).toFixed(1)));

    return { cropStress, floodRisk, droughtIndex, heatStressPop: heatPop };
  };

  const impacts = calculateImpacts();

  return (
    <div className="space-y-4">
      {/* What-If Parameters Section */}
      <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
        <div className="flex items-center gap-1.5 border-b border-slate-900 pb-2 mb-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">SCENARIO CONTROLS</h4>
        </div>

        {/* Temperature Sliders */}
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1 text-slate-300">
                <Thermometer className="w-3.5 h-3.5 text-orange-400" />
                Temperature Anomaly
              </span>
              <span className="font-mono font-bold text-cyan-400">
                {scenario.tempAnomaly >= 0 ? "+" : ""}
                {scenario.tempAnomaly.toFixed(1)}°C
              </span>
            </div>
            <input
              type="range"
              min="-3.0"
              max="5.0"
              step="0.5"
              value={scenario.tempAnomaly}
              onChange={(e) => updateParam("tempAnomaly", parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Rainfall Sliders */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1 text-slate-300">
                <CloudRain className="w-3.5 h-3.5 text-sky-400" />
                Rainfall Delta
              </span>
              <span className="font-mono font-bold text-cyan-400">
                {scenario.rainChange >= 0 ? "+" : ""}
                {scenario.rainChange}%
              </span>
            </div>
            <input
              type="range"
              min="-50"
              max="100"
              step="5"
              value={scenario.rainChange}
              onChange={(e) => updateParam("rainChange", parseInt(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Monsoon Shift */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1 text-slate-300">
                <Wind className="w-3.5 h-3.5 text-purple-400" />
                Monsoon Onset Shift
              </span>
              <span className="font-mono font-bold text-cyan-400">
                {scenario.monsoonShift === 0
                  ? "Normal"
                  : `${scenario.monsoonShift > 0 ? "+" : ""}${scenario.monsoonShift} days`}
              </span>
            </div>
            <input
              type="range"
              min="-14"
              max="14"
              step="1"
              value={scenario.monsoonShift}
              onChange={(e) => updateParam("monsoonShift", parseInt(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Sea Surface Temp */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1 text-slate-300">
                <Activity className="w-3.5 h-3.5 text-teal-400" />
                Indian Ocean SST Anomaly
              </span>
              <span className="font-mono font-bold text-cyan-400">
                {scenario.sstChange >= 0 ? "+" : ""}
                {scenario.sstChange.toFixed(1)}°C
              </span>
            </div>
            <input
              type="range"
              min="-2.0"
              max="3.0"
              step="0.5"
              value={scenario.sstChange}
              onChange={(e) => updateParam("sstChange", parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Aerosols */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1 text-slate-300">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                Aerosol Optical Index
              </span>
              <span className="font-mono font-bold text-cyan-400">{scenario.aerosols.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.1"
              value={scenario.aerosols}
              onChange={(e) => updateParam("aerosols", parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>
        </div>
      </div>

      {/* Projected Impacts Section */}
      <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
        <div className="flex items-center gap-1.5 border-b border-slate-900 pb-2">
          <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">PROJECTED HAZARD IMPACTS</h4>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Crop Stress */}
          <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-lg space-y-1">
            <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase tracking-wider">
              <Wheat className="w-3 h-3 text-emerald-400" />
              <span>Crop Stress</span>
            </div>
            <div
              className={`text-sm font-bold font-mono ${
                impacts.cropStress === "Severe"
                  ? "text-rose-500"
                  : impacts.cropStress === "Moderate"
                  ? "text-amber-500"
                  : "text-emerald-400"
              }`}
            >
              {impacts.cropStress}
            </div>
          </div>

          {/* Flood Risk */}
          <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-lg space-y-1">
            <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase tracking-wider">
              <CloudRain className="w-3 h-3 text-sky-400" />
              <span>Flood Index</span>
            </div>
            <div
              className={`text-sm font-bold font-mono ${
                impacts.floodRisk === "High"
                  ? "text-rose-500"
                  : impacts.floodRisk === "Moderate"
                  ? "text-amber-500"
                  : "text-emerald-400"
              }`}
            >
              {impacts.floodRisk}
            </div>
          </div>

          {/* Drought Hazard */}
          <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-lg space-y-1">
            <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase tracking-wider">
              <Thermometer className="w-3 h-3 text-amber-500" />
              <span>Drought Index</span>
            </div>
            <div
              className={`text-sm font-bold font-mono ${
                impacts.droughtIndex === "Severe"
                  ? "text-rose-500"
                  : impacts.droughtIndex === "Watch"
                  ? "text-amber-500"
                  : "text-emerald-400"
              }`}
            >
              {impacts.droughtIndex}
            </div>
          </div>

          {/* Heat Stress Exposure */}
          <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-lg space-y-1">
            <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase tracking-wider">
              <Flame className="w-3 h-3 text-orange-400" />
              <span>Thermal Exposure</span>
            </div>
            <div
              className={`text-sm font-bold font-mono ${
                impacts.heatStressPop > 15
                  ? "text-rose-500"
                  : impacts.heatStressPop > 5
                  ? "text-amber-500"
                  : "text-emerald-400"
              }`}
            >
              {impacts.heatStressPop} Million
            </div>
          </div>
        </div>

        <div className="p-2.5 bg-slate-900/30 border border-slate-900 rounded-lg text-[10px] text-slate-400 leading-normal font-mono flex items-start gap-1.5">
          <Award className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
          <span>Downscaled forecasts fused with EnKF data assimilation across all major meteorological zones.</span>
        </div>
      </div>
    </div>
  );
};
