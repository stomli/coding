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
- Once stopped, balls lock into position

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

### 4.4 Animation Timing
- **Configurable delays** between:
  - Piece lock → Match detection
  - Match clear → Ball drop
  - Drop complete → Next match check
- **Default:** Instant (0ms), but configurable for visual feedback

---

## 5. Scoring System

### 5.1 Base Scoring
- **Balls 1-10 cleared:** 1 point each
- **Balls 11-15 cleared:** 2 points each (doubles)
- **Balls 16-20 cleared:** 4 points each (doubles again)
- **Pattern:** Points double every 5 balls after first 10

### 5.2 Bonus Scoring
- **Full Row Clear:** +50 points
- **Cascade Bonus:**
  - 1st cascade: +3 points (configurable)
  - 2nd cascade: +6 points (doubles)
  - 3rd cascade: +12 points (doubles)
  - Pattern: Cascade bonus doubles each level

### 5.3 Difficulty Multiplier
- **Difficulty 1:** 1x points
- **Difficulty 2:** 1.5x points
- **Difficulty 3:** 2x points
- **Difficulty 4:** 2.5x points
- **Difficulty 5:** 3x points

### 5.4 Score Display
- **Current Level Score:** Resets each level
- **Total Score:** Cumulative across all levels in current session
- **High Score:** Per (difficulty × level) combination, persisted in localStorage

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

**Document Version:** 1.0  
**Date:** December 19, 2025  
**Status:** Final for Implementation
