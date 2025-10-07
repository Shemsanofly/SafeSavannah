import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { Animal, AnimalTrack } from '../models/animal.model';
import { Zone } from '../models/zone.model';

@Injectable({
  providedIn: 'root'
})
export class GpsSimulatorService {
  private animalsSubject = new BehaviorSubject<Animal[]>([]);
  private tracksSubject = new BehaviorSubject<AnimalTrack[]>([]);
  private isSimulationRunning = false;
  private simulationInterval: any;

  // Sample data for simulation
  private sampleAnimals: Animal[] = [
    {
      id: 'elephant-001',
      name: 'Tembo',
      species: 'African Elephant',
      position: { latitude: -1.2921, longitude: 36.8219 }, // Near Nairobi
      lastSeen: new Date(),
      collarId: 'COL-001',
      isActive: true,
      batteryLevel: 85,
      speed: 5.2,
      heading: 180,
      health: 'healthy',
      age: 25,
      gender: 'male',
      conservationStatus: 'endangered'
    },
    {
      id: 'lion-001',
      name: 'Simba',
      species: 'African Lion',
      position: { latitude: -1.2845, longitude: 36.8156 },
      lastSeen: new Date(),
      collarId: 'COL-002',
      isActive: true,
      batteryLevel: 72,
      speed: 8.5,
      heading: 45,
      health: 'healthy',
      age: 8,
      gender: 'male',
      conservationStatus: 'vulnerable'
    },
    {
      id: 'rhino-001',
      name: 'Kifaru',
      species: 'Black Rhinoceros',
      position: { latitude: -1.2756, longitude: 36.8089 },
      lastSeen: new Date(),
      collarId: 'COL-003',
      isActive: true,
      batteryLevel: 91,
      speed: 3.1,
      heading: 270,
      health: 'healthy',
      age: 15,
      gender: 'female',
      conservationStatus: 'endangered'
    },
    {
      id: 'giraffe-001',
      name: 'Twiga',
      species: 'Masai Giraffe',
      position: { latitude: -1.2689, longitude: 36.8203 },
      lastSeen: new Date(),
      collarId: 'COL-004',
      isActive: true,
      batteryLevel: 68,
      speed: 12.3,
      heading: 90,
      health: 'healthy',
      age: 12,
      gender: 'female',
      conservationStatus: 'vulnerable'
    },
    {
      id: 'leopard-001',
      name: 'Chui',
      species: 'African Leopard',
      position: { latitude: -1.2634, longitude: 36.8267 },
      lastSeen: new Date(),
      collarId: 'COL-005',
      isActive: true,
      batteryLevel: 45,
      speed: 15.7,
      heading: 135,
      health: 'healthy',
      age: 6,
      gender: 'female',
      conservationStatus: 'vulnerable'
    }
  ];

  private tracks: AnimalTrack[] = [];

  constructor() {
    this.initializeTracks();
  }

  private initializeTracks(): void {
    this.tracks = this.sampleAnimals.map(animal => ({
      animalId: animal.id,
      positions: [{
        latitude: animal.position.latitude,
        longitude: animal.position.longitude,
        timestamp: new Date(),
        accuracy: Math.random() * 10 + 5 // 5-15 meter accuracy
      }]
    }));
    this.tracksSubject.next([...this.tracks]);
  }

  getAnimals(): Observable<Animal[]> {
    return this.animalsSubject.asObservable();
  }

  getTracks(): Observable<AnimalTrack[]> {
    return this.tracksSubject.asObservable();
  }

  startSimulation(): void {
    if (this.isSimulationRunning) return;

    this.isSimulationRunning = true;
    this.animalsSubject.next([...this.sampleAnimals]);

    // Update positions every 30 seconds
    this.simulationInterval = interval(30000).subscribe(() => {
      this.updateAnimalPositions();
    });
  }

  stopSimulation(): void {
    if (!this.isSimulationRunning) return;

    this.isSimulationRunning = false;
    if (this.simulationInterval) {
      this.simulationInterval.unsubscribe();
    }
  }

  isRunning(): boolean {
    return this.isSimulationRunning;
  }

  private updateAnimalPositions(): void {
    this.sampleAnimals.forEach(animal => {
      // Simulate movement within a reasonable range
      const maxMovement = 0.001; // Roughly 100 meters
      const latChange = (Math.random() - 0.5) * maxMovement;
      const lngChange = (Math.random() - 0.5) * maxMovement;

      animal.position.latitude += latChange;
      animal.position.longitude += lngChange;
      animal.lastSeen = new Date();

      // Update speed and heading
      animal.speed = Math.random() * 20 + 1; // 1-21 km/h
      animal.heading = Math.random() * 360;

      // Simulate battery drain
      if (animal.batteryLevel && animal.batteryLevel > 0) {
        animal.batteryLevel = Math.max(0, animal.batteryLevel - Math.random() * 2);
      }

      // Add to track
      const track = this.tracks.find(t => t.animalId === animal.id);
      if (track) {
        track.positions.push({
          latitude: animal.position.latitude,
          longitude: animal.position.longitude,
          timestamp: new Date(),
          accuracy: Math.random() * 10 + 5
        });

        // Keep only last 100 positions
        if (track.positions.length > 100) {
          track.positions = track.positions.slice(-100);
        }
      }
    });

    this.animalsSubject.next([...this.sampleAnimals]);
    this.tracksSubject.next([...this.tracks]);
  }

  getAnimalById(id: string): Animal | undefined {
    return this.sampleAnimals.find(animal => animal.id === id);
  }

  getTrackById(animalId: string): AnimalTrack | undefined {
    return this.tracks.find(track => track.animalId === animalId);
  }

  // Method to check if animal is near a zone
  isAnimalNearZone(animal: Animal, zone: Zone, radiusKm: number = 1): boolean {
    // Simple distance calculation (not accounting for Earth's curvature)
    const centerLat = zone.boundaries.reduce((sum, point) => sum + point.latitude, 0) / zone.boundaries.length;
    const centerLng = zone.boundaries.reduce((sum, point) => sum + point.longitude, 0) / zone.boundaries.length;

    const distance = this.calculateDistance(
      animal.position.latitude,
      animal.position.longitude,
      centerLat,
      centerLng
    );

    return distance <= radiusKm;
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Add custom animal for testing
  addCustomAnimal(animal: Partial<Animal>): void {
    const newAnimal: Animal = {
      id: animal.id || `custom-${Date.now()}`,
      name: animal.name || 'Unknown',
      species: animal.species || 'Unknown Species',
      position: animal.position || { latitude: -1.2921, longitude: 36.8219 },
      lastSeen: new Date(),
      collarId: animal.collarId,
      isActive: animal.isActive ?? true,
      batteryLevel: animal.batteryLevel ?? 100,
      speed: animal.speed ?? 0,
      heading: animal.heading ?? 0,
      health: animal.health || 'unknown',
      age: animal.age,
      gender: animal.gender || 'unknown',
      conservationStatus: animal.conservationStatus || 'unknown'
    };

    this.sampleAnimals.push(newAnimal);
    
    // Add initial track
    this.tracks.push({
      animalId: newAnimal.id,
      positions: [{
        latitude: newAnimal.position.latitude,
        longitude: newAnimal.position.longitude,
        timestamp: new Date(),
        accuracy: Math.random() * 10 + 5
      }]
    });

    this.animalsSubject.next([...this.sampleAnimals]);
    this.tracksSubject.next([...this.tracks]);
  }
}