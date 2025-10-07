import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AlertService } from '../../services/alert.service';
import { Alert, AlertStats } from '../../models/alert.model';

@Component({
  selector: 'app-alerts',
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.css']
})
export class AlertsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Make Object available in template
  Object = Object;
  
  alerts: Alert[] = [];
  alertStats: AlertStats = {
    total: 0,
    unread: 0,
    byPriority: { low: 0, medium: 0, high: 0, critical: 0 },
    byType: {},
    todayCount: 0,
    weekCount: 0
  };
  
  filteredAlerts: Alert[] = [];
  selectedPriority: string = 'all';
  selectedType: string = 'all';
  showOnlyUnread = false;
  showOnlyActive = true;

  // Sound settings
  soundEnabled = true;
  currentlyPlayingSound: HTMLAudioElement | null = null;
  showSoundDropdown = false;

  // Track metadata visibility for each alert
  private metadataVisibility: { [alertId: string]: boolean } = {};

  // Animal sound mappings - Real audio files
  animalSounds: { [key: string]: string } = {
    'elephant': 'assets/sounds/elephant-trumpet.mp3',
    'rhino': 'assets/sounds/rhino-snort.mp3',
    'lion': 'assets/sounds/lion-roar.mp3',
    'zebra': 'assets/sounds/zebra-whinny.mp3',
    'giraffe': 'assets/sounds/giraffe-bleat.mp3',
    'buffalo': 'assets/sounds/buffalo-grunt.mp3',
    'leopard': 'assets/sounds/leopard-growl.mp3',
    'cheetah': 'assets/sounds/cheetah-chirp.mp3',
    'hippo': 'assets/sounds/hippo-grunt.mp3',
    'hyena': 'assets/sounds/hyena-laugh.mp3'
  };

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  // Available filters
  priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];

  typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'animal_near_village', label: 'Animal Near Village' },
    { value: 'poacher_detected', label: 'Poacher Detected' },
    { value: 'fence_breach', label: 'Fence Breach' },
    { value: 'collar_malfunction', label: 'Collar Malfunction' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'wildlife_conflict', label: 'Wildlife Conflict' }
  ];

  constructor(private alertService: AlertService) {}

  ngOnInit(): void {
    // Check sound file availability and show setup instructions
    this.checkSoundFilesAvailability();
    this.logSoundSetupInstructions();
    
    // Subscribe to alerts and play sounds for new ones
    let previousAlertCount = 0;
    this.alertService.getAlerts()
      .pipe(takeUntil(this.destroy$))
      .subscribe(alerts => {
        // Play sound for new alerts
        if (alerts.length > previousAlertCount && previousAlertCount > 0) {
          const newAlerts = alerts.slice(previousAlertCount);
          if (newAlerts.length > 0) {
            const latestAlert = newAlerts[0];
            const animalType = this.getAnimalFromAlert(latestAlert);
            setTimeout(() => this.playAnimalSound(animalType), 100);
          }
        }
        
        this.alerts = alerts;
        previousAlertCount = alerts.length;
        console.log('Alerts component received alerts:', alerts.length);
        console.log('Sample alerts:', alerts.slice(0, 2));
        this.applyFilters();
      });

    // Subscribe to alert stats
    this.alertService.getAlertStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe(stats => {
        this.alertStats = stats;
        console.log('Alert stats received:', stats);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  applyFilters(): void {
    let filtered = [...this.alerts];

    // Filter by active status
    if (this.showOnlyActive) {
      filtered = filtered.filter(alert => alert.isActive);
    }

    // Filter by unread status
    if (this.showOnlyUnread) {
      filtered = filtered.filter(alert => !alert.isRead);
    }

    // Filter by priority
    if (this.selectedPriority !== 'all') {
      filtered = filtered.filter(alert => alert.priority === this.selectedPriority);
    }

    // Filter by type
    if (this.selectedType !== 'all') {
      filtered = filtered.filter(alert => alert.type === this.selectedType);
    }

    this.filteredAlerts = filtered;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredAlerts.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }

  get paginatedAlerts(): Alert[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredAlerts.slice(startIndex, endIndex);
  }

  get paginationInfo(): string {
    if (this.filteredAlerts.length === 0) return 'No alerts to display';
    
    const startIndex = (this.currentPage - 1) * this.itemsPerPage + 1;
    const endIndex = Math.min(this.currentPage * this.itemsPerPage, this.filteredAlerts.length);
    return `Showing ${startIndex}-${endIndex} of ${this.filteredAlerts.length} alerts`;
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  markAsRead(alert: Alert): void {
    if (!alert.isRead) {
      this.alertService.markAsRead(alert.id);
    }
  }

  dismissAlert(alert: Alert): void {
    this.alertService.dismissAlert(alert.id);
  }

  markAllAsRead(): void {
    this.alertService.markAllAsRead();
  }

  clearFilters(): void {
    this.selectedPriority = 'all';
    this.selectedType = 'all';
    this.showOnlyUnread = false;
    this.showOnlyActive = true;
    this.currentPage = 1;
    this.applyFilters();
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-green-500 bg-green-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  }

  getPriorityTextClass(priority: string): string {
    switch (priority) {
      case 'critical': return 'text-red-800';
      case 'high': return 'text-orange-800';
      case 'medium': return 'text-yellow-800';
      case 'low': return 'text-green-800';
      default: return 'text-gray-800';
    }
  }

  getPriorityBadgeClass(priority: string): string {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getTypeDisplayName(type: string): string {
    const typeMap: { [key: string]: string } = {
      'animal_near_village': 'Animal Near Village',
      'poacher_detected': 'Poacher Detected',
      'fence_breach': 'Fence Breach',
      'collar_malfunction': 'Collar Malfunction',
      'emergency': 'Emergency',
      'wildlife_conflict': 'Wildlife Conflict'
    };
    return typeMap[type] || type.replace('_', ' ');
  }

  getSourceDisplayName(source: string): string {
    const sourceMap: { [key: string]: string } = {
      'gps_collar': 'GPS Collar',
      'camera_trap': 'Camera Trap',
      'ranger_report': 'Ranger Report',
      'villager_report': 'Villager Report',
      'sensor': 'Sensor',
      'system': 'System'
    };
    return sourceMap[source] || source.replace('_', ' ');
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

  playAlertSound(): void {
    try {
      const audio = new Audio('assets/sounds/general-alert.mp3');
      audio.volume = 0.3;
      audio.play().catch(err => console.warn('Could not play alert sound:', err));
    } catch (err) {
      console.warn('Alert sound not available:', err);
    }
  }

  // Enhanced animal sound functionality
  playAnimalSound(animalType: string): void {
    if (!this.soundEnabled) return;

    // Stop any currently playing sound
    this.stopCurrentSound();

    try {
      const audioSrc = this.animalSounds[animalType.toLowerCase()];

      // Fallback to synthesized sounds using Web Audio API if no file path
      if (!audioSrc) {
        console.log(`No sound file for ${animalType}, using synthesized sound`);
        this.synthesizeAnimalSound(animalType);
        return;
      }

      const audio = new Audio(audioSrc);
      audio.volume = 0.4;
      this.currentlyPlayingSound = audio;

      audio.play().then(() => {
        console.log(`🎵 Playing REAL animal sound for ${animalType}: ${audioSrc}`);
      }).catch((error) => {
        console.log(`📁 Real sound file not found for ${animalType} at ${audioSrc}`);
        console.log(`🎛️ Falling back to synthesized sound for ${animalType}`);
        // Fallback to synthesized sound if file doesn't exist or can't be played
        this.synthesizeAnimalSound(animalType);
      });

      // Clear reference when sound ends
      audio.addEventListener('ended', () => {
        this.currentlyPlayingSound = null;
      });

    } catch (err) {
      console.warn('Could not play animal sound:', err);
      this.synthesizeAnimalSound(animalType);
    }
  }

  // Synthesize animal sounds using Web Audio API
  synthesizeAnimalSound(animalType: string): void {
    if (!this.soundEnabled) return;

    console.log(`🎛️ Synthesizing sound for ${animalType} (real file not available)`);

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Different frequency patterns for different animals
      const soundPatterns: { [key: string]: { freq: number; duration: number; type: OscillatorType } } = {
        'elephant': { freq: 85, duration: 2000, type: 'sine' },
        'lion': { freq: 220, duration: 1500, type: 'sawtooth' },
        'rhino': { freq: 120, duration: 800, type: 'square' },
        'zebra': { freq: 440, duration: 600, type: 'triangle' },
        'giraffe': { freq: 330, duration: 400, type: 'sine' },
        'buffalo': { freq: 180, duration: 700, type: 'square' },
        'leopard': { freq: 200, duration: 1000, type: 'sawtooth' },
        'cheetah': { freq: 350, duration: 300, type: 'triangle' },
        'hippo': { freq: 100, duration: 1200, type: 'sine' },
        'hyena': { freq: 300, duration: 800, type: 'sawtooth' }
      };

      const pattern = soundPatterns[animalType.toLowerCase()] || soundPatterns['elephant'];

      oscillator.frequency.setValueAtTime(pattern.freq, audioContext.currentTime);
      oscillator.type = pattern.type;

      // Create envelope for more natural sound
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + pattern.duration / 1000);

      // Add vibrato for some animals
      if (['lion', 'elephant', 'buffalo'].includes(animalType.toLowerCase())) {
        const lfo = audioContext.createOscillator();
        const lfoGain = audioContext.createGain();
        lfo.frequency.setValueAtTime(5, audioContext.currentTime);
        lfoGain.gain.setValueAtTime(10, audioContext.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(oscillator.frequency);
        lfo.start();
        lfo.stop(audioContext.currentTime + pattern.duration / 1000);
      }

      oscillator.start();
      oscillator.stop(audioContext.currentTime + pattern.duration / 1000);

    } catch (err) {
      console.warn('Could not synthesize animal sound:', err);
    }
  }

  // Extract animal type from alert message or metadata
  getAnimalFromAlert(alert: Alert): string {
    // Check metadata first
    if (alert.metadata && alert.metadata['animalType']) {
      return alert.metadata['animalType'];
    }

    // Extract from message or title
    const text = (alert.message + ' ' + alert.title).toLowerCase();
    
    for (const animal of Object.keys(this.animalSounds)) {
      if (text.includes(animal)) {
        return animal;
      }
    }

    // Default fallback
    return 'elephant';
  }

  stopCurrentSound(): void {
    if (this.currentlyPlayingSound) {
      this.currentlyPlayingSound.pause();
      this.currentlyPlayingSound = null;
    }
  }

  toggleSound(): void {
    this.soundEnabled = !this.soundEnabled;
    if (!this.soundEnabled) {
      this.stopCurrentSound();
    }
  }

  // Test all animal sounds (for demonstration)
  testAllAnimalSounds(): void {
    if (!this.soundEnabled) return;

    const animals = Object.keys(this.animalSounds);
    let index = 0;

    const playNext = () => {
      if (index < animals.length) {
        console.log(`Playing sound for: ${animals[index]}`);
        this.playAnimalSound(animals[index]);
        index++;
        setTimeout(playNext, 2500); // Wait 2.5 seconds between sounds
      }
    };

    playNext();
  }

  // Check if real animal sound files are available
  async checkSoundFilesAvailability(): Promise<void> {
    const availableFiles: string[] = [];
    const missingFiles: string[] = [];

    for (const [animal, filePath] of Object.entries(this.animalSounds)) {
      try {
        const audio = new Audio(filePath);
        await new Promise((resolve, reject) => {
          audio.addEventListener('canplaythrough', () => resolve(true));
          audio.addEventListener('error', () => reject(false));
          audio.load();
        });
        availableFiles.push(animal);
      } catch {
        missingFiles.push(animal);
      }
    }

    if (missingFiles.length > 0) {
      console.log(`Real sound files missing for: ${missingFiles.join(', ')}`);
      console.log('Using synthesized sounds as fallback for missing files');
    }
    
    if (availableFiles.length > 0) {
      console.log(`Real sound files available for: ${availableFiles.join(', ')}`);
    }
  }

  // Get sound file status for UI display
  getSoundFileStatus(animal: string): 'real' | 'synthesized' {
    // This would be enhanced with actual file checking in production
    // For now, we assume synthesized since we don't have real files yet
    return 'synthesized';
  }

  // Helper method for conservation teams to understand sound file setup
  logSoundSetupInstructions(): void {
    console.log('🦁 SafeSavannah Animal Sound Setup Instructions:');
    console.log('📁 Place real animal sound files in: /src/assets/sounds/');
    console.log('📋 Required files:');
    for (const [animal, filePath] of Object.entries(this.animalSounds)) {
      console.log(`   • ${filePath} (for ${animal} alerts)`);
    }
    console.log('🎵 File format: MP3, 128kbps+, 2-5 seconds duration');
    console.log('🌍 Sources: Freesound.org, Zapsplat.com, BBC Sound Library');
    console.log('🔄 Synthesized sounds used as fallback until real files added');
  }

  // Missing method: Generate test alert
  generateTestAlert(): void {
    const animalTypes = ['elephant', 'lion', 'rhino', 'zebra', 'giraffe'];
    const randomAnimal = animalTypes[Math.floor(Math.random() * animalTypes.length)];
    
    // Create a new alert to actually display in the dashboard
    const testAlert = {
      id: `test-${Date.now()}`,
      type: 'animal_near_village' as const,
      priority: 'high' as const,
      title: `${randomAnimal.charAt(0).toUpperCase() + randomAnimal.slice(1)} Alert - Test`,
      message: `Test alert: A ${randomAnimal} has been detected near a village. This is a simulation alert for testing purposes.`,
      timestamp: new Date(),
      location: { 
        latitude: -1.2890 + (Math.random() - 0.5) * 0.01, 
        longitude: 36.8210 + (Math.random() - 0.5) * 0.01, 
        name: 'Test Village' 
      },
      isRead: false,
      isActive: true,
      source: 'gps_collar' as const,
      metadata: { 
        animalType: randomAnimal,
        testAlert: true 
      }
    };

    // Add to local alerts array
    this.alerts.unshift(testAlert);
    this.applyFilters();
    
    if (this.soundEnabled) {
      this.playAnimalSound(randomAnimal);
    }
    console.log(`Generated test alert for ${randomAnimal}`, testAlert);
  }

  // Missing method: Track alert for ngFor
  trackAlert(index: number, alert: Alert): string {
    return alert.id;
  }

  // Missing method: Get formatted source
  getFormattedSource(source: string): string {
    const sourceMap: { [key: string]: string } = {
      'gps_collar': 'GPS Collar',
      'camera_trap': 'Camera Trap',
      'ranger_report': 'Ranger Report',
      'villager_report': 'Villager Report',
      'sensor': 'Sensor',
      'system': 'System'
    };
    return sourceMap[source] || source.replace('_', ' ');
  }

  // Missing method: Resolve alert
  resolveAlert(alertId: string): void {
    // Update alert status locally since service method doesn't exist yet
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.isActive = false;
      this.applyFilters();
    }
  }

  // Missing method: Delete alert  
  deleteAlert(alertId: string): void {
    // Remove alert locally since service method doesn't exist yet
    this.alerts = this.alerts.filter(a => a.id !== alertId);
    this.applyFilters();
  }

  // Missing method: Get page numbers for pagination
  getPageNumbers(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Handle metadata visibility
  toggleMetadata(alert: Alert): void {
    this.metadataVisibility[alert.id] = !this.metadataVisibility[alert.id];
  }

  getMetadataVisible(alert: Alert): boolean {
    return !!this.metadataVisibility[alert.id];
  }

  // Refresh alerts from service
  refreshAlerts(): void {
    console.log('Refreshing alerts and statistics...');
    this.alertService.getAlerts().subscribe(alerts => {
      console.log('Refreshed alerts received:', alerts.length);
      this.alerts = alerts;
      this.applyFilters();
    });
    
    this.alertService.getAlertStats().subscribe(stats => {
      console.log('Refreshed stats received:', stats);
      this.alertStats = stats;
    });
  }

  getAlertIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'animal_near_village': '🐘',
      'poacher_detected': '🚨',
      'fence_breach': '🔓',
      'collar_malfunction': '🔧',
      'emergency': '🆘',
      'wildlife_conflict': '⚡'
    };
    return icons[type] || '❗';
  }

  exportAlerts(): void {
    const dataStr = JSON.stringify(this.filteredAlerts, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `alerts-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    window.URL.revokeObjectURL(url);
  }

  trackByAlertId(index: number, alert: Alert): string {
    return alert.id;
  }
}