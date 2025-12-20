# Implementation Plan: Ball Drop Puzzle Game

## 1. Project Architecture

### 1.1 Technology Stack
- **HTML5:** Structure and canvas/SVG rendering
- **CSS3:** Styling and layout
- **Vanilla JavaScript (ES6+):** Game logic
- **JSON:** Configuration management
- **LocalStorage API:** Data persistence
- **Web Audio API:** Sound generation

### 1.2 Design Patterns
- **Module Pattern:** Each game component as independent module
- **Observer Pattern:** Event system for game state changes
- **Strategy Pattern:** Different ball behaviors (normal, exploding, painting, blocking)
- **Factory Pattern:** Piece and ball generation
- **MVC-like:** Separation of game state, rendering, and input handling

---

## 2. Project Structure

```
ball-drop-game/
├── index.html
├── config.json
├── README.md
├── docs/
│   ├── FUNCTIONAL_SPEC.md
│   ├── IMPLEMENTATION_PLAN.md
│   ├── modules/
│   │   ├── GameEngine.md
│   │   ├── Grid.md
│   │   ├── Piece.md
│   │   ├── Ball.md
│   │   ├── InputHandler.md
│   │   ├── Renderer.md
│   │   ├── ScoreManager.md
│   │   ├── LevelManager.md
│   │   ├── AudioManager.md
│   │   ├── StorageManager.md
│   │   └── ConfigManager.md
├── src/
│   ├── main.js
│   ├── modules/
│   │   ├── GameEngine.js
│   │   ├── Grid.js
│   │   ├── Piece.js
│   │   ├── Ball.js
│   │   ├── InputHandler.js
│   │   ├── Renderer.js
│   │   ├── ScoreManager.js
│   │   ├── LevelManager.js
│   │   ├── AudioManager.js
│   │   ├── StorageManager.js
│   │   ├── ConfigManager.js
│   │   └── UIManager.js
│   ├── utils/
│   │   ├── Constants.js
│   │   ├── EventEmitter.js
│   │   └── Helpers.js
│   └── styles/
│       └── main.css
└── tests/
    ├── unit/
    │   ├── Grid.test.js
    │   ├── Piece.test.js
    │   ├── Ball.test.js
    │   ├── ScoreManager.test.js
    │   └── LevelManager.test.js
    └── integration/
        └── GameFlow.test.js
```

---

## 3. Module Specifications

### 3.1 ConfigManager.js
**Responsibility:** Load and provide access to config.json  
**Dependencies:** None  
**Exports:**
```javascript
{
	loadConfig: async function() → Promise<Config>,
	get: function(key) → any,
	getAll: function() → Config
}
```

**Key Methods:**
- `loadConfig()` - Fetch and parse config.json
- `get(key)` - Retrieve specific config value (supports dot notation: 'colors.ball.red')
- `getAll()` - Return entire config object

---

### 3.2 Constants.js
**Responsibility:** Define game constants and enums  
**Dependencies:** None  
**Exports:**
```javascript
{
	GRID_ROWS: 25,
	GRID_COLS: 15,
	BALL_TYPES: { NORMAL, EXPLODING, PAINTER_H, PAINTER_V, PAINTER_D, BLOCKING },
	DIRECTIONS: { UP, DOWN, LEFT, RIGHT },
	GAME_STATES: { MENU, PLAYING, PAUSED, GAME_OVER, LEVEL_COMPLETE }
}
```

---

### 3.3 EventEmitter.js
**Responsibility:** Pub/Sub event system for module communication  
**Dependencies:** None  
**Exports:**
```javascript
{
	on: function(event, callback),
	off: function(event, callback),
	emit: function(event, data)
}
```

**Usage Example:**
```javascript
EventEmitter.on('pieceLockedEvent', (piece) => {
	// Handle piece lock
});
EventEmitter.emit('pieceLockedEvent', currentPiece);
```

---

### 3.4 Ball.js
**Responsibility:** Ball object with type, color, and behavior  
**Dependencies:** Constants, ConfigManager  
**Exports:**
```javascript
class Ball {
	constructor(type, color);
	getType();
	getColor();
	setColor(newColor);
	isMatchable();
	isSpecial();
}
```

