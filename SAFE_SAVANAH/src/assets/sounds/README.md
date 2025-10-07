# Animal Sound Files for SafeSavannah

This directory should contain real animal sound files for the SafeSavannah wildlife monitoring application.

## 🎵 Required Sound Files:

Place the following MP3 files in this directory for authentic animal sounds:

- `elephant-trumpet.mp3` - Elephant trumpeting sound
- `rhino-snort.mp3` - Rhinoceros snorting/breathing sound
- `lion-roar.mp3` - Lion roaring sound
- `zebra-whinny.mp3` - Zebra whinnying sound
- `giraffe-bleat.mp3` - Giraffe bleating sound
- `buffalo-grunt.mp3` - Buffalo grunting sound
- `leopard-growl.mp3` - Leopard growling sound
- `cheetah-chirp.mp3` - Cheetah chirping sound
- `hippo-grunt.mp3` - Hippo grunting sound
- `hyena-laugh.mp3` - Hyena laughing sound
- `general-alert.mp3` - General system alert sound

## 🌍 Recommended Sound Sources:

### Free Wildlife Sound Libraries:
1. **Freesound.org** (Creative Commons licensed)
   - Search for "elephant trumpet", "lion roar", etc.
   - Filter by CC0 or CC-BY licenses
   - Download high-quality WAV/MP3 files

2. **Zapsplat.com** (Free with registration)
   - Professional animal sound effects
   - High-quality recordings
   - Easy download and licensing

3. **BBC Sound Effects Library**
   - Professional wildlife recordings
   - Available for educational/non-commercial use
   - Excellent quality and authenticity

### Conservation Organizations:
- **African Wildlife Foundation** - Audio resources
- **WWF** - Wildlife sound archives
- **Wildlife Conservation Society** - Field recordings
- **National Geographic** - Animal sound collections

### Academic Sources:
- **Macaulay Library** (Cornell Lab)
- **Animal Sound Archive** (Museum für Naturkunde Berlin)
- **Fonoteca Zoológica** (Museo Nacional de Ciencias Naturales)

## 🔧 Technical Requirements:

- **Format**: MP3, 128kbps or higher
- **Duration**: 2-5 seconds (optimal for alerts)
- **Volume**: Normalized to prevent volume variations
- **Quality**: Clear, minimal background noise
- **File size**: Keep under 500KB per file for fast loading

## 🎛️ Fallback System:

**Current Status**: The application uses Web Audio API to synthesize animal sounds when real files are not available.

**Benefits of Real Sounds**:
- ✅ More authentic wildlife monitoring experience
- ✅ Better recognition by conservation teams
- ✅ Improved training effectiveness
- ✅ Enhanced user engagement

**Synthesized Sound Features**:
- 🔄 Automatic fallback when files missing
- 🎵 Unique frequency patterns per animal
- 🎚️ Consistent volume levels
- ⚡ No file loading delays

## 🚀 Quick Setup:

1. Download animal sounds from recommended sources
2. Convert to MP3 format if needed
3. Rename files to match required filenames exactly
4. Place in this `/src/assets/sounds/` directory
5. Restart the application to detect new files

## 🦁 Sound Usage in Application:

- **Automatic Alerts**: Plays when new wildlife alerts arrive
- **Manual Testing**: Use dropdown menu in alerts panel
- **Animal Recognition**: Different sound for each animal type
- **Training Mode**: Test all sounds for team familiarization

The enhanced audio experience helps rangers and villagers quickly identify wildlife encounters and respond appropriately to conservation alerts!