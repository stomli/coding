# Piece Module Documentation

## Overview
Falling piece composition and rotation for the Ball Drop Puzzle Game.

## Responsibility
- Define piece shapes (8 Tetromino variants)
- Handle piece rotation (90° clockwise)
- Manage piece position
- Contain ball objects that make up the piece

## Dependencies
- Ball
- Constants
- ConfigManager

## Public API

### Constructor
```javascript
constructor(shapeType, balls)
```
Creates a new piece with specified shape and ball composition.

**Parameters:**
- `shapeType` (String): One of 'I', 'O', 'T', 'L', 'J', 'S', 'Z', 'Single'
- `balls` (Array<Ball>): Array of Ball objects for the piece

### Methods

#### rotate()
```javascript
rotate() → void
```
Rotates the piece 90° clockwise by transforming the shape matrix.

---

#### getShape()
```javascript
getShape() → Array<Array<Number>>
```
Returns the current shape as a 2D boolean matrix.

**Returns:** 2D array where 1 = ball present, 0 = empty

---

#### getBalls()
```javascript
getBalls() → Array<Ball>
```
Returns array of Ball objects in this piece.

**Returns:** Array of Ball instances

---

#### getPosition()
```javascript
getPosition() → {x: Number, y: Number}
```
Gets the current position of the piece.

**Returns:** Object with x (column) and y (row) coordinates

---

#### setPosition(x, y)
```javascript
setPosition(x, y) → void
```
Sets the position of the piece.

**Parameters:**
- `x` (Number): Column position
- `y` (Number): Row position

---

#### getWidth()
```javascript
getWidth() → Number
```
Calculates the width of the piece based on its shape.

**Returns:** Number of columns occupied

---

#### getHeight()
```javascript
getHeight() → Number
```
Calculates the height of the piece based on its shape.

**Returns:** Number of rows occupied

---

## Internal State

```javascript
{
	shapeType: String,          // 'I', 'O', 'T', 'L', 'J', 'S', 'Z', 'Single'
	shape: Array<Array>,        // 2D matrix of shape
	balls: Array<Ball>,         // Balls composing the piece
	position: {x, y}            // Current grid position
}
```

## Shape Definitions

All shapes defined as 2D arrays in config.json (4-6 balls each for visual distinction):

```javascript
I: [[1,1,1,1]]                    // 4 balls - line
O: [[1,1],[1,1],[1,1]]            // 6 balls - 2×3 rectangle
T: [[0,1,0],[1,1,1]]              // 4 balls - T-shape
L: [[1,0],[1,0],[1,1]]            // 5 balls - L-shape
J: [[0,1],[0,1],[1,1]]            // 5 balls - reverse L
S: [[0,1,1],[1,1,0],[1,0,0]]      // 5 balls - extended S
Z: [[1,1,0],[0,1,1],[0,0,1]]      // 5 balls - extended Z
Single: [[1]]                      // 1 ball
```

## Rotation Algorithm

Matrix transformation for 90° clockwise rotation:
```javascript
newShape[i][j] = oldShape[height - 1 - j][i]
```

Where:
- `i` is new row index
- `j` is new column index
- `height` is number of rows in original shape

## Implementation Notes

### Ball Assignment
Balls are assigned to shape positions in row-major order (left-to-right, top-to-bottom).

### Position Tracking
Position represents the top-left corner of the piece's bounding box.

### Special Cases
- O-piece rotation has no visual effect (2×2 symmetry)
- Single ball has no rotation effect

## Testing Considerations

- Test all 4 rotations for each shape (360° = back to start)
- Verify ball count preservation after rotation
- Test position updates
- Check width/height calculations for all orientations

## Version
1.0

## Last Updated
December 19, 2025
