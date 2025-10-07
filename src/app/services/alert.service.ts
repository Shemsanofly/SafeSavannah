import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { Alert, AlertStats } from '../models/alert.model';
import { Animal } from '../models/animal.model';
import { Zone } from '../models/zone.model';
import { GpsSimulatorService } from './gps-simulator.service';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private alertsSubject = new BehaviorSubject<Alert[]>([]);
  private alertStatsSubject = new BehaviorSubject<AlertStats>(this.getInitialStats());
  private isMonitoring = false;
  private monitoringInterval: any;
  private alertCounter = 1;

  // Sample zones for detection
  private sampleZones: Zone[] = [
    {
      id: 'village-001',
      name: 'Village A',
      type: 'village',
      boundaries: [
        { latitude: -1.2900, longitude: 36.8200 },
        { latitude: -1.2950, longitude: 36.8200 },
        { latitude: -1.2950, longitude: 36.8250 },
        { latitude: -1.2900, longitude: 36.8250 }
      ],
      isActive: true,
      description: 'Local farming community',
      alertRadius: 500,
      riskLevel: 'high',
      population: 1200,
      lastUpdated: new Date()
    },
    {
      id: 'village-002',
      name: 'Village B',
      type: 'village',
      boundaries: [
        { latitude: -1.2650, longitude: 36.8100 },
        { latitude: -1.2700, longitude: 36.8100 },
        { latitude: -1.2700, longitude: 36.8150 },
        { latitude: -1.2650, longitude: 36.8150 }
      ],
      isActive: true,
      description: 'Pastoral community',
      alertRadius: 700,
      riskLevel: 'medium',
      population: 800,
      lastUpdated: new Date()
    },
    {
      id: 'protected-001',
      name: 'National Reserve',
      type: 'protected_area',
      boundaries: [
        { latitude: -1.2800, longitude: 36.8000 },
        { latitude: -1.2600, longitude: 36.8000 },
        { latitude: -1.2600, longitude: 36.8300 },
        { latitude: -1.2800, longitude: 36.8300 }
      ],
      isActive: true,
      description: 'Protected wildlife area',
      alertRadius: 1000,
      riskLevel: 'low',
      lastUpdated: new Date()
    }
  ];

  private alerts: Alert[] = [];

  constructor(private gpsSimulator: GpsSimulatorService) {
    this.generateInitialAlerts();
  }

  getAlerts(): Observable<Alert[]> {
    return this.alertsSubject.asObservable();
  }

  getAlertStats(): Observable<AlertStats> {
    return this.alertStatsSubject.asObservable();
  }

  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;

    // Check for alerts every 60 seconds
    this.monitoringInterval = interval(60000).subscribe(() => {
      this.checkForAlerts();
    });
  }

  stopMonitoring(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    if (this.monitoringInterval) {
      this.monitoringInterval.unsubscribe();
    }
  }

  private checkForAlerts(): void {
    this.gpsSimulator.getAnimals().subscribe(animals => {
      animals.forEach(animal => {
        this.checkAnimalNearVillage(animal);
        this.checkCollarMalfunction(animal);
        this.checkBatteryLow(animal);
      });
    });

    // Occasionally generate random alerts for simulation
    if (Math.random() < 0.1) { // 10% chance
      this.generateRandomAlert();
    }
  }

  private checkAnimalNearVillage(animal: Animal): void {
    const villageZones = this.sampleZones.filter(zone => zone.type === 'village');
    
    villageZones.forEach(village => {
      if (this.gpsSimulator.isAnimalNearZone(animal, village, 1)) {
        // Check if we already have a recent alert for this animal-village combination
        const recentAlert = this.alerts.find(alert => 
          alert.animalId === animal.id && 
          alert.zoneId === village.id && 
          alert.type === 'animal_near_village' &&
          alert.isActive &&
          (Date.now() - alert.timestamp.getTime()) < 1800000 // 30 minutes
        );

        if (!recentAlert) {
          this.createAlert({
            type: 'animal_near_village',
            priority: village.riskLevel === 'high' ? 'high' : 'medium',
            title: `${animal.species} near ${village.name}`,
            message: `${animal.name} (${animal.species}) has been detected within 1km of ${village.name}. Population at risk: ${village.population} people.`,
            location: {
              latitude: animal.position.latitude,
              longitude: animal.position.longitude,
              name: village.name
            },
            animalId: animal.id,
            zoneId: village.id,
            source: 'gps_collar',
            metadata: {
              distance: this.calculateDistanceToZone(animal, village),
              animalSpeed: animal.speed,
              villagePopulation: village.population
            }
          });
        }
      }
    });
  }

  private checkCollarMalfunction(animal: Animal): void {
    if (animal.batteryLevel !== undefined && animal.batteryLevel < 10) {
      const recentAlert = this.alerts.find(alert => 
        alert.animalId === animal.id && 
        alert.type === 'collar_malfunction' &&
        alert.isActive &&
        (Date.now() - alert.timestamp.getTime()) < 3600000 // 1 hour
      );

      if (!recentAlert) {
        this.createAlert({
          type: 'collar_malfunction',
          priority: 'high',
          title: `Collar Battery Critical`,
          message: `GPS collar for ${animal.name} (${animal.species}) has critical battery level: ${animal.batteryLevel}%`,
          location: {
            latitude: animal.position.latitude,
            longitude: animal.position.longitude
          },
          animalId: animal.id,
          source: 'gps_collar',
          metadata: {
            batteryLevel: animal.batteryLevel,
            collarId: animal.collarId
          }
        });
      }
    }
  }

  private checkBatteryLow(animal: Animal): void {
    if (animal.batteryLevel !== undefined && animal.batteryLevel < 20 && animal.batteryLevel >= 10) {
      const recentAlert = this.alerts.find(alert => 
        alert.animalId === animal.id && 
        alert.type === 'collar_malfunction' &&
        alert.isActive &&
        (Date.now() - alert.timestamp.getTime()) < 7200000 // 2 hours
      );

      if (!recentAlert) {
        this.createAlert({
          type: 'collar_malfunction',
          priority: 'medium',
          title: `Collar Battery Low`,
          message: `GPS collar for ${animal.name} (${animal.species}) has low battery: ${animal.batteryLevel}%`,
          location: {
            latitude: animal.position.latitude,
            longitude: animal.position.longitude
          },
          animalId: animal.id,
          source: 'gps_collar',
          metadata: {
            batteryLevel: animal.batteryLevel,
            collarId: animal.collarId
          }
        });
      }
    }
  }

  private generateRandomAlert(): void {
    const alertTypes = ['poacher_detected', 'fence_breach', 'wildlife_conflict', 'emergency'];
    const randomType = alertTypes[Math.floor(Math.random() * alertTypes.length)] as any;
    
    const randomZone = this.sampleZones[Math.floor(Math.random() * this.sampleZones.length)];
    
    this.createAlert({
      type: randomType,
      priority: Math.random() > 0.7 ? 'high' : 'medium',
      title: this.getRandomAlertTitle(randomType),
      message: this.getRandomAlertMessage(randomType, randomZone.name),
      location: {
        latitude: randomZone.boundaries[0].latitude + (Math.random() - 0.5) * 0.01,
        longitude: randomZone.boundaries[0].longitude + (Math.random() - 0.5) * 0.01,
        name: randomZone.name
      },
      zoneId: randomZone.id,
      source: 'sensor',
      metadata: {
        zoneType: randomZone.type,
        generated: true
      }
    });
  }

  private getRandomAlertTitle(type: string): string {
    const titles: { [key: string]: string } = {
      'poacher_detected': 'Suspicious Activity Detected',
      'fence_breach': 'Perimeter Breach Alert',
      'wildlife_conflict': 'Human-Wildlife Conflict',
      'emergency': 'Emergency Situation'
    };
    return titles[type] || 'Alert';
  }

  private getRandomAlertMessage(type: string, zoneName: string): string {
    const messages: { [key: string]: string } = {
      'poacher_detected': `Camera trap detected suspicious human activity near ${zoneName}. Possible poaching attempt.`,
      'fence_breach': `Perimeter fence breach detected in ${zoneName} area. Wildlife may have crossed into restricted zone.`,
      'wildlife_conflict': `Human-wildlife conflict reported near ${zoneName}. Rangers dispatched to investigate.`,
      'emergency': `Emergency situation reported in ${zoneName} area. Immediate response required.`
    };
    return messages[type] || 'Alert generated';
  }

  private createAlert(alertData: Partial<Alert>): void {
    const alert: Alert = {
      id: `alert-${this.alertCounter++}`,
      type: alertData.type!,
      priority: alertData.priority!,
      title: alertData.title!,
      message: alertData.message!,
      timestamp: new Date(),
      location: alertData.location!,
      animalId: alertData.animalId,
      zoneId: alertData.zoneId,
      isRead: false,
      isActive: true,
      source: alertData.source!,
      metadata: alertData.metadata
    };

    this.alerts.unshift(alert); // Add to beginning of array
    
    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(0, 100);
    }

    this.alertsSubject.next([...this.alerts]);
    this.updateStats();

    // Play alert sound for high priority alerts
    if (alert.priority === 'high' || alert.priority === 'critical') {
      this.playAlertSound();
    }
  }

  private generateInitialAlerts(): void {
    // Generate some sample alerts for demonstration
    const sampleAlerts = [
      {
        type: 'animal_near_village' as const,
        priority: 'high' as const,
        title: 'Elephant herd approaching Village A',
        message: 'A herd of 6 elephants has been detected 800m from Village A. Estimated arrival in 20 minutes.',
        location: { latitude: -1.2890, longitude: 36.8210, name: 'Village A' },
        source: 'gps_collar' as const,
        timestamp: new Date(Date.now() - 300000), // 5 minutes ago
        metadata: { animalType: 'elephant', herdSize: 6 }
      },
      {
        type: 'poacher_detected' as const,
        priority: 'critical' as const,
        title: 'Suspicious activity detected',
        message: 'Camera trap captured images of armed individuals in protected area. Rangers notified.',
        location: { latitude: -1.2720, longitude: 36.8150, name: 'National Reserve' },
        source: 'camera_trap' as const,
        timestamp: new Date(Date.now() - 900000), // 15 minutes ago
        metadata: { threatLevel: 'high', rangersNotified: true }
      },
      {
        type: 'collar_malfunction' as const,
        priority: 'medium' as const,
        title: 'GPS collar battery low',
        message: 'Collar COL-003 (Kifaru - Black Rhinoceros) battery at 15%. Maintenance required.',
        location: { latitude: -1.2756, longitude: 36.8089, name: 'Reserve Zone B' },
        source: 'gps_collar' as const,
        timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
        metadata: { animalType: 'rhino', batteryLevel: 15, collarId: 'COL-003' }
      },
      {
        type: 'animal_near_village' as const,
        priority: 'medium' as const,
        title: 'Lion pride spotted near Village C',
        message: 'A pride of 4 lions has been seen 2km from Village C. Monitoring situation.',
        location: { latitude: -1.2650, longitude: 36.8050, name: 'Village C' },
        source: 'ranger_report' as const,
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        metadata: { animalType: 'lion', prideSize: 4, distance: '2km' }
      },
      {
        type: 'fence_breach' as const,
        priority: 'high' as const,
        title: 'Perimeter fence damaged',
        message: 'Section 12-B of perimeter fence has been damaged, possibly by elephants. Immediate repair needed.',
        location: { latitude: -1.2800, longitude: 36.8100, name: 'Fence Section 12-B' },
        source: 'sensor' as const,
        timestamp: new Date(Date.now() - 600000), // 10 minutes ago
        metadata: { sectionId: '12-B', damageLevel: 'major' }
      },
      {
        type: 'wildlife_conflict' as const,
        priority: 'critical' as const,
        title: 'Human-wildlife conflict reported',
        message: 'Farmers report crop damage by buffalo herd. Rangers dispatched to resolve conflict.',
        location: { latitude: -1.2950, longitude: 36.8300, name: 'Farming Area C' },
        source: 'villager_report' as const,
        timestamp: new Date(), // Just now
        metadata: { conflictType: 'crop_damage', animalType: 'buffalo' }
      }
    ];

    sampleAlerts.forEach(alertData => {
      const alert: Alert = {
        id: `alert-${this.alertCounter++}`,
        type: alertData.type,
        priority: alertData.priority,
        title: alertData.title,
        message: alertData.message,
        timestamp: alertData.timestamp,
        location: alertData.location,
        isRead: Math.random() > 0.7, // Some alerts are read, some unread
        isActive: true,
        source: alertData.source,
        metadata: alertData.metadata || { generated: true }
      };
      this.alerts.push(alert);
    });

    console.log('Generated initial alerts:', this.alerts.length);
    console.log('Sample alert data:', this.alerts.slice(0, 2));
    this.alertsSubject.next([...this.alerts]);
    this.updateStats();
    
    // Verify stats calculation
    setTimeout(() => {
      const stats = this.alertStatsSubject.value;
      console.log('Alert statistics calculated:', stats);
    }, 100);
  }

  markAsRead(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.isRead = true;
      this.alertsSubject.next([...this.alerts]);
      this.updateStats();
    }
  }

  markAllAsRead(): void {
    this.alerts.forEach(alert => alert.isRead = true);
    this.alertsSubject.next([...this.alerts]);
    this.updateStats();
  }

  dismissAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.isActive = false;
      this.alertsSubject.next([...this.alerts]);
      this.updateStats();
    }
  }

  private calculateDistanceToZone(animal: Animal, zone: Zone): number {
    const centerLat = zone.boundaries.reduce((sum, point) => sum + point.latitude, 0) / zone.boundaries.length;
    const centerLng = zone.boundaries.reduce((sum, point) => sum + point.longitude, 0) / zone.boundaries.length;

    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(centerLat - animal.position.latitude);
    const dLng = this.toRadians(centerLng - animal.position.longitude);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(animal.position.latitude)) * Math.cos(this.toRadians(centerLat)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private updateStats(): void {
    const activeAlerts = this.alerts.filter(alert => alert.isActive);
    const unreadAlerts = activeAlerts.filter(alert => !alert.isRead);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const stats: AlertStats = {
      total: activeAlerts.length,
      unread: unreadAlerts.length,
      byPriority: {
        low: activeAlerts.filter(a => a.priority === 'low').length,
        medium: activeAlerts.filter(a => a.priority === 'medium').length,
        high: activeAlerts.filter(a => a.priority === 'high').length,
        critical: activeAlerts.filter(a => a.priority === 'critical').length
      },
      byType: {},
      todayCount: activeAlerts.filter(a => {
        const alertDate = new Date(a.timestamp);
        alertDate.setHours(0, 0, 0, 0);
        return alertDate.getTime() === today.getTime();
      }).length,
      weekCount: activeAlerts.filter(a => 
        a.timestamp.getTime() >= weekAgo.getTime()
      ).length
    };

    // Count by type
    activeAlerts.forEach(alert => {
      stats.byType[alert.type] = (stats.byType[alert.type] || 0) + 1;
    });

    console.log('Updating stats:', stats);
    this.alertStatsSubject.next(stats);
  }

  private getInitialStats(): AlertStats {
    return {
      total: 0,
      unread: 0,
      byPriority: { low: 0, medium: 0, high: 0, critical: 0 },
      byType: {},
      todayCount: 0,
      weekCount: 0
    };
  }

  private playAlertSound(): void {
    try {
      const audio = new Audio('assets/gunshot.mp3');
      audio.volume = 0.3;
      audio.play().catch(err => console.warn('Could not play alert sound:', err));
    } catch (err) {
      console.warn('Alert sound not available:', err);
    }
  }

  // Get zones for external use
  getZones(): Zone[] {
    return [...this.sampleZones];
  }

  isMonitoringActive(): boolean {
    return this.isMonitoring;
  }
}