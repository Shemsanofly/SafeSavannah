import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GpsSimulatorService } from '../../services/gps-simulator.service';
import { AlertService } from '../../services/alert.service';
import { Animal } from '../../models/animal.model';
import { Alert, AlertStats } from '../../models/alert.model';
import { Zone } from '../../models/zone.model';

export interface DashboardStats {
  totalAnimals: number;
  activeAnimals: number;
  lowBatteryAnimals: number;
  criticalBatteryAnimals: number;
  speciesCount: { [species: string]: number };
  healthStats: { [health: string]: number };
  conservationStats: { [status: string]: number };
  recentActivity: {
    newAnimalsToday: number;
    alertsToday: number;
    criticalAlertsToday: number;
  };
}

export interface VillagerReport {
  id: string;
  reporterName: string;
  location: string;
  reportType: 'wildlife_sighting' | 'damage_report' | 'suspicious_activity' | 'request_help';
  description: string;
  timestamp: Date;
  status: 'new' | 'investigating' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high';
  coordinates?: { latitude: number; longitude: number };
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  animals: Animal[] = [];
  alerts: Alert[] = [];
  zones: Zone[] = [];
  alertStats: AlertStats = {
    total: 0,
    unread: 0,
    byPriority: { low: 0, medium: 0, high: 0, critical: 0 },
    byType: {},
    todayCount: 0,
    weekCount: 0
  };

  dashboardStats: DashboardStats = {
    totalAnimals: 0,
    activeAnimals: 0,
    lowBatteryAnimals: 0,
    criticalBatteryAnimals: 0,
    speciesCount: {},
    healthStats: {},
    conservationStats: {},
    recentActivity: {
      newAnimalsToday: 0,
      alertsToday: 0,
      criticalAlertsToday: 0
    }
  };

  villagerReports: VillagerReport[] = [
    {
      id: 'VR001',
      reporterName: 'John Mwangi',
      location: 'Village A',
      reportType: 'wildlife_sighting',
      description: 'Large herd of elephants spotted near the water well. Approximately 12 elephants including calves.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      status: 'investigating',
      priority: 'medium',
      coordinates: { latitude: -1.2921, longitude: 36.8219 }
    },
    {
      id: 'VR002',
      reporterName: 'Mary Wanjiku',
      location: 'Village B',
      reportType: 'damage_report',
      description: 'Crop damage in the maize field. Looks like elephant damage from last night.',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      status: 'new',
      priority: 'high',
      coordinates: { latitude: -1.2650, longitude: 36.8100 }
    },
    {
      id: 'VR003',
      reporterName: 'Peter Kimani',
      location: 'Village A',
      reportType: 'suspicious_activity',
      description: 'Heard gunshots around 3 AM near the forest edge. Possible poaching activity.',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      status: 'investigating',
      priority: 'high',
      coordinates: { latitude: -1.2890, longitude: 36.8210 }
    },
    {
      id: 'VR004',
      reporterName: 'Grace Njeri',
      location: 'Village C',
      reportType: 'request_help',
      description: 'Lions spotted near the school. Children are afraid to go to school.',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      status: 'new',
      priority: 'high',
      coordinates: { latitude: -1.2750, longitude: 36.8150 }
    },
    {
      id: 'VR005',
      reporterName: 'Samuel Kariuki',
      location: 'Village A',
      reportType: 'wildlife_sighting',
      description: 'Black rhino spotted in the northern area. Very rare sighting!',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      status: 'resolved',
      priority: 'medium'
    }
  ];

  recentAlerts: Alert[] = [];
  criticalAnimals: Animal[] = [];

