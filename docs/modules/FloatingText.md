# FloatingTextManager Module Documentation

## Overview
Visual feedback system for displaying animated floating text (score popups) in the Ball Drop Puzzle Game.

## Responsibility
- Create and manage floating text animations
- Animate text upward with fade-out effect
- Clean up expired animations
- Render text overlays on canvas

## Architecture
**Pattern:** Class (instantiated by GameEngine)  
**Export:** Named class export

## Dependencies
- Constants

## Public API

### Constructor
```javascript
constructor()
```
Creates a new FloatingTextManager with empty active text array.

**Example:**
```javascript
const floatingTextManager = new FloatingTextManager();
```

---

### Methods

#### add(text, x, y, color)
```javascript
add(text, x, y, color) → void
```
Creates a new floating text animation at specified position.

**Parameters:**
- `text` (String): Text to display (e.g., "+10", "+50")
- `x` (Number): Starting x-coordinate (canvas pixels)
- `y` (Number): Starting y-coordinate (canvas pixels)
- `color` (String): Text color (CSS color string, default: 'white')

**Example:**
```javascript
floatingTextManager.add('+25', 300, 400, 'white');
```

---

#### update(deltaTime)
```javascript
update(deltaTime) → void
```
Updates all active floating text animations.

**Parameters:**
- `deltaTime` (Number): Time elapsed since last update (milliseconds)

**Behavior:**
- Moves text upward based on configured distance and duration
- Fades opacity from 1.0 to 0.0 linearly
- Removes expired animations (when age exceeds duration)

**Example:**
```javascript
// In game loop
const deltaTime = currentTime - lastTime;
floatingTextManager.update(deltaTime);
```

---

#### render(ctx)
```javascript
render(ctx) → void
```
Renders all active floating text to canvas context.

**Parameters:**
- `ctx` (CanvasRenderingContext2D): Canvas 2D rendering context

**Rendering:**
- Font: Bold 20px sans-serif
- Text alignment: Center
- Shadow: Black 2px blur for visibility
- Alpha: Based on animation progress

**Example:**
```javascript
floatingTextManager.render(canvasContext);
```

---

#### clear()
```javascript
clear() → void
```
Removes all active floating text animations.

**Example:**
```javascript
floatingTextManager.clear();
```

---

## Animation Behavior

### Configuration
Reads from ConfigManager (with defaults):
- `animations.floatingTextDuration` - Total animation duration (default: 1500ms)
- `animations.floatingTextDistance` - Upward travel distance (default: 50 pixels)

### Animation Properties
Each floating text object contains:
```javascript
{
  text: "+25",           // Display text
  x: 300,               // X position (pixels)
  y: 400,               // Y position (pixels)
  startY: 400,          // Starting Y position
  color: 'white',       // Text color
  age: 0,               // Current age (ms)
  duration: 1500,       // Total duration (ms)
  distance: 50          // Travel distance (pixels)
}
```

### Animation Formula
```javascript
// Vertical position
currentY = startY - (distance * progress)

// Opacity
opacity = 1.0 - progress

// Where progress = age / duration (0.0 to 1.0)
```

## Usage Example

```javascript
import { FloatingTextManager } from './FloatingText.js';

// Create manager
const floatingTextManager = new FloatingTextManager();

// Add floating text when balls cleared
EventEmitter.on(CONSTANTS.EVENTS.BALLS_CLEARED, (data) => {
  const points = calculatePoints(data.count);
  floatingTextManager.add(
    `+${points}`,
    matchCenterX,
    matchCenterY,
    'white'
  );
});

// In game loop
function gameLoop(timestamp) {
  const deltaTime = timestamp - lastTime;
  
  // Update animations
  floatingTextManager.update(deltaTime);
  
  // Render to canvas
  floatingTextManager.render(ctx);
  
  lastTime = timestamp;
  requestAnimationFrame(gameLoop);
}

// Clear on game restart
floatingTextManager.clear();
```

## Visual Design

- **Font:** Bold 20px sans-serif for readability
- **Color:** White text (configurable per animation)
- **Shadow:** 2px black blur for contrast against any background
- **Animation:** Smooth upward float with linear fade
- **Duration:** 1.5 seconds (configurable)
- **Distance:** 50 pixels upward (configurable)

## Testing
- 11 unit tests covering:
  - Initialization
  - Adding text animations
  - Update behavior (position and opacity)
  - Upward movement calculation
  - Expiration and removal
  - Clear functionality
  - Mixed active/expired handling

**Test Coverage:** Full coverage of public API and animation logic
