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

#### getHighScore(difficulty, level)
```javascript
getHighScore(difficulty, level) → Number
```
Gets the high score for a specific difficulty/level.

**Parameters:**
- `difficulty` (Number): Difficulty level (1-5)
- `level` (Number): Level number (1-∞)

**Returns:** High score (0 if no score recorded)

**Example:**
```javascript
const score = PlayerManager.getHighScore(3, 10); // 1234
```

---

#### updateHighScore(difficulty, level, score)
```javascript
updateHighScore(difficulty, level, score) → Boolean
```
Updates the high score if the new score is higher.

**Parameters:**
- `difficulty` (Number): Difficulty level (1-5)
- `level` (Number): Level number
- `score` (Number): New score to compare

**Returns:** true if new high score was set

**Side Effects:**
- Updates player's highScores object if score is higher
- Saves to localStorage
- Updates lastPlayed timestamp

**Example:**
```javascript
const isNewHighScore = PlayerManager.updateHighScore(3, 10, 1500);
if (isNewHighScore) {
    // Show "NEW HIGH SCORE!" message
}
```

---

#### unlockLevel(difficulty, level)
```javascript
unlockLevel(difficulty, level) → void
```
Unlocks a specific level for current player.

**Parameters:**
- `difficulty` (Number): Difficulty level (1-5)
- `level` (Number): Level to unlock

**Side Effects:**
- Adds level to unlockedLevels array for difficulty
- Saves to localStorage
- Prevents duplicates

**Example:**
```javascript
PlayerManager.unlockLevel(3, 11); // Unlock Difficulty 3, Level 11
```

---

#### isLevelUnlocked(difficulty, level)
```javascript
isLevelUnlocked(difficulty, level) → Boolean
```
Checks if a level is unlocked for current player.

**Parameters:**
- `difficulty` (Number): Difficulty level (1-5)
- `level` (Number): Level to check

**Returns:** true if level is unlocked

**Default Behavior:**
- Level 1 always unlocked for all difficulties

**Example:**
```javascript
if (PlayerManager.isLevelUnlocked(3, 10)) {
    // Enable "Start" button for this level
}
```

---

#### getUnlockedLevels(difficulty)
```javascript
getUnlockedLevels(difficulty) → Array<Number>
```
Gets all unlocked levels for a difficulty.

**Parameters:**
- `difficulty` (Number): Difficulty level (1-5)

**Returns:** Sorted array of unlocked level numbers

**Example:**
```javascript
const levels = PlayerManager.getUnlockedLevels(3); 
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
        "1_1": 450,   // Difficulty 1, Level 1: 450 points
        "1_2": 780,
        "3_5": 1234
    },
    unlockedLevels: {
        "1": [1, 2, 3, 4, 5],
        "2": [1, 2],
        "3": [1, 2, 3, 4, 5, 6]
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
// Key: 'players'
{
    currentPlayerId: "player_1703123456789",
    players: [
        { /* player object 1 */ },
        { /* player object 2 */ }
    ]
}
```

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

### High Score Keys
Format: `"difficulty_level"`
```javascript
const key = `${difficulty}_${level}`; // "3_10"
```

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

**Version:** 1.0  
**Last Updated:** December 21, 2025
