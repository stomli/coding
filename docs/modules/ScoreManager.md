# ScoreManager Module Documentation

## Overview
Score calculation and tracking system for the Ball Drop Puzzle Game.

## Responsibility
- Calculate points from cleared balls
- Apply cascade bonuses
- Apply difficulty multipliers
- Track current level score
- Track cumulative total score

## Dependencies
- ConfigManager
- EventEmitter

## Public API

### Constructor
```javascript
constructor()
```
Initializes score manager with zero scores.

### Methods

#### reset()
```javascript
reset() → void
```
Resets current level score to zero (preserves total score).

---

#### addScore(ballsCleared, cascadeLevel, isFullRow)
```javascript
addScore(ballsCleared, cascadeLevel, isFullRow) → void
```
Adds points based on balls cleared and bonuses.

**Parameters:**
- `ballsCleared` (Number): Number of balls cleared
- `cascadeLevel` (Number): Cascade depth (0 = no cascade)
- `isFullRow` (Boolean): Whether a full row was cleared

---

#### getCurrentLevelScore()
```javascript
getCurrentLevelScore() → Number
```
Gets the score for the current level.

**Returns:** Current level score

---

#### getTotalScore()
```javascript
getTotalScore() → Number
```
Gets the cumulative total score.

**Returns:** Total score across all levels

---

#### calculatePoints(ballsCleared, cascadeLevel, difficulty)
```javascript
calculatePoints(ballsCleared, cascadeLevel, difficulty) → Number
```
Calculates raw points before adding to scores.

**Parameters:**
- `ballsCleared` (Number): Number of balls cleared
- `cascadeLevel` (Number): Cascade depth
- `difficulty` (Number): Current difficulty (1-5)

**Returns:** Calculated points

---

## Scoring Formula

### Base Points
```
For balls 1-10: 1 point each
For ball 11-15: 2 points each
For ball 16-20: 4 points each
For ball 21-25: 8 points each
...pattern continues (doubles every 5 balls)
```

### Cascade Bonus
```
cascadeBonus = 3 × 2^(cascadeLevel - 1)

Examples:
1st cascade: 3 × 2^0 = 3 points
2nd cascade: 3 × 2^1 = 6 points
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
