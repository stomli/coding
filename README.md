# Ball Drop Puzzle Game

A color-matching puzzle game where piece clusters of orbs fall and stack. Match 3+ balls of the same color to clear them and score points. Features special balls (exploding, painting, blocking) and progressive difficulty across 5 difficulty levels.

## 🎮 Game Features

- **Four Game Modes:**
  - 🕐 **Classic:** Standard timed gameplay (90 seconds per level)
  - 🧘 **Zen:** Untimed mode - fill the grid to complete levels
  - ⚔️ **Gauntlet:** Pre-filled challenge with rising random orbs
  - 🌊 **Rising Tide:** Rising blocking orbs - clear with explosions
- **Piece Mechanics:** 8 piece shapes made of colored balls
- **Color Matching:** Match 3+ balls horizontally, vertically, or diagonally
- **Cascade System:** Continuous matching after balls drop
- **Special Balls:**
  - 💥 Exploding: Clears 7×7 area when matched
  - 🎨 Painting: Changes entire lines to matched color
  - 🚫 Blocking: Enemy balls that can only be exploded
- **5 Difficulty Levels:** From Easy to Master
- **Progressive Levels:** Unlimited levels with increasing challenge
- **High Score System:** Track best scores per mode/difficulty/level

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

### Game Modes
- **Classic:** Survive 90 seconds per level, avoid filling columns
- **Zen:** No timer - strategically fill the grid to complete levels
- **Gauntlet:** Start with 5 pre-filled rows, random orbs rise every 5 seconds
- **Rising Tide:** Blocking orbs rise every 5 seconds, use explosions to clear

### Controls
### Objective
**Classic/Gauntlet/Rising Tide:** Survive for 90 seconds per level by matching colored balls. Avoid filling any column to the top!

**Zen:** Fill the grid completely to successfully complete the level. Take your time and plan strategically!
- **↓** Hard drop (instant fall)
- **P** Pause game
- **R** Restart level

### Objective
### Scoring
- **Base:** 1 point per ball cleared
- **Cascades:** Progressive multipliers (Level 1: ×1, Level 2: ×2, Level 3: ×3, etc.)
  - Cascade bonus: 3 × (cascadeCount - 1) for 2+ level cascades
  - Example: 2× cascade with 3 balls (L1) + 5 balls (L2) + 3 bonus = 3 + 10 + 3 = 16 points
- **Difficulty:** 1.0×, 1.5×, 2.0×, 2.5×, 3.0× multipliers
- **Visual Feedback:** Color-coded floating text (white: clears, gold: explosions, blue: cascades)
- **Mode-Specific:** Each mode tracks scores independently
- **Difficulty:** 1.0×, 1.5×, 2.0×, 2.5×, 3.0× multipliers
- **Visual Feedback:** Color-coded floating text (white: clears, gold: explosions, blue: cascades)

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
- `ScoreManager.js` - Score calculation with progressive cascades
- `LevelManager.js` - Level/difficulty progression
- `AudioManager.js` - Web Audio API sound generation
- `PlayerManager.js` - High scores and player profiles
- `ConfigManager.js` - Configuration loading (156 parameters)
- `FloatingText.js` - Color-coded score feedback
- `AnimationManager.js` - Animation state tracking
- `ParticleSystem.js` - Visual particle effects
- `StatisticsTracker.js` - Match/cascade analytics
- `WeatherBackground.js` - Dynamic background effects

## 📚 Documentation

Complete documentation available in:
- **FUNCTIONAL_SPEC.md** - Game design and mechanics
- **IMPLEMENTATION_PLAN.md** - Technical architecture and development phases
- **docs/modules/** - Individual module documentation

## 🧪 Testing

Open `validate.html` in your browser to run the comprehensive test suite:
- **262+ Unit Tests** across 14 modules
- Real-time pass/fail reporting
- Detailed error messages
- Coverage: Core utilities, game entities, factories, managers, and game systems

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

- None currently - all core features implemented and tested

## 📝 Version History

- **v1.0** (December 2025)
  - Complete core gameplay implementation
  - Progressive cascade scoring system
  - Special balls: exploding, painting, blocking
  - 5 difficulty levels with unlimited progression
  - Web Audio API sound system
  - LocalStorage persistence
  - 262+ comprehensive unit tests

## 🤝 Contributing

This is a personal project, but suggestions and bug reports are welcome!

## 📄 License

All dependencies must be FOSS (Free and Open Source Software) licensed.

## 🙏 Acknowledgments

- Inspired by classic falling-piece and color-matching puzzle games
- Built with vanilla JavaScript - no framework dependencies

## 📧 Contact

For questions or feedback, please open an issue in the repository.

---

**Status:** ✅ Complete (Phase 10: Documentation in progress)  
**Version:** 1.0  
**Last Updated:** December 21, 2025