export interface StateMetaData {
  name: string;
  capital: string;
  region: "Northwest" | "Western Ghats" | "Indo-Gangetic Plain" | "Northeast" | "Deccan Plateau" | "Central India" | "South India";
  baseTemp: number; // °C
  baseRain: number; // mm/day
  humidity: number; // %
  elevation: number; // meters
}

export interface GridNode {
  id: string;
  lat: number;
  lon: number;
  stateName: string;
  elevation: number;
  baseTemp: number;
  baseRain: number;
}

// Simplified high-fidelity polygon of India's coastline & borders for fast outline rendering
export const INDIA_BORDER_OUTLINE: [number, number][] = [
  [68.1, 23.7], [68.5, 24.6], [70.9, 24.4], [71.0, 24.6], [71.1, 24.6],
  [74.0, 33.2], [76.8, 34.9], [77.8, 35.5], [78.1, 35.4], [78.9, 34.3],
  [79.5, 32.7], [78.7, 31.2], [80.1, 30.7], [81.0, 30.2], [81.3, 28.1],
  [83.3, 27.3], [85.0, 26.8], [88.1, 26.5], [88.5, 27.1], [88.8, 28.0],
  [88.8, 27.3], [91.6, 27.5], [92.0, 27.1], [96.1, 29.4], [97.4, 28.2],
  [97.2, 27.9], [95.2, 26.7], [94.5, 25.6], [93.2, 24.0], [92.2, 24.2],
  [92.8, 24.4], [92.2, 22.2], [91.8, 23.2], [91.4, 23.0], [91.2, 23.3],
  [89.0, 22.0], [89.0, 21.6], [88.3, 21.6], [87.0, 20.7], [85.9, 19.8],
  [84.0, 18.7], [83.3, 17.7], [81.1, 15.9], [80.2, 13.4], [79.8, 11.9],
  [79.8, 11.2], [79.8, 10.9], [79.5, 10.3], [79.2, 10.0], [78.8, 9.2],
  [78.1, 8.7], [77.5, 8.1], [77.3, 8.1], [76.9, 8.3], [76.5, 8.9],
  [76.2, 9.9], [76.0, 10.5], [75.8, 11.1], [75.4, 11.7], [74.8, 12.7],
  [74.3, 14.5], [73.7, 15.7], [72.8, 20.3], [72.7, 21.0], [72.1, 22.0],
  [72.2, 22.1], [72.1, 22.2], [71.8, 21.0], [70.8, 20.7], [68.9, 22.1],
  [68.3, 23.5], [68.1, 23.7]
];

