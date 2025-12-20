# ScoreManager Module Documentation

## Overview
Event-driven score calculation and tracking system for the Ball Drop Puzzle Game.

## Responsibility
- Listen for ball clearing and cascade events
- Calculate points from cleared balls with cascade bonuses
- Apply difficulty multipliers
- Track cumulative game score
- Emit score update events for UI synchronization

## Architecture
**Pattern:** Singleton  
**Export:** Pre-instantiated singleton instance

## Dependencies
- ConfigManager
- EventEmitter
- Constants

## Public API

### Methods

#### initialize(difficulty)
```javascript
initialize(difficulty) → void
```
Initializes score manager with difficulty level and sets up event listeners.

**Parameters:**
- `difficulty` (Number): Current difficulty level (1-5)

**Side Effects:**
- Resets score to 0
- Sets difficulty multiplier
- Attaches event listeners for BALLS_CLEARED and CASCADE_COMPLETE
- Removes old listeners if already initialized

**Example:**
```javascript
ScoreManager.initialize(3); // Difficulty 3
```

---

#### getScore()
```javascript
getScore() → Number
```
Gets the current cumulative score.

**Returns:** Current score

**Example:**
```javascript
const currentScore = ScoreManager.getScore();
```

---

#### getDifficulty()
```javascript
getDifficulty() → Number
```
Gets the current difficulty level.

**Returns:** Difficulty level (1-5)

---

## Event Handling

### Listened Events

#### BALLS_CLEARED
Triggered when balls are matched and cleared from grid.

**Expected Data:**
```javascript
{
  count: Number,    // Number of balls cleared
  matches: Array    // Array of match groups
}
```

**Behavior:**
- Accumulates ball count for cascade sequence
- Increments cascade level counter

---

#### CASCADE_COMPLETE
Triggered when cascade sequence finishes (no more matches).

**Expected Data:**
```javascript
{
  cascadeCount: Number  // Total number of cascades in sequence
}
```

**Behavior:**
- Calculates final score for cascade sequence
- Applies difficulty multiplier
- Emits SCORE_UPDATE event
- Resets cascade tracking data

---

### Emitted Events

#### SCORE_UPDATE
Emitted when score changes after cascade completion.

**Event Data:**
```javascript
{
  score: Number,        // New total score
  points: Number,       // Points added this cascade
  cascadeCount: Number  // Number of cascades in sequence
}
```

**Example:**
```javascript
EventEmitter.on(CONSTANTS.EVENTS.SCORE_UPDATE, (data) => {
  console.log(`+${data.points} points! Total: ${data.score}`);
  updateScoreDisplay(data.score);
});
```

---

## Scoring Formula

### Base Points
```javascript
basePoints = ballsCleared × 1 point
```
Configurable via `config.json` (`scoring.basePoints`)

### Cascade Bonus
Cascade bonuses grow exponentially:
```javascript
Single cascade (level 1): 0 bonus
2nd cascade: +3 points
3rd cascade: +6 points (3 × 2)
4th cascade: +12 points (6 × 2)
nth cascade: bonus = 3 × 2^(cascadeLevel - 2)
```

Formula:
```javascript
if (cascadeLevel === 1) {
  cascadeBonus = 0;
} else {
  cascadeBonus = 3 × 2^(cascadeLevel - 2);
}
```

### Difficulty Multiplier
Applied to total points before adding to score:

| Difficulty | Multiplier |
|------------|------------|
| 1 | 1.0x |
| 2 | 1.5x |
| 3 | 2.0x |
| 4 | 2.5x |
| 5 | 3.0x |

Configurable via `config.json` (`scoring.difficultyMultipliers`)

### Final Calculation
```javascript
rawPoints = (ballsCleared × basePoints) + cascadeBonus
finalPoints = rawPoints × difficultyMultiplier
score += finalPoints
```

## Internal Implementation

### Private Methods

#### _onBallsCleared(data)
```javascript
_onBallsCleared(data) → void
```
Event handler for BALLS_CLEARED. Accumulates ball count and increments cascade level.

#### _onCascadeComplete(data)
```javascript
_onCascadeComplete(data) → void
```
Event handler for CASCADE_COMPLETE. Calculates and applies final score, emits SCORE_UPDATE.

