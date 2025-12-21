# Debug Mode

Debug mode allows you to control piece generation for testing specific scenarios.

## Enabling Debug Mode

Add `?debug=1` to the URL query string:

```
http://localhost:8000/?debug=1
```

## Parameters

### Shape Control
Force a specific piece shape:
```
?debug=1&shape=T
```

Available shapes: `I`, `O`, `T`, `S`, `Z`, `L`, `J`

### Color Control
Force specific ball colors (comma-separated):
```
?debug=1&colors=red,blue,green
```

Available color names: `red`, `green`, `blue`, `yellow`, `cyan`, `magenta`, `orange`, `purple`

You can also use hex codes:
```
?debug=1&colors=#FF0000,#00FF00,#0000FF
```

If you specify fewer colors than balls in the piece, colors will cycle.

### Ball Type Control
Force all balls to be a specific type:
```
?debug=1&type=exploding
```

Available types:
- `normal` - Regular colored balls
- `exploding` - Exploding balls (7×7 clear)
- `blocking` - Blocking balls (immune to painters)
- `painterH` - Horizontal painter
- `painterV` - Vertical painter
- `painterDNE` - Diagonal NE painter (↗↙)
- `painterDNW` - Diagonal NW painter (↖↘)

## Examples

### Test Exploding Ball with T-Piece
```
?debug=1&shape=T&type=exploding
```

### Test Specific Color Pattern
```
?debug=1&shape=I&colors=red,red,blue,red
```

### Test Blocking Balls
```
?debug=1&shape=O&type=blocking&colors=gray
```

### Test Painter Combinations
```
?debug=1&shape=L&type=painterH&colors=magenta
```

## Debug Overlay

When debug mode is enabled, a green overlay appears in the top-right corner showing:
- Active debug parameters
- Current settings
- Instructions to disable

To disable debug mode, simply refresh the page without the query string parameters.

## Implementation Details

Debug mode is implemented in `src/utils/DebugMode.js` and integrated into:
- `PieceFactory.js` - Overrides piece/ball generation
- `main.js` - Displays debug overlay

The debug system respects game logic while allowing precise control over piece generation for testing edge cases and special ball behaviors.
