"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import {
  FlaskConical, AlertTriangle, Play, RefreshCw, X, Thermometer,
  Droplets, Wind, BarChart3, Map as MapIcon, TrendingUp, TrendingDown,
} from "lucide-react";
import dynamic from "next/dynamic";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart,
} from "recharts";
import PageContainer from "@/components/ui/PageContainer";
import DataTable, { Column } from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import { api, Simulation, SimulationResult, SimulationAggregated, GridCell } from "@/lib/api";

const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const ZoomControl = dynamic(() => import("react-leaflet").then((m) => m.ZoomControl), { ssr: false });

const INDIA_CENTER: [number, number] = [20.5937, 78.9629];

function SimHeatmapLayer({ points, color }: { points: { lat: number; lng: number; value: number }[]; color: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const mapEl = canvas.closest(".leaflet-container") as HTMLElement | null;
    if (!mapEl) return;
    const map = (mapEl as unknown as { _leaflet_map: L.Map })._leaflet_map;
    if (!map) return;
    const size = map.getSize();
    canvas.width = size.x;
    canvas.height = size.y;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, size.x, size.y);
    const maxVal = Math.max(...points.map((p) => p.value), 1);
    const parseHex = (hex: string) => hex.match(/[a-f0-9]{2}/gi)?.map((x) => parseInt(x, 16)) ?? [0, 0, 0];
    const [r, g, b] = parseHex(color);
    for (const pt of points) {
      const pixel = map.latLngToContainerPoint([pt.lat, pt.lng]);
      const intensity = pt.value / maxVal;
      const g2 = ctx.createRadialGradient(pixel.x, pixel.y, 0, pixel.x, pixel.y, 20);
      g2.addColorStop(0, `rgba(${r},${g},${b},${intensity * 0.6})`);
      g2.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = g2;
      ctx.beginPath();
      ctx.arc(pixel.x, pixel.y, 20, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [points, color]);
  return <canvas ref={ref} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 400 }} />;
}

