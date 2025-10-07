import { Component, OnInit } from '@angular/core';
import { AlertService } from './services/alert.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'SafeSavannah';
  currentView: 'dashboard' | 'map' | 'alerts' | 'simulation' = 'dashboard';

  constructor(private alertService: AlertService) {}

  ngOnInit(): void {
    // Initialize the app and start alert monitoring
    console.log('SafeSavannah app initializing...');
    
    // Start alert monitoring
    this.alertService.startMonitoring();
    
    // Debug: Check if alerts are being generated
    this.alertService.getAlerts().subscribe(alerts => {
      console.log('Current alerts:', alerts.length);
    });
  }

  setCurrentView(view: 'dashboard' | 'map' | 'alerts' | 'simulation'): void {
    this.currentView = view;
  }

  getCurrentViewTitle(): string {
    switch (this.currentView) {
      case 'dashboard': return 'Dashboard Overview';
      case 'map': return 'Live Map View';
      case 'alerts': return 'Alerts Management';
      case 'simulation': return 'Training & Simulation';
      default: return 'SafeSavannah';
    }
  }
}