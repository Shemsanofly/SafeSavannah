import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GpsSimulatorService } from '../../services/gps-simulator.service';
import { AlertService } from '../../services/alert.service';
import { Animal } from '../../models/animal.model';

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  events: SimulationEvent[];
}

export interface SimulationEvent {
  id: string;
  type: 'animal_movement' | 'alert_trigger' | 'battery_drain' | 'health_change';
  triggerTime: number; // minutes from start
  description: string;
  parameters: any;
}

@Component({
  selector: 'app-simulation',
  templateUrl: './simulation.component.html',
  styleUrls: ['./simulation.component.css']
})
export class SimulationComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  isSimulationRunning = false;
  currentScenario: SimulationScenario | null = null;
  simulationStartTime: Date | null = null;
  elapsedTime = 0;
  
  scenarios: SimulationScenario[] = [
    {
      id: 'training_basic',
      name: 'Basic Training Scenario',
      description: 'Introduction to the system with normal animal movements and occasional alerts',
      duration: 15,
      events: [
        {
          id: 'e1',
          type: 'animal_movement',
          triggerTime: 2,
          description: 'Elephant herd moves towards village boundary',
          parameters: { animalId: 'elephant-001', moveToward: 'village-001' }
        },
        {
          id: 'e2',
          type: 'alert_trigger',
          triggerTime: 5,
          description: 'Low battery alert for rhino collar',
          parameters: { animalId: 'rhino-001', batteryLevel: 15 }
        }
      ]
    },
    {
      id: 'emergency_drill',
      name: 'Emergency Response Drill',
      description: 'High-stress scenario with multiple critical alerts and poaching activity',
      duration: 30,
      events: [
        {
          id: 'e3',
          type: 'alert_trigger',
          triggerTime: 3,
          description: 'Suspected poacher activity detected',
          parameters: { type: 'poacher_detected', location: 'protected-001' }
        },
        {
          id: 'e4',
          type: 'animal_movement',
          triggerTime: 5,
          description: 'Multiple animals flee from poacher area',
          parameters: { behavior: 'flee_response' }
        },
        {
          id: 'e5',
          type: 'alert_trigger',
          triggerTime: 8,
          description: 'Critical alert: Animal in distress',
          parameters: { animalId: 'leopard-001', healthStatus: 'injured' }
        }
      ]
    },
    {
      id: 'wildlife_conflict',
      name: 'Human-Wildlife Conflict Scenario',
      description: 'Animals approaching villages, crop damage, and community response',
      duration: 20,
      events: [
        {
          id: 'e6',
          type: 'animal_movement',
          triggerTime: 1,
          description: 'Elephant herd approaches Village A',
          parameters: { animalId: 'elephant-001', target: 'village-001' }
        },
        {
          id: 'e7',
          type: 'alert_trigger',
          triggerTime: 4,
          description: 'Villagers report crop damage',
          parameters: { type: 'wildlife_conflict', location: 'village-001' }
        }
      ]
    },
    {
      id: 'night_patrol',
      name: 'Night Patrol Training',
      description: 'Nighttime monitoring with reduced visibility and increased poaching risk',
      duration: 25,
      events: [
        {
          id: 'e8',
          type: 'alert_trigger',
          triggerTime: 5,
          description: 'Motion sensors detect suspicious activity',
          parameters: { type: 'suspicious_activity', time: 'night' }
        },
        {
          id: 'e9',
          type: 'battery_drain',
          triggerTime: 10,
          description: 'Multiple collar batteries drain faster due to cold weather',
          parameters: { drainRate: 'accelerated' }
        }
      ]
    }
  ];

  animals: Animal[] = [];
  simulationSpeed = 1; // 1x normal speed
  speedOptions = [
    { value: 0.5, label: '0.5x (Slow)' },
    { value: 1, label: '1x (Normal)' },
    { value: 2, label: '2x (Fast)' },
    { value: 5, label: '5x (Very Fast)' }
  ];

  constructor(
    private gpsSimulator: GpsSimulatorService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.isSimulationRunning = this.gpsSimulator.isRunning();
    
    // Subscribe to animals
    this.gpsSimulator.getAnimals()
      .pipe(takeUntil(this.destroy$))
      .subscribe(animals => {
        this.animals = animals;
      });

    // Update elapsed time if simulation is running
    if (this.isSimulationRunning && this.simulationStartTime) {
      setInterval(() => {
        this.updateElapsedTime();
      }, 1000);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  startScenario(scenario: SimulationScenario): void {
    this.currentScenario = scenario;
    this.simulationStartTime = new Date();
    this.elapsedTime = 0;
    
    // Start the GPS simulator
    this.gpsSimulator.startSimulation();
    this.alertService.startMonitoring();
    this.isSimulationRunning = true;

    // Schedule scenario events
    this.scheduleScenarioEvents(scenario);
  }

  stopSimulation(): void {
    this.gpsSimulator.stopSimulation();
    this.alertService.stopMonitoring();
    this.isSimulationRunning = false;
    this.currentScenario = null;
    this.simulationStartTime = null;
    this.elapsedTime = 0;
  }

  pauseSimulation(): void {
    // In a real implementation, this would pause the simulation
    console.log('Pause simulation functionality would be implemented here');
  }

  resetSimulation(): void {
    this.stopSimulation();
    // Reset all animals to initial positions
    // In a real implementation, this would reset the entire state
  }

  addCustomAnimal(): void {
    const customAnimal = {
      name: `Custom Animal ${this.animals.length + 1}`,
      species: 'Test Species',
      position: {
        latitude: -1.2921 + (Math.random() - 0.5) * 0.01,
        longitude: 36.8219 + (Math.random() - 0.5) * 0.01
      },
      health: 'healthy' as const,
      batteryLevel: Math.random() * 100,
      conservationStatus: 'stable' as const
    };

    this.gpsSimulator.addCustomAnimal(customAnimal);
  }

  changeSimulationSpeed(speed: number): void {
    this.simulationSpeed = speed;
    // In a real implementation, this would adjust the simulation update intervals
    console.log(`Simulation speed changed to ${speed}x`);
  }

  triggerManualAlert(type: string): void {
    // Trigger a manual alert for testing
    const alertTypes = ['poacher_detected', 'fence_breach', 'emergency', 'wildlife_conflict'];
    const randomType = alertTypes.includes(type) ? type : alertTypes[Math.floor(Math.random() * alertTypes.length)];
    
    console.log(`Manual alert triggered: ${randomType}`);
    // In the real implementation, this would create an alert through the AlertService
  }

  private scheduleScenarioEvents(scenario: SimulationScenario): void {
    scenario.events.forEach(event => {
      const delay = (event.triggerTime * 60 * 1000) / this.simulationSpeed; // Convert to milliseconds and adjust for speed
      
      setTimeout(() => {
        this.executeScenarioEvent(event);
      }, delay);
    });
  }

  private executeScenarioEvent(event: SimulationEvent): void {
    console.log(`Executing scenario event: ${event.description}`);
    
    switch (event.type) {
      case 'animal_movement':
        // Trigger specific animal movement
        break;
      case 'alert_trigger':
        // Trigger specific alert
        break;
      case 'battery_drain':
        // Simulate battery drain
        break;
      case 'health_change':
        // Change animal health status
        break;
    }
  }

  private updateElapsedTime(): void {
    if (this.simulationStartTime) {
      this.elapsedTime = Math.floor((Date.now() - this.simulationStartTime.getTime()) / 1000);
    }
  }

  getElapsedTimeFormatted(): string {
    const minutes = Math.floor(this.elapsedTime / 60);
    const seconds = this.elapsedTime % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  getScenarioProgress(): number {
    if (!this.currentScenario || !this.simulationStartTime) return 0;
    
    const elapsedMinutes = this.elapsedTime / 60;
    const progress = (elapsedMinutes / this.currentScenario.duration) * 100;
    return Math.min(progress, 100);
  }

  getNextEvent(): SimulationEvent | null {
    if (!this.currentScenario) return null;
    
    const elapsedMinutes = this.elapsedTime / 60;
    return this.currentScenario.events.find(event => 
      event.triggerTime > elapsedMinutes
    ) || null;
  }
}