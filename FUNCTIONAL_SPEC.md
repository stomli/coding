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

#### 3.3.1 Exploding Balls
- **Appearance:** Distinct visual marker (e.g., star/burst pattern)
- **Spawn Rate:** 5% per ball in piece (configurable)
- **Behavior:** When 3+ match, clears a 7×7 area
- **Explosion Pattern:**
  - Horizontal match: 7×7 grid-aligned square
  - Vertical match: 7×7 grid-aligned square
  - Diagonal match: 7×7 square rotated 45° along match axis
- **Clears:** All ball types except blocking balls outside explosion radius

#### 3.3.2 Painting Balls
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

#### 3.3.3 Blocking Balls
- **Appearance:** Distinct visual (e.g., gray/black with X or lock icon)
- **Spawn Method:** Drop individually from center-top of board (column 7-8)
- **Player Control:** None - they fall automatically
- **Spawn Rate:** 
  - Base: 0.5% chance per piece dropped
  - Increases with difficulty and level progression
  - Not before piece 50 on difficulty 1
  - Earlier on higher difficulties
- **Removal:** Only by reaching bottom of stack or being caught in explosion radius
- **Cannot:** Be matched, painted, or rotated by player

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
- **Cascade Bonus Formula:**
  - Single cascade (no chain): Base points only
  - 2nd cascade in chain: +3 points (configurable)
  - 3rd cascade in chain: +6 points (previous bonus × 2)
  - 4th+ cascade: Bonus continues doubling
  - Formula: `3 × 2^(cascadeLevel - 2)` for cascade level ≥ 2

### 5.2 Visual Score Feedback (Implemented)
- **Floating Point Text:** Shows points earned for each match
  - Appears at center of matched balls
  - Floats upward 50 pixels over 1.5 seconds
  - Fades out linearly during animation
  - White text with black outline for visibility
  - Separate popup for each match group in multi-match clears

### 5.3 Difficulty Multiplier (Implemented)
- **Difficulty 1:** 1.0x points
- **Difficulty 2:** 1.5x points
- **Difficulty 3:** 2.0x points
- **Difficulty 4:** 2.5x points
- **Difficulty 5:** 3.0x points

**Score Calculation:** `(ballCount × basePoints + cascadeBonuses) × difficultyMultiplier`

### 5.4 Score Display (Implemented)
- **Score Manager:** Singleton module tracking score via event system
  - Listens for `BALLS_CLEARED` events to accumulate ball counts per cascade
  - Listens for `CASCADE_COMPLETE` events to calculate and apply final score
  - Emits `SCORE_UPDATE` events for UI synchronization
- **Real-time UI Update:** Score display updates immediately after each cascade
- **Current Level Score:** Displayed in HUD (resets per level - not yet implemented)
- **Total Score:** Cumulative tracking (multi-level system not yet implemented)
- **High Score:** localStorage persistence (not yet implemented)

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

### 8.1 Sound Effects (Programmatic)
- Piece rotation
- Piece movement (optional, subtle)
- Piece lock/land
- Match clear (different pitch per cascade level)
- Explosion
- Painting activation
- Level complete
- Game over

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

### 14.1 Completed Features (Phase 1-3)
✅ **Core Foundation**
- Project structure with modular architecture
- ConfigManager with config.json loading
- Constants and EventEmitter utilities
- Ball class with type system
- Piece class with 8 shapes and rotation
- Grid class with match detection
- Renderer with Canvas API
- InputHandler with keyboard controls
- GameEngine with game loop

✅ **Core Gameplay**
- Piece dropping with gravity
- Collision detection
- Piece rotation (clockwise 90°)
- Horizontal movement (left/right)
- Hard drop (instant fall)
- Piece locking with 500ms delay
- PieceFactory with level-based color unlocking (3→8 colors)
- Next piece preview
- Ghost piece (drop location preview)
- Pause functionality

✅ **Matching System**
- Match detection (horizontal, vertical, diagonal in all 4 directions)
- Clear animation (3-flash white effect)
- Gravity/cascade system (automatic multi-cascade loops)
- Cascade counting
- ScoreManager with event-driven architecture
- Cascade bonus scoring (3 × 2^n formula)
- Difficulty multipliers (1.0x - 3.0x)
- Floating point text animations
- Real-time score display updates

✅ **Quality Assurance**
- 136 unit tests across 11 test modules
- Comprehensive test coverage:
  - **Core Utilities:** Helpers (6 tests), EventEmitter (8 tests)
  - **Game Entities:** Ball (12 tests), Piece (13 tests), Grid (23 tests)
  - **Factories & Managers:** PieceFactory (13 tests), ScoreManager (13 tests), ConfigManager (12 tests), FloatingText (11 tests)
  - **Game Systems:** InputHandler (10 tests), GameEngine (12 tests), Renderer (3 tests)
- Test runner with async support and detailed reporting
- All tests passing with singleton pattern support

### 14.2 Pending Features (Phase 4+)
⏳ **Special Ball Effects**
- Exploding ball 7×7 clear behavior (type exists, effect not implemented)
- Painter ball line painting (type exists, effect not implemented)
- Blocking ball spawn and immunity (type exists, behavior not implemented)

⏳ **Level & Difficulty System**
- LevelManager module
- Level timer (15 second countdown)
- Difficulty selection (1-5)
- Level progression and unlocking
- Drop speed scaling
- Blocking ball frequency scaling

⏳ **UI Screens**
- Main menu
- Level selection screen
- Pause overlay
- Game over screen
- Level complete screen
- High score display

⏳ **Audio System**
- AudioManager module
- Web Audio API sound generation
- All sound effects (rotation, movement, lock, match, explosion, paint, etc.)
- Volume control and mute

⏳ **Data Persistence**
- StorageManager module
- LocalStorage high score tracking
- Level unlock persistence
- Settings persistence

---

**Document Version:** 1.1  
**Last Updated:** December 19, 2025  
**Status:** Living Document - Updated with Phase 1-3 Implementation