**Ball Types:**
- `NORMAL` - Standard colored ball
- `EXPLODING` - Clears 7×7 area when matched
- `PAINTER_H` - Paints horizontal line
- `PAINTER_V` - Paints vertical line
- `PAINTER_D` - Paints diagonal line
- `BLOCKING` - Cannot be matched, only exploded

---

### 3.5 Piece.js
**Responsibility:** Falling piece composition and rotation  
**Dependencies:** Ball, Constants, ConfigManager  
**Exports:**
```javascript
class Piece {
	constructor(shapeType, balls);
	rotate();
	getShape();
	getBalls();
	getPosition();
	setPosition(x, y);
	getWidth();
	getHeight();
}
```

**Key Methods:**
- `rotate()` - Rotate piece 90° clockwise (matrix transformation)
- `getShape()` - Return 2D array representing piece layout
- `getBalls()` - Return array of Ball objects in piece

**Shape Definitions:** 8 Tetromino shapes stored as 2D boolean arrays

---

### 3.6 Grid.js
**Responsibility:** Game board state management  
**Dependencies:** Ball, Constants  
**Exports:**
```javascript
class Grid {
	constructor(rows, cols);
	isValidPosition(piece, x, y);
	placePiece(piece, x, y);
	getBall(row, col);
	setBall(row, col, ball);
	removeBall(row, col);
	findMatches();
	applyGravity();
	isColumnFull(col);
	clear();
}
```

**Key Methods:**
- `isValidPosition(piece, x, y)` - Check collision
- `placePiece(piece, x, y)` - Lock piece balls into grid
- `findMatches()` - Return array of match objects (coords, type, direction)
- `applyGravity()` - Drop floating balls, return true if any moved
- `isColumnFull(col)` - Check if column reached top (game over condition)

**Internal Grid Representation:**
```javascript
// 2D array: grid[row][col] = Ball | null
this.grid = Array(rows).fill(null).map(() => Array(cols).fill(null));
```

---

### 3.7 InputHandler.js
**Responsibility:** Keyboard input processing  
**Dependencies:** EventEmitter, Constants  
**Exports:**
```javascript
{
	initialize: function(),
	enableInput: function(),
	disableInput: function()
}
```

**Key Events Emitted:**
- `moveLeftEvent`
- `moveRightEvent`
- `rotateEvent`
- `hardDropEvent`
- `pauseEvent`
- `restartEvent`

**Implementation:**
- Listen for keydown events
- Debounce/throttle for smooth movement
- Handle key repeat for continuous movement

---

### 3.8 Renderer.js
**Responsibility:** Visual rendering of game state  
**Dependencies:** Grid, Piece, Ball, ConfigManager  
**Exports:**
```javascript
class Renderer {
	constructor(canvasElement);
	initialize();
	renderGrid(grid);
	renderPiece(piece, x, y);
	renderNextPiece(piece);
	renderAnimation(animationType, data);
	clear();
}
```

**Rendering Methods:**
- `renderGrid(grid)` - Draw all locked balls
- `renderPiece(piece, x, y)` - Draw falling piece
- `renderNextPiece(piece)` - Draw preview
- `renderAnimation(type, data)` - Handle match/explosion/painting animations

**Visual Techniques:**
- Canvas 2D API or SVG (decision based on performance testing)
- Color gradients for balls (configurable)
- Particle effects for explosions
- Wave effects for painting

---

### 3.9 ScoreManager.js
**Responsibility:** Score calculation and tracking  
**Dependencies:** ConfigManager, EventEmitter  
**Exports:**
```javascript
class ScoreManager {
	constructor();
	reset();
	addScore(ballsCleared, cascadeLevel, isFullRow);
	getCurrentLevelScore();
	getTotalScore();
	calculatePoints(ballsCleared, cascadeLevel, difficulty);
}
```

