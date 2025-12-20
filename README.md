# Color Ball Drop - Puzzle Game 🎮

A standalone HTML/JavaScript puzzle game that combines Tetris-style piece dropping with color-matching mechanics.

## How to Play

Simply open `game.html` in any modern web browser. No installation, build process, or server required!

## Game Features

### Core Mechanics
- **8 Different Piece Shapes**: I-shape, L-shape, J-shape, T-shape, Square, Z-shape, S-shape, and single Dot
- **8 Vibrant Colors**: Red, Blue, Green, Yellow, Purple, Orange, Cyan, and Pink
- **Color Matching**: Match 3 or more balls of the same color to clear them
- **Multiple Match Directions**: Horizontal, vertical, and diagonal (both directions)
- **Gravity & Cascading**: When matches clear, pieces fall and trigger new matches from bottom to top
- **Progressive Difficulty**: Game speeds up every 10 lines cleared
- **Score System**: Earn points for matches (scaled by level) and hard drops

### Controls
- **← / →** : Move piece left/right
- **↓** : Drop faster (soft drop)
- **↑ or Z** : Rotate piece
- **Space** : Hard drop (instant placement)

### Gameplay
1. Colored pieces drop from the top of the board
2. Position and rotate them as they fall
3. When 3 or more balls of the same color line up (horizontally, vertically, or diagonally), they disappear
4. Balls above fall down to fill empty spaces
5. This can trigger chain reactions (cascades) for bonus points!
6. Game ends when pieces reach the top

### Progressive Levels
- Start at Level 1 with 1000ms drop speed
- Every 10 lines cleared increases the level
- Drop speed increases by 100ms per level (minimum 200ms at higher levels)

## Technical Details

- **Fully Standalone**: Single HTML file with embedded CSS and JavaScript
- **No Dependencies**: Pure vanilla JavaScript, no frameworks or libraries
- **Responsive Design**: Modern, gradient-based UI with smooth animations
- **Browser Compatible**: Works in all modern browsers (Chrome, Firefox, Safari, Edge)

## File Structure

```
coding/
├── README.md       # This file
└── game.html       # The complete game (open this to play!)
```

## Development

The game is entirely self-contained in `game.html`. To modify:
1. Open `game.html` in your favorite text editor
2. Make changes to the HTML, CSS (in `<style>` tags), or JavaScript (in `<script>` tags)
3. Save and refresh in your browser to see changes

No build process, compilation, or bundling required!