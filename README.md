# Ball Drop Puzzle Game

A Tetris-inspired puzzle game where colored ball pieces fall and stack. Match 3+ balls of the same color to clear them and score points. Features special balls (exploding, painting, blocking) and progressive difficulty across 5 difficulty levels.

## 🎮 Game Features

- **Classic Tetris Mechanics:** 8 piece shapes made of colored balls
- **Color Matching:** Match 3+ balls horizontally, vertically, or diagonally
- **Cascade System:** Continuous matching after balls drop
- **Special Balls:**
  - 💥 Exploding: Clears 7×7 area when matched
  - 🎨 Painting: Changes entire lines to matched color
  - 🚫 Blocking: Enemy balls that can only be exploded
- **5 Difficulty Levels:** From Easy to Master
- **Progressive Levels:** Unlimited levels with increasing challenge
- **High Score System:** Track best scores per difficulty/level

## 🚀 Getting Started

### Prerequisites
- Modern Chromium-based browser (Chrome, Edge, Brave, etc.)
- No installation required - runs entirely in browser

### Running the Game

1. Clone or download this repository
2. Open `index.html` in your browser
3. Select difficulty and level
4. Start playing!

## 🎯 How to Play

### Controls
- **← →** Move piece left/right
- **↑** Rotate piece clockwise
- **↓** Hard drop (instant fall)
- **P** Pause game
- **R** Restart level

### Objective
Survive for 15 seconds per level by matching colored balls. Avoid filling any column to the top!

### Scoring
- **Base:** 1 point per ball (doubles every 5 balls after first 10)
- **Full Row:** +50 bonus
- **Cascades:** +3 for first, doubles each level
- **Difficulty:** Up to 3× multiplier

## 📁 Project Structure

```
ball-drop-game/
├── index.html              # Main HTML file
├── config.json             # Game configuration
├── README.md               # This file
├── GameIdea.md             # Original concept document
├── FUNCTIONAL_SPEC.md      # Detailed functional specification
├── IMPLEMENTATION_PLAN.md  # Technical implementation guide
├── docs/                   # Module documentation
│   └── modules/            # Individual module docs
├── src/                    # Source code
│   ├── main.js             # Entry point
│   ├── modules/            # Game modules
│   ├── utils/              # Utility functions
│   └── styles/             # CSS files
└── tests/                  # Test files
    ├── unit/               # Unit tests
    └── integration/        # Integration tests
```

## 🛠️ Development

### Code Standards
- Modular design (ES6 modules)
- Unit testable components
- JSDoc function headers
- Comments for all conditional blocks
- Tabs for indentation
- DRY and SOLID principles

### Configuration
All game parameters are configurable via `config.json`:
- Colors and visuals
- Scoring formulas
- Difficulty curves
- Animation timings
- Special ball probabilities

### Module Overview

**Core Modules:**
- `GameEngine.js` - Main game loop and state management
- `Grid.js` - Game board state and matching logic
- `Piece.js` - Falling piece mechanics
- `Ball.js` - Ball entities and types

**Supporting Modules:**
- `Renderer.js` - Canvas rendering
- `InputHandler.js` - Keyboard controls
- `ScoreManager.js` - Score calculation
- `LevelManager.js` - Level/difficulty progression
- `AudioManager.js` - Sound effects (Web Audio API)
- `StorageManager.js` - LocalStorage persistence
- `UIManager.js` - UI element updates
- `ConfigManager.js` - Configuration loading

## 📚 Documentation

Complete documentation available in:
- **FUNCTIONAL_SPEC.md** - Game design and mechanics
- **IMPLEMENTATION_PLAN.md** - Technical architecture and development phases
- **docs/modules/** - Individual module documentation

## 🧪 Testing

```powershell
# Run unit tests (when implemented)
npm test

# Run specific test file
npm test Grid.test.js
```

## 🎨 Customization

### Changing Colors
Edit `config.json` → `colors.balls` section with hex codes.

### Adjusting Difficulty
Modify `config.json` → `difficulty` section:
- `dropSpeedModifier` - How fast pieces fall
- `blockingBallFrequencyModifier` - Enemy spawn rate

### Tweaking Scoring
Edit `config.json` → `scoring` section to adjust point values.

## 🐛 Known Issues

- None currently (development in progress)

## 📝 Version History

- **v1.0** (In Development)
  - Initial implementation
  - All core features planned

## 🤝 Contributing

This is a personal project, but suggestions and bug reports are welcome!

## 📄 License

All dependencies must be FOSS (Free and Open Source Software) licensed.

## 🙏 Acknowledgments

- Inspired by classic Tetris and Puzzle Bobble mechanics
- Built with vanilla JavaScript - no framework dependencies

## 📧 Contact

For questions or feedback, please open an issue in the repository.

---

**Status:** 🚧 In Development  
**Target Release:** TBD  
**Last Updated:** December 19, 2025