**Scoring Logic:**
```javascript
calculatePoints(ballsCleared, cascadeLevel, difficulty) {
	let basePoints = 0;
	
	// Base calculation (1-10: 1pt, 11-15: 2pt, etc.)
	for (let i = 1; i <= ballsCleared; i++) {
		if (i <= 10) {
			basePoints += 1;
		} else {
			const tier = Math.floor((i - 11) / 5);
			basePoints += Math.pow(2, tier + 1);
		}
	}
	
	// Cascade bonus (3 * 2^cascadeLevel)
	const cascadeBonus = cascadeLevel > 0 ? 3 * Math.pow(2, cascadeLevel - 1) : 0;
	
	// Difficulty multiplier
	const difficultyMultiplier = [1, 1.5, 2, 2.5, 3][difficulty - 1];
	
	return Math.floor((basePoints + cascadeBonus) * difficultyMultiplier);
}
```

---

### 3.10 LevelManager.js
**Responsibility:** Level/difficulty progression and timing  
**Dependencies:** ConfigManager, EventEmitter, StorageManager  
**Exports:**
```javascript
class LevelManager {
	constructor();
	startLevel(difficulty, level);
	updateTimer(deltaTime);
	completeLevel();
	getCurrentLevel();
	getCurrentDifficulty();
	getTimeRemaining();
	getDropSpeed();
	getBlockingBallProbability();
	getAvailableColors();
	isLevelUnlocked(difficulty, level);
}
```

**Key Methods:**
- `startLevel(difficulty, level)` - Initialize level with config
- `updateTimer(deltaTime)` - Countdown, emit levelCompleteEvent at 0
- `getDropSpeed()` - Calculate based on difficulty + level
- `getBlockingBallProbability()` - Calculate spawn chance
- `getAvailableColors()` - Return color array based on level

**Level Data:**
```javascript
{
	difficulty: 1-5,
	level: 1-∞,
	timeRemaining: 15.0,
	pieceCount: 0,
	dropSpeed: calculated,
	colorsUnlocked: [...]
}
```

---

### 3.11 AudioManager.js
**Responsibility:** Sound effect generation and playback  
**Dependencies:** ConfigManager  
**Exports:**
```javascript
class AudioManager {
	constructor();
	initialize();
	playSound(soundType);
	setVolume(volume);
	mute();
	unmute();
}
```

**Sound Types:**
- `ROTATE` - Short click
- `MOVE` - Subtle tick
- `LOCK` - Thud/click
- `MATCH` - Rising tone (pitch varies by cascade level)
- `EXPLOSION` - Boom with decay
- `PAINT` - Whoosh
- `LEVEL_COMPLETE` - Victory jingle
- `GAME_OVER` - Descending tone

**Implementation:**
- Web Audio API for programmatic sounds
- Oscillators for tones
- Noise generators for effects
- Envelope (ADSR) for shaping

---

### 3.12 StorageManager.js
**Responsibility:** LocalStorage persistence  
**Dependencies:** None  
**Exports:**
```javascript
{
	saveHighScore: function(difficulty, level, score),
	getHighScore: function(difficulty, level),
	unlockLevel: function(difficulty, level),
	getUnlockedLevels: function(difficulty),
	saveSettings: function(settings),
	getSettings: function()
}
```

**Storage Keys:**
- `ballDropGame_highScores` - JSON object of scores
- `ballDropGame_unlockedLevels` - JSON object of unlocked levels
- `ballDropGame_settings` - JSON object of user preferences

---

### 3.13 UIManager.js
**Responsibility:** UI element updates (HUD, menus, overlays)  
**Dependencies:** EventEmitter  
**Exports:**
```javascript
class UIManager {
	constructor();
	initialize();
	updateScore(levelScore, totalScore);
	updateTimer(timeRemaining);
	updateLevelInfo(difficulty, level);
	showMenu();
	showPauseScreen();
	showGameOverScreen(score, highScore, isNewRecord);
	showLevelCompleteScreen();
}
```

**UI Elements:**
- Score displays
- Timer display
- Difficulty/level indicators
- Menu screens
- Modal overlays (pause, game over, level select)

---

### 3.14 GameEngine.js
**Responsibility:** Core game loop and state management  
**Dependencies:** All other modules  
**Exports:**
```javascript
class GameEngine {
	constructor();
	initialize();
	start(difficulty, level);
	pause();
	resume();
	restart();
	update(deltaTime);
	handlePieceLock();
	handleMatching();
	spawnNextPiece();
	checkGameOver();
}
```

