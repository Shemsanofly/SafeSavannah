import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as L from 'leaflet';
import { GpsSimulatorService } from '../../services/gps-simulator.service';
import { AlertService } from '../../services/alert.service';
import { Animal } from '../../models/animal.model';
import { Zone } from '../../models/zone.model';
import { Alert } from '../../models/alert.model';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, OnDestroy, AfterViewInit {
  private destroy$ = new Subject<void>();
  private map!: L.Map;
  private animalMarkers: Map<string, L.Marker> = new Map();
  private zonePolygons: Map<string, L.Polygon> = new Map();
  private alertMarkers: Map<string, L.Marker> = new Map();
  private animalTracks: Map<string, L.Polyline> = new Map();

  animals: Animal[] = [];
  zones: Zone[] = [];
  alerts: Alert[] = [];
  
  showTracks = true;
  showZones = true;
  showAlerts = true;
  selectedAnimal: Animal | null = null;

  // Map center (Kenya/Nairobi area)
  private mapCenter: L.LatLngExpression = [-1.2921, 36.8219];

  constructor(
    private gpsSimulator: GpsSimulatorService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    // Subscribe to animal updates
    this.gpsSimulator.getAnimals()
      .pipe(takeUntil(this.destroy$))
      .subscribe(animals => {
        this.animals = animals;
        this.updateAnimalMarkers();
      });

    // Subscribe to animal tracks
    this.gpsSimulator.getTracks()
      .pipe(takeUntil(this.destroy$))
      .subscribe(tracks => {
        if (this.showTracks) {
          this.updateAnimalTracks(tracks);
        }
      });

    // Subscribe to alerts
    this.alertService.getAlerts()
      .pipe(takeUntil(this.destroy$))
      .subscribe(alerts => {
        this.alerts = alerts.filter(alert => alert.isActive);
        if (this.showAlerts) {
          this.updateAlertMarkers();
        }
      });

    // Get zones
    this.zones = this.alertService.getZones();
  }

  ngAfterViewInit(): void {
    this.initializeMap();
    setTimeout(() => {
      this.addZones();
    }, 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.map) {
      this.map.remove();
    }
  }

  private initializeMap(): void {
    // Initialize map
    this.map = L.map('map', {
      center: this.mapCenter,
      zoom: 12
    });

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Add scale
    L.control.scale().addTo(this.map);

    // Add custom controls
    this.addCustomControls();
  }

  private addCustomControls(): void {
    // Create legend control
    const legend = new (L.Control.extend({
      options: { position: 'bottomright' },
      onAdd: () => {
        const div = L.DomUtil.create('div', 'map-legend');
        div.innerHTML = `
          <h4>Legend</h4>
          <div class="legend-item">
            <span class="legend-icon animal-icon"></span>
            <span>Animals</span>
          </div>
          <div class="legend-item">
            <span class="legend-icon village-zone"></span>
            <span>Villages</span>
          </div>
          <div class="legend-item">
            <span class="legend-icon protected-zone"></span>
            <span>Protected Areas</span>
          </div>
          <div class="legend-item">
            <span class="legend-icon alert-icon"></span>
            <span>Active Alerts</span>
          </div>
        `;
        return div;
      }
    }))();

    legend.addTo(this.map);
  }

  private updateAnimalMarkers(): void {
    // Remove existing markers
    this.animalMarkers.forEach(marker => this.map.removeLayer(marker));
    this.animalMarkers.clear();

    // Add new markers
    this.animals.forEach(animal => {
      const icon = this.getAnimalIcon(animal);
      const marker = L.marker([animal.position.latitude, animal.position.longitude], { icon })
        .bindPopup(this.createAnimalPopup(animal))
        .on('click', () => {
          this.onAnimalMarkerClick(animal);
        });

      marker.addTo(this.map);
      this.animalMarkers.set(animal.id, marker);
    });
  }

  private getAnimalIcon(animal: Animal): L.DivIcon {
    const color = this.getAnimalColor(animal.species);
    const iconHtml = `
      <div class="animal-marker" style="background-color: ${color}">
        <span class="animal-icon">${this.getAnimalEmoji(animal.species)}</span>
        ${animal.batteryLevel && animal.batteryLevel < 20 ? '<span class="battery-warning">⚠</span>' : ''}
      </div>
    `;

    return L.divIcon({
      html: iconHtml,
      className: 'custom-animal-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
  }

  private getAnimalColor(species: string): string {
    const colors: { [key: string]: string } = {
      'African Elephant': '#8B4513',
      'African Lion': '#DAA520',
      'Black Rhinoceros': '#696969',
      'Masai Giraffe': '#DEB887',
      'African Leopard': '#F4A460'
    };
    return colors[species] || '#666666';
  }

  private getAnimalEmoji(species: string): string {
    const emojis: { [key: string]: string } = {
      'African Elephant': '🐘',
      'African Lion': '🦁',
      'Black Rhinoceros': '🦏',
      'Masai Giraffe': '🦒',
      'African Leopard': '🐆'
    };
    return emojis[species] || '🐾';
  }

  private createAnimalPopup(animal: Animal): string {
    const lastSeenTime = new Date(animal.lastSeen).toLocaleTimeString();
    return `
      <div class="animal-popup">
        <h3>${animal.name}</h3>
        <p><strong>Species:</strong> ${animal.species}</p>
        <p><strong>Status:</strong> ${animal.health}</p>
        <p><strong>Last Seen:</strong> ${lastSeenTime}</p>
        ${animal.speed ? `<p><strong>Speed:</strong> ${animal.speed.toFixed(1)} km/h</p>` : ''}
        ${animal.batteryLevel ? `<p><strong>Collar Battery:</strong> ${animal.batteryLevel.toFixed(0)}%</p>` : ''}
        ${animal.collarId ? `<p><strong>Collar ID:</strong> ${animal.collarId}</p>` : ''}
        <button onclick="this.selectAnimal('${animal.id}')" class="btn-primary">Track Animal</button>
      </div>
    `;
  }

  private addZones(): void {
    if (!this.showZones) return;

    this.zones.forEach(zone => {
      const color = this.getZoneColor(zone.type);
      const polygon = L.polygon(
        zone.boundaries.map(point => [point.latitude, point.longitude] as L.LatLngExpression),
        {
          color: color,
          fillColor: color,
          fillOpacity: 0.2,
          weight: 2
        }
      ).bindPopup(this.createZonePopup(zone));

      polygon.addTo(this.map);
      this.zonePolygons.set(zone.id, polygon);
    });
  }

  private getZoneColor(type: string): string {
    const colors: { [key: string]: string } = {
      'village': '#FF6B6B',
      'protected_area': '#4ECDC4',
      'buffer_zone': '#45B7D1',
      'danger_zone': '#FF4757',
      'wildlife_corridor': '#26D0CE'
    };
    return colors[type] || '#999999';
  }

  private createZonePopup(zone: Zone): string {
    return `
      <div class="zone-popup">
        <h3>${zone.name}</h3>
        <p><strong>Type:</strong> ${zone.type.replace('_', ' ')}</p>
        <p><strong>Risk Level:</strong> ${zone.riskLevel}</p>
        ${zone.population ? `<p><strong>Population:</strong> ${zone.population}</p>` : ''}
        ${zone.description ? `<p><strong>Description:</strong> ${zone.description}</p>` : ''}
        <p><strong>Status:</strong> ${zone.isActive ? 'Active' : 'Inactive'}</p>
      </div>
    `;
  }

  private updateAlertMarkers(): void {
    if (!this.showAlerts) return;

    // Remove existing alert markers
    this.alertMarkers.forEach(marker => this.map.removeLayer(marker));
    this.alertMarkers.clear();

    // Add new alert markers
    this.alerts.forEach(alert => {
      const icon = this.getAlertIcon(alert);
      const marker = L.marker([alert.location.latitude, alert.location.longitude], { icon })
        .bindPopup(this.createAlertPopup(alert));

      marker.addTo(this.map);
      this.alertMarkers.set(alert.id, marker);
    });
  }

  private getAlertIcon(alert: Alert): L.DivIcon {
    const color = this.getAlertColor(alert.priority);
    const symbol = this.getAlertSymbol(alert.type);
    
    const iconHtml = `
      <div class="alert-marker ${alert.priority}" style="border-color: ${color}">
        <span class="alert-symbol">${symbol}</span>
      </div>
    `;

    return L.divIcon({
      html: iconHtml,
      className: 'custom-alert-marker',
      iconSize: [25, 25],
      iconAnchor: [12, 12]
    });
  }

  private getAlertColor(priority: string): string {
    const colors: { [key: string]: string } = {
      'critical': '#DC2626',
      'high': '#EA580C',
      'medium': '#D97706',
      'low': '#65A30D'
    };
    return colors[priority] || '#6B7280';
  }

  private getAlertSymbol(type: string): string {
    const symbols: { [key: string]: string } = {
      'animal_near_village': '⚠️',
      'poacher_detected': '🚨',
      'fence_breach': '🔓',
      'collar_malfunction': '🔧',
      'emergency': '🆘',
      'wildlife_conflict': '⚡'
    };
    return symbols[type] || '❗';
  }

  private createAlertPopup(alert: Alert): string {
    const timeAgo = this.getTimeAgo(alert.timestamp);
    return `
      <div class="alert-popup ${alert.priority}">
        <h3>${alert.title}</h3>
        <p class="alert-message">${alert.message}</p>
        <p><strong>Priority:</strong> <span class="priority-badge ${alert.priority}">${alert.priority.toUpperCase()}</span></p>
        <p><strong>Time:</strong> ${timeAgo}</p>
        <p><strong>Source:</strong> ${alert.source.replace('_', ' ')}</p>
        ${alert.location.name ? `<p><strong>Location:</strong> ${alert.location.name}</p>` : ''}
        <div class="alert-actions">
          <button onclick="this.markAlertAsRead('${alert.id}')" class="btn-secondary">Mark as Read</button>
          <button onclick="this.dismissAlert('${alert.id}')" class="btn-danger">Dismiss</button>
        </div>
      </div>
    `;
  }

  private updateAnimalTracks(tracks: any[]): void {
    if (!this.showTracks) return;

    // Remove existing tracks
    this.animalTracks.forEach(track => this.map.removeLayer(track));
    this.animalTracks.clear();

    // Add new tracks
    tracks.forEach(track => {
      if (track.positions.length > 1) {
        const latLngs = track.positions.map((pos: any) => 
          [pos.latitude, pos.longitude] as L.LatLngExpression
        );

        const animal = this.animals.find(a => a.id === track.animalId);
        const color = animal ? this.getAnimalColor(animal.species) : '#666666';

        const polyline = L.polyline(latLngs, {
          color: color,
          weight: 3,
          opacity: 0.7,
          dashArray: '5, 10'
        });

        polyline.addTo(this.map);
        this.animalTracks.set(track.animalId, polyline);
      }
    });
  }

  private onAnimalMarkerClick(animal: Animal): void {
    this.selectedAnimal = animal;
    // Center map on animal
    this.map.setView([animal.position.latitude, animal.position.longitude], 14);
  }

  getTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minutes ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  }

  // Public methods for template
  toggleTracks(): void {
    this.showTracks = !this.showTracks;
    if (this.showTracks) {
      this.gpsSimulator.getTracks().pipe(takeUntil(this.destroy$)).subscribe(tracks => {
        this.updateAnimalTracks(tracks);
      });
    } else {
      this.animalTracks.forEach(track => this.map.removeLayer(track));
      this.animalTracks.clear();
    }
  }

  toggleZones(): void {
    this.showZones = !this.showZones;
    if (this.showZones) {
      this.addZones();
    } else {
      this.zonePolygons.forEach(polygon => this.map.removeLayer(polygon));
      this.zonePolygons.clear();
    }
  }

  toggleAlerts(): void {
    this.showAlerts = !this.showAlerts;
    if (this.showAlerts) {
      this.updateAlertMarkers();
    } else {
      this.alertMarkers.forEach(marker => this.map.removeLayer(marker));
      this.alertMarkers.clear();
    }
  }

  centerOnAnimal(animalId: string): void {
    const animal = this.animals.find(a => a.id === animalId);
    if (animal) {
      this.map.setView([animal.position.latitude, animal.position.longitude], 15);
      this.selectedAnimal = animal;
    }
  }

  fitAllAnimals(): void {
    if (this.animals.length > 0) {
      const group = new L.FeatureGroup(Array.from(this.animalMarkers.values()));
      this.map.fitBounds(group.getBounds().pad(0.1));
    }
  }
}