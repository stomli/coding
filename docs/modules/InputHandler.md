# InputHandler Module Documentation

## Overview
Keyboard input processing and event emission system for the Ball Drop Puzzle Game.

## Responsibility
- Listen for keyboard events
- Map key codes to game actions
- Emit game events via EventEmitter
- Enable/disable input processing
- Handle key repeat behavior

## Architecture
**Pattern:** Singleton  
**Export:** Pre-instantiated singleton instance

## Dependencies
- EventEmitter
- ConfigManager
- Constants

## Public API

### Methods

#### initialize()
```javascript
initialize() → void
```
Sets up keyboard event listeners and loads key mappings from config.

**Side Effects:**
- Attaches keydown listener to window
- Loads control mappings from ConfigManager

**Example:**
```javascript
InputHandler.initialize();
```

---

#### enableInput()
```javascript
enableInput() → void
```
Enables input processing (events will be emitted).

---

#### disableInput()
```javascript
disableInput() → void
```
Disables input processing (events will be ignored).

---

## Event Emissions

InputHandler emits events via the global EventEmitter. Subscribe to these events:

### MOVE_LEFT
Emitted when left arrow key pressed.
```javascript
EventEmitter.on(CONSTANTS.EVENTS.MOVE_LEFT, () => {
  // Move piece left
});
```

### MOVE_RIGHT
Emitted when right arrow key pressed.
```javascript
EventEmitter.on(CONSTANTS.EVENTS.MOVE_RIGHT, () => {
  // Move piece right
});
```

### ROTATE
Emitted when up arrow key pressed.
```javascript
EventEmitter.on(CONSTANTS.EVENTS.ROTATE, () => {
  // Rotate piece
});
```

### HARD_DROP
Emitted when down arrow key pressed.
```javascript
EventEmitter.on(CONSTANTS.EVENTS.HARD_DROP, () => {
  // Drop piece instantly
});
```

### PAUSE
Emitted when P key pressed.
```javascript
EventEmitter.on(CONSTANTS.EVENTS.PAUSE, () => {
  // Toggle pause
});
```

### RESTART
Emitted when R key pressed.
```javascript
EventEmitter.on(CONSTANTS.EVENTS.RESTART, () => {
  // Restart game
});
```

## Key Mappings

Default key mappings (configurable via config.json):

| Action | Key Code | Key |
|--------|----------|-----|
| Move Left | ArrowLeft | ← |
| Move Right | ArrowRight | → |
| Rotate | ArrowUp | ↑ |
| Hard Drop | ArrowDown | ↓ |
| Pause | KeyP | P |
| Restart | KeyR | R |

## Key Repeat Behavior

- **Movement Keys (Left/Right):** Allow key repeat for smooth continuous movement
- **All Other Keys:** Ignore key repeat to prevent accidental double actions

## Internal Implementation

### Private Methods

#### _handleKeyDown(event)
```javascript
_handleKeyDown(event) → void
```
Internal handler for keyboard events. Checks if input enabled, maps key codes to events, prevents default browser behavior for game keys, and emits appropriate events.

## Usage Example

```javascript
// Initialize input system
await ConfigManager.loadConfig();
InputHandler.initialize();

// Set up game event listeners
EventEmitter.on(CONSTANTS.EVENTS.MOVE_LEFT, () => {
  piece.moveLeft();
});

EventEmitter.on(CONSTANTS.EVENTS.ROTATE, () => {
  piece.rotate();
});

// Disable input during pause
InputHandler.disableInput();

// Re-enable when resuming
InputHandler.enableInput();
```

## Testing
- 10 unit tests covering:
  - Singleton existence
  - Event emission for all key types
  - preventDefault behavior
  - Non-game key filtering
  - Enable/disable state control

**Test Coverage:** Full coverage of public API and event emissions
