import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AlertService } from '../../services/alert.service';
import { GpsSimulatorService } from '../../services/gps-simulator.service';
import { AlertStats } from '../../models/alert.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  @Output() viewChanged = new EventEmitter<'dashboard' | 'map' | 'alerts' | 'simulation'>();
  
  alertStats: AlertStats = {
    total: 0,
    unread: 0,
    byPriority: { low: 0, medium: 0, high: 0, critical: 0 },
    byType: {},
    todayCount: 0,
    weekCount: 0
  };
  
  isSimulationRunning = false;
  isMonitoringActive = false;
  currentTime = new Date();
  lastUpdateTime = new Date();
  activeAnimals = 0;
  currentView = 'dashboard';
  showUserMenu = false;
  
  constructor(
    private alertService: AlertService,
    private gpsSimulator: GpsSimulatorService
  ) {}

  ngOnInit(): void {
    // Subscribe to alert stats
    this.alertService.getAlertStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe(stats => {
        this.alertStats = stats;
        this.lastUpdateTime = new Date();
      });

    // Subscribe to animals data to get count
    this.gpsSimulator.getAnimals()
      .pipe(takeUntil(this.destroy$))
      .subscribe(animals => {
        this.activeAnimals = animals.length;
      });

    // Check simulation and monitoring status
    this.isSimulationRunning = this.gpsSimulator.isRunning();
    this.isMonitoringActive = this.alertService.isMonitoringActive();

    // Update time every second
    setInterval(() => {
      this.currentTime = new Date();
    }, 1000);

    // Update last update time periodically
    setInterval(() => {
      this.lastUpdateTime = new Date();
    }, 30000); // Update every 30 seconds
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setActiveView(view: 'dashboard' | 'map' | 'alerts' | 'simulation'): void {
    this.currentView = view;
    this.viewChanged.emit(view);
    this.showUserMenu = false; // Close user menu when switching views
  }

  toggleSimulation(): void {
    if (this.isSimulationRunning) {
      this.gpsSimulator.stopSimulation();
      this.alertService.stopMonitoring();
    } else {
      this.gpsSimulator.startSimulation();
      this.alertService.startMonitoring();
    }
    this.isSimulationRunning = this.gpsSimulator.isRunning();
    this.isMonitoringActive = this.alertService.isMonitoringActive();
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  markAllAlertsAsRead(): void {
    this.alertService.markAllAsRead();
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  }

  getPriorityBadgeColor(priority: string): string {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}