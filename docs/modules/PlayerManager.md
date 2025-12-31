# PlayerManager Module Documentation

## Overview
Manages player profiles, high scores, level unlocking, and localStorage persistence.

## Responsibility
- Create and manage player profiles (guest and named)
- Track high scores per (difficulty, level) combination
- Persist and load level unlock states
- Save player statistics and achievements
- Handle localStorage serialization and deserialization
- Manage current active player

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
Initializes the player management system.

**Side Effects:**
- Loads all players from localStorage
- Sets default guest player if none exists
- Loads current player profile
- Validates data integrity

**Example:**
```javascript
PlayerManager.initialize();
```

---

#### loadPlayers()
```javascript
loadPlayers() → void
```
Loads all player data from localStorage.

**Side Effects:**
- Reads `players` key from localStorage
- Parses JSON data
- Creates default guest player if needed
- Sets current player

**Storage Key:** `'players'`

---

#### savePlayers()
```javascript
savePlayers() → void
```
Saves all player data to localStorage.

**Side Effects:**
- Serializes player data to JSON
- Writes to localStorage `'players'` key
- Handles quota exceeded errors

---

#### getCurrentPlayer()
```javascript
getCurrentPlayer() → Object
```
Gets the currently active player profile.

**Returns:** Player object
```javascript
{
    id: String,           // Unique identifier
    name: String,         // Display name
    isGuest: Boolean,     // Guest vs named player
    highScores: Object,   // { "difficulty_level": score }
    unlockedLevels: Object, // { difficulty: [levels] }
    statistics: Object,   // Game statistics
    createdAt: Number,    // Timestamp
    lastPlayed: Number    // Timestamp
}
```

---

#### setCurrentPlayer(playerId)
```javascript
setCurrentPlayer(playerId) → void
```
Sets the active player by ID.

**Parameters:**
- `playerId` (String): Player ID to set as current

**Side Effects:**
- Switches current player
- Saves current player ID to localStorage
- Loads player's high scores and unlocks

**Example:**
```javascript
PlayerManager.setCurrentPlayer('player_123');
```

---

#### createPlayer(name)
```javascript
createPlayer(name) → Object
```
Creates a new named player profile.

**Parameters:**
- `name` (String): Player display name

**Returns:** New player object

**Side Effects:**
- Generates unique player ID
- Initializes empty high scores and unlocks
- Sets as current player
- Saves to localStorage

**Example:**
```javascript
const player = PlayerManager.createPlayer('Alice');
// Returns: { id: 'player_timestamp', name: 'Alice', ... }
```

---

#### getLevelBestScore(difficulty, level, mode)
```javascript
LevelBestScore(difficulty, level, mode = 'CLASSIC') → Number
```
Gets the best score for a specific difficulty/level/mode combination.

**Parameters:**
- `difficulty` (Number): Difficulty level (1-5)
- `level` (Number): Level number (1-∞)
- `mode` (String): Game mode (default: 'CLASSIC')

**Returns:** Best score (0 if no score recorded)

**Legacy Support:** Falls back to old "difficulty_level" format for CLASSIC mode

**Example:**
```javascript
const score = PlayerManager.getLevelBestScore(3, 10, 'ZEN'); // 1234
const classicScore = PlayerManager.getLevelBestScore(3, 10); // Uses CLASSIC
```

---

#### updateStats(statsObject)
```javascript
updateStats(statsObject) → void
```
Updates player statistics and high score after level completion.

**Parameters:**
- `statsObject` (Object):
  - `score` (Number): Final score
  - `time` (Number): Time taken
  - `difficulty` (Number): Difficulty level (1-5)
  - `levelCompleted` (Number): Level number
  - `mode` (String): Game mode

**Side Effects:**
- Updates player's high scores if score is higher (by mode/difficulty/level)
- Updates statistics (gamesPlayed, totalScore, etc.)
- Saves to localStorage
- Updates lastPlayed timestamp

**Example:**
```javascript
PlayerManager.updateStats({
    score: 1500,
    time: 14250,
    difficulty: 3,
    levelCompleted: 10,
    mode: 'GAUNTLET'
});
```

---

#### unlockLevel(difficulty, level, mode)
```javascript
unlockLevel(difficulty, level, mode = 'CLASSIC') → void
```
Unlocks a specific level for current player in the specified mode.

**Parameters:**
- `difficulty` (Number): Difficulty level (1-5)
- `level` (Number): Level to unlock
- `mode` (String): Game mode (default: 'CLASSIC')

**Side Effects:**
- Adds level to unlockedLevelsByMode[mode][difficulty] array
- Saves to localStorage
- Prevents duplicates

**Example:**
```javascript
PlayerManager.unlockLevel(3, 11, 'ZEN'); // Unlock Difficulty 3, Level 11 in ZEN mode
```

---

#### isLevelCompleted(difficulty, level, mode)
```javascript
isLevelCompleted(difficulty, level, mode = 'CLASSIC') → Boolean
```
Checks if a level has been completed for current player in specified mode.

**Parameters:**
- `difficulty` (Number): Difficulty level (1-5)
- `level` (Number): Level to check
- `mode` (String): Game mode (default: 'CLASSIC')

**Returns:** true if level is completed

**Default Behavior:**
- Level 1 always considered incomplete (always playable)

**Example:**
```javascript
if (PlayerManager.isLevelCompleted(3, 10, 'GAUNTLET')) {
    // Enable next level button
}
```

---