**Game Loop:**
```javascript
update(deltaTime) {
	// 1. Update timer
	this.levelManager.updateTimer(deltaTime);
	
	// 2. Handle piece dropping
	if (!this.isPaused) {
		this.dropTimer += deltaTime;
		if (this.dropTimer >= this.levelManager.getDropSpeed()) {
			this.dropCurrentPiece();
			this.dropTimer = 0;
		}
	}
	
	// 3. Handle blocking ball spawns
	this.checkBlockingBallSpawn();
	
	// 4. Check game over
	this.checkGameOver();
	
	// 5. Render
	this.render();
}
```

**Matching Algorithm:**
```javascript
handleMatching() {
	let cascadeLevel = 0;
	let totalBallsCleared = 0;
	
	do {
		// Find all matches
		const matches = this.grid.findMatches();
		
		if (matches.length === 0) {
			break;
		}
		
		// Process special balls first
		this.processExplosions(matches);
		this.processPainting(matches);
		
		// Clear standard matches
		const cleared = this.clearMatches(matches);
		totalBallsCleared += cleared;
		
		// Apply gravity
		this.grid.applyGravity();
		
		cascadeLevel++;
		
		// Render cascade animation
		this.renderer.renderAnimation('cascade', cascadeLevel);
		
	} while (true); // Loop until no more matches
	
	// Award points
	if (totalBallsCleared > 0) {
		this.scoreManager.addScore(
			totalBallsCleared,
			cascadeLevel,
			this.levelManager.getCurrentDifficulty()
		);
	}
}
```

---

## 4. Development Phases

### Phase 1: Core Foundation (Week 1)
**Goal:** Basic game structure and rendering

**Tasks:**
1. ✅ Set up project structure
2. ✅ Create config.json schema
3. ✅ Implement ConfigManager
4. ✅ Implement Constants and EventEmitter utilities
5. ✅ Create Ball class
6. ✅ Create Piece class with 8 shapes
7. ✅ Implement Grid class
8. ✅ Basic Renderer (grid + piece drawing)
9. ✅ Simple InputHandler
10. ✅ Basic GameEngine (initialization only)

**Deliverable:** Static display of game board with manually placed pieces

---

### Phase 2: Core Gameplay (Week 2)
**Goal:** Functional Tetris-like mechanics

**Tasks:**
1. ✅ Implement piece dropping logic
2. ✅ Add collision detection
3. ✅ Implement rotation
4. ✅ Add horizontal movement
5. ✅ Add hard drop
6. ✅ Implement piece locking
7. ✅ Create PieceFactory for random generation
8. ✅ Add next piece preview
9. ✅ Basic scoring (no special balls)

**Deliverable:** Playable basic Tetris-like game

---

### Phase 3: Matching System (Week 3)
**Goal:** Color matching and clearing

**Tasks:**
1. ✅ Implement match detection (horizontal, vertical, diagonal)
2. ✅ Add clear animation
3. ✅ Implement gravity/cascade system
4. ✅ Add cascade counter
5. ✅ Integrate scoring with cascades
6. ✅ Test edge cases (simultaneous matches, full board)

**Deliverable:** Full matching and cascade system

---

### Phase 4: Special Balls (Week 4)
**Goal:** Add exploding, painting, blocking balls

**Tasks:**
1. ✅ Implement Ball type system
2. ✅ Add exploding ball logic (7×7 clear)
3. ✅ Implement explosion animation
4. ✅ Add painting ball variants (H, V, D)
5. ✅ Implement painting logic
6. ✅ Add painting animation
7. ✅ Implement blocking ball spawn
8. ✅ Add blocking ball rendering
9. ✅ Configure spawn probabilities

**Deliverable:** All special ball types functional

---

### Phase 5: Level & Difficulty System (Week 5)
**Goal:** Full progression system

**Tasks:**
1. ✅ Implement LevelManager
2. ✅ Add level timer
3. ✅ Implement difficulty settings
4. ✅ Add color unlock progression
5. ✅ Implement drop speed scaling
6. ✅ Add blocking ball frequency scaling
7. ✅ Create level select UI
8. ✅ Implement level unlock system

**Deliverable:** Complete level/difficulty progression

---

### Phase 6: UI & Polish (Week 6)
**Goal:** Full user interface

