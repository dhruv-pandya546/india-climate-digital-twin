export interface ClimateMetrics {
  rain: number; // rainfall in mm/day
  temp: number; // max temperature in °C
  anom: number; // temperature anomaly in °C
  conf: number; // model confidence in %
}

export interface StateClimateProperties extends ClimateMetrics {
  name: string;
}

export interface ScenarioParameters {
  tempAnomaly: number; // in °C (-3 to +5)
  rainChange: number; // in % (-50 to +100)
  monsoonShift: number; // in days (-14 to +14)
  sstChange: number; // Sea Surface Temp in °C (-2 to +3)
  aerosols: number; // Aerosol Optical Depth index (0 to 2)
}

export interface RegionalImpactSummary {
  cropStress: "Low" | "Moderate" | "Severe";
  floodRisk: "Low" | "Moderate" | "High";
  droughtIndex: "Normal" | "Watch" | "Severe";
  heatStressPop: number; // in Millions of people exposed
}

export interface SimulationStep {
  hour: number; // T+0 to T+72
  timestamp: string;
  assimilatedSources: string[];
}

export interface ChatMessage {
  role: "user" | "model";
  text: string;
  timestamp: string;
}

export interface HistoricalRecord {
  year: number;
  avgTemp: number;
  avgRain: number;
  anomaly: number;
}
