# StatisticsTracker Module Documentation

## Overview
Tracks detailed game statistics for matches, clears, and special ball usage across colors and types.

## Responsibility
- Record matches by ball type and color
- Track total counts per color
- Monitor blocking ball usage
- Calculate statistics for analytics and UI display
- Provide aggregated data for player insights

## Architecture
**Pattern:** Singleton  
**Export:** Pre-instantiated singleton instance

## Dependencies
- Constants

## Public API

### Methods

#### initialize()
```javascript
initialize() → void
```
Initializes the statistics tracker.

**Side Effects:**
- Resets all statistics to empty state
- Clears type/color tracking objects

**Example:**
```javascript
StatisticsTracker.initialize();
```

---

#### reset()
```javascript
reset() → void
```
Resets all statistics to zero.

**Side Effects:**
- Clears all tracked data
- Resets match counts
- Clears color statistics

**Example:**
```javascript
// Start new game
StatisticsTracker.reset();
```

---

#### recordMatches(matches)
```javascript
recordMatches(matches) → void
```
Records match statistics from cleared balls.

**Parameters:**
- `matches` (Array): Array of match objects
  - Each match: `{ positions: Array, color: String, direction: String }`

**Side Effects:**
- Increments match count by ball type
- Tracks balls per color
- Updates total counts

**Example:**
```javascript
const matches = [
    { 
        positions: [{x:0,y:0},{x:1,y:0},{x:2,y:0}], 
        color: '#FF0000', 
        direction: 'horizontal' 
    }
];
StatisticsTracker.recordMatches(matches);
```

---

#### recordExplosion(count, color)
```javascript
recordExplosion(count, color) → void
```
Records an explosion event.

**Parameters:**
- `count` (Number): Number of balls cleared by explosion
- `color` (String): Color of the exploding ball

**Side Effects:**
- Increments explosion count for ball type
- Tracks balls cleared by explosions
- Updates color statistics

**Example:**
```javascript
StatisticsTracker.recordExplosion(12, '#FF0000');
```

---

#### recordPainting(count, fromColor, toColor)
```javascript
recordPainting(count, fromColor, toColor) → void
```
Records a painting event.

**Parameters:**
- `count` (Number): Number of balls painted
- `fromColor` (String): Original color
- `toColor` (String): New color after painting

**Side Effects:**
- Increments painting count
- Tracks color transformations
- Updates painted ball statistics

**Example:**
```javascript
StatisticsTracker.recordPainting(5, '#00FF00', '#FF0000');
```

---

#### recordBlockingBall()
```javascript
recordBlockingBall() → void
```
Records a blocking ball spawn.

**Side Effects:**
- Increments blocking ball count
- Updates blocking ball statistics

**Example:**
```javascript
StatisticsTracker.recordBlockingBall();
```

---

#### getCount(type, color)
```javascript
getCount(type, color) → Number
```
Gets the count for a specific ball type and color.

**Parameters:**
- `type` (String): Ball type from Constants.BALL_TYPES
  - `NORMAL`, `EXPLODING`, `HORIZONTAL_PAINTER`, `VERTICAL_PAINTER`, `DIAGONAL_PAINTER`, `BLOCKING`
- `color` (String): Hex color code (e.g., '#FF0000')

**Returns:** Count (0 if not tracked)

**Example:**
```javascript
const redExplosions = StatisticsTracker.getCount('EXPLODING', '#FF0000');
```

---

#### getTotalCount(type)
```javascript
getTotalCount(type) → Number
```
Gets the total count for a ball type across all colors.

**Parameters:**
- `type` (String): Ball type from Constants.BALL_TYPES

**Returns:** Total count

**Example:**
```javascript
const totalExplosions = StatisticsTracker.getTotalCount('EXPLODING');
```

---

#### getStats()
```javascript
getStats() → Object
```
Gets all statistics organized by type and color.

**Returns:** Statistics object
```javascript
{
    NORMAL: {
        '#FF0000': 45,
        '#00FF00': 32,
        '#0000FF': 28
    },
    EXPLODING: {
        '#FF0000': 3,
        '#00FF00': 2
    },
    HORIZONTAL_PAINTER: {
        '#FF0000': 1
    },
    BLOCKING: {
        '#808080': 5
    }
}
```

---

#### getColorStats()
```javascript
getColorStats() → Object
```
Gets statistics aggregated by color across all types.

**Returns:** Color statistics object
```javascript
{
    '#FF0000': 49,  // Total red balls (normal + special)
    '#00FF00': 34,
    '#0000FF': 28
}
```