#### getUnlockedLevels(difficulty, mode)
```javascript
getUnlockedLevels(difficulty, mode = 'CLASSIC') → Array<Number>
```
Gets all unlocked levels for a difficulty and mode.

**Parameters:**
- `difficulty` (Number): Difficulty level (1-5)
- `mode` (String): Game mode (default: 'CLASSIC')

**Returns:** Sorted array of unlocked level numbers

**Example:**
```javascript
const levels = PlayerManager.getUnlockedLevels(3, 'ZEN'); 
// [1, 2, 3, 4, 5, 6, 7]
```

---

#### getAllPlayers()
```javascript
getAllPlayers() → Array<Object>
```
Gets all player profiles.

**Returns:** Array of player objects

**Example:**
```javascript
const players = PlayerManager.getAllPlayers();
// Display in player selection UI
```

---

#### deletePlayer(playerId)
```javascript
deletePlayer(playerId) → Boolean
```
Deletes a player profile.

**Parameters:**
- `playerId` (String): Player ID to delete

**Returns:** true if deleted successfully

**Side Effects:**
- Removes player from players list
- If current player deleted, switches to guest
- Saves to localStorage

**Protection:**
- Cannot delete the only remaining player
- Creates new guest if last player deleted

---

#### updateStatistics(statType, value)
```javascript
updateStatistics(statType, value) → void
```
Updates player statistics.

**Parameters:**
- `statType` (String): Statistic to update
  - `gamesPlayed`, `totalScore`, `totalMatches`, `totalCascades`, `longestCascade`, `totalExplosions`
- `value` (Number): Value to add (or set for max values)

**Side Effects:**
- Updates current player's statistics
- Saves to localStorage

**Example:**
```javascript
PlayerManager.updateStatistics('gamesPlayed', 1);
PlayerManager.updateStatistics('totalScore', 1234);
PlayerManager.updateStatistics('longestCascade', 5); // Sets if higher
```

---

#### getStatistics()
```javascript
getStatistics() → Object
```
Gets current player's statistics.

**Returns:** Statistics object
```javascript
{
    gamesPlayed: Number,
    totalScore: Number,
    totalMatches: Number,
    totalCascades: Number,
    longestCascade: Number,
    totalExplosions: Number
}
```

---

## Data Structure

### Player Object
```javascript
{
    id: "player_1703123456789",
    name: "Alice",
    isGuest: false,
    highScores: {
        "CLASSIC-1-1": 450,      // Classic Mode, Difficulty 1, Level 1
        "CLASSIC-1-2": 780,
        "ZEN-3-5": 1234,         // Zen Mode, Difficulty 3, Level 5
        "GAUNTLET-2-3": 567,
        "1_1": 450               // Legacy format (auto-migrated to CLASSIC)
    },
    unlockedLevelsByMode: {
        "CLASSIC": {
            "1": [1, 2, 3, 4, 5],
            "2": [1, 2],
            "3": [1, 2, 3, 4, 5, 6]
        },
        "ZEN": {
            "1": [1, 2, 3],
            "3": [1, 2, 3, 4, 5]
        },
        "GAUNTLET": {
            "2": [1, 2, 3]
        },
        "RISING_TIDE": {}
    },
    unlockedLevels: {             // Legacy - migrated to CLASSIC mode
        "1": [1, 2, 3, 4, 5]
    },
    statistics: {
        gamesPlayed: 42,
        totalScore: 12345,
        totalMatches: 500,
        totalCascades: 150,
        longestCascade: 7,
        totalExplosions: 25
    },
    createdAt: 1703123456789,
    lastPlayed: 1703987654321
}
```

### LocalStorage Schema
```javascript
// Key: 'ballMatcher_players'
{
    currentPlayerId: "player_1703123456789",
    players: [
        { /* player object 1 */ },
        { /* player object 2 */ }
    ]
}
```

### High Score Keys
Format: `"MODE-difficulty-level"`
```javascript
const key = `${mode}-${difficulty}-${level}`; // "ZEN-3-10"
```

### Legacy Migration
Old format `"difficulty_level"` is automatically migrated to `"CLASSIC-difficulty-level"` on data load. Both formats are checked when retrieving CLASSIC mode scores for backward compatibility.

---

## Event Integration

### Listens For
(None - uses direct method calls)

### Emits
- `PLAYER_CHANGED` - When current player switches
  - Data: `{ player: Object }`
- `HIGH_SCORE_UPDATE` - When new high score is set
  - Data: `{ difficulty: Number, level: Number, score: Number }`

---

## Implementation Notes

### Game Modes System
- Each mode tracks progression independently
- High scores stored separately per mode
- Legacy data automatically migrated to CLASSIC mode
- Mode-specific unlocked levels in `unlockedLevelsByMode`

### Guest Player
- Automatically created if no players exist
- ID: `"guest"`
- Name: `"Guest"`
- isGuest: `true`
- Can be replaced by creating named player

### Data Validation
- Validates player objects on load
- Repairs corrupted data when possible
- Falls back to default guest player on critical errors

### Storage Quota
```javascript
try {
    localStorage.setItem('players', JSON.stringify(data));
} catch (e) {
    if (e.name === 'QuotaExceededError') {
        console.error('Storage quota exceeded');
        // Could implement cleanup of old data
    }
}
```

---

## Testing
See `tests/unit/test-player-manager.js` (12 tests passing)

---

**Version:** 1.1  
**Last Updated:** December 30, 2025
