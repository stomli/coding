# PieceFactory Module Documentation

## Overview
Factory pattern implementation for generating game pieces with level-based color unlocking and special ball spawning.

## Responsibility
- Generate new Piece instances with random shapes
- Manage color unlocking based on level progression
- Spawn special balls (exploding, painter, blocking) based on configuration
- Track piece generation for blocking ball spawning
- Provide factory reset functionality

## Architecture
**Pattern:** Singleton  
**Export:** Pre-instantiated singleton instance

## Dependencies
- Piece
- Ball
- ConfigManager
- Constants
- Helpers (randomInt)

## Public API

### Methods

#### generatePiece(level, difficulty)
```javascript
generatePiece(level, difficulty) → Piece
```
Creates a new random piece with appropriate color palette and special balls.

**Parameters:**
- `level` (Number): Current game level (affects color unlocking)
- `difficulty` (Number): Current difficulty (1-5, affects special ball rates)

**Returns:** New Piece instance with random shape and colored balls

**Behavior:**
- Selects random shape from 8 available shapes
- Determines available colors based on level
- Applies special ball spawn rates
- Increments piece counter for blocking ball tracking

**Example:**
```javascript
const piece = PieceFactory.generatePiece(5, 2);
```

---

#### reset()
```javascript
reset() → void
```
Resets internal state (piece counter).

**Example:**
```javascript
PieceFactory.reset();
```

---

## Color Unlocking System

Colors unlock progressively as levels increase:

| Level | Colors Available | Total Colors |
|-------|------------------|--------------|
| 1-2 | Red, Green, Blue | 3 |
| 3-6 | + Yellow | 4 |
| 7-10 | + Cyan | 5 |
| 11-14 | + Magenta | 6 |
| 15-18 | + Orange | 7 |
| 19+ | + Purple | 8 |

**Configuration:** Color palette defined in `config.json` under `colors.ballColors`

**Formula:**
```javascript
const colorCount = Math.min(8, 3 + Math.floor(level / 4));
```

## Special Ball Spawning

### Special Ball Types
1. **EXPLODING** - Clears 7×7 area when matched
2. **PAINTER_HORIZONTAL** - Paints entire horizontal line
3. **PAINTER_VERTICAL** - Paints entire vertical column
4. **PAINTER_DIAGONAL** - Paints diagonal line
5. **BLOCKING** - Cannot be cleared by matches, only explosions

### Spawn Rates
Configured in `config.json` under `specialBalls`:
```json
{
  "explodingRate": 0.05,        // 5% chance
  "painterHorizontalRate": 0.02, // 2% chance
  "painterVerticalRate": 0.02,   // 2% chance
  "painterDiagonalRate": 0.01    // 1% chance
}
```

### Spawn Logic
For each ball in piece:
1. Check if should spawn special ball (random chance)
2. If yes, randomly select special type
3. If no, create normal ball with random color from available palette

## Piece Shapes

Factory can generate 8 different shapes (configured in `config.json`):

1. **I-Piece** - 4 balls in straight line
2. **O-Piece** - 6 balls in 2×3 rectangle
3. **T-Piece** - 4 balls in T-shape
4. **L-Piece** - 5 balls in L-shape
5. **J-Piece** - 5 balls in reverse L-shape
6. **S-Piece** - 5 balls in S-shape
7. **Z-Piece** - 5 balls in Z-shape
8. **Single** - 1 ball

**Shape Selection:** Random with equal probability for all shapes

## Internal Implementation

### Private Methods

#### _getAvailableColors(level)
```javascript
_getAvailableColors(level) → Array<String>
```
Determines which colors are unlocked for given level.

#### _shouldSpawnSpecialBall()
```javascript
_shouldSpawnSpecialBall() → Boolean
```
Randomly determines if next ball should be special.

#### _getRandomSpecialType()
```javascript
_getRandomSpecialType() → String
```
Randomly selects special ball type based on configured rates.

## Usage Example

```javascript
import { PieceFactory } from './PieceFactory.js';

// Initialize game
PieceFactory.reset();

// Generate pieces during gameplay
function spawnNextPiece() {
  const currentLevel = gameState.level;
  const currentDifficulty = gameState.difficulty;
  
  const newPiece = PieceFactory.generatePiece(currentLevel, currentDifficulty);
  
  // Position piece at top center
  const startX = Math.floor(grid.cols / 2) - Math.floor(newPiece.getWidth() / 2);
  newPiece.setPosition(startX, 0);
  
  return newPiece;
}

// Generate next piece preview
const nextPiece = PieceFactory.generatePiece(currentLevel, currentDifficulty);

// Reset factory when starting new game
PieceFactory.reset();
```

## Testing
- 13 unit tests covering:
  - Piece generation
  - Color unlocking at different levels
  - Shape randomness
  - Special ball spawning
  - Factory reset
  - Configuration integration

**Test Coverage:** Full coverage of public API and color unlocking logic