function ImpactCard({ label, baseline, scenario, unit, icon: Icon, reverse }: {
  label: string; baseline: number; scenario: number; unit: string;
  icon: React.ComponentType<{ className?: string }>; reverse?: boolean;
}) {
  const delta = scenario - baseline;
  const pct = baseline !== 0 ? ((delta / Math.abs(baseline)) * 100) : 0;
  const isBad = reverse ? delta < 0 : delta > 0;
  return (
    <div className="bg-black-800/50 rounded-xl border border-white/5 p-4">
      <div className="flex items-center gap-2 text-xs text-white/40 mb-1">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      <div className="text-lg font-semibold text-white/90">
        {scenario.toFixed(1)} <span className="text-xs font-normal text-white/40">{unit}</span>
      </div>
      <div className={`flex items-center gap-1 mt-1 text-xs ${isBad ? "text-red-400" : "text-green-400"}`}>
        {isBad ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {delta >= 0 ? "+" : ""}{delta.toFixed(2)} ({pct >= 0 ? "+" : ""}{pct.toFixed(1)}%)
      </div>
      <div className="text-[10px] text-white/30 mt-0.5">Baseline: {baseline.toFixed(1)} {unit}</div>
    </div>
  );
}

const COLORS = ["#dc2626", "#2563eb", "#16a34a", "#ca8a04", "#8b5cf6", "#0891b2"];

export default function SimulationPage() {
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [results, setResults] = useState<SimulationResult[]>([]);
  const [aggregated, setAggregated] = useState<SimulationAggregated | null>(null);
  const [cells, setCells] = useState<GridCell[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSim, setSelectedSim] = useState<string | null>(null);
  const [chartMetric, setChartMetric] = useState<string>("rainfall");

  const [name, setName] = useState("");
  const [selectedCells, setSelectedCells] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [tempOffset, setTempOffset] = useState(0);
  const [rainMultiplier, setRainMultiplier] = useState(1);
  const [rainAdd, setRainAdd] = useState(0);
  const [humidityOffset, setHumidityOffset] = useState(0);
  const [horizon, setHorizon] = useState(7);

  const load = useCallback(() => {
    setLoading(true);
    api.simulations({ page_size: "20" })
      .then((r) => setSimulations(r.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    api.gridCells({ page_size: "500" })
      .then((r) => setCells(r.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedSim) { setResults([]); setAggregated(null); return; }
    api.simulationResults(selectedSim, { page_size: "500" })
      .then((r) => setResults(r.data))
      .catch(() => setResults([]));
    api.simulationAggregated(selectedSim)
      .then(setAggregated)
      .catch(() => setAggregated(null));
  }, [selectedSim]);

  const run = async () => {
    if (!name || !selectedCells.length) return;
    setRunning(true);
    try {
      const resp = await api.runSimulation({
        name, grid_cell_ids: selectedCells,
        modifications: {
          temperature_offset: tempOffset,
          rainfall_multiplier: rainMultiplier,
          rainfall_add_mm: rainAdd,
          humidity_offset: humidityOffset,
        },
        horizon_days: horizon,
      });
      setName("");
      setSelectedCells([]);
      setSelectedSim(resp.simulation_id);
      load();
    } catch (e) {
      setError((e as Error).message);
    }
    setRunning(false);
  };

  const toggleCell = (id: string) => {
    setSelectedCells((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const filteredCells = useMemo(() => {
    if (!searchTerm) return cells;
    const t = searchTerm.toLowerCase();
    return cells.filter((c) =>
      c.cell_id.toLowerCase().includes(t) ||
      c.state_name.toLowerCase().includes(t) ||
      (c.district_name?.toLowerCase().includes(t))
    );
  }, [cells, searchTerm]);

  const chartData = useMemo(() => {
    if (!aggregated) return [];
    return aggregated.forecast_hours.map((h, i) => ({
      hour: `${Math.floor(h / 24)}d${h % 24}h`,
      hourNum: h,
      "Rainfall (mm)": aggregated.rainfall_mm_avg[i],
      "Tmax (°C)": aggregated.tmax_avg[i],
      "Tmin (°C)": aggregated.tmin_avg[i],
      "Humidity (%)": aggregated.humidity_avg[i],
      "Crop Stress": aggregated.crop_stress_avg[i],
      "Flood Risk": aggregated.flood_risk_avg[i],
      "Drought": aggregated.drought_avg[i],
      "Heat Stress": aggregated.heat_stress_avg[i],
      "Humidity Stress": aggregated.humidity_stress_avg[i],
    }));
  }, [aggregated]);

  const chartLines = useMemo(() => {
    const map: Record<string, { keys: string[]; colors: string[]; unit: string }> = {
      rainfall: { keys: ["Rainfall (mm)"], colors: ["#2563eb"], unit: "mm" },
      temperature: { keys: ["Tmax (°C)", "Tmin (°C)"], colors: ["#dc2626", "#16a34a"], unit: "°C" },
      humidity: { keys: ["Humidity (%)"], colors: ["#0891b2"], unit: "%" },
      indices: { keys: ["Crop Stress", "Flood Risk", "Drought", "Heat Stress", "Humidity Stress"], colors: COLORS, unit: "" },
    };
    return map[chartMetric] ?? map.rainfall;
  }, [chartMetric]);

  const lastResultPerCell = useMemo(() => {
    if (!results.length) return [];
    const lastHour = Math.max(...results.map((r) => r.forecast_hour));
    const last = results.filter((r) => r.forecast_hour === lastHour);
    const cellMap = new Map(cells.map((c) => [c.id, c]));
    return last.map((r) => {
      const cell = cellMap.get(r.grid_cell_id);
      return {
        lat: cell?.latitude ?? 0,
        lng: cell?.longitude ?? 0,
        value: r.predicted_rainfall_mm ?? r.predicted_tmax_celsius ?? 0,
      };
    }).filter((p) => p.lat !== 0);
  }, [results, cells]);

  const simColumns: Column<Simulation>[] = [
    { key: "name", header: "Name" },
    {
      key: "status", header: "Status",
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: "scenario_params", header: "Modifications",
      render: (r) => {
        const p = r.scenario_params;
        const parts: string[] = [];
        const to = p?.temperature_offset as number | undefined;
        const rm = p?.rainfall_multiplier as number | undefined;
        const ho = p?.humidity_offset as number | undefined;
        if (to) parts.push(`${to}°C`);
        if (rm) parts.push(`${(rm * 100).toFixed(0)}% rain`);
        if (ho) parts.push(`${ho > 0 ? "+" : ""}${ho}% hum`);
        return <span className="text-xs text-white/50">{parts.join(", ") || "—"}</span>;
      },
    },
    {
      key: "created_at", header: "Created",
      render: (r) => r.created_at ? new Date(r.created_at).toLocaleDateString() : "—",
    },
  ];

  return (
    <PageContainer title="Scenario Simulation" subtitle="What-if climate scenarios with configurable parameters and live impact visualization">
      {error && (
        <div className="mb-4 flex items-center gap-3 p-4 bg-red-900/20 border border-red-800/30 rounded-xl text-red-300 text-sm">
          <AlertTriangle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-ombre-card rounded-xl border border-white/5 p-5 mb-6 animate-slide-up">
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Scenario Builder</h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-5">
          <div className="bg-black-800/30 rounded-xl border border-white/5 p-4">
            <div className="flex items-center gap-2 text-sm text-white/60 mb-3">
              <Thermometer className="w-4 h-4 text-red-400" />
              Temperature
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/30 min-w-[36px] text-right">{tempOffset}°C</span>
              <input
                type="range" min={-5} max={5} step={0.5}
                value={tempOffset}
                onChange={(e) => setTempOffset(Number(e.target.value))}
                className="flex-1 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
              <div className="flex gap-1 text-[10px] text-white/30 min-w-[60px]">
                <span>-5°</span><span>+5°</span>
              </div>
            </div>
          </div>

          <div className="bg-black-800/30 rounded-xl border border-white/5 p-4">
            <div className="flex items-center gap-2 text-sm text-white/60 mb-3">
              <Droplets className="w-4 h-4 text-blue-400" />
              Rainfall
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/30 min-w-[36px] text-right">{(rainMultiplier * 100).toFixed(0)}%</span>
                <input
                  type="range" min={0} max={3} step={0.1}
                  value={rainMultiplier}
                  onChange={(e) => setRainMultiplier(Number(e.target.value))}
                  className="flex-1 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex gap-1 text-[10px] text-white/30 min-w-[60px]">
                  <span>0%</span><span>300%</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/30">+</span>
                <input
                  type="number" value={rainAdd} min={0} step={5}
                  onChange={(e) => setRainAdd(Number(e.target.value))}
                  className="w-20 px-2 py-1 bg-black-800 border border-white/10 rounded text-xs text-white/70 focus:outline-none focus:border-blue-600/50"
                />
                <span className="text-[10px] text-white/30">mm add</span>
              </div>
            </div>
          </div>

          <div className="bg-black-800/30 rounded-xl border border-white/5 p-4">
            <div className="flex items-center gap-2 text-sm text-white/60 mb-3">
              <Wind className="w-4 h-4 text-cyan-400" />
              Humidity
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/30 min-w-[36px] text-right">{humidityOffset > 0 ? "+" : ""}{humidityOffset}%</span>
              <input
                type="range" min={-30} max={30} step={5}
                value={humidityOffset}
                onChange={(e) => setHumidityOffset(Number(e.target.value))}
                className="flex-1 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-600"
              />
              <div className="flex gap-1 text-[10px] text-white/30 min-w-[60px]">
                <span>-30%</span><span>+30%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-white/40 mb-1">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Heatwave +20% rain"
              className="w-full px-4 py-2 bg-black-800 border border-white/10 rounded-lg text-sm text-white/70 focus:outline-none focus:border-red-700/50"
            />
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1">Horizon (days)</label>
            <input
              type="number" value={horizon} min={1} max={90}
              onChange={(e) => setHorizon(Number(e.target.value))}
              className="w-full px-4 py-2 bg-black-800 border border-white/10 rounded-lg text-sm text-white/70 focus:outline-none focus:border-red-700/50"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs text-white/40 mb-2">
            Grid Cells — {selectedCells.length} selected
          </label>
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search cells by ID, state, district..."
            className="w-full px-4 py-2 bg-black-800 border border-white/10 rounded-lg text-sm text-white/70 focus:outline-none focus:border-red-700/50 mb-2"
          />
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {filteredCells.slice(0, 100).map((c) => (
              <button
                key={c.id}
                onClick={() => toggleCell(c.id)}
                className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                  selectedCells.includes(c.id)
                    ? "bg-red-900/30 border-red-700/50 text-red-300"
                    : "bg-black-800 border-white/10 text-white/50 hover:border-white/20"
                }`}
              >
                {c.cell_id}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={run}
          disabled={!name || !selectedCells.length || running}
          className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 disabled:opacity-40 rounded-lg text-sm font-medium text-white transition-all duration-200 glow-red"
        >
          {running ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {running ? "Running..." : "Run Simulation"}
        </button>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm text-white/40">
            <FlaskConical className="w-4 h-4" />
            {simulations.length} simulations
          </div>
          <button onClick={load} className="flex items-center gap-2 px-3 py-1.5 text-xs text-white/40 hover:text-white/70 transition-colors">
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>
        <DataTable
          columns={simColumns}
          data={simulations}
          keyExtractor={(r) => r.id}
          loading={loading}
          emptyMessage="No simulations yet. Build one above."
          onRowClick={(r) => setSelectedSim(r.id)}
        />
      </div>

      {selectedSim && aggregated && (
        <div className="animate-fade-in space-y-6 mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
              Simulation Impact — {aggregated.cell_count} cells
            </h3>
            <button onClick={() => setSelectedSim(null)} className="text-xs text-white/30 hover:text-white/60 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <ImpactCard
              label="Total Rainfall" unit="mm"
              baseline={0}
              scenario={aggregated.rainfall_mm_avg.reduce((a, b) => a + b, 0)}
              icon={Droplets}
            />
            <ImpactCard
              label="Avg Tmax" unit="°C"
              baseline={30}
              scenario={aggregated.tmax_avg.reduce((a, b) => a + b, 0) / Math.max(aggregated.tmax_avg.length, 1)}
              icon={Thermometer}
            />
            <ImpactCard
              label="Avg Humidity" unit="%"
              baseline={60}
              scenario={aggregated.humidity_avg.reduce((a, b) => a + b, 0) / Math.max(aggregated.humidity_avg.length, 1)}
              icon={Wind}
            />
            <ImpactCard
              label="Max Crop Stress" unit=""
              baseline={0.3}
              scenario={Math.max(...aggregated.crop_stress_avg, 0)}
              icon={BarChart3}
            />
            <ImpactCard
              label="Max Flood Risk" unit=""
              baseline={0.2}
              scenario={Math.max(...aggregated.flood_risk_avg, 0)}
              icon={BarChart3}
            />
          </div>

          <div className="bg-ombre-card rounded-xl border border-white/5 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm text-white/40">
                <BarChart3 className="w-4 h-4" />
                Forecast Trends
              </div>
              <div className="flex gap-1 bg-black-800/50 rounded-lg p-0.5">
                {[
                  { key: "rainfall", label: "Rainfall" },
                  { key: "temperature", label: "Temperature" },
                  { key: "humidity", label: "Humidity" },
                  { key: "indices", label: "Indices" },
                ].map((m) => (
                  <button
                    key={m.key}
                    onClick={() => setChartMetric(m.key)}
                    className={`px-3 py-1 text-xs rounded-md transition-all ${
                      chartMetric === m.key ? "bg-red-700/40 text-red-200" : "text-white/40 hover:text-white/70"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  {chartLines.keys.map((k, i) => (
                    <linearGradient key={k} id={`grad-${k}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartLines.colors[i]} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={chartLines.colors[i]} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="hour" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 10 }} />
                <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 10 }} unit={chartLines.unit} />
                <Tooltip
                  contentStyle={{ background: "rgba(0,0,0,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "rgba(255,255,255,0.7)" }}
                />
                {chartLines.keys.map((k, i) => (
                  <Area
                    key={k}
                    type="monotone"
                    dataKey={k}
                    stroke={chartLines.colors[i]}
                    fill={`url(#grad-${k})`}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-ombre-card rounded-xl border border-white/5 p-5">
              <div className="flex items-center gap-2 text-sm text-white/40 mb-3">
                <BarChart3 className="w-4 h-4" />
                Index Distribution (avg)
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={[
                    { name: "Crop Stress", value: aggregated.crop_stress_avg.reduce((a, b) => a + b, 0) / Math.max(aggregated.crop_stress_avg.length, 1) },
                    { name: "Flood Risk", value: aggregated.flood_risk_avg.reduce((a, b) => a + b, 0) / Math.max(aggregated.flood_risk_avg.length, 1) },
                    { name: "Drought", value: aggregated.drought_avg.reduce((a, b) => a + b, 0) / Math.max(aggregated.drought_avg.length, 1) },
                    { name: "Heat Stress", value: aggregated.heat_stress_avg.reduce((a, b) => a + b, 0) / Math.max(aggregated.heat_stress_avg.length, 1) },
                    { name: "Humidity Stress", value: aggregated.humidity_stress_avg.reduce((a, b) => a + b, 0) / Math.max(aggregated.humidity_stress_avg.length, 1) },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" height={50} />
                  <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 10 }} domain={[0, 1]} />
                  <Tooltip
                    contentStyle={{ background: "rgba(0,0,0,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                  />
                  <Bar dataKey="value" fill="#dc2626" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-ombre-card rounded-xl border border-white/5 overflow-hidden" style={{ height: 300 }}>
              <div className="flex items-center gap-2 px-5 pt-4 pb-2 text-sm text-white/40">
                <MapIcon className="w-4 h-4" />
                Last Forecast — Spatial Distribution
              </div>
                      {typeof window !== "undefined" && lastResultPerCell.length > 0 && (
                <MapContainer center={INDIA_CENTER} zoom={4} zoomControl={false} style={{ width: "100%", height: "calc(100% - 32px)" }} scrollWheelZoom={false} dragging={false}>
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution="&copy; CARTO" />
                  <SimHeatmapLayer points={lastResultPerCell} color="#dc2626" />
                </MapContainer>
              )}
            </div>
          </div>

          <div className="bg-ombre-card rounded-xl border border-white/5 p-5">
            <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Detailed Results</h4>
            <DataTable
              columns={[
                { key: "forecast_hour", header: "Hour", render: (r: SimulationResult) => `${r.forecast_hour}h (${Math.floor(r.forecast_hour / 24)}d)` },
                { key: "predicted_rainfall_mm", header: "Rainfall", render: (r: SimulationResult) => r.predicted_rainfall_mm != null ? `${r.predicted_rainfall_mm.toFixed(1)} mm` : "—" },
                { key: "predicted_tmax_celsius", header: "Tmax", render: (r: SimulationResult) => r.predicted_tmax_celsius != null ? `${r.predicted_tmax_celsius.toFixed(1)}°C` : "—" },
                { key: "predicted_humidity_percent", header: "Humidity", render: (r: SimulationResult) => r.predicted_humidity_percent != null ? `${r.predicted_humidity_percent.toFixed(0)}%` : "—" },
                { key: "crop_stress_index", header: "Crop Stress", render: (r: SimulationResult) => r.crop_stress_index != null ? r.crop_stress_index.toFixed(3) : "—" },
                { key: "flood_risk_index", header: "Flood Risk", render: (r: SimulationResult) => r.flood_risk_index != null ? r.flood_risk_index.toFixed(3) : "—" },
                { key: "humidity_stress_index", header: "Hum Stress", render: (r: SimulationResult) => r.humidity_stress_index != null ? r.humidity_stress_index.toFixed(3) : "—" },
              ]}
              data={results.slice(0, 20)}
              keyExtractor={(r) => r.id}
              emptyMessage="No results."
            />
          </div>
        </div>
      )}
    </PageContainer>
  );
}