  constructor(
    private gpsSimulator: GpsSimulatorService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.zones = this.alertService.getZones();
    
    // Subscribe to data sources
    combineLatest([
      this.gpsSimulator.getAnimals(),
      this.alertService.getAlerts(),
      this.alertService.getAlertStats()
    ]).pipe(takeUntil(this.destroy$))
      .subscribe(([animals, alerts, alertStats]) => {
        this.animals = animals;
        this.alerts = alerts;
        this.alertStats = alertStats;
        this.updateDashboardStats();
        this.updateRecentAlerts();
        this.updateCriticalAnimals();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateDashboardStats(): void {
    // Basic animal stats
    this.dashboardStats.totalAnimals = this.animals.length;
    this.dashboardStats.activeAnimals = this.animals.filter(a => a.isActive).length;
    this.dashboardStats.lowBatteryAnimals = this.animals.filter(a => 
      a.batteryLevel !== undefined && a.batteryLevel < 30 && a.batteryLevel >= 10
    ).length;
    this.dashboardStats.criticalBatteryAnimals = this.animals.filter(a => 
      a.batteryLevel !== undefined && a.batteryLevel < 10
    ).length;

    // Species count
    this.dashboardStats.speciesCount = {};
    this.animals.forEach(animal => {
      const species = animal.species;
      this.dashboardStats.speciesCount[species] = (this.dashboardStats.speciesCount[species] || 0) + 1;
    });

    // Health stats
    this.dashboardStats.healthStats = {};
    this.animals.forEach(animal => {
      const health = animal.health;
      this.dashboardStats.healthStats[health] = (this.dashboardStats.healthStats[health] || 0) + 1;
    });

    // Conservation stats
    this.dashboardStats.conservationStats = {};
    this.animals.forEach(animal => {
      if (animal.conservationStatus) {
        const status = animal.conservationStatus;
        this.dashboardStats.conservationStats[status] = (this.dashboardStats.conservationStats[status] || 0) + 1;
      }
    });

    // Recent activity
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    this.dashboardStats.recentActivity = {
      newAnimalsToday: 0, // Would be calculated from creation dates if available
      alertsToday: this.alertStats.todayCount,
      criticalAlertsToday: this.alerts.filter(alert => 
        alert.priority === 'critical' && 
        new Date(alert.timestamp) >= today
      ).length
    };
  }

  private updateRecentAlerts(): void {
    this.recentAlerts = this.alerts
      .filter(alert => alert.isActive)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
  }

  private updateCriticalAnimals(): void {
    this.criticalAnimals = this.animals.filter(animal => 
      (animal.batteryLevel !== undefined && animal.batteryLevel < 20) ||
      animal.health === 'injured' ||
      animal.health === 'sick'
    ).slice(0, 5);
  }

  getSpeciesEntries(): Array<{key: string, value: number}> {
    return Object.entries(this.dashboardStats.speciesCount)
      .map(([key, value]) => ({key, value}))
      .sort((a, b) => b.value - a.value);
  }

  getHealthEntries(): Array<{key: string, value: number}> {
    return Object.entries(this.dashboardStats.healthStats)
      .map(([key, value]) => ({key, value}));
  }

  getConservationEntries(): Array<{key: string, value: number}> {
    return Object.entries(this.dashboardStats.conservationStats)
      .map(([key, value]) => ({key, value}))
      .sort((a, b) => b.value - a.value);
  }

  getUnresolvedReports(): VillagerReport[] {
    return this.villagerReports.filter(report => 
      report.status === 'new' || report.status === 'investigating'
    );
  }

  getHighPriorityReports(): VillagerReport[] {
    return this.villagerReports.filter(report => 
      report.priority === 'high' && (report.status === 'new' || report.status === 'investigating')
    );
  }

  getReportTypeDisplayName(type: string): string {
    const typeMap: { [key: string]: string } = {
      'wildlife_sighting': 'Wildlife Sighting',
      'damage_report': 'Damage Report',
      'suspicious_activity': 'Suspicious Activity',
      'request_help': 'Help Request'
    };
    return typeMap[type] || type.replace('_', ' ');
  }

  getReportStatusClass(status: string): string {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'dismissed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getReportPriorityClass(priority: string): string {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  }

  getHealthStatusClass(health: string): string {
    switch (health) {
      case 'healthy': return 'text-green-600';
      case 'injured': return 'text-red-600';
      case 'sick': return 'text-orange-600';
      case 'unknown': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  }

  getBatteryClass(batteryLevel: number): string {
    if (batteryLevel < 10) return 'text-red-600';
    if (batteryLevel < 30) return 'text-orange-600';
    if (batteryLevel < 50) return 'text-yellow-600';
    return 'text-green-600';
  }

  getTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  updateReportStatus(reportId: string, newStatus: string): void {
    const report = this.villagerReports.find(r => r.id === reportId);
    if (report) {
      report.status = newStatus as any;
    }
  }

  markReportAsResolved(reportId: string): void {
    this.updateReportStatus(reportId, 'resolved');
  }

  markReportAsDismissed(reportId: string): void {
    this.updateReportStatus(reportId, 'dismissed');
  }

  trackByReportId(index: number, report: VillagerReport): string {
    return report.id;
  }

  trackByAlertId(index: number, alert: Alert): string {
    return alert.id;
  }

  trackByAnimalId(index: number, animal: Animal): string {
    return animal.id;
  }
}