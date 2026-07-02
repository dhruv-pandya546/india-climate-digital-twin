export interface HistoricalYear {
  year: number;
  tempAnomaly: number; // vs 1961-1990 baseline
  monsoonRainfall: number; // % of long-period average
  extremeEvents: string[];
}

export const HISTORICAL_CLIMATE_DATA: HistoricalYear[] = [
  { year: 2012, tempAnomaly: 0.45, monsoonRainfall: 93, extremeEvents: ["Delayed monsoon onset by 6 days", "Mild drought in Karnataka and Maharashtra"] },
  { year: 2013, tempAnomaly: 0.38, monsoonRainfall: 106, extremeEvents: ["Uttarakhand extreme cloudburst and flash floods", "Cyclone Phailin in Odisha coast"] },
  { year: 2014, tempAnomaly: 0.53, monsoonRainfall: 88, extremeEvents: ["Severe monsoon deficit across Northern Plains", "Kashmir Valley urban floods"] },
  { year: 2015, tempAnomaly: 0.67, monsoonRainfall: 86, extremeEvents: ["El Niño induced country-wide drought", "Chennai extreme precipitation event (494mm in 24h)"] },
  { year: 2016, tempAnomaly: 0.81, monsoonRainfall: 97, extremeEvents: ["Warmest year on record globally", "Severe pre-monsoon heatwaves in Rajasthan (51.0°C in Phalodi)"] },
  { year: 2017, tempAnomaly: 0.71, monsoonRainfall: 95, extremeEvents: ["Cyclone Ockhi along Kerala and Tamil Nadu coast"] },
  { year: 2018, tempAnomaly: 0.66, monsoonRainfall: 91, extremeEvents: ["Kerala Century Floods (August)", "Cyclone Gaja in Tamil Nadu"] },
  { year: 2019, tempAnomaly: 0.58, monsoonRainfall: 110, extremeEvents: ["Unusually prolonged active monsoon season", "Cyclone Fani in Odisha", "Severe flooding in Western Ghats"] },
  { year: 2020, tempAnomaly: 0.62, monsoonRainfall: 109, extremeEvents: ["Cyclone Amphan in West Bengal", "Heavy monsoon cloudbursts in Hyderabad"] },
  { year: 2021, tempAnomaly: 0.51, monsoonRainfall: 99, extremeEvents: ["Cyclone Tauktae in Arabian Sea", "Uttarakhand Chamoli glacier break"] },
  { year: 2022, tempAnomaly: 0.73, monsoonRainfall: 106, extremeEvents: ["Severe early heatwaves (March-April) across NW India", "Northeast India (Assam) flood events"] },
  { year: 2023, tempAnomaly: 0.84, monsoonRainfall: 94, extremeEvents: ["Record hot February", "Driest August in a century (El Niño)", "Cyclone Michaung in Chennai"] },
  { year: 2024, tempAnomaly: 0.89, monsoonRainfall: 108, extremeEvents: ["Record severe heatwaves in NW and Central India (49.9°C in Delhi)", "Heavy pre-monsoon precipitation in Kerala", "Cyclone Remal"] }
];
