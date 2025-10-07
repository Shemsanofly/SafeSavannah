import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { MapComponent } from './components/map/map.component';
import { AlertsComponent } from './components/alerts/alerts.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SimulationComponent } from './components/simulation/simulation.component';

import { GpsSimulatorService } from './services/gps-simulator.service';
import { AlertService } from './services/alert.service';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    MapComponent,
    AlertsComponent,
    DashboardComponent,
    SimulationComponent
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [
    GpsSimulatorService,
    AlertService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }