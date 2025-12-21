# Functional Specification: Ball Drop Puzzle Game

## 1. Game Overview

A Tetris-inspired puzzle game where colored ball pieces fall from the top and stack at the bottom. Players match 3+ balls of the same color to clear them and score points. The game features special balls (exploding, painting, blocking) and progressive difficulty across 5 difficulty levels with unlimited numbered levels within each.

**Platform:** Static HTML/JavaScript  
**Target Browsers:** Chromium-based browsers only  
**Technology:** Vanilla JavaScript with FOSS libraries as needed

---

## 2. Game Board & Grid

### 2.1 Grid Specifications
- **Dimensions:** 15 columns × 25 rows
- **Cell Type:** Each cell can contain a ball or be empty
- **Rendering:** Programmatic graphics (SVG/Canvas), encapsulated for future replacement

### 2.2 Visual Layout
```
┌─────────────────────────────────┐
│  Score | Level | Difficulty     │ ← Status Bar
├─────────────────────────────────┤
│                                 │
│     [15 columns × 25 rows]      │ ← Game Board
│         Game Grid               │
│                                 │
├─────────────────────────────────┤
│    Next Piece Preview           │ ← Preview Panel
└─────────────────────────────────┘
```

---

## 3. Game Pieces

### 3.1 Standard Pieces (8 Shapes - Tetris-style)
All pieces are composed of 4-6 colored balls arranged in these configurations:

1. **I-Piece:** 4 balls in a straight line
2. **O-Piece:** 6 balls in a 2×3 rectangle
3. **T-Piece:** 4 balls in T-shape
4. **L-Piece:** 5 balls in L-shape (3 vertical + 2 horizontal base)
5. **J-Piece:** 5 balls in reverse L-shape (3 vertical + 2 horizontal base)
6. **S-Piece:** 5 balls in S-shape (2-2-1 stagger)
7. **Z-Piece:** 5 balls in Z-shape (2-2-1 stagger)
8. **Single Ball:** 1 ball

**Note:** Variable ball counts (4-6) ensure each piece shape is visually distinct even when the same color.

### 3.2 Ball Colors
- **Starting Colors (Levels 1-2):** 3 colors (Red, Green, Blue)
- **Level 3:** 4 colors (add Yellow)
- **Level 7:** 5 colors (add Magenta)
- **Level 11:** 6 colors (add Cyan)
- **Level 15:** 7 colors (add Orange)
- **Level 19+:** 8 colors (add Purple)

**Color Palette:** RGB primaries + CMY secondaries (configurable via config.json)

### 3.3 Special Ball Types

#### 3.3.1 Exploding Balls (Implemented)
- **Appearance:** Distinct visual marker (e.g., star/burst pattern)
- **Spawn Rate:** 5% per ball in piece (configurable)
- **Behavior:** When 3+ match, clears a 7×7 area centered on match
- **Explosion Pattern:**
  - All matches: 7×7 grid-aligned square centered on the matched exploding balls
  - Multiple exploding balls: Separate 7×7 explosions per position
- **Clears:** All ball types including blocking balls within the 7×7 radius
- **Scoring:** All exploded balls counted and tracked via `BALLS_CLEARED` event
- **Visual Feedback:** Gold floating text shows count of balls destroyed

#### 3.3.2 Painting Balls (Implemented)
- **Types:** 3 variants
  - Horizontal Painter (↔)
  - Vertical Painter (↕)
  - Diagonal Painter (⤢)
- **Spawn Rate:** 5% per ball in piece (configurable, independent from exploding)
- **Behavior:** When 3+ match in their designated direction, entire line changes to the painting ball's color
- **Line Definition:**
  - Horizontal: Entire row
  - Vertical: Entire column
  - Diagonal: Entire diagonal line through the match
- **Match Re-Finding:** After painting, grid immediately re-checks for new matches
  - Newly painted balls can create immediate matches
  - Triggers additional cascades if matches found

#### 3.3.3 Blocking Balls (Implemented)
- **Appearance:** Distinct visual (gray/black with X pattern)
- **Spawn Method:** Drop individually from center-top of board (column 7-8)
- **Player Control:** None - they fall automatically at piece drop speed
- **Spawn Rate:** 
  - Base: 0.5% chance per piece dropped (configurable)
  - Increases with difficulty and level progression
  - Not before piece 50 on difficulty 1
  - Earlier on higher difficulties (configurable thresholds)
- **Removal:** Only by being caught in explosion radius (7×7 area)
- **Cannot:** Be matched, painted, or affected by normal clears
- **Behavior:** Falls like normal ball, stacks at bottom, persists until exploded

---

## 4. Game Mechanics

### 4.1 Piece Movement
- **Auto-Drop:** Pieces fall at configurable speed (increases per level)
- **Ghost Piece:** Semi-transparent outline shows where piece will land when hard dropped
- **Player Controls:**
  - **Left Arrow:** Move piece left
  - **Right Arrow:** Move piece right
  - **Up Arrow:** Rotate piece clockwise 90°
  - **Down Arrow:** Hard drop (instant fall to bottom)
  - **P Key:** Pause game
  - **R Key:** Restart game

### 4.2 Collision & Stacking
- Pieces stop when they collide with:
  - Bottom of grid
  - Another ball already in the grid
- **Lock Delay:** 500ms (configurable) before piece locks into position
  - Allows player to make final adjustments
  - Timer resets if piece moves or rotates while grounded

### 4.3 Matching & Clearing

#### 4.3.1 Match Detection
- **Minimum:** 3 balls of same color
- **Directions:** Horizontal, Vertical, All 4 Diagonals (↗ ↘ ↙ ↖)
- **Timing:** Check after each piece locks AND after each cascade drop

#### 4.3.2 Cascade System
1. Piece locks → Check for matches
2. Matches clear → Balls above drop down
3. After drop completes → Check for new matches
4. Repeat until no matches found

#### 4.3.3 Special Ball Interactions
**Priority Order:**
1. Exploding balls trigger first (if matched)
2. Painting balls apply color changes
3. Standard color matches clear
4. Cascade check repeats

**Blocking Ball Rules:**
- Not affected by painting
- Not affected by standard color matches
- Only removed by explosions or reaching bottom

### 4.4 Animation Timing (Implemented)
- **Configurable delays** between:
  - Piece lock → Match detection: `matchDetectionDelay` (default: 0ms)
  - Match clear animation: `clearAnimationDuration` (default: 100ms)
  - Ball drop speed: `dropAnimationSpeed` (default: 20ms per row)
  - Drop complete → Next match check: `cascadeCheckDelay` (default: 0ms)

**Clear Animation Sequence:**
1. Flash matched balls white 3 times (alternating original color/white)
2. Each flash: `clearAnimationDuration / 6` duration
3. Display floating point text showing score earned
4. Remove balls and update grid
5. Begin gravity animation

---

## 5. Scoring System

### 5.1 Base Scoring (Implemented)
- **Base Points:** 1 point per ball cleared (configurable)
- **Cascade Bonus Formula (Progressive Multipliers):**
  - Single cascade (no chain): Base points only (balls × 1)
  - 2nd cascade in chain: Progressive scoring begins
    - Level 1 balls: `count × basePoints × 1`
    - Level 2 balls: `count × basePoints × 2`
  - 3rd cascade in chain:
    - Level 1 balls: `count × basePoints × 1`
    - Level 2 balls: `count × basePoints × 2`
    - Level 3 balls: `count × basePoints × 3`
  - Formula: Each cascade level N gets balls cleared × basePoints × N
  - Example: 2x cascade with 3 balls (L1) + 5 balls (L2) = (3×1) + (5×2) = 13 points
  - Example: 3x cascade with 3 balls (L1) + 5 balls (L2) + 6 balls (L3) = (3×1) + (5×2) + (6×3) = 31 points

### 5.2 Visual Score Feedback (Implemented)
- **Floating Text System:** Color-coded feedback for different clear types
  - **Match Clears (White #FFFFFF):** Shows ball count (not points)
    - Appears at center of matched balls
    - Text: Number of balls cleared (e.g., "5")
    - Used for normal color matches
  - **Explosion Clears (Gold #FFD700):** Shows exploded ball count
    - Appears at center of all explosion positions
    - Text: Number of balls destroyed (e.g., "12")
    - Triggered when exploding balls detonate
  - **Cascade Bonuses (Blue #4080FF):** Shows cascade multiplier
    - Appears at center of game grid
    - Text: Cascade level (e.g., "2x CASCADE!", "3x CASCADE!")
    - Only shown for 2+ cascades
  - **Animation:** All text floats upward 50 pixels over 1 second, fading linearly with rgba opacity

### 5.3 Difficulty Multiplier (Implemented)
- **Difficulty 1:** 1.0x points
- **Difficulty 2:** 1.5x points
- **Difficulty 3:** 2.0x points
- **Difficulty 4:** 2.5x points
- **Difficulty 5:** 3.0x points

**Score Calculation:** `(ballCount × basePoints + cascadeBonuses) × difficultyMultiplier`

### 5.4 Score Display (Implemented)
- **Score Manager:** Singleton module tracking score via event system
  - Listens for `BALLS_CLEARED` events to accumulate ball counts per cascade level
  - Tracks `ballsPerLevel` array to support progressive cascade scoring
  - Listens for `CASCADE_COMPLETE` events (from GameEngine) to calculate and apply final score
  - Emits `SCORE_UPDATE` events for UI synchronization
  - Detailed console logging for debugging: `🎯 SCORE CALC: 8 balls, 2x cascade, L1(3×1=3) + L2(5×2=10), TOTAL=13`
- **Real-time UI Update:** Score display updates immediately after each cascade completes
- **Current Level Score:** Displayed in HUD
- **High Score:** localStorage persistence via PlayerManager

---

## 6. Level & Difficulty System

### 6.1 Difficulty Settings (1-5)
Each difficulty affects:
- **Drop Speed:** Faster on higher difficulties
- **Blocking Ball Frequency:** More frequent on higher difficulties
- **Blocking Ball Start:** Earlier piece counts on higher difficulties
- **Score Multiplier:** Higher on higher difficulties
- **Color Unlock Speed:** Same across all difficulties

### 6.2 Level Progression

#### 6.2.1 Level Duration
- **Time Limit:** 15 seconds (configurable)
- **Completion:** Survive full duration without game over

#### 6.2.2 Level Advancement
- **Success:** Timer reaches 0, board clears, advance to next level
- **Failure:** Any column reaches top row = Game Over
- **Infinite Levels:** No final level, continues indefinitely

#### 6.2.3 Level Unlocking
- Players start at Difficulty 1, Level 1
- Completing a level unlocks it for replay
- Can select any unlocked (difficulty, level) combination from menu
- Each combination tracks independent high score

### 6.3 Progressive Difficulty Within Levels
As level numbers increase (within same difficulty):
- Drop speed increases (configurable increment)
- Blocking ball spawn rate increases
- More colors unlock at specific levels (3, 7, 11, 15, 19)

---

## 7. User Interface

### 7.1 Main Game Screen
```
┌─────────────────────────────────────────────┐
│  DIFFICULTY: 3    LEVEL: 12    TIME: 8.3s  │
│  LEVEL SCORE: 1,234   TOTAL: 45,678        │
├─────────────────────────────────────────────┤
│                                             │
│          [Game Board 15×25]                 │
│                                             │
│                                             │
├─────────────────────────────────────────────┤
│    NEXT PIECE:   [Preview]                  │
└─────────────────────────────────────────────┘
```

### 7.2 Menu / Level Selection
- **Difficulty Selector:** 1-5 buttons
- **Level Grid:** Shows unlocked levels for selected difficulty
- **High Scores:** Display best score for each (difficulty, level)
- **Start Button:** Begin selected level

### 7.3 Pause Screen
- Overlay on game board
- Options: Resume, Restart, Return to Menu
- Displays current scores

### 7.4 Game Over Screen
- Show final level score
- Show total score
- Show high score for this (difficulty, level)
- Display "NEW HIGH SCORE!" if achieved
- Options: Retry, Menu

---

## 8. Audio & Visual Effects

### 8.1 Sound Effects (Implemented - Programmatic Web Audio API)
- **AudioManager:** Singleton managing all game audio with Web Audio API
  - **Sound Effects:**
    - Piece rotation (subtle beep)
    - Piece movement left/right (click)
    - Piece hard drop (thud)
    - Piece lock/land (clunk)
    - Match clear (escalating pitch per cascade level)
    - Explosion (bass boom)
    - Painting activation (whoosh)
    - Level complete (victory chime)
    - Game over (descending tone)
  - **Background Music:**
    - Procedurally generated ambient music loop
    - Tempo increases with difficulty level
  - **Volume Controls:**
    - Independent SFX and music volume sliders (0-100%)
    - Master mute toggle
    - Optimization: Skips audio processing entirely when volume is 0
  - **Audio Categories:**
    - SFX (one-shot sounds)
    - Music (looping background)
    - Both controlled independently

### 8.2 Visual Effects
- **Match Animation:** Balls flash/pulse before clearing
- **Explosion Animation:** Radial burst effect
- **Painting Animation:** Wave/ripple along painted line
- **Cascade Feedback:** Visual indicator for combo count
- **Blocking Ball:** Falling animation with distinct trail

---

## 9. Data Persistence

### 9.1 LocalStorage Schema
```json
{
  "highScores": {
    "difficulty_1": {
      "level_1": 1234,
      "level_2": 2345,
      ...
    },
    "difficulty_2": {
      ...
    }
  },
  "unlockedLevels": {
    "difficulty_1": [1, 2, 3, 4, 5],
    "difficulty_2": [1, 2],
    ...
  },
  "settings": {
    "soundEnabled": true,
    "volume": 0.7
  }
}
```

---

## 10. Configuration File (config.json)

All game parameters should be configurable via JSON:

### 10.1 Core Settings
- Grid dimensions (rows, columns)
- Time per level
- Starting drop speed
- Drop speed increment per level

### 10.2 Colors
- Ball color palette (hex codes for 8 colors)
- Background colors
- UI theme colors

### 10.3 Probabilities
- Special ball spawn rates (exploding, horizontal painter, vertical painter, diagonal painter)
- Blocking ball spawn rates per difficulty/level

### 10.4 Scoring
- Base points per ball
- Point doubling thresholds
- Row clear bonus
- Cascade bonus (initial and multiplier)
- Difficulty multipliers

### 10.5 Animation Timings
- Match detection delay
- Clear animation duration
- Drop animation speed
- Cascade delay between checks

### 10.6 Difficulty Curves
- Drop speed per difficulty level
- Blocking ball frequency per difficulty
- Blocking ball start piece per difficulty

### 10.7 Level Color Unlocks
- Levels at which each color unlocks

---

## 11. Edge Cases & Rules

### 11.1 Simultaneous Matches
- All matches detected simultaneously
- Special balls trigger in priority order (exploding → painting → standard)

### 11.2 Overlapping Explosions
- Multiple explosion zones combine (union of affected cells)

### 11.3 Painting + Matching
- Painted balls immediately re-checked for matches
- Can trigger additional cascades

### 11.4 Blocking Balls at Bottom
- When blocking ball reaches bottom, it stays there
- Does not clear even if surrounded by matches
- Only explosions can remove them

### 11.5 Game Over Condition
- Checked when new piece spawns
- If spawn position occupied → Game Over
- If any column reaches row 0 during piece lock → Game Over

### 11.6 Level Timer
- Countdown starts when level begins
- Pauses when game is paused
- Reaching 0:00 = Level Complete (if still alive)

---

## 12. Accessibility & Polish

### 12.1 Keyboard Controls
- All game functions accessible via keyboard
- No mouse required

### 12.2 Visual Clarity
- High contrast between ball colors
- Clear visual distinction for special balls
- Grid lines visible but subtle

### 12.3 Responsive Feedback
- Immediate visual response to all controls
- Audio feedback for all player actions

### 12.4 Performance
- Target: 60 FPS
- Efficient rendering (only redraw changed cells)

---

## 13. Future Enhancements (Out of Scope for V1)

- Mobile touch controls
- Multiplayer mode
- Power-up system
- Achievement system
- Daily challenges
- Leaderboards (online)
- Custom color themes
- Accessibility modes (colorblind-friendly palettes)

---

## 14. Implementation Status

### 14.1 Completed Features (Phases 1-9)
✅ **Core Foundation (Phase 1-2)**
- Project structure with modular architecture
- ConfigManager with config.json loading (156 configurable parameters)
- Constants and EventEmitter utilities
- Ball class with type system (NORMAL, BLOCKING, EXPLODING, HORIZONTAL_PAINTER, VERTICAL_PAINTER, DIAGONAL_PAINTER)
- Piece class with 8 shapes and rotation
- Grid class with comprehensive match detection
- Renderer with Canvas API
- InputHandler with keyboard controls
- GameEngine with game loop

✅ **Core Gameplay (Phase 2-3)**
- Piece dropping with gravity
- Collision detection
- Piece rotation (clockwise 90°)
- Horizontal movement (left/right)
- Hard drop (instant fall)
- Piece locking with configurable delay (default 500ms)
- PieceFactory with level-based color unlocking (3→8 colors at levels 1, 3, 7, 11, 15, 19)
- Next piece preview
- Ghost piece (drop location preview)
- Pause functionality

✅ **Matching & Scoring System (Phase 3-4)**
- Match detection (horizontal, vertical, diagonal in all 4 directions)
- Clear animation (3-flash white effect with configurable timing)
- Gravity/cascade system (automatic multi-cascade loops)
- Cascade counting tracked by GameEngine
- ScoreManager with event-driven architecture
- Progressive cascade scoring (Level 1: ×1, Level 2: ×2, Level 3: ×3, etc.)
- Difficulty multipliers (1.0x, 1.5x, 2.0x, 2.5x, 3.0x)
- Color-coded floating text system:
  - White: Normal match ball counts
  - Gold: Explosion ball counts
  - Blue: Cascade multipliers (2x, 3x, etc.)
- Real-time score display updates

✅ **Special Ball Effects (Phase 5)**
- Exploding balls: 7×7 area clear on match (configurable spawn rate: 5%)
- Horizontal/Vertical/Diagonal painters: Full line painting (configurable spawn rate: 5%)
- Blocking balls: Spawn system with difficulty/level scaling, explosion-only removal
- Painter re-matching: Painted balls immediately re-checked for new matches
- Explosion scoring: All cleared balls counted and displayed

✅ **Level & Difficulty System (Phase 6)**
- LevelManager module with 5 difficulty levels
- Level timer (configurable, default 15 seconds)
- Difficulty selection (1-5) with independent progression
- Level progression and unlocking system
- Drop speed scaling (configurable per difficulty)
- Blocking ball frequency scaling (configurable thresholds)
- Color unlocking at levels 1, 3, 7, 11, 15, 19
- Level survival condition (timer reaches 0 without game over)

✅ **Audio System (Phase 7)**
- AudioManager singleton with Web Audio API
- Programmatic sound effects:
  - Piece rotation, movement, drop, lock
  - Match clear (escalating pitch per cascade)
  - Explosion, painting activation
  - Level complete, game over
- Procedurally generated background music
- Independent SFX and music volume controls (0-100%)
- Master mute toggle
- Volume=0 optimization (skips audio processing entirely)

✅ **UI Screens & Menus (Phase 8)**
- Main menu with difficulty/level selection
- HUD with score, level, difficulty, timer display
- Pause overlay (Resume/Restart/Menu options)
- Game over screen with score display
- Level complete screen with progression
- Settings panel (audio controls, visual options)
- High score tracking and display per difficulty/level

✅ **Data Persistence (Phase 9)**
- PlayerManager with localStorage integration
- High score tracking per (difficulty, level) combination
- Level unlock persistence
- Player profile system with guest/named players
- Settings persistence (audio volumes, visual preferences)
- StatisticsTracker for match/clear/cascade analytics

✅ **Quality Assurance (Continuous)**
- 262+ unit tests across 14 test modules
- Comprehensive test coverage:
  - **Core Utilities:** Helpers (15 tests), EventEmitter (18 tests)
  - **Game Entities:** Ball (31 tests), Piece (36 tests), Grid (78 tests)
  - **Factories & Managers:** PieceFactory (17 tests), ScoreManager (25 tests), ConfigManager (12 tests), FloatingText (11 tests)
  - **Special Mechanics:** SpecialBalls (23 tests), StatisticsTracker (31 tests)
  - **Game Systems:** InputHandler (10 tests), GameEngine (12 tests), PlayerManager (12 tests), Renderer (3 tests)
- Test runner with async support and detailed reporting
- All tests passing with singleton pattern support

### 14.2 Pending Features (Phase 10 - Documentation & Deployment)
⏳ **Documentation**
- Module documentation (inline JSDoc comments)
- User guide / gameplay instructions
- Deployment guide

⏳ **Deployment Optimization**
- Asset optimization
- Code minification/bundling (if needed)
- Hosting setup
- Final QA pass

---

**Document Version:** 2.0  
**Last Updated:** January 2025  
**Status:** Living Document - Updated through Phase 9 Implementation
