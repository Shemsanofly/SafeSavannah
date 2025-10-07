export interface Zone {
  id: string;
  name: string;
  type: 'protected_area' | 'village' | 'buffer_zone' | 'danger_zone' | 'wildlife_corridor';
  boundaries: {
    latitude: number;
    longitude: number;
  }[];
  isActive: boolean;
  description?: string;
  alertRadius?: number; // in meters
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  population?: number; // for villages
  lastUpdated: Date;
  metadata?: {
    [key: string]: any;
  };
}

export interface GeoFence {
  id: string;
  zoneId: string;
  name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  }[];
  isActive: boolean;
  alertOnEntry: boolean;
  alertOnExit: boolean;
  allowedSpecies?: string[];
  maxAnimalsAllowed?: number;
  currentAnimalsInside?: string[]; // animal IDs
}

export interface ZoneStats {
  totalZones: number;
  activeZones: number;
  byType: {
    [key: string]: number;
  };
  byRiskLevel: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  totalPopulation?: number;
}