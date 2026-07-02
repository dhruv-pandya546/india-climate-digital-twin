import React, { useRef, useEffect, useState } from "react";
import { GridNode, INDIA_BORDER_OUTLINE, generateGridNodes } from "../data/indiaGrid";
import { ScenarioParameters } from "../types";
import { Sun, CloudRain, MapPin, Gauge } from "lucide-react";

interface ClimateMapProps {
  currentLayer: "rain" | "temp" | "anomaly" | "monsoon";
  scenario: ScenarioParameters;
  timeStep: number;
  isPlaying: boolean;
  selectedRegion: string;
  onHoverNode: (node: GridNode | null, currentVal: number) => void;
  onSelectState: (stateName: string) => void;
}

const LON_MIN = 67.0;
const LON_MAX = 98.0;
const LAT_MIN = 6.0;
const LAT_MAX = 36.5;

export const ClimateMap: React.FC<ClimateMapProps> = ({
  currentLayer,
  scenario,
  timeStep,
  isPlaying,
  selectedRegion,
  onHoverNode,
  onSelectState,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<GridNode[]>([]);
  const [connections, setConnections] = useState<{ nodeA: GridNode; nodeB: GridNode }[]>([]);
  const [hoveredNode, setHoveredNode] = useState<GridNode | null>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 500 });
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Generate grid nodes and pre-calculate neighbor connections on mount
  useEffect(() => {
    const generatedNodes = generateGridNodes();
    setNodes(generatedNodes);

    const conns: { nodeA: GridNode; nodeB: GridNode }[] = [];
    const maxDist = 1.15; // Max degrees distance for gridded mesh connectivity
    for (let i = 0; i < generatedNodes.length; i++) {
      for (let j = i + 1; j < generatedNodes.length; j++) {
        const nA = generatedNodes[i];
        const nB = generatedNodes[j];
        const dist = Math.sqrt((nA.lon - nB.lon) ** 2 + (nA.lat - nB.lat) ** 2);
        if (dist <= maxDist) {
          conns.push({ nodeA: nA, nodeB: nB });
        }
      }
    }
    setConnections(conns);
  }, []);

  // Handle window resizing
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: Math.max(450, containerRef.current.clientHeight),
        });
      }
    };
    handleResize();
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Map projection helper
  const project = (lon: number, lat: number) => {
    const pad = Math.min(dimensions.width, dimensions.height) * 0.05;
    const x = pad + ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * (dimensions.width - 2 * pad);
    const y = (dimensions.height - pad) - ((lat - LAT_MIN) / (LAT_MAX - LAT_MIN)) * (dimensions.height - 2 * pad);
    return [x, y];
  };

  // Convert raw value to hex/rgba colors
  const rainColors = ["#07162c", "#0a3c71", "#1565c0", "#29b6f6", "#00e5ff", "#00e676", "#12e090"];
  const tempColors = ["#0d47a1", "#1e88e5", "#ffb74d", "#ff7043", "#f4511e", "#e53935", "#b71c1c"];
  const anomColors = ["#002984", "#3f51b5", "#90caf9", "#eceff1", "#ef9a9a", "#e53935", "#b71c1c"];
  const monsoonColors = ["#1a0633", "#4a148c", "#8e24aa", "#ce93d8", "#e1bee7", "#00acc1", "#00d4aa"];

  const getColorInterpolator = (val: number, palette: string[], min: number, max: number, alpha: number = 0.8) => {
    const t = Math.max(0, Math.min(1, (val - min) / (max - min)));
    const idx = Math.floor(t * (palette.length - 1));
    const frac = t * (palette.length - 1) - idx;

    const hexToRgb = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return { r, g, b };
    };

    const c1 = hexToRgb(palette[Math.min(idx, palette.length - 1)]);
    const c2 = hexToRgb(palette[Math.min(idx + 1, palette.length - 1)]);

    const r = Math.round(c1.r + frac * (c2.r - c1.r));
    const g = Math.round(c1.g + frac * (c2.g - c1.g));
    const b = Math.round(c1.b + frac * (c2.b - c1.b));

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Canvas drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = dimensions.width;
    const H = dimensions.height;
    ctx.clearRect(0, 0, W, H);

    // 1. Deep Space backdrop with radial grid
    const grad = ctx.createRadialGradient(W / 2, H / 2, 50, W / 2, H / 2, Math.max(W, H));
    grad.addColorStop(0, "#081225");
    grad.addColorStop(1, "#020617");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // 2. Draw subtle grid mesh lines
    ctx.strokeStyle = "rgba(59, 139, 255, 0.04)";
    ctx.lineWidth = 0.5;
    for (let lon = Math.floor(LON_MIN); lon <= LON_MAX; lon += 2) {
      const [x1] = project(lon, LAT_MIN);
      const [x2] = project(lon, LAT_MAX);
      ctx.beginPath(); ctx.moveTo(x1, 0); ctx.lineTo(x2, H); ctx.stroke();
    }
    for (let lat = Math.floor(LAT_MIN); lat <= LAT_MAX; lat += 2) {
      const [, y1] = project(LON_MIN, lat);
      const [, y2] = project(LON_MAX, lat);
      ctx.beginPath(); ctx.moveTo(0, y1); ctx.lineTo(W, y2); ctx.stroke();
    }

    // 3. Draw Subcontinent Land backdrop
    if (INDIA_BORDER_OUTLINE.length > 0) {
      ctx.beginPath();
      const [startLon, startLat] = INDIA_BORDER_OUTLINE[0];
      const [sx, sy] = project(startLon, startLat);
      ctx.moveTo(sx, sy);
      for (let i = 1; i < INDIA_BORDER_OUTLINE.length; i++) {
        const [lon, lat] = INDIA_BORDER_OUTLINE[i];
        const [x, y] = project(lon, lat);
        ctx.lineTo(x, y);
      }
      ctx.closePath();
      // Land fills slightly lighter midnight blue
      ctx.fillStyle = "rgba(10, 22, 45, 0.65)";
      ctx.fill();

      // Land outline glow
      ctx.shadowBlur = 10;
      ctx.shadowColor = "rgba(59, 139, 255, 0.3)";
      ctx.strokeStyle = "rgba(59, 139, 255, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.shadowBlur = 0; // reset shadow
    }

    // 3.5 Draw continuous high-fidelity gridded climate twin simulation mesh
    ctx.lineWidth = 0.5;
    connections.forEach((conn) => {
      const [ax, ay] = project(conn.nodeA.lon, conn.nodeA.lat);
      const [bx, by] = project(conn.nodeB.lon, conn.nodeB.lat);

      const isAActive = conn.nodeA.stateName === hoveredState || conn.nodeA.stateName === selectedRegion;
      const isBActive = conn.nodeB.stateName === hoveredState || conn.nodeB.stateName === selectedRegion;

      if (isAActive && isBActive) {
        ctx.strokeStyle = "rgba(0, 229, 255, 0.22)";
        ctx.lineWidth = 0.8;
      } else {
        ctx.strokeStyle = "rgba(59, 139, 255, 0.05)";
        ctx.lineWidth = 0.4;
      }

      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
    });

    // 4. Render gridded simulation nodes
    nodes.forEach((node) => {
      const [cx, cy] = project(node.lon, node.lat);
      
      // Calculate active metrics with dynamic scenario and timeline fluctuation
      let val = 0;
      let pal: string[] = [];
      let minVal = 0;
      let maxVal = 100;

      // Fluctuations representing simulation timelines
      const timeFactor = Math.sin(timeStep * 0.1 + node.lon * 0.2) * 0.15 + 1.0;

      if (currentLayer === "rain") {
        const scenarioRainOffset = (scenario.rainChange / 100) * node.baseRain;
        val = (node.baseRain + scenarioRainOffset) * timeFactor;
        pal = rainColors;
        minVal = 0;
        maxVal = 200;
      } else if (currentLayer === "temp") {
        const lapseAdjustedBase = node.baseTemp;
        val = lapseAdjustedBase + scenario.tempAnomaly + (timeStep * 0.04);
        pal = tempColors;
        minVal = 15;
        maxVal = 48;
      } else if (currentLayer === "anomaly") {
        // Standard normal anomalies
        val = scenario.tempAnomaly + (scenario.rainChange / 50) + (Math.sin(timeStep * 0.08) * 0.3);
        pal = anomColors;
        minVal = -4;
        maxVal = 5;
      } else { // monsoon
        // Combination of sea-surface-temperature anomaly and rainfall shift
        val = (node.baseRain * 0.6) + (scenario.sstChange * 12) + (scenario.monsoonShift * -2);
        pal = monsoonColors;
        minVal = 0;
        maxVal = 180;
      }

      const isNodeHovered = hoveredNode?.id === node.id;
      const isStateHovered = hoveredState === node.stateName;

      // Draw node circle
      ctx.beginPath();
      ctx.arc(cx, cy, isNodeHovered ? 8 : isStateHovered ? 4.5 : 3, 0, Math.PI * 2);
      ctx.fillStyle = getColorInterpolator(val, pal, minVal, maxVal, isNodeHovered ? 1.0 : isStateHovered ? 0.9 : 0.65);
      ctx.fill();

      // If hovered or state highlighted, add neon rings
      if (isNodeHovered || isStateHovered) {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
        ctx.lineWidth = isNodeHovered ? 1.5 : 0.6;
        ctx.stroke();
      }
    });

    // 5. Draw active scanner beam when playing
    if (isPlaying) {
      const scanY = (Date.now() / 15) % H;
      const gradScan = ctx.createLinearGradient(0, scanY - 30, 0, scanY);
      gradScan.addColorStop(0, "rgba(0, 212, 170, 0.0)");
      gradScan.addColorStop(0.5, "rgba(0, 212, 170, 0.03)");
      gradScan.addColorStop(1, "rgba(0, 212, 170, 0.15)");
      ctx.fillStyle = gradScan;
      ctx.fillRect(0, scanY - 30, W, 30);

      ctx.strokeStyle = "rgba(0, 212, 170, 0.4)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(W, scanY);
      ctx.stroke();
    }

    // 5.5 Draw geographical regional labels onto the map atlas
    const REGION_LABELS = [
      { name: "NORTHWEST", lon: 74.0, lat: 28.5 },
      { name: "INDO-GANGETIC", lon: 81.0, lat: 26.5 },
      { name: "NORTHEAST", lon: 93.5, lat: 26.8 },
      { name: "CENTRAL INDIA", lon: 79.0, lat: 22.0 },
      { name: "DECCAN PLATEAU", lon: 77.0, lat: 17.5 },
      { name: "WESTERN GHATS", lon: 73.8, lat: 13.5 },
      { name: "SOUTH INDIA", lon: 78.5, lat: 10.5 }
    ];

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    REGION_LABELS.forEach((reg) => {
      const [rx, ry] = project(reg.lon, reg.lat);
      ctx.fillStyle = "rgba(148, 163, 184, 0.3)";
      ctx.font = "bold 8px 'Space Mono', 'JetBrains Mono', monospace";
      ctx.fillText(reg.name, rx, ry);
    });

    // 6. Draw Compass
    const cx_comp = W - 40;
    const cy_comp = 40;
    ctx.strokeStyle = "rgba(100, 160, 255, 0.25)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx_comp, cy_comp, 15, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx_comp, cy_comp - 15); ctx.lineTo(cx_comp, cy_comp + 15);
    ctx.moveTo(cx_comp - 15, cy_comp); ctx.lineTo(cx_comp + 15, cy_comp);
    ctx.stroke();
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = "8px Space Mono";
    ctx.textAlign = "center";
    ctx.fillText("N", cx_comp, cy_comp - 18);
    ctx.fillText("S", cx_comp, cy_comp + 24);

  }, [dimensions, currentLayer, scenario, timeStep, isPlaying, nodes, connections, hoveredNode, hoveredState, selectedRegion]);

  // Handle cursor hover and node detection
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    let foundNode: GridNode | null = null;
    let minDist = Infinity;

    nodes.forEach((node) => {
      const [cx, cy] = project(node.lon, node.lat);
      const d = Math.sqrt((cx - mx) ** 2 + (cy - my) ** 2);
      if (d < 16 && d < minDist) {
        minDist = d;
        foundNode = node;
      }
    });

    if (foundNode) {
      setHoveredNode(foundNode);
      setHoveredState((foundNode as GridNode).stateName);
      setTooltipPos({ x: mx + 15, y: my + 15 });

      // Determine active hovered node metric value
      let currentVal = 0;
      const fNode = foundNode as GridNode;
      const timeFactor = Math.sin(timeStep * 0.1 + fNode.lon * 0.2) * 0.15 + 1.0;
      if (currentLayer === "rain") {
        currentVal = (fNode.baseRain + (scenario.rainChange / 100) * fNode.baseRain) * timeFactor;
      } else if (currentLayer === "temp") {
        currentVal = fNode.baseTemp + scenario.tempAnomaly + (timeStep * 0.04);
      } else if (currentLayer === "anomaly") {
        currentVal = scenario.tempAnomaly + (scenario.rainChange / 50) + (Math.sin(timeStep * 0.08) * 0.3);
      } else {
        currentVal = (fNode.baseRain * 0.6) + (scenario.sstChange * 12) + (scenario.monsoonShift * -2);
      }
      onHoverNode(foundNode, parseFloat(currentVal.toFixed(1)));
    } else {
      setHoveredNode(null);
      setHoveredState(null);
      onHoverNode(null, 0);
    }
  };

  const handleMouseClick = () => {
    if (hoveredState) {
      onSelectState(hoveredState);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full bg-[#020617]/40 overflow-hidden rounded-xl border border-slate-800">
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        onMouseMove={handleMouseMove}
        onClick={handleMouseClick}
        className="block cursor-crosshair"
      />

      {/* Real-time State Tooltip Overlay */}
      {hoveredNode && (
        <div
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
          className="absolute z-20 pointer-events-none p-3.5 bg-slate-950/95 border border-cyan-500/40 rounded-lg shadow-xl shadow-cyan-950/20 text-xs text-slate-100 min-w-[210px] backdrop-blur-md transition-all duration-75"
        >
          <div className="flex items-center gap-1.5 font-semibold text-cyan-400 border-b border-slate-800 pb-1.5 mb-2">
            <MapPin className="w-3.5 h-3.5" />
            <span>{hoveredNode.stateName}</span>
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] font-mono">
            <span className="text-slate-400">Node ID:</span>
            <span className="text-right text-slate-200">{hoveredNode.id}</span>

            <span className="text-slate-400">Coord:</span>
            <span className="text-right text-slate-200">
              {hoveredNode.lat.toFixed(1)}°N, {hoveredNode.lon.toFixed(1)}°E
            </span>

            <span className="text-slate-400">Elevation:</span>
            <span className="text-right text-emerald-400">{hoveredNode.elevation}m</span>

            <span className="text-slate-400">Temp Max:</span>
            <span className="text-right text-orange-400">
              {(hoveredNode.baseTemp + scenario.tempAnomaly + timeStep * 0.04).toFixed(1)}°C
            </span>

            <span className="text-slate-400">Rainfall:</span>
            <span className="text-right text-sky-400">
              {Math.max(
                0,
                Math.round(
                  (hoveredNode.baseRain + (scenario.rainChange / 100) * hoveredNode.baseRain) *
                    (Math.sin(timeStep * 0.1 + hoveredNode.lon * 0.2) * 0.15 + 1.0)
                )
              )} mm/d
            </span>

            <span className="text-slate-400">AI Confidence:</span>
            <span className="text-right text-cyan-400">{(90 - hoveredNode.elevation / 200).toFixed(0)}%</span>
          </div>
          <div className="mt-2 pt-1.5 border-t border-slate-800 text-[10px] text-cyan-500/90 text-center font-mono">
            Click grid to lock observation
          </div>
        </div>
      )}

      {/* Geographic Grid Key */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 p-2.5 bg-slate-950/85 border border-blue-900/40 rounded-lg backdrop-blur-md z-10 text-[10px] font-mono text-slate-400 max-w-[170px]">
        <div className="font-semibold text-slate-300 border-b border-slate-800 pb-1 mb-1">DATA LAYOUT KEY</div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block shadow-sm shadow-cyan-400/50"></span>
          <span>IMD Grid Station Node</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-0.5 bg-blue-500/50 inline-block"></span>
          <span>Latitude/Longitude Grid</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 border border-cyan-400/40 bg-blue-950/40 inline-block"></span>
          <span>INSAT Raster Footprint</span>
        </div>
      </div>
    </div>
  );
};