---

#### getAvailableColors(level)
```javascript
getAvailableColors(level) → Array<String>
```
Gets the list of available colors based on level.

**Parameters:**
- `level` (Number): Current level number

**Returns:** Array of color hex codes

**Color Unlock Schedule:**
- Level 1-2: 3 colors
- Level 3-6: 4 colors
- Level 7-10: 5 colors
- Level 11-14: 6 colors
- Level 15-18: 7 colors
- Level 19+: 8 colors

**Example:**
```javascript
const colors = StatisticsTracker.getAvailableColors(10);
// Returns: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF']
```

---

## Data Structure

### Internal Stats Object
```javascript
{
    // Normal matches
    NORMAL: {
        '#FF0000': 45,   // Red normal balls matched
        '#00FF00': 32,   // Green normal balls matched
        '#0000FF': 28    // Blue normal balls matched
    },
    
    // Exploding balls
    EXPLODING: {
        '#FF0000': 3,    // Red exploding balls triggered
        '#00FF00': 2     // Green exploding balls triggered
    },
    
    // Painter balls
    HORIZONTAL_PAINTER: {
        '#FF0000': 1     // Red horizontal painters triggered
    },
    VERTICAL_PAINTER: {
        '#0000FF': 2     // Blue vertical painters triggered
    },
    DIAGONAL_PAINTER: {
        '#00FF00': 1     // Green diagonal painters triggered
    },
    
    // Blocking balls
    BLOCKING: {
        '#808080': 5     // Blocking balls spawned
    }
}
```

---

## Event Integration

### Listens For
- `BALLS_CLEARED` - Records match statistics
  - Data: `{ matches: Array }`
- `EXPLOSION` - Records explosion events
  - Data: `{ count: Number, color: String }`
- `PAINTING` - Records painting events
  - Data: `{ count: Number, fromColor: String, toColor: String }`
- `BLOCKING_BALL_SPAWN` - Records blocking ball spawns

### Emits
(None - pure data tracking module)

---

## Implementation Notes

### Nested Object Structure
```javascript
// Initialize type if doesn't exist
if (!this.stats[type]) {
    this.stats[type] = {};
}

// Initialize color count if doesn't exist
if (!this.stats[type][color]) {
    this.stats[type][color] = 0;
}

// Increment count
this.stats[type][color] += count;
```

### Safe Access with Optional Chaining
```javascript
getCount(type, color) {
    return this.stats[type]?.[color] || 0;
}
```

### Aggregation for UI Display
```javascript
// Display statistics panel
const stats = StatisticsTracker.getStats();
const totalNormal = StatisticsTracker.getTotalCount('NORMAL');
const totalExplosions = StatisticsTracker.getTotalCount('EXPLODING');
const colorBreakdown = StatisticsTracker.getColorStats();
```

---

## Use Cases

### End-of-Level Summary
```javascript
const stats = StatisticsTracker.getStats();
console.log(`Normal matches: ${StatisticsTracker.getTotalCount('NORMAL')}`);
console.log(`Explosions: ${StatisticsTracker.getTotalCount('EXPLODING')}`);
console.log(`Paintings: ${
    StatisticsTracker.getTotalCount('HORIZONTAL_PAINTER') +
    StatisticsTracker.getTotalCount('VERTICAL_PAINTER') +
    StatisticsTracker.getTotalCount('DIAGONAL_PAINTER')
}`);
```

### Color Analysis
```javascript
const colorStats = StatisticsTracker.getColorStats();
const mostUsedColor = Object.keys(colorStats)
    .reduce((a, b) => colorStats[a] > colorStats[b] ? a : b);
console.log(`Most matched color: ${mostUsedColor}`);
```

### Player Profile
```javascript
// Save to PlayerManager after game
const totalMatches = StatisticsTracker.getTotalCount('NORMAL');
const totalExplosions = StatisticsTracker.getTotalCount('EXPLODING');
PlayerManager.updateStatistics('totalMatches', totalMatches);
PlayerManager.updateStatistics('totalExplosions', totalExplosions);
```

---

## Testing
See `tests/unit/test-statistics-tracker.js` (31 tests passing)

Test coverage includes:
- Edge cases (empty types, non-existent colors)
- Validation of nested object structure
- Multiple operations and accumulation
- Level progression color unlocking
- Large count handling (1000+ matches)
- Type independence

---

**Version:** 1.0  
**Last Updated:** December 21, 2025
