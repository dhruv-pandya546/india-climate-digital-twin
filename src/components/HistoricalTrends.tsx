import React, { useState } from "react";
import { HISTORICAL_CLIMATE_DATA, HistoricalYear } from "../data/historicalData";
import { Calendar, AlertCircle, TrendingUp } from "lucide-react";

export const HistoricalTrends: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<HistoricalYear>(HISTORICAL_CLIMATE_DATA[HISTORICAL_CLIMATE_DATA.length - 1]);

  // Determine chart scales
  const years = HISTORICAL_CLIMATE_DATA.map((d) => d.year);
  const anomalies = HISTORICAL_CLIMATE_DATA.map((d) => d.tempAnomaly);
  const rainfall = HISTORICAL_CLIMATE_DATA.map((d) => d.monsoonRainfall);

  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  const minAnom = Math.min(...anomalies);
  const maxAnom = Math.max(...anomalies);

  const chartWidth = 500;
  const chartHeight = 120;

  // Project data points to SVG coordinates
  const getCoordinates = (index: number, val: number, min: number, max: number) => {
    const x = (index / (HISTORICAL_CLIMATE_DATA.length - 1)) * (chartWidth - 40) + 20;
    const y = chartHeight - ((val - min) / (max - min || 1)) * (chartHeight - 30) - 15;
    return `${x},${y}`;
  };

  const tempPoints = anomalies.map((v, i) => getCoordinates(i, v, minAnom, maxAnom)).join(" ");
  const rainPoints = rainfall.map((v, i) => getCoordinates(i, v, 70, 130)).join(" ");

  return (
    <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
      <div className="flex items-center gap-1.5 border-b border-slate-900 pb-2">
        <Calendar className="w-4 h-4 text-cyan-400" />
        <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">HISTORICAL ANOMALIES (2012–2024)</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* SVG Temp Anomaly Chart */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-lg space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-orange-400" />
              Annual Temp Anomaly (°C)
            </span>
            <span className="text-orange-400 font-bold">Record Peak: +0.89°C</span>
          </div>

          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-24 overflow-visible">
            {/* Horizontal Grid lines */}
            <line x1="0" y1={chartHeight / 2} x2={chartWidth} y2={chartHeight / 2} stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
            
            {/* Polyline */}
            <polyline fill="none" stroke="url(#tempGrad)" strokeWidth="2" points={tempPoints} className="transition-all duration-300" />

            {/* Glowing gradient */}
            <defs>
              <linearGradient id="tempGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2196f3" />
                <stop offset="50%" stopColor="#ffb74d" />
                <stop offset="100%" stopColor="#e53935" />
              </linearGradient>
            </defs>

            {/* Interactive Circles */}
            {HISTORICAL_CLIMATE_DATA.map((d, i) => {
              const [cx, cy] = getCoordinates(i, d.tempAnomaly, minAnom, maxAnom).split(",").map(Number);
              const isSelected = d.year === selectedYear.year;
              return (
                <g key={i} className="cursor-pointer" onClick={() => setSelectedYear(d)}>
                  <circle cx={cx} cy={cy} r={isSelected ? 6 : 3} fill={isSelected ? "#e53935" : "rgba(255,255,255,0.4)"} className="transition-all" />
                  {isSelected && (
                    <circle cx={cx} cy={cy} r={10} fill="none" stroke="#e53935" strokeWidth="1" className="animate-ping" />
                  )}
                  <text x={cx} y={chartHeight - 2} fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="middle" fontFamily="Space Mono">
                    {d.year % 2 === 0 ? `'${d.year.toString().slice(-2)}` : ""}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* SVG Rainfall Deficit Chart */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-lg space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
              Monsoon Rainfall (% of LPA)
            </span>
            <span className="text-sky-400 font-bold">Drought Zone: &lt; 90%</span>
          </div>

          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-24 overflow-visible">
            {/* LPA Baseline (100%) */}
            <line x1="0" y1={chartHeight / 2} x2={chartWidth} y2={chartHeight / 2} stroke="rgba(0,229,255,0.15)" strokeWidth="1" />
            
            {/* Polyline */}
            <polyline fill="none" stroke="#00e5ff" strokeWidth="2" points={rainPoints} className="transition-all duration-300" />

            {/* Interactive Circles */}
            {HISTORICAL_CLIMATE_DATA.map((d, i) => {
              const [cx, cy] = getCoordinates(i, d.monsoonRainfall, 70, 130).split(",").map(Number);
              const isSelected = d.year === selectedYear.year;
              return (
                <g key={i} className="cursor-pointer" onClick={() => setSelectedYear(d)}>
                  <circle cx={cx} cy={cy} r={isSelected ? 6 : 3} fill={isSelected ? "#00e5ff" : "rgba(255,255,255,0.4)"} className="transition-all" />
                  {isSelected && (
                    <circle cx={cx} cy={cy} r={10} fill="none" stroke="#00e5ff" strokeWidth="1" className="animate-ping" />
                  )}
                  <text x={cx} y={chartHeight - 2} fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="middle" fontFamily="Space Mono">
                    {d.year % 2 === 0 ? `'${d.year.toString().slice(-2)}` : ""}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Selected Year Micro-Analysis */}
      <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-white font-bold">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>CLIMATE STATE RECORD: {selectedYear.year}</span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-400">
            <div>
              Temp Anomaly:{" "}
              <span className={selectedYear.tempAnomaly > 0.6 ? "text-rose-400 font-bold" : "text-slate-200"}>
                +{selectedYear.tempAnomaly}°C
              </span>
            </div>
            <div>
              Precip LPA:{" "}
              <span className={selectedYear.monsoonRainfall < 90 ? "text-amber-400 font-bold" : "text-slate-200"}>
                {selectedYear.monsoonRainfall}%
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-lg md:border-l md:border-slate-800 md:pl-4 space-y-1">
          <div className="flex items-center gap-1 text-[10px] text-amber-400 font-bold">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>KEY WEATHER EVENTS & ANOMALIES</span>
          </div>
          <div className="space-y-1">
            {selectedYear.extremeEvents.map((event, idx) => (
              <div key={idx} className="text-[11px] text-slate-300 leading-relaxed flex items-start gap-1">
                <span className="text-amber-500">•</span>
                <span>{event}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default HistoricalTrends;
