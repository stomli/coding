# LevelManager Module Documentation

## Overview
Manages level progression, difficulty settings, timer countdown, and level unlocking system.

## Responsibility
- Track current difficulty (1-5) and level number (1-∞)
- Manage 15-second countdown timer per level
- Calculate drop speed scaling based on difficulty and level
- Control blocking ball spawn rates
- Handle color unlocking at specific levels (3, 7, 11, 15, 19)
- Persist and load unlocked levels per difficulty
- Emit level completion and game over events

## Architecture
**Pattern:** Singleton  
**Export:** Pre-instantiated singleton instance

## Dependencies
- ConfigManager
- EventEmitter
- Constants
- PlayerManager (for level unlocking)

## Public API

### Methods

#### initialize(difficulty, level)
```javascript
initialize(difficulty, level) → void
```
Initializes level manager with starting difficulty and level.

**Parameters:**
- `difficulty` (Number): Difficulty level 1-5
- `level` (Number): Starting level (default: 1)

**Side Effects:**
- Sets current difficulty and level
- Resets timer to 15 seconds (configurable)
- Calculates initial drop speed
- Determines available colors
- Loads unlocked levels from PlayerManager

**Example:**
```javascript
LevelManager.initialize(3, 5); // Difficulty 3, Level 5
```

---

#### startTimer()
```javascript
startTimer() → void
```
Starts the level countdown timer.

**Side Effects:**
- Begins countdown from configured time (default: 15 seconds)
- Emits TIMER_UPDATE events every 100ms
- Emits LEVEL_COMPLETE when timer reaches 0

**Timer Behavior:**
- Pauses automatically when game is paused
- Resumes when game unpauses
- Stops on level completion or game over

---

#### pauseTimer()
```javascript
pauseTimer() → void
```
Pauses the countdown timer.

**Side Effects:**
- Stops timer updates
- Preserves remaining time

---

#### resumeTimer()
```javascript
resumeTimer() → void
```
Resumes the countdown timer from paused state.

**Side Effects:**
- Restarts timer updates from remaining time

---

#### getTimeRemaining()
```javascript
getTimeRemaining() → Number
```
Gets the remaining time in seconds.

**Returns:** Time remaining (seconds, 1 decimal place)

**Example:**
```javascript
const time = LevelManager.getTimeRemaining(); // 8.3
```

---

#### getDropSpeed()
```javascript
getDropSpeed() → Number
```
Gets the current piece drop speed in milliseconds.

**Returns:** Drop interval in ms

**Formula:**
```javascript
baseSpeed / (difficultyModifier * levelModifier)
```

**Scaling:**
- Base speed: 1000ms (configurable)
- Difficulty modifier: 1.0x - 3.0x
- Level modifier: 1.0x + (level - 1) × 0.05

**Example:**
```javascript
// Difficulty 3, Level 10
// Base: 1000ms
// Difficulty modifier: 2.0x
// Level modifier: 1.0 + 9 × 0.05 = 1.45
// Speed: 1000 / (2.0 × 1.45) = 345ms
```

---

#### getBlockingBallChance()
```javascript
getBlockingBallChance() → Number
```
Gets the current probability of blocking ball spawn.

**Returns:** Probability (0.0 - 1.0)

**Formula:**
```javascript
baseChance × difficultyModifier × levelModifier
```

**Scaling:**
- Base: 0.5% (0.005)
- Difficulty modifier: 1.0x - 3.0x
- Level modifier: 1.0 + level × 0.01

**Minimum Piece Count:**
- Difficulty 1: No blocking balls before piece 50
- Difficulty 2: No blocking balls before piece 30
- Difficulty 3: No blocking balls before piece 20
- Difficulty 4: No blocking balls before piece 10
- Difficulty 5: Blocking balls from start

---

#### getAvailableColors()
```javascript
getAvailableColors() → Number
```
Gets the number of colors available at current level.

**Returns:** Color count (3-8)

**Unlock Schedule:**
- Level 1-2: 3 colors (Red, Green, Blue)
- Level 3-6: 4 colors (add Yellow)
- Level 7-10: 5 colors (add Magenta)
- Level 11-14: 6 colors (add Cyan)
- Level 15-18: 7 colors (add Orange)
- Level 19+: 8 colors (add Purple)

---

#### completeLevel()
```javascript
completeLevel() → void
```
Called when level timer reaches 0.

