# Grid Module Documentation

## Overview
Game board state management for the Ball Drop Puzzle Game.

## Responsibility
- Maintain 2D grid of ball positions
- Validate piece placement
- Detect matches (horizontal, vertical, diagonal)
- Apply gravity to floating balls
- Check column overflow (game over condition)

## Dependencies
- Ball
- Constants

## Public API

### Constructor
```javascript
constructor(rows, cols)
```
Creates a new grid with specified dimensions.

**Parameters:**
- `rows` (Number): Number of rows (default: 25)
- `cols` (Number): Number of columns (default: 15)

### Methods

#### isValidPosition(piece, x, y)
```javascript
isValidPosition(piece, x, y) → Boolean
```
Checks if piece can be placed at given position without collision.

**Parameters:**
- `piece` (Piece): Piece to check
- `x` (Number): Column position
- `y` (Number): Row position

**Returns:** True if position is valid, false otherwise

---

#### placePiece(piece, x, y)
```javascript
placePiece(piece, x, y) → void
```
Locks piece balls into grid at specified position.

**Parameters:**
- `piece` (Piece): Piece to place
- `x` (Number): Column position
- `y` (Number): Row position

---

#### getBall(row, col)
```javascript
getBall(row, col) → Ball | null
```
Retrieves ball at specified grid position.

**Parameters:**
- `row` (Number): Row index
- `col` (Number): Column index

**Returns:** Ball object or null if empty

---

#### setBall(row, col, ball)
```javascript
setBall(row, col, ball) → void
```
Sets ball at specified grid position.

**Parameters:**
- `row` (Number): Row index
- `col` (Number): Column index
- `ball` (Ball | null): Ball to place or null to clear

---

#### removeBall(row, col)
```javascript
removeBall(row, col) → void
```
Removes ball from specified grid position.

**Parameters:**
- `row` (Number): Row index
- `col` (Number): Column index

---

#### findMatches()
```javascript
findMatches() → Array<Match>
```
Scans grid for all color matches (3+ in a row).

**Returns:** Array of match objects with structure:
```javascript
{
	type: String,           // 'horizontal', 'vertical', 'diagonal'
	color: String,          // Color of matched balls
	positions: Array,       // Array of {row, col} positions
	direction: String       // For diagonals: 'ne', 'se', 'sw', 'nw'
}
```

---

#### applyGravity(removedPositions)
```javascript
applyGravity(removedPositions?) → Boolean
```
Drops floating balls down to nearest solid surface.

**Parameters:**
- `removedPositions` (Array<{row, col}>): Optional array of positions that were removed. If provided, only columns containing these positions will have gravity applied. If omitted, all columns are processed (legacy behavior).

**Returns:** True if any balls moved, false if grid is stable

**Example:**
```javascript
// Only apply gravity to columns where balls were removed
const removed = [{row: 5, col: 3}, {row: 6, col: 3}, {row: 5, col: 7}];
grid.applyGravity(removed); // Only columns 3 and 7 are processed
```

---

#### isColumnFull(col)
```javascript
isColumnFull(col) → Boolean
```
Checks if specified column has reached the top row.

**Parameters:**
- `col` (Number): Column index

**Returns:** True if column is full, false otherwise

---

#### clear()
```javascript
clear() → void
```
Clears entire grid, setting all cells to null.

---

## Internal State

```javascript
{
	rows: Number,           // Grid height
	cols: Number,           // Grid width
	grid: Array             // 2D array [row][col] of Ball | null
}
```

## Implementation Notes

### Match Detection Algorithm
Four separate scans:
1. Horizontal: Check each row left-to-right
2. Vertical: Check each column top-to-bottom
3. Diagonal NE/SW: Check all diagonals
4. Diagonal NW/SE: Check all diagonals

Matches of 3+ consecutive same-color balls are returned.

### Gravity Algorithm
Optimized to only affect columns with removed balls:
- Accepts optional `removedPositions` parameter
- Extracts unique column indices from removed positions
- For each affected column, iterates from bottom-up:
  - Compacts all balls down to fill gaps
  - Clears empty cells at top
- If no positions provided, processes all columns (legacy behavior)

### Coordinate System
- Origin (0,0) is top-left
- Rows increase downward
- Columns increase rightward

## Testing Considerations

- Test all 4 match directions
- Verify gravity with complex stacks
- Check edge detection (no out-of-bounds)
- Test simultaneous multiple matches
- Validate collision detection accuracy

## Version
1.0

## Last Updated
December 19, 2025