export const STATES_METADATA: StateMetaData[] = [
  { name: "Andaman and Nicobar", capital: "Port Blair", region: "South India", baseTemp: 28.5, baseRain: 8.2, humidity: 81, elevation: 15 },
  { name: "Andhra Pradesh", capital: "Amaravati", region: "South India", baseTemp: 34.0, baseRain: 4.5, humidity: 65, elevation: 120 },
  { name: "Arunachal Pradesh", capital: "Itanagar", region: "Northeast", baseTemp: 22.4, baseRain: 9.8, humidity: 82, elevation: 1100 },
  { name: "Assam", capital: "Dispur", region: "Northeast", baseTemp: 28.2, baseRain: 8.5, humidity: 79, elevation: 95 },
  { name: "Bihar", capital: "Patna", region: "Indo-Gangetic Plain", baseTemp: 35.8, baseRain: 5.2, humidity: 62, elevation: 53 },
  { name: "Chandigarh", capital: "Chandigarh", region: "Northwest", baseTemp: 36.2, baseRain: 3.8, humidity: 55, elevation: 320 },
  { name: "Chhattisgarh", capital: "Raipur", region: "Central India", baseTemp: 36.5, baseRain: 6.4, humidity: 58, elevation: 298 },
  { name: "Delhi", capital: "New Delhi", region: "Indo-Gangetic Plain", baseTemp: 39.5, baseRain: 2.1, humidity: 48, elevation: 216 },
  { name: "Goa", capital: "Panaji", region: "Western Ghats", baseTemp: 31.2, baseRain: 12.4, humidity: 78, elevation: 12 },
  { name: "Gujarat", capital: "Gandhinagar", region: "Northwest", baseTemp: 38.4, baseRain: 1.8, humidity: 54, elevation: 42 },
  { name: "Haryana", capital: "Chandigarh", region: "Northwest", baseTemp: 39.1, baseRain: 2.2, humidity: 50, elevation: 220 },
  { name: "Himachal Pradesh", capital: "Shimla", region: "Northwest", baseTemp: 24.5, baseRain: 5.8, humidity: 64, elevation: 2200 },
  { name: "Jammu and Kashmir", capital: "Srinagar", region: "Northwest", baseTemp: 21.0, baseRain: 3.4, humidity: 68, elevation: 1585 },
  { name: "Jharkhand", capital: "Ranchi", region: "Central India", baseTemp: 34.8, baseRain: 5.9, humidity: 60, elevation: 651 },
  { name: "Karnataka", capital: "Bengaluru", region: "Deccan Plateau", baseTemp: 31.5, baseRain: 7.2, humidity: 68, elevation: 920 },
  { name: "Kerala", capital: "Thiruvananthapuram", region: "Western Ghats", baseTemp: 29.8, baseRain: 14.2, humidity: 82, elevation: 10 },
  { name: "Madhya Pradesh", capital: "Bhopal", region: "Central India", baseTemp: 38.2, baseRain: 4.1, humidity: 48, elevation: 500 },
  { name: "Maharashtra", capital: "Mumbai", region: "Deccan Plateau", baseTemp: 34.5, baseRain: 6.8, humidity: 72, elevation: 550 },
  { name: "Manipur", capital: "Imphal", region: "Northeast", baseTemp: 25.4, baseRain: 7.8, humidity: 76, elevation: 790 },
  { name: "Meghalaya", capital: "Shillong", region: "Northeast", baseTemp: 21.2, baseRain: 15.6, humidity: 85, elevation: 1496 },
  { name: "Mizoram", capital: "Aizawl", region: "Northeast", baseTemp: 24.8, baseRain: 9.2, humidity: 80, elevation: 1132 },
  { name: "Nagaland", capital: "Kohima", region: "Northeast", baseTemp: 23.5, baseRain: 8.4, humidity: 78, elevation: 1444 },
  { name: "Orissa", capital: "Bhubaneswar", region: "Deccan Plateau", baseTemp: 35.2, baseRain: 7.8, humidity: 74, elevation: 45 },
  { name: "Punjab", capital: "Chandigarh", region: "Northwest", baseTemp: 39.8, baseRain: 2.4, humidity: 48, elevation: 250 },
  { name: "Rajasthan", capital: "Jaipur", region: "Northwest", baseTemp: 41.5, baseRain: 1.1, humidity: 40, elevation: 430 },
  { name: "Sikkim", capital: "Gangtok", region: "Northeast", baseTemp: 18.5, baseRain: 11.2, humidity: 84, elevation: 1650 },
  { name: "Tamil Nadu", capital: "Chennai", region: "South India", baseTemp: 34.8, baseRain: 3.5, humidity: 66, elevation: 10 },
  { name: "Tripura", capital: "Agartala", region: "Northeast", baseTemp: 29.4, baseRain: 8.8, humidity: 78, elevation: 15 },
  { name: "Uttar Pradesh", capital: "Lucknow", region: "Indo-Gangetic Plain", baseTemp: 38.6, baseRain: 3.2, humidity: 55, elevation: 125 },
  { name: "Uttaranchal", capital: "Dehradun", region: "Northwest", baseTemp: 25.8, baseRain: 6.2, humidity: 62, elevation: 1400 },
  { name: "West Bengal", capital: "Kolkata", region: "Indo-Gangetic Plain", baseTemp: 33.5, baseRain: 8.1, humidity: 75, elevation: 9 }
];