**Side Effects:**
- Emits LEVEL_COMPLETE event
- Unlocks next level for current difficulty
- Saves unlock state to PlayerManager
- Stops timer

**Example:**
```javascript
// Automatically called by timer
// Or manually triggered for testing
LevelManager.completeLevel();
```

---

#### advanceLevel()
```javascript
advanceLevel() → void
```
Advances to the next level in current difficulty.

**Side Effects:**
- Increments level number
- Resets timer to full
- Recalculates drop speed
- Updates available colors
- Emits LEVEL_START event

---

#### changeDifficulty(newDifficulty, newLevel)
```javascript
changeDifficulty(newDifficulty, newLevel) → void
```
Changes difficulty and optionally level.

**Parameters:**
- `newDifficulty` (Number): New difficulty 1-5
- `newLevel` (Number, optional): New level (default: 1)

**Side Effects:**
- Sets new difficulty
- Resets to specified level
- Recalculates all scaling factors
- Resets timer

**Example:**
```javascript
LevelManager.changeDifficulty(4, 8); // Difficulty 4, Level 8
```

---

#### isLevelUnlocked(difficulty, level)
```javascript
isLevelUnlocked(difficulty, level) → Boolean
```
Checks if a specific difficulty/level combination is unlocked.

**Parameters:**
- `difficulty` (Number): Difficulty to check (1-5)
- `level` (Number): Level to check

**Returns:** true if unlocked

**Example:**
```javascript
if (LevelManager.isLevelUnlocked(3, 10)) {
    // Player can play Difficulty 3, Level 10
}
```

---

#### getCurrentDifficulty()
```javascript
getCurrentDifficulty() → Number
```
Gets the current difficulty level.

**Returns:** Difficulty (1-5)

---

#### getCurrentLevel()
```javascript
getCurrentLevel() → Number
```
Gets the current level number.

**Returns:** Level (1-∞)

---

#### getDifficultyMultiplier()
```javascript
getDifficultyMultiplier() → Number
```
Gets the score multiplier for current difficulty.

**Returns:** Multiplier (1.0, 1.5, 2.0, 2.5, 3.0)

---

## Event Integration

### Listens For
- `GAME_PAUSE` - Pauses timer
- `GAME_RESUME` - Resumes timer
- `GAME_OVER` - Stops timer

### Emits
- `TIMER_UPDATE` - Every 100ms with remaining time
  - Data: `{ time: Number }` (seconds with 1 decimal)
- `LEVEL_COMPLETE` - When timer reaches 0
  - Data: `{ difficulty: Number, level: Number }`
- `LEVEL_START` - When new level begins
  - Data: `{ difficulty: Number, level: Number, colors: Number }`

---

## Configuration

Configured via `config.json`:
```json
{
  "levelProgression": {
    "timePerLevel": 15,
    "baseDropSpeed": 1000,
    "dropSpeedIncrement": 0.05
  },
  "difficulty": {
    "dropSpeedModifier": [1.0, 1.5, 2.0, 2.5, 3.0],
    "scoreMultiplier": [1.0, 1.5, 2.0, 2.5, 3.0],
    "blockingBallFrequencyModifier": [1.0, 1.5, 2.0, 2.5, 3.0],
    "blockingBallStartPiece": [50, 30, 20, 10, 0]
  },
  "colorUnlocks": {
    "level3": 4,
    "level7": 5,
    "level11": 6,
    "level15": 7,
    "level19": 8
  }
}
```

---

## Implementation Notes

### Timer Precision
- Updates every 100ms for smooth countdown
- Displays with 1 decimal place (e.g., "8.3s")
- Uses `performance.now()` for accuracy

### Progressive Difficulty
```javascript
// Drop speed calculation
const baseSpeed = 1000; // ms
const diffMod = [1.0, 1.5, 2.0, 2.5, 3.0][difficulty - 1];
const levelMod = 1.0 + (level - 1) * 0.05;
const dropSpeed = baseSpeed / (diffMod * levelMod);
```

### Level Unlocking
- Level 1 always unlocked for all difficulties
- Completing a level unlocks the next level in that difficulty
- Unlocks persist via PlayerManager localStorage
- Can replay any unlocked level

---

## Testing
See `tests/unit/test-level-manager.js` (not yet implemented)

---

**Version:** 1.0  
**Last Updated:** December 21, 2025
