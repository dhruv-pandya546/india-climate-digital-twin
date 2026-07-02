import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { ClimateMap } from "./components/ClimateMap";
import { SimulationControls } from "./components/SimulationControls";
import { AIAnalyst } from "./components/AIAnalyst";
import { HistoricalTrends } from "./components/HistoricalTrends";
import { ScenarioParameters } from "./types";
import { STATES_METADATA, GridNode } from "./data/indiaGrid";
import {
  Play,
  Pause,
  Layers,
  Thermometer,
  CloudRain,
  AlertTriangle,
  Brain,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Cpu,
} from "lucide-react";

export default function App() {
  // Navigation & Layers State
  const [activeTab, setActiveTab] = useState<"insights" | "simulation" | "chat">("insights");
  const [currentView, setCurrentView] = useState<"map" | "history">("map");
  const [currentLayer, setCurrentLayer] = useState<"rain" | "temp" | "anomaly" | "monsoon">("rain");
  const [selectedRegion, setSelectedRegion] = useState("india");

  // What-If Scenario State
  const [scenario, setScenario] = useState<ScenarioParameters>({
    tempAnomaly: 0.0,
    rainChange: 0,
    monsoonShift: 0,
    sstChange: 0.0,
    aerosols: 1.0,
  });

  // Time Series Animation State (T+0h to T+72h)
  const [timeStep, setTimeStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Active Map Node hover interaction
  const [hoveredNode, setHoveredNode] = useState<GridNode | null>(null);
  const [hoveredValue, setHoveredValue] = useState<number>(0);
  const [selectedState, setSelectedState] = useState<string>("Maharashtra");

  // Ingestion streams status
  const [activeFeeds, setActiveFeeds] = useState(4);

  // Auto animation playback
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setTimeStep((prev) => (prev + 1) % 73);
      }, 150);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying]);

  const activeStateMeta = STATES_METADATA.find((s) => s.name === selectedState) || STATES_METADATA[0];

  // Helper for dynamic local metrics based on What-If parameters
  const getDynamicStateMetrics = () => {
    const timeFactor = Math.sin(timeStep * 0.1) * 0.15 + 1.0;
    const scenarioRainOffset = (scenario.rainChange / 100) * activeStateMeta.baseRain;
    const currentRain = Math.max(0, (activeStateMeta.baseRain + scenarioRainOffset) * timeFactor);
    const currentTemp = activeStateMeta.baseTemp + scenario.tempAnomaly + timeStep * 0.04;
    return {
      rain: parseFloat(currentRain.toFixed(1)),
      temp: parseFloat(currentTemp.toFixed(1)),
    };
  };

  const dynamicMetrics = getDynamicStateMetrics();

  return (
    <div className="h-screen overflow-hidden bg-[#020617] text-slate-100 flex flex-col font-sans select-none antialiased">
      {/* 🛰️ CORE IMMERSIVE HEADER */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-900/40 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
            </svg>
          </div>
          <div>
            <h1 className="font-bold tracking-tight text-lg leading-none text-white">
              BHARAT CLIMATE TWIN <span className="text-blue-500 text-xs font-mono ml-2">v1.24_AI</span>
            </h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mt-1 font-sans">
              National Digital Infrastructure • ISRO-IMD Federated Data
            </p>
          </div>
        </div>

        <div className="flex gap-6 items-center">
          <div className="hidden md:block text-right border-r border-slate-700 pr-6">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider font-mono">Active Satellites</p>
            <p className="font-mono text-xs text-emerald-400">INSAT-3DR, SCATSAT-1, OCEANSAT</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider font-mono">System Status</p>
            <p className="font-mono text-xs text-emerald-400">SYNC_READY • 98.2% ACCURACY</p>
          </div>
        </div>
      </header>

      {/* 🛠️ CORE THREE-COLUMN SYSTEM LAYOUT */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-0">
        {/* COLUMN 1: SIDEBAR SENSORS & NAVIGATION (span 2) */}
        <div className="lg:col-span-2 overflow-y-auto border-r border-slate-800/80 bg-slate-950/20">
          <div className="p-3 bg-slate-950 border-b border-slate-900 flex gap-2">
            <button
              onClick={() => setCurrentView("map")}
              className={`flex-1 py-1.5 text-center text-[10px] font-mono font-bold uppercase tracking-wider rounded-md border transition-all cursor-pointer ${
                currentView === "map"
                  ? "bg-cyan-950 text-cyan-400 border-cyan-500/30"
                  : "bg-transparent text-slate-400 border-slate-900 hover:text-slate-200"
              }`}
            >
              🗺️ MAP GRID
            </button>
            <button
              onClick={() => setCurrentView("history")}
              className={`flex-1 py-1.5 text-center text-[10px] font-mono font-bold uppercase tracking-wider rounded-md border transition-all cursor-pointer ${
                currentView === "history"
                  ? "bg-cyan-950 text-cyan-400 border-cyan-500/30"
                  : "bg-transparent text-slate-400 border-slate-900 hover:text-slate-200"
              }`}
            >
              📈 HISTORY
            </button>
          </div>

          <Sidebar
            selectedRegion={selectedRegion}
            onSelectRegion={setSelectedRegion}
            scenario={scenario}
            onChangeScenario={setScenario}
            activeFeedCount={activeFeeds}
          />
        </div>

        {/* COLUMN 2: PRIMARY GEOSPATIAL MAP / TRENDS (span 6) */}
        <div className="lg:col-span-6 flex flex-col p-4 bg-slate-900/20 overflow-y-auto space-y-4">
          {currentView === "map" ? (
            <div className="flex-1 flex flex-col min-h-[450px]">
              {/* Layers & Controls bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 bg-slate-950/60 p-2 border border-slate-900/60 rounded-xl">
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setCurrentLayer("rain")}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                      currentLayer === "rain"
                        ? "bg-cyan-600 text-white font-bold"
                        : "bg-slate-900 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <CloudRain className="w-3.5 h-3.5" />
                    Rainfall
                  </button>
                  <button
                    onClick={() => setCurrentLayer("temp")}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                      currentLayer === "temp"
                        ? "bg-orange-600 text-white font-bold"
                        : "bg-slate-900 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Thermometer className="w-3.5 h-3.5" />
                    Temperature
                  </button>
                  <button
                    onClick={() => setCurrentLayer("anomaly")}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                      currentLayer === "anomaly"
                        ? "bg-rose-600 text-white font-bold"
                        : "bg-slate-900 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    Anomaly
                  </button>
                  <button
                    onClick={() => setCurrentLayer("monsoon")}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                      currentLayer === "monsoon"
                        ? "bg-purple-600 text-white font-bold"
                        : "bg-slate-900 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    Monsoon
                  </button>
                </div>

                {/* Live values under cursor */}
                <div className="text-[11px] font-mono bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300">
                  {hoveredNode ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[#00d4aa] animate-pulse">●</span>
                      <span>
                        {hoveredNode.id}: <strong className="text-white">{hoveredValue}</strong>
                        {currentLayer === "rain" || currentLayer === "monsoon" ? "mm/d" : "°C"}
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-500">❯ Hover node for live data</span>
                  )}
                </div>
              </div>

              {/* Climate Canvas map */}
              <div className="flex-1 min-h-[350px]">
                <ClimateMap
                  currentLayer={currentLayer}
                  scenario={scenario}
                  timeStep={timeStep}
                  isPlaying={isPlaying}
                  selectedRegion={selectedRegion}
                  onHoverNode={(node, val) => {
                    setHoveredNode(node);
                    setHoveredValue(val);
                  }}
                  onSelectState={setSelectedState}
                />
              </div>

              {/* Glowing Timeline Timeline Slider */}
              <div className="mt-4 p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center gap-4">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-8 h-8 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white flex items-center justify-center cursor-pointer transition-all shadow-md shadow-cyan-600/30"
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                </button>
                <div className="text-[11px] font-mono text-cyan-400 w-12 text-center">T+{timeStep}h</div>
                <input
                  type="range"
                  min="0"
                  max="72"
                  step="1"
                  value={timeStep}
                  onChange={(e) => setTimeStep(parseInt(e.target.value))}
                  className="flex-1 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="text-[10px] font-mono text-slate-500">GRID PROJECTION HORIZON</div>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <HistoricalTrends />
            </div>
          )}
        </div>

        {/* COLUMN 3: SCIENTIFIC ANALYTICS, SIMULATIONS & GEMINI AI ANALYST (span 4) */}
        <div className="lg:col-span-4 flex flex-col p-4 border-l border-slate-800 bg-slate-950/40 space-y-4 overflow-y-auto">
          {/* Tab Selector bar */}
          <div className="flex border-b border-slate-900 pb-px">
            <button
              onClick={() => setActiveTab("insights")}
              className={`flex-1 py-2 text-center text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer border-b-2 ${
                activeTab === "insights"
                  ? "border-cyan-500 text-cyan-400"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              Telemetry
            </button>
            <button
              onClick={() => setActiveTab("simulation")}
              className={`flex-1 py-2 text-center text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer border-b-2 ${
                activeTab === "simulation"
                  ? "border-cyan-500 text-cyan-400"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              What-If
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex-1 py-2 text-center text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer border-b-2 ${
                activeTab === "chat"
                  ? "border-cyan-500 text-cyan-400"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              AI Analyst
            </button>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            {activeTab === "insights" && (
              <div className="space-y-4">
                {/* Localized Metrics of Active Selected State */}
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <div className="flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-emerald-400" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                        {selectedState.toUpperCase()} ANALYSIS
                      </h4>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">GRID INTERPOLATED</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-2.5 bg-slate-900/60 border border-slate-800/80 rounded-lg">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">Temp max</span>
                      <strong className="text-xl font-bold font-mono text-orange-400">{dynamicMetrics.temp}°C</strong>
                    </div>
                    <div className="p-2.5 bg-slate-900/60 border border-slate-800/80 rounded-lg">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">Rainfall</span>
                      <strong className="text-xl font-bold font-mono text-sky-400">{dynamicMetrics.rain} mm</strong>
                    </div>
                    <div className="p-2.5 bg-slate-900/60 border border-slate-800/80 rounded-lg">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">Relative Humid</span>
                      <strong className="text-lg font-bold font-mono text-teal-400">{activeStateMeta.humidity}%</strong>
                    </div>
                    <div className="p-2.5 bg-slate-900/60 border border-slate-800/80 rounded-lg">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">Elevation</span>
                      <strong className="text-lg font-bold font-mono text-emerald-400">{activeStateMeta.elevation}m</strong>
                    </div>
                  </div>
                </div>

                {/* active model pipeline information */}
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center gap-1.5 border-b border-slate-900 pb-2">
                    <Brain className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">AI PIPELINE ENGINE</h4>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2.5 bg-slate-900/40 rounded-lg text-xs">
                      <div>
                        <div className="font-semibold text-slate-200">ConvLSTM-Rain</div>
                        <div className="text-[10px] text-slate-500 font-mono">Short-range spatial precip</div>
                      </div>
                      <span className="font-mono text-emerald-400 font-bold">91% SKILL</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-slate-900/40 rounded-lg text-xs">
                      <div>
                        <div className="font-semibold text-slate-200">U-Net Temperature</div>
                        <div className="text-[10px] text-slate-500 font-mono">Topographic lapse correction</div>
                      </div>
                      <span className="font-mono text-emerald-400 font-bold">94% SKILL</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-slate-900/40 rounded-lg text-xs">
                      <div>
                        <div className="font-semibold text-slate-200">Monsoon-Transformer</div>
                        <div className="text-[10px] text-slate-500 font-mono">Sea-surface anomaly matching</div>
                      </div>
                      <span className="font-mono text-cyan-400 font-bold">88% SKILL</span>
                    </div>
                  </div>
                </div>

                {/* Active Alerts */}
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center gap-1.5 border-b border-slate-900 pb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">ACTIVE IMD WARN ALERTS</h4>
                  </div>

                  <div className="space-y-2 max-h-[140px] overflow-y-auto custom-scrollbar">
                    {scenario.tempAnomaly > 2.0 && (
                      <div className="p-2.5 bg-red-950/40 border border-red-900/50 text-red-200 text-[11px] rounded-lg leading-relaxed flex gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0 animate-ping"></span>
                        <div><strong>HEATWAVE WATCH</strong>: Max temperature exceeding extreme thresholds in Northwest Plains.</div>
                      </div>
                    )}
                    {scenario.rainChange > 30 && (
                      <div className="p-2.5 bg-sky-950/40 border border-sky-900/50 text-sky-200 text-[11px] rounded-lg leading-relaxed flex gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 flex-shrink-0 animate-ping"></span>
                        <div><strong>PRECIPITATION HAZARD</strong>: Excess convective anomalies indicated. Extreme rainfall surge watch on Malabar Coast.</div>
                      </div>
                    )}
                    {scenario.rainChange < -20 && (
                      <div className="p-2.5 bg-amber-950/40 border border-amber-900/50 text-amber-200 text-[11px] rounded-lg leading-relaxed flex gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0 animate-ping"></span>
                        <div><strong>MONSOON DEFICIT WARNING</strong>: Moisture levels dropping. Agricultural stress alerts released for central Deccan.</div>
                      </div>
                    )}
                    <div className="p-2.5 bg-slate-900/50 border border-slate-800 text-slate-300 text-[11px] rounded-lg leading-relaxed flex gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0"></span>
                      <div><strong>DATA STABILITY</strong>: All gridded meteorological station feeds operating under nominal tolerances.</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "simulation" && (
              <div className="flex-1 flex flex-col">
                <SimulationControls scenario={scenario} onChangeScenario={setScenario} />
              </div>
            )}

            {activeTab === "chat" && (
              <div className="flex-1 flex flex-col h-full min-h-[350px]">
                <AIAnalyst scenario={scenario} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 📊 BOTTOM ANALYTICS BAR */}
      <footer className="h-12 bg-slate-950 border-t border-slate-800 px-6 flex items-center justify-between font-mono text-[10px] text-slate-500 uppercase tracking-tighter shrink-0 select-none">
        <div className="flex gap-8 items-center">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> 
            BHUVAN_GEOSPATIAL_ACTIVE
          </span>
          <span className="flex items-center gap-2 hidden sm:flex">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> 
            MOSDAC_FEED_SYNCED
          </span>
          <span className="flex items-center gap-2 hidden md:flex">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span> 
            NICES_ARCHIVE_LINKED
          </span>
        </div>
        <div className="text-slate-400">
          LAT: 20.5937° N | LONG: 78.9629° E | ELEV: 160m MSL
        </div>
      </footer>
    </div>
  );
}
