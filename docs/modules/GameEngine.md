# GameEngine Module Documentation

## Overview
Core game loop and state management for the Ball Drop Puzzle Game.

## Responsibility
- Main game loop execution
- State transitions (menu, playing, paused, game over)
- Piece spawning and lifecycle
- Matching and cascade orchestration
- Game over detection

## Dependencies
- Grid
- Piece
- Ball
- InputHandler
- Renderer
- ScoreManager
- LevelManager
- AudioManager
- UIManager
- ConfigManager
- EventEmitter

## Public API

### Constructor
```javascript
constructor()
```
Initializes the game engine with default state.

### Methods

#### initialize()
```javascript
initialize() → Promise<void>
```
Sets up all game systems, loads configuration, and prepares for gameplay.

**Returns:** Promise that resolves when initialization is complete

---

#### start(difficulty, level)
```javascript
start(difficulty, level) → void
```
Begins a new game session at specified difficulty and level.

**Parameters:**
- `difficulty` (Number): Difficulty level (1-5)
- `level` (Number): Starting level number

---

#### pause()
```javascript
pause() → void
```
Pauses the current game, stopping all timers and input processing.

---

#### resume()
```javascript
resume() → void
```
Resumes a paused game, restarting timers and input processing.

---

#### restart()
```javascript
restart() → void
```
Restarts the current level from the beginning.

---

#### update(deltaTime)
```javascript
update(deltaTime) → void
```
Main game loop update function, called every frame.

**Parameters:**
- `deltaTime` (Number): Time elapsed since last frame in milliseconds

---

#### handlePieceLock()
```javascript
handlePieceLock() → void
```
Processes piece locking into grid and triggers matching checks.

---

#### handleMatching()
```javascript
handleMatching() → void
```
Executes matching algorithm with cascade support.

---

#### spawnNextPiece()
```javascript
spawnNextPiece() → void
```
Generates and spawns the next falling piece.

---

#### checkGameOver()
```javascript
checkGameOver() → Boolean
```
Checks if game over conditions are met.

**Returns:** True if game is over, false otherwise

---

## Internal State

```javascript
{
	state: GameState,           // MENU, PLAYING, PAUSED, GAME_OVER, LEVEL_COMPLETE
	currentPiece: Piece,        // Currently falling piece
	nextPiece: Piece,           // Next piece to spawn
	dropTimer: Number,          // Time accumulator for auto-drop
	isPaused: Boolean,          // Pause flag
	grid: Grid                  // Game board state
}
```

## Events Emitted

- `gameStartEvent` - When game begins
- `gamePauseEvent` - When game pauses
- `gameResumeEvent` - When game resumes
- `gameOverEvent` - When game ends
- `levelCompleteEvent` - When level is completed
- `pieceSpawnEvent` - When new piece spawns
- `pieceLockEvent` - When piece locks into grid
- `matchFoundEvent` - When matches are detected
- `cascadeEvent` - When cascade occurs

## Events Listened To

- `moveLeftEvent` - Player moves piece left
- `moveRightEvent` - Player moves piece right
- `rotateEvent` - Player rotates piece
- `hardDropEvent` - Player drops piece
- `pauseEvent` - Player pauses game
- `restartEvent` - Player restarts game

## Implementation Notes

### Game Loop Pattern
Uses requestAnimationFrame for smooth 60 FPS rendering.

### Cascade Algorithm
Iterative matching and clearing until no more matches found, with cascade bonus tracking.

### Blocking Ball Spawns
Probabilistic spawns based on level and difficulty, always at center-top position.

## Testing Considerations

- Test all state transitions
- Verify cascade depth limits
- Check game over detection edge cases
- Validate piece collision detection
- Test pause/resume state preservation

## Version
1.0

## Last Updated
December 19, 2025
