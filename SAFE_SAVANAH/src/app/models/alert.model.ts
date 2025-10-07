export interface Alert {
  id: string;
  type: 'animal_near_village' | 'poacher_detected' | 'fence_breach' | 'collar_malfunction' | 'emergency' | 'wildlife_conflict';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  location: {
    latitude: number;
    longitude: number;
    name?: string;
  };
  animalId?: string;
  zoneId?: string;
  isRead: boolean;
  isActive: boolean;
  source: 'gps_collar' | 'camera_trap' | 'ranger_report' | 'villager_report' | 'sensor' | 'system';
  metadata?: {
    [key: string]: any;
  };
}

export interface AlertStats {
  total: number;
  unread: number;
  byPriority: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  byType: {
    [key: string]: number;
  };
  todayCount: number;
  weekCount: number;
}