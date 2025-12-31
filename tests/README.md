# Testing & Debugging Guide

## Quick Start

### Run Unit Tests
Open `tests/test-runner.html` in a Chromium browser to run all unit tests.

### Debug Rendering
Open `debug.html` in a Chromium browser to test individual components interactively.

### Run the Game
Open `index.html` in a Chromium browser to play the game.

**Important:** Use a local HTTP server to avoid CORS issues when loading config.json:
```powershell
# PowerShell
cd "c:\Users\stoml\OneDrive\Personal\coding"
python -m http.server 8000
# Then visit: http://localhost:8000
```

## Test Suites

### Unit Tests (`tests/unit/`)
- **test-helpers.js** - Tests for utility functions (clamp, randomInt, deepClone, etc.)
- **test-event-emitter.js** - Tests for pub/sub event system
- **test-ball.js** - Tests for Ball class (types, colors, special balls)
- **test-piece.js** - Tests for Piece class (rotation, positioning)
- **test-grid.js** - Tests for Grid class (collision, matching, gravity)
- **test-gravity-optimization.js** - Tests for optimized gravity (column-specific processing)
- **test-special-ball-interactions.js** - Tests for special ball chain reactions
- **test-game-modes.js** - Tests for game mode mechanics (classic, rising tide, etc.)

### Debug Tools (`debug.html`)
Interactive canvas testing:
- **Test Grid Rendering** - Renders grid with random balls
- **Test Piece Rendering** - Renders a T-piece
- **Test Special Balls** - Shows exploding, painter, and blocking balls with indicators
- **Test Rotation** - Demonstrates piece rotation
- **Console Log** - Real-time logging of operations

## Known Issues Fixed

### Issue 1: Config Loading Path
**Problem:** `fetch('../config.json')` failed with 404
**Fix:** Changed to `fetch('./config.json')` relative to HTML file

### Issue 2: Screen ID Mismatch  
**Problem:** main.js used `'menu-screen'` but HTML has `'menuScreen'`
**Fix:** Updated main.js to use correct IDs from HTML

### Issue 3: BALL_TYPES Import
**Problem:** Test files tried to import BALL_TYPES directly
**Fix:** Added named exports to Constants.js for convenience

## Phase 1 Status

✅ **Completed Modules:**
1. Constants.js - Game constants
2. EventEmitter.js - Pub/sub system
3. Helpers.js - Utility functions
4. ConfigManager.js - Config loader
5. Ball.js - Ball entities
6. Piece.js - Piece with rotation
7. Grid.js - Game board
8. Renderer.js - Canvas rendering
9. InputHandler.js - Keyboard input
10. GameEngine.js - Core engine
11. main.js - Entry point

✅ **Test Coverage:**
- Helpers: 15 tests
- EventEmitter: 5 tests
- Ball: 10 tests
- Piece: 7 tests
- Grid: 13 tests
- **Total: 50 unit tests**

## Next Steps

### Phase 2 - Core Gameplay
- Implement piece dropping (gravity)
- Add rotation with wall kicks
- Implement horizontal movement
- Add hard drop feature
- Piece locking mechanism
- PieceFactory for generation
- Game loop with requestAnimationFrame

### Testing Phase 2
Create integration tests for:
- Piece falling behavior
- Collision detection during movement
- Rotation edge cases
- Lock delay timing
