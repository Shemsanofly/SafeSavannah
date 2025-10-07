# SafeSavannah 🐘🦁

**Wildlife Monitoring & Anti-Poaching Dashboard**

A comprehensive Angular-based web application for real-time wildlife monitoring, alert management, and anti-poaching operations in wildlife conservation areas.

## 🌟 Features

### 🗺️ **Live Map View**
- Interactive map with real-time animal tracking
- GPS collar data visualization
- Geo-fence monitoring and alerts
- Animal movement patterns and heatmaps

### 🚨 **Alert Dashboard**
- Real-time wildlife monitoring alerts
- Priority-based alert system (Critical, High, Medium, Low)
- Animal sound notifications with realistic audio feedback
- Alert filtering and pagination
- Statistics overview with meaningful metrics

### 📊 **Dashboard Overview**
- Wildlife monitoring statistics
- Alert trends and patterns
- System health monitoring
- Quick action buttons

### 🎯 **Simulation Mode**
- Training and testing environment
- Generate test alerts for system validation
- Educational scenarios for ranger training

## 🎵 **Immersive Audio System**

### Real Animal Sounds
The application supports authentic animal sound files:
- 🐘 **Elephant trumpeting** (`assets/sounds/elephant-trumpet.mp3`)
- 🦏 **Rhino snorting** (`assets/sounds/rhino-snort.mp3`)
- 🦁 **Lion roaring** (`assets/sounds/lion-roar.mp3`)
- 🦓 **Zebra whinnying** (`assets/sounds/zebra-whinny.mp3`)
- 🦒 **Giraffe bleating** (`assets/sounds/giraffe-bleat.mp3`)
- 🐃 **Buffalo grunting** (`assets/sounds/buffalo-grunt.mp3`)
- 🐆 **Leopard growling** (`assets/sounds/leopard-growl.mp3`)
- 🐆 **Cheetah chirping** (`assets/sounds/cheetah-chirp.mp3`)
- 🦛 **Hippo grunting** (`assets/sounds/hippo-grunt.mp3`)
- 🐺 **Hyena laughing** (`assets/sounds/hyena-laugh.mp3`)

### Intelligent Fallback System
- **Primary**: Real audio files (when available)
- **Fallback**: Synthesized animal sounds using Web Audio API
- **Graceful degradation**: Visual-only alerts if audio fails

## 🚀 **Getting Started**

### Prerequisites
- Node.js (v16+)
- npm or yarn
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/SafeSavannah.git
   cd SafeSavannah
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Add animal sound files** (optional for enhanced experience)
   ```bash
   mkdir -p src/assets/sounds
   # Add your animal sound MP3 files to this directory
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   ```
   http://localhost:4200
   ```

## 🛠️ **Technology Stack**

- **Frontend**: Angular 17, TypeScript
- **Styling**: Tailwind CSS with custom conservation theme
- **Maps**: Leaflet.js for interactive mapping
- **Audio**: Web Audio API + HTML5 Audio
- **State Management**: RxJS with BehaviorSubject
- **Build Tools**: Angular CLI, Webpack

## 📁 **Project Structure**

```
SafeSavannah/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── alerts/          # Alert dashboard & management
│   │   │   ├── dashboard/       # Main overview dashboard
│   │   │   ├── map/            # Interactive map component
│   │   │   ├── header/         # Navigation & branding
│   │   │   └── simulation/     # Training & testing mode
│   │   ├── services/
│   │   │   ├── alert.service.ts      # Alert management & generation
│   │   │   └── gps-simulator.service.ts  # Animal tracking simulation
│   │   ├── models/
│   │   │   ├── alert.model.ts   # Alert data structures
│   │   │   ├── animal.model.ts  # Animal tracking models
│   │   │   └── zone.model.ts    # Geographic zone definitions
│   │   └── app.component.ts     # Main application component
│   ├── assets/
│   │   └── sounds/             # Animal sound files (user-provided)
│   └── styles/                 # Global CSS and Tailwind config
├── tailwind.config.js          # Tailwind CSS configuration
├── angular.json               # Angular project configuration
└── package.json              # Project dependencies and scripts
```

## 🎮 **Usage Guide**

### Navigation
- **Dashboard**: Overview of system status and key metrics
- **Map**: Real-time animal tracking and geo-fence monitoring
- **Alerts**: Comprehensive alert management with sound notifications
- **Simulation**: Training mode for testing and education

### Alert Management
1. **View Alerts**: Navigate to the Alerts tab
2. **Filter Alerts**: Use priority, type, and status filters
3. **Test Sounds**: Click animal names in the sound dropdown
4. **Generate Test Data**: Use the "🧪 Test Alert" button
5. **Manage Alerts**: Mark as read, dismiss, or export data

### Sound System Setup
1. Create `src/assets/sounds/` directory
2. Add MP3 files with exact naming convention
3. Test with the "🎵 Animal Sounds" dropdown
4. Fallback synthesis will activate for missing files

## 🔧 **Configuration**

### Environment Setup
The application includes sample wildlife monitoring data and realistic scenarios. For production use:

1. Connect to real GPS collar data APIs
2. Integrate with camera trap systems
3. Configure ranger communication systems
4. Set up SMS/email alert notifications

### Customization
- **Alert Types**: Modify `alert.service.ts` for custom alert categories
- **Sound Mapping**: Update `alerts.component.ts` for new animal types
- **Map Styling**: Customize Leaflet map themes in `map.component.ts`
- **Color Scheme**: Adjust Tailwind config for branding

## 🧪 **Testing**

### Manual Testing
- Use "🧪 Test Alert" to generate sample alerts
- Test sound system with "🎵 Animal Sounds" dropdown
- Verify responsive design on different screen sizes
- Test alert filtering and pagination

### Sample Data
The application includes 6 realistic conservation scenarios:
- Elephant herd near village (high priority)
- Poacher detection (critical)
- GPS collar malfunction (medium)
- Lion pride sighting (medium)
- Fence breach (high priority)
- Human-wildlife conflict (critical)

## 📈 **Performance**

- **Bundle Size**: ~3.9MB (including Leaflet and dependencies)
- **Build Time**: ~20 seconds
- **Hot Reload**: <2 seconds for development changes
- **Audio Latency**: <100ms for sound notifications

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- Wildlife conservation organizations for inspiration
- Angular team for the excellent framework
- Leaflet.js for mapping capabilities
- Tailwind CSS for utility-first styling
- Open-source community for various dependencies

## 📞 **Support**

For questions, issues, or contributions:
- 📧 Email: your-email@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/SafeSavannah/issues)
- 📖 Documentation: [Wiki](https://github.com/yourusername/SafeSavannah/wiki)

---

**SafeSavannah** - Protecting wildlife through technology 🌍🐾