#### _calculateCascadeScore(totalBalls, cascadeCount)
```javascript
_calculateCascadeScore(totalBalls, cascadeCount) → Number
```
Calculates total points for a cascade sequence with bonuses and multipliers.
## Usage Example

```javascript
import { ScoreManager } from './ScoreManager.js';
import { EventEmitter } from '../utils/EventEmitter.js';
import { CONSTANTS } from '../utils/Constants.js';

// Initialize for difficulty 3
ScoreManager.initialize(3);

// Listen for score updates
EventEmitter.on(CONSTANTS.EVENTS.SCORE_UPDATE, (data) => {
  console.log(`Score: ${data.score} (+${data.points})`);
  document.getElementById('score').textContent = data.score;
});

// Scoring happens automatically via events:
// 1. Grid detects matches and emits BALLS_CLEARED
// 2. ScoreManager accumulates ball count
// 3. Grid completes cascade and emits CASCADE_COMPLETE
// 4. ScoreManager calculates final score and emits SCORE_UPDATE

// Check current score
const score = ScoreManager.getScore(); // 1250

// Get difficulty
const difficulty = ScoreManager.getDifficulty(); // 3
```

## Scoring Examples

### Example 1: Single Cascade
```
Clear 5 balls → No further cascades
Difficulty: 2 (1.5x multiplier)

Calculation:
- Base: 5 balls × 1 = 5 points
- Cascade bonus: 0 (only 1 cascade)
- Subtotal: 5 points
- × 1.5 multiplier = 7.5 → 8 points (rounded)
```

### Example 2: Two Cascades
```
Clear 4 balls → gravity → Clear 3 balls → No more matches
Difficulty: 3 (2.0x multiplier)

Calculation:
- Base: 7 balls × 1 = 7 points
- Cascade bonus: 3 points (2nd cascade)
- Subtotal: 10 points
- × 2.0 multiplier = 20 points
```

### Example 3: Four Cascades
```
Clear 3 → 4 → 5 → 3 balls (15 total)
Difficulty: 5 (3.0x multiplier)

Calculation:
- Base: 15 balls × 1 = 15 points
- Cascade bonus: 3 + 6 + 12 = 21 points
  - 2nd cascade: 3 × 2^0 = 3
  - 3rd cascade: 3 × 2^1 = 6
  - 4th cascade: 3 × 2^2 = 12
- Subtotal: 36 points
- × 3.0 multiplier = 108 points
```

## Testing
- 13 unit tests covering:
  - Initialization
  - Score tracking
  - Difficulty multipliers
  - Cascade bonus calculation
  - Event handling (BALLS_CLEARED, CASCADE_COMPLETE)
  - Score update emissions
  - Multi-cascade scoring

**Test Coverage:** Full coverage of public API and scoring formulas

3rd cascade: 3 × 2^2 = 12 points
4th cascade: 3 × 2^3 = 24 points
```

### Full Row Bonus
```
+50 points (flat bonus)
```

### Difficulty Multiplier
```
Difficulty 1: ×1.0
Difficulty 2: ×1.5
Difficulty 3: ×2.0
Difficulty 4: ×2.5
Difficulty 5: ×3.0
```

### Final Formula
```
finalScore = floor((basePoints + cascadeBonus + rowBonus) × difficultyMultiplier)
```

## Internal State

```javascript
{
	currentLevelScore: Number,      // Score for current level
	totalScore: Number,             // Cumulative score
	config: Object                  // Reference to scoring config
}
```

## Events Emitted

- `scoreUpdateEvent` - When score changes
  - Payload: `{levelScore, totalScore}`

## Implementation Example

```javascript
// Example: Clear 12 balls in 2nd cascade at difficulty 3
const ballsCleared = 12;
const cascadeLevel = 2;
const difficulty = 3;

// Base points: (10 × 1) + (2 × 2) = 14
// Cascade bonus: 3 × 2^1 = 6
// Row bonus: 0 (not full row)
// Subtotal: 14 + 6 = 20
// Difficulty multiplier: ×2.0
// Final: 20 × 2.0 = 40 points
```

## Testing Considerations

- Test base scoring tiers (1-10, 11-15, etc.)
- Verify cascade bonus doubling
- Test difficulty multipliers
- Validate full row bonus application
- Check score persistence across levels

## Version
1.0

## Last Updated
December 19, 2025