**Tasks:**
1. ✅ Create main menu
2. ✅ Add pause screen
3. ✅ Create game over screen
4. ✅ Add level complete screen
5. ✅ Implement HUD (score, timer, level info)
6. ✅ Add visual polish (gradients, shadows)
7. ✅ Implement all animations
8. ✅ Add particle effects

**Deliverable:** Complete visual experience

---

### Phase 7: Audio (Week 7)
**Goal:** Sound effects and audio feedback

**Tasks:**
1. ✅ Implement AudioManager
2. ✅ Create sound generators (Web Audio API)
3. ✅ Add all sound effects
4. ✅ Implement volume control
5. ✅ Add mute toggle
6. ✅ Test audio timing with animations

**Deliverable:** Full audio experience

---

### Phase 8: Persistence (Week 8)
**Goal:** Save/load system

**Tasks:**
1. ✅ Implement StorageManager
2. ✅ Add high score saving
3. ✅ Implement level unlock persistence
4. ✅ Add settings persistence
5. ✅ Create data migration system (version handling)
6. ✅ Test localStorage limits

**Deliverable:** Full data persistence

---

### Phase 9: Testing & Bug Fixes (Week 9)
**Goal:** Comprehensive testing

**Tasks:**
1. ✅ Write unit tests for all modules
2. ✅ Create integration tests
3. ✅ Performance testing (60 FPS target)
4. ✅ Edge case testing
5. ✅ Cross-browser testing (Chrome, Edge)
6. ✅ Bug fixing
7. ✅ Code review and refactoring

**Deliverable:** Stable, tested codebase

---

### Phase 10: Documentation & Deployment (Week 10)
**Goal:** Final polish and release

**Tasks:**
1. ✅ Complete module documentation
2. ✅ Write README with instructions
3. ✅ Add code comments
4. ✅ Create user guide
5. ✅ Optimize assets
6. ✅ Minify/bundle code (if needed)
7. ✅ Deploy to hosting
8. ✅ Final QA pass

**Deliverable:** Shipped game!

---

## 5. Testing Strategy

### 5.1 Unit Tests

**Grid.test.js:**
```javascript
describe('Grid', () => {
	test('isValidPosition detects collisions');
	test('placePiece locks balls correctly');
	test('findMatches detects horizontal matches');
	test('findMatches detects vertical matches');
	test('findMatches detects diagonal matches');
	test('applyGravity drops floating balls');
	test('isColumnFull detects game over');
});
```

**Piece.test.js:**
```javascript
describe('Piece', () => {
	test('rotate transforms shape correctly');
	test('all 8 shapes defined correctly');
	test('getWidth/getHeight calculate bounds');
});
```

**ScoreManager.test.js:**
```javascript
describe('ScoreManager', () => {
	test('calculates base score correctly (1-10 balls)');
	test('calculates doubling score (11+ balls)');
	test('applies cascade bonus correctly');
	test('applies difficulty multiplier');
	test('awards full row bonus');
});
```

**LevelManager.test.js:**
```javascript
describe('LevelManager', () => {
	test('timer counts down correctly');
	test('drop speed scales with level');
	test('blocking ball probability increases');
	test('colors unlock at correct levels');
	test('level unlock persists');
});
```

### 5.2 Integration Tests

**GameFlow.test.js:**
```javascript
describe('Game Flow', () => {
	test('complete game loop executes');
	test('piece spawns after lock');
	test('matching triggers cascade');
	test('game over triggers on column full');
	test('level complete triggers on timer 0');
	test('high score saves correctly');
});
```

### 5.3 Performance Tests
- Measure FPS during heavy cascade scenarios
- Test with full grid (25×15 = 375 balls)
- Profile rendering bottlenecks
- Optimize critical paths

---

## 6. Code Standards Compliance