export function isPointInPolygon(point: [number, number], polygon: [number, number][]): boolean {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    const intersect = ((yi > y) !== (yj > y))
        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// Generate an active IMD / INSAT Gridded Climate Assimilation Node List spanning India's geography
export const generateGridNodes = (): GridNode[] => {
  const nodes: GridNode[] = [];
  const STATE_CENTERS: { [state: string]: [number, number] } = {
    "Andaman and Nicobar": [92.7, 11.7],
    "Andhra Pradesh": [79.8, 15.9],
    "Arunachal Pradesh": [94.5, 28.0],
    "Assam": [92.9, 26.2],
    "Bihar": [85.3, 25.1],
    "Chandigarh": [76.8, 30.7],
    "Chhattisgarh": [81.8, 21.3],
    "Delhi": [77.2, 28.6],
    "Goa": [74.1, 15.3],
    "Gujarat": [71.6, 22.3],
    "Haryana": [76.3, 29.1],
    "Himachal Pradesh": [77.2, 31.8],
    "Jammu and Kashmir": [74.8, 33.9],
    "Jharkhand": [85.3, 23.6],
    "Karnataka": [75.7, 15.3],
    "Kerala": [76.5, 10.4],
    "Madhya Pradesh": [78.2, 23.5],
    "Maharashtra": [76.1, 19.6],
    "Manipur": [93.9, 24.8],
    "Meghalaya": [91.3, 25.5],
    "Mizoram": [92.9, 23.3],
    "Nagaland": [94.3, 26.2],
    "Orissa": [84.3, 20.4],
    "Punjab": [75.3, 30.9],
    "Rajasthan": [73.3, 26.6],
    "Sikkim": [88.6, 27.5],
    "Tamil Nadu": [78.7, 10.8],
    "Tripura": [91.7, 23.8],
    "Uttar Pradesh": [80.9, 26.9],
    "Uttaranchal": [79.3, 30.1],
    "West Bengal": [87.9, 23.9]
  };

  let count = 1;

  // 1. First, create at least 1 guaranteed central node for each state metadata to guarantee representation.
  STATES_METADATA.forEach((stateMeta) => {
    const centerCoords = STATE_CENTERS[stateMeta.name];
    if (centerCoords) {
      const [lon, lat] = centerCoords;
      nodes.push({
        id: `IMD-${stateMeta.name.slice(0, 3).toUpperCase()}-CENTER`,
        lat,
        lon,
        stateName: stateMeta.name,
        elevation: stateMeta.elevation,
        baseTemp: stateMeta.baseTemp,
        baseRain: stateMeta.baseRain
      });
    }
  });

  // 2. Now generate a beautiful, highly uniform grid covering the coordinates of India.
  // Step size of 0.8 degrees ensures a highly optimized, uniform, and responsive grid.
  const STEP = 0.8;
  for (let lon = 68.0; lon <= 97.5; lon += STEP) {
    for (let lat = 8.0; lat <= 35.8; lat += STEP) {
      const point: [number, number] = [lon, lat];
      
      // Check if point is inside the official India border outline
      if (isPointInPolygon(point, INDIA_BORDER_OUTLINE)) {
        // Find the closest state based on distance to the state center
        let closestState: StateMetaData | null = null;
        let minDistance = Infinity;

        STATES_METADATA.forEach((stateMeta) => {
          const center = STATE_CENTERS[stateMeta.name];
          if (center) {
            const d = Math.sqrt((lon - center[0]) ** 2 + (lat - center[1]) ** 2);
            if (d < minDistance) {
              minDistance = d;
              closestState = stateMeta;
            }
          }
        });

        if (closestState) {
          const stateMeta: StateMetaData = closestState;
          
          // Subtle variance to make grid nodes organic
          const jitterLon = lon + (Math.random() - 0.5) * 0.12;
          const jitterLat = lat + (Math.random() - 0.5) * 0.12;

          // Local elevation with subtle variance
          const elevationOffset = (Math.random() - 0.5) * (stateMeta.elevation * 0.25);
          const nodeElevation = Math.max(5, Math.round(stateMeta.elevation + elevationOffset));

          // Temperature drop using lapse rate
          const lapseRate = 0.0065;
          const elevationDrop = (nodeElevation - stateMeta.elevation) * lapseRate;
          const nodeTemp = parseFloat((stateMeta.baseTemp - elevationDrop + (Math.random() - 0.5) * 1.5).toFixed(1));
          const nodeRain = parseFloat((stateMeta.baseRain + (Math.random() - 0.5) * (stateMeta.baseRain * 0.35)).toFixed(1));

          // Ensure points aren't placed too close to state center node or other nodes
          const tooClose = nodes.some(
            (n) => Math.sqrt((n.lon - jitterLon) ** 2 + (n.lat - jitterLat) ** 2) < 0.4
          );

          if (!tooClose) {
            nodes.push({
              id: `IMD-${stateMeta.name.slice(0, 3).toUpperCase()}-${count++}`,
              lat: parseFloat(jitterLat.toFixed(4)),
              lon: parseFloat(jitterLon.toFixed(4)),
              stateName: stateMeta.name,
              elevation: nodeElevation,
              baseTemp: nodeTemp,
              baseRain: Math.max(0, nodeRain)
            });
          }
        }
      }
    }
  }

  return nodes;
};
