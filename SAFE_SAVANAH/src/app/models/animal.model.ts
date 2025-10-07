export interface Animal {
  id: string;
  name: string;
  species: string;
  position: {
    latitude: number;
    longitude: number;
  };
  lastSeen: Date;
  collarId?: string;
  isActive: boolean;
  batteryLevel?: number;
  speed?: number;
  heading?: number;
  health: 'healthy' | 'injured' | 'sick' | 'unknown';
  age?: number;
  gender?: 'male' | 'female' | 'unknown';
  conservationStatus?: 'endangered' | 'vulnerable' | 'stable' | 'unknown';
}

export interface AnimalTrack {
  animalId: string;
  positions: {
    latitude: number;
    longitude: number;
    timestamp: Date;
    accuracy?: number;
  }[];
}