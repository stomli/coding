# Renderer Module Documentation

## Overview
Canvas-based rendering system for the Ball Drop Puzzle Game.

## Responsibility
- Render game grid and cells
- Render current piece and balls
- Render ghost piece (drop preview)
- Render next piece preview
- Clear and update canvas

## Architecture
**Pattern:** Class (instantiated by GameEngine)  
**Export:** Default class export

## Dependencies
- ConfigManager
- Constants

## Public API

### Constructor
```javascript
constructor(canvas)
```
Creates renderer attached to specified canvas element.

**Parameters:**
- `canvas` (HTMLCanvasElement): Canvas DOM element for rendering

**Example:**
```javascript
const canvas = document.getElementById('gameCanvas');
const renderer = new Renderer(canvas);
```

---

### Methods

#### initialize()
```javascript
initialize() → void
```
Sets up canvas dimensions and rendering context.

**Side Effects:**
- Calculates cell size based on canvas and grid dimensions
- Initializes 2D rendering context

**Example:**
```javascript
renderer.initialize();
```

---

#### clear()
```javascript
clear() → void
```
Clears entire canvas with background color.

**Example:**
```javascript
renderer.clear();
```

---

#### renderGrid(grid)
```javascript
renderGrid(grid) → void
```
Renders the game grid and all locked balls.

**Parameters:**
- `grid` (Grid): Grid instance containing locked balls

**Rendering:**
- Draws grid outline
- Renders each non-empty cell as colored circle
- Uses ball colors from config

---

#### renderPiece(piece)
```javascript
renderPiece(piece) → void
```
Renders the active falling piece.

**Parameters:**
- `piece` (Piece): Current piece to render

**Rendering:**
- Iterates piece shape
- Draws balls at piece position + shape offset
- Uses ball colors and types

---

#### renderGhostPiece(piece, ghostY)
```javascript
renderGhostPiece(piece, ghostY) → void
```
Renders semi-transparent preview of where piece will land.

**Parameters:**
- `piece` (Piece): Current piece
- `ghostY` (Number): Calculated landing Y position

**Rendering:**
- Renders piece shape at ghostY position
- Uses 0.3 opacity for transparency
- Same shape as current piece

---

#### renderNextPiece(piece, x, y, scale)
```javascript
renderNextPiece(piece, x, y, scale) → void
```
Renders preview of next piece in side panel.

**Parameters:**
- `piece` (Piece): Next piece to preview
- `x` (Number): Render X position
- `y` (Number): Render Y position
- `scale` (Number): Scale factor (default: 0.5)

**Rendering:**
- Renders smaller version of piece
- Centered at specified position
- Used for "Next Piece" UI panel

---

## Rendering Details

### Ball Rendering
```javascript
// Standard ball
ctx.fillStyle = ballColor;
ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
ctx.fill();
```

### Grid Lines
```javascript
// Subtle grid outline
ctx.strokeStyle = '#333333';
ctx.lineWidth = 1;
ctx.strokeRect(gridX, gridY, gridWidth, gridHeight);
```

### Colors
- Background: From `config.json` (`colors.backgroundColor`)
- Ball colors: From `config.json` (`colors.ballColors` array)
- Grid lines: Hard-coded #333333

## Usage Example

```javascript
import Renderer from './Renderer.js';

// Create renderer
const canvas = document.getElementById('gameCanvas');
const renderer = new Renderer(canvas);
renderer.initialize();

// In game loop
function render() {
  // Clear canvas
  renderer.clear();
  
  // Render locked balls
  renderer.renderGrid(grid);
  
  // Render ghost piece preview
  const ghostY = calculateGhostPosition(currentPiece);
  renderer.renderGhostPiece(currentPiece, ghostY);
  
  // Render active piece
  renderer.renderPiece(currentPiece);
  
  // Render next piece preview
  renderer.renderNextPiece(nextPiece, 500, 100, 0.5);
}
```

## Testing
- 3 unit tests covering:
  - Renderer initialization
  - Canvas context setup
  - Clear functionality

**Test Coverage:** Basic API coverage (visual rendering difficult to unit test)

## Future Enhancements
- Special ball visual indicators (glow, particles)
- Clear animation effects
- Cascade visual feedback
- UI overlays (score, level, timer)
