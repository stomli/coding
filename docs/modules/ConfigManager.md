# ConfigManager Module Documentation

## Overview
Configuration loading and management system for the Ball Drop Puzzle Game.

## Responsibility
- Load game configuration from config.json
- Provide access to configuration values with dot notation
- Supply default values for missing configuration
- Validate configuration structure

## Architecture
**Pattern:** Singleton  
**Export:** Pre-instantiated singleton instance

## Dependencies
- None (pure configuration module)

## Public API

### Methods

#### loadConfig()
```javascript
loadConfig() → Promise<void>
```
Loads configuration from `/config/config.json` file.

**Returns:** Promise that resolves when config is loaded

**Throws:** Error if config file cannot be loaded or parsed

**Example:**
```javascript
await ConfigManager.loadConfig();
```

---

#### get(path, defaultValue)
```javascript
get(path, defaultValue) → any
```
Retrieves configuration value using dot notation path.

**Parameters:**
- `path` (String): Dot-separated path to config value (e.g., 'game.gridRows', 'scoring.basePoints')
- `defaultValue` (any): Value to return if path not found

**Returns:** Configuration value at path, or defaultValue if not found

**Examples:**
```javascript
const gridRows = ConfigManager.get('game.gridRows', 20);
const basePoints = ConfigManager.get('scoring.basePoints', 1);
const colors = ConfigManager.get('colors.ballColors', []);
```

---

#### getAll()
```javascript
getAll() → Object
```
Returns entire configuration object.

**Returns:** Complete config object

**Example:**
```javascript
const config = ConfigManager.getAll();
console.log(config.game.gridCols); // 10
```

---

#### isConfigLoaded()
```javascript
isConfigLoaded() → Boolean
```
Checks if configuration has been loaded.

**Returns:** true if config loaded, false otherwise

---

## Configuration Structure

```json
{
  "game": {
    "gridRows": 20,
    "gridCols": 10,
    "dropSpeed": 1000,
    "lockDelay": 500
  },
  "scoring": {
    "basePoints": 1,
    "cascadeBonus": 3,
    "difficultyMultipliers": [1.0, 1.5, 2.0, 2.5, 3.0]
  },
  "colors": {
    "ballColors": ["#FF0000", "#00FF00", ...],
    "backgroundColor": "#1a1a1a"
  },
  "controls": {
    "moveLeft": "ArrowLeft",
    "moveRight": "ArrowRight",
    "rotate": "ArrowUp",
    "hardDrop": "ArrowDown",
    "pause": "KeyP",
    "restart": "KeyR"
  },
  "animations": {
    "clearFlashDuration": 100,
    "floatingTextDuration": 1500,
    "floatingTextDistance": 50
  },
  "pieces": {
    "shapes": {...}
  },
  "specialBalls": {
    "explodingRate": 0.05,
    "painterHorizontalRate": 0.02,
    "painterVerticalRate": 0.02,
    "painterDiagonalRate": 0.01
  }
}
```

## Usage Example

```javascript
// Initialize
await ConfigManager.loadConfig();

// Access values with defaults
const rows = ConfigManager.get('game.gridRows', 20);
const basePoints = ConfigManager.get('scoring.basePoints', 1);

// Access nested arrays
const colors = ConfigManager.get('colors.ballColors', []);

// Check if loaded
if (ConfigManager.isConfigLoaded()) {
  // Config ready
}
```

## Testing
- 12 unit tests covering:
  - Config loading
  - Dot notation access (simple and nested paths)
  - Default value handling
  - Array access
  - Piece shape configuration
  - Special ball rate configuration

**Test Coverage:** Full coverage of public API
