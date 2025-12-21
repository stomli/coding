# AudioManager Module Documentation

## Overview
Web Audio API-based sound generation and management system for programmatic game audio.

## Responsibility
- Generate procedural sound effects using Web Audio API
- Manage background music loops
- Control volume levels independently for SFX and music
- Optimize performance by skipping audio processing when volume is 0
- Handle audio context initialization and browser restrictions

## Architecture
**Pattern:** Singleton  
**Export:** Pre-instantiated singleton instance

## Dependencies
- ConfigManager
- Constants

## Public API

### Methods

#### initialize()
```javascript
initialize() → void
```
Initializes the audio system with Web Audio API context and configures audio nodes.

**Side Effects:**
- Creates AudioContext (or webkitAudioContext for Safari)
- Sets up gain nodes for SFX and music
- Loads volume settings from ConfigManager
- Prepares audio node chains

**Browser Compatibility:**
- Requires user interaction before playing audio (browser security)
- Automatically resumes context on first user action

---

#### playSound(type, options)
```javascript
playSound(type, options) → void
```
Plays a procedurally generated sound effect.

**Parameters:**
- `type` (String): Sound effect type from Constants.SOUNDS
  - `ROTATE`, `MOVE`, `DROP`, `LOCK`, `MATCH`, `EXPLOSION`, `PAINT`, `LEVEL_COMPLETE`, `GAME_OVER`
- `options` (Object, optional): Sound customization
  - `pitch` (Number): Frequency multiplier for cascade levels
  - `volume` (Number): Override default volume (0-1)

**Returns:** void

**Side Effects:**
- Creates oscillator and gain nodes
- Schedules sound playback
- Skips processing if SFX volume is 0

**Example:**
```javascript
// Basic sound
AudioManager.playSound(Constants.SOUNDS.ROTATE);

// Match with cascade pitch scaling
AudioManager.playSound(Constants.SOUNDS.MATCH, { pitch: cascadeLevel });

// Explosion with custom volume
AudioManager.playSound(Constants.SOUNDS.EXPLOSION, { volume: 0.8 });
```

---

#### startMusic()
```javascript
startMusic() → void
```
Starts the procedurally generated background music loop.

**Side Effects:**
- Creates oscillator nodes for ambient music
- Sets up looping buffer
- Adjusts tempo based on difficulty level
- Skips if music volume is 0

**Music Characteristics:**
- Procedurally generated ambient tones
- Tempo increases with difficulty (1.0x - 3.0x)
- Seamless looping

---

#### stopMusic()
```javascript
stopMusic() → void
```
Stops the background music playback.

**Side Effects:**
- Disconnects music oscillators
- Clears music node references

---

#### setSFXVolume(volume)
```javascript
setSFXVolume(volume) → void
```
Sets the sound effects volume level.

**Parameters:**
- `volume` (Number): Volume level 0-100

**Side Effects:**
- Updates SFX gain node (0.0 - 1.0 range)
- Triggers optimization when volume is 0
- Persists to ConfigManager

---

#### setMusicVolume(volume)
```javascript
setMusicVolume(volume) → void
```
Sets the background music volume level.

**Parameters:**
- `volume` (Number): Volume level 0-100

**Side Effects:**
- Updates music gain node (0.0 - 1.0 range)
- Triggers optimization when volume is 0
- Persists to ConfigManager

---

#### toggleMute()
```javascript
toggleMute() → Boolean
```
Toggles master mute on/off.

**Returns:** New mute state (true = muted)

**Side Effects:**
- Sets both SFX and music volumes to 0 when muted
- Restores previous volumes when unmuted
- Updates UI state

---

#### canPlaySound()
```javascript
canPlaySound() → Boolean
```
Checks if sound effects can be played.

**Returns:** true if SFX volume > 0 and audio system initialized

**Performance Optimization:**
Used internally to skip all audio node creation when volume is 0.

---

#### canPlayMusic()
```javascript
canPlayMusic() → Boolean
```
Checks if music can be played.

**Returns:** true if music volume > 0 and audio system initialized

**Performance Optimization:**
Used internally to skip music processing when volume is 0.

---

## Sound Effect Characteristics

### ROTATE
- **Type:** Beep
- **Frequency:** 440Hz
- **Duration:** 50ms
- **Character:** Subtle click

### MOVE
- **Type:** Click
- **Frequency:** 330Hz
- **Duration:** 30ms
- **Character:** Quick tap

### DROP
- **Type:** Thud
- **Frequency:** 110Hz (low)
- **Duration:** 100ms
- **Character:** Deep impact

### LOCK
- **Type:** Clunk
- **Frequency:** 220Hz
- **Duration:** 80ms
- **Character:** Mechanical lock

### MATCH
- **Type:** Chime
- **Frequency:** 523Hz × pitch multiplier
- **Duration:** 150ms
- **Character:** Escalating pitch per cascade level

### EXPLOSION
- **Type:** Boom
- **Frequency:** 55Hz (bass)
- **Duration:** 300ms
- **Character:** Deep explosion with decay

### PAINT
- **Type:** Whoosh
- **Frequency:** Sweep 440Hz → 880Hz
- **Duration:** 200ms
- **Character:** Rising sweep

### LEVEL_COMPLETE
- **Type:** Victory chime
- **Frequency:** Chord (523Hz, 659Hz, 784Hz)
- **Duration:** 500ms
- **Character:** Major chord progression

### GAME_OVER
- **Type:** Descending tone
- **Frequency:** 440Hz → 220Hz
- **Duration:** 800ms
- **Character:** Sad descending slide

---

## Implementation Notes

### Performance Optimization
```javascript
if (!this.canPlaySound()) return; // Skip all processing
```
When volume is 0, skips:
- Oscillator creation
- Gain node setup
- Frequency calculations
- Audio buffer allocation

### Browser Compatibility
- Uses AudioContext (standard) or webkitAudioContext (Safari)
- Requires user interaction before audio plays
- Automatically resumes context on first input

### Volume Scaling
- UI range: 0-100 (integer)
- Audio range: 0.0-1.0 (float)
- Conversion: `volume / 100`

---

## Event Integration

### Listens For
(None - uses direct method calls)

### Emits
(None - pure utility module)

---

## Configuration

All sound parameters loaded from `config.json`:
```json
{
  "audio": {
    "sfxVolume": 50,
    "musicVolume": 30,
    "masterMuted": false
  }
}
```

---

## Testing
See `tests/unit/test-audio-manager.js` (not yet implemented)

---

**Version:** 1.0  
**Last Updated:** December 21, 2025