### 6.1 Module Structure Template
```javascript
/**
 * ModuleName.js
 * 
 * Description: Brief description of module responsibility
 * 
 * Dependencies: List of required modules
 * 
 * Exports: List of public API
 */

import { ConfigManager } from './ConfigManager.js';
import { CONSTANTS } from '../utils/Constants.js';

/**
 * Class or Module Description
 */
class ModuleName {
	
	/**
	 * Constructor description
	 * @param {Type} paramName - Parameter description
	 */
	constructor(paramName) {
		this.property = paramName;
	}
	
	/**
	 * Method description
	 * @param {Type} paramName - Parameter description
	 * @returns {Type} Return value description
	 */
	methodName(paramName) {
		const hasCondition = this._checkCondition(paramName);
		
		// Comment explaining conditional block
		if (hasCondition) {
			return this._handleSuccess();
		}
		else {
			return this._handleFailure();
		}
	}
	
	/**
	 * Private helper method
	 */
	_checkCondition(value) {
		const isValid = value !== null;
		const isPositive = value > 0;
		
		// Both conditions must be met
		if (isValid && isPositive) {
			return true;
		}
		else {
			return false;
		}
	}
}

export { ModuleName };
```

### 6.2 Standards Checklist
- ✅ All functions have JSDoc headers
- ✅ All conditional blocks have comments
- ✅ No standalone `if` statements (always use `else`)
- ✅ Complex boolean logic broken into named variables
- ✅ All statements end with semicolons
- ✅ No trailing spaces
- ✅ Tabs for indentation (not spaces)
- ✅ DRY principle applied
- ✅ SOLID principles followed
- ✅ Modular design
- ✅ Unit testable

---

## 7. Configuration File Structure

See `config.json` (created separately)

---

## 8. Risk Assessment & Mitigation

### 8.1 Performance Risks
**Risk:** Cascade calculations with full board may lag  
**Mitigation:** 
- Optimize match detection with spatial indexing
- Limit cascade depth (emergency break at 10 levels)
- Use requestAnimationFrame for smooth rendering

### 8.2 Browser Compatibility
**Risk:** Web Audio API differences across Chromium versions  
**Mitigation:**
- Test on Chrome, Edge, Brave
- Fallback to silent mode if Audio API fails
- Feature detection before use

### 8.3 LocalStorage Limits
**Risk:** Storage quota exceeded with many high scores  
**Mitigation:**
- Store only top score per (difficulty, level)
- Implement data pruning for old records
- Catch quota exceeded errors

### 8.4 Complexity Creep
**Risk:** Special ball interactions become too complex  
**Mitigation:**
- Strict priority order (exploding → painting → standard)
- Comprehensive unit tests for edge cases
- Clear documentation of interaction rules

---

## 9. Future Extensibility

### 9.1 Plugin Architecture
Design modules to allow:
- Custom ball types (add new behaviors)
- Custom piece shapes (beyond 8 standard)
- Custom scoring algorithms
- Theme system for graphics

### 9.2 Data Export
- JSON export of high scores for backup
- Replay system (record input sequences)

### 9.3 Mobile Support
- Touch event handlers (swipe, tap)
- Responsive canvas sizing
- Virtual D-pad overlay

---

## 10. Development Tools

### 10.1 Recommended Tools
- **Code Editor:** VS Code
- **Browser DevTools:** Chrome DevTools
- **Testing:** Jest or Mocha
- **Linting:** ESLint with custom rules for coding standards
- **Version Control:** Git

### 10.2 Build Process
**For V1:** No build process (vanilla JS)  
**For Future:** Consider:
- Webpack/Rollup for bundling
- Babel for older browser support
- Minification for production

---

## 11. Launch Checklist

### 11.1 Pre-Launch
- [ ] All unit tests passing
- [ ] Integration tests passing
- [ ] Performance meets 60 FPS target
- [ ] All animations smooth
- [ ] All sounds working
- [ ] High scores persist correctly
- [ ] Cross-browser tested
- [ ] Documentation complete
- [ ] README written
- [ ] Code commented
- [ ] No console errors

### 11.2 Launch Day
- [ ] Deploy to web host
- [ ] Test live deployment
- [ ] Share with testers
- [ ] Monitor for bugs
- [ ] Collect feedback

### 11.3 Post-Launch
- [ ] Bug fix iteration
- [ ] Balance tweaking based on feedback
- [ ] Performance optimization
- [ ] Plan V2 features

---

**Document Version:** 1.0  
**Date:** December 19, 2025  
**Estimated Timeline:** 10 weeks  
**Status:** Ready for Development
