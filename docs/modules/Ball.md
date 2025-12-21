# Ball Module Documentation

## Overview
Ball object with type, color, and behavior properties for the Ball Drop Puzzle Game.

## Responsibility
- Represent individual ball entities
- Define ball types (normal, exploding, painting, blocking)
- Store color information
- Provide matchability logic

## Dependencies
- Constants
- ConfigManager

## Public API

### Constructor
```javascript
constructor(type, color)
```
Creates a new ball with specified type and color.

**Parameters:**
- `type` (String): Ball type constant (NORMAL, EXPLODING, PAINTER_H, PAINTER_V, PAINTER_D, BLOCKING)
- `color` (String): Hex color code (e.g., '#FF0000')

### Methods

#### getType()
```javascript
getType() → String
```
Returns the ball's type.

**Returns:** Ball type constant

---

#### getColor()
```javascript
getColor() → String
```
Returns the ball's color.

**Returns:** Hex color string

---

#### setColor(newColor)
```javascript
setColor(newColor) → void
```
Changes the ball's color (used by painting mechanic).

**Parameters:**
- `newColor` (String): Hex color code

---

#### isMatchable()
```javascript
isMatchable() → Boolean
```
Determines if this ball can participate in color matching.

**Returns:** True for normal and special balls, false for blocking balls

---

#### isSpecial()
```javascript
isSpecial() → Boolean
```
Checks if ball has special properties (exploding or painting).

**Returns:** True if special, false if normal or blocking

---

## Ball Types

### NORMAL
Standard colored ball that matches by color.

### EXPLODING
- Matches like normal ball
- When matched, clears 7×7 area
- Visual: Star/burst overlay

### PAINTER_H (Horizontal Painter)
- Matches like normal ball
- When 3+ match horizontally, paints entire row to this color
- Visual: Horizontal stripe overlay

### PAINTER_V (Vertical Painter)
- Matches like normal ball
- When 3+ match vertically, paints entire column to this color
- Visual: Vertical stripe overlay

### PAINTER_DIAGONAL_NE (Diagonal NE Painter)
- Matches like normal ball
- When 3+ match, paints entire NE-SW diagonal (↗↙) to this color
- Visual: Diagonal stripe overlay (↗)

### PAINTER_DIAGONAL_NW (Diagonal NW Painter)
- Matches like normal ball
- When 3+ match, paints entire NW-SE diagonal (↖↘) to this color
- Visual: Diagonal stripe overlay (↖)

### BLOCKING
- Cannot be matched
- Only removed by explosions or reaching bottom
- Visual: Gray with X or lock icon

## Internal State

```javascript
{
	type: String,           // Ball type constant
	color: String           // Hex color code
}
```

## Implementation Notes

### Color Matching
Only `isMatchable()` balls participate in matching. Blocking balls are excluded.

### Special Ball Priority
When multiple special balls match:
1. Exploding balls trigger first
2. Painting balls activate second
3. Standard clearing happens last

### Color Changes
Painting mechanic uses `setColor()` to change ball colors. Type remains unchanged.

## Testing Considerations

- Test all ball types
- Verify matchability logic
- Test color changes (painting)
- Validate special ball detection

## Version
1.0

## Last Updated
December 19, 2025
