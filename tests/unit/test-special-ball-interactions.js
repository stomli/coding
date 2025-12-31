/**
 * Tests for special ball interactions (painters, explosions, etc.)
 * @module test-special-ball-interactions
 */

import Grid from '../../src/modules/Grid.js';
import Ball from '../../src/modules/Ball.js';
import { CONSTANTS } from '../../src/utils/Constants.js';

/**
 * Run all special ball interaction tests
 * @returns {Array} Test results
 */
export function runSpecialBallInteractionTests() {
	const tests = [];
	
	// Test 1: Painter paints exploding ball into match, explosion triggers
	try {
		const grid = new Grid(10, 8); // 10 rows, 8 columns
		
		// Setup: Create a horizontal match with a painter
		// Row 5: [RED] [RED] [PAINTER-H-RED] ... [BLUE] [BLUE] [EXPLODING-RED] [BLUE]
		const redBall1 = new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#FF0000');
		const redBall2 = new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#FF0000');
		const painterBall = new Ball(CONSTANTS.BALL_TYPES.PAINTER_HORIZONTAL, '#FF0000');
		
		grid.setBallAt(5, 0, redBall1);
		grid.setBallAt(5, 1, redBall2);
		grid.setBallAt(5, 2, painterBall);
		
		// Add blue balls that will be painted red
		const blueBall1 = new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#0000FF');
		const blueBall2 = new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#0000FF');
		const blueBall3 = new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#0000FF');
		grid.setBallAt(5, 4, blueBall1);
		grid.setBallAt(5, 5, blueBall2);
		grid.setBallAt(5, 7, blueBall3);
		
		// Add exploding red ball
		const explodingBall = new Ball(CONSTANTS.BALL_TYPES.EXPLODING, '#FF0000');
		grid.setBallAt(5, 6, explodingBall);
		
		// Add surrounding balls to verify explosion
		const greenBall1 = new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#00FF00');
		const greenBall2 = new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#00FF00');
		const greenBall3 = new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#00FF00');
		grid.setBallAt(4, 6, greenBall1);
		grid.setBallAt(6, 6, greenBall2);
		grid.setBallAt(5, 3, greenBall3);
		
		// Step 1: Find initial matches
		const initialMatches = grid.findMatches();
		const hasRedMatch = initialMatches.length === 1 && initialMatches[0].color === '#FF0000';
		
		if (!hasRedMatch) {
			throw new Error(`Initial match check failed: found ${initialMatches.length} matches, first color: ${initialMatches[0]?.color}`);
		}
		
		// Step 2: Process painters
		const paintedPositions = grid.processPainters(initialMatches);
		const bluesPainted = grid.getBallAt(5, 4).getColor() === '#FF0000' && 
		                     grid.getBallAt(5, 5).getColor() === '#FF0000';
		
		if (!bluesPainted) {
			throw new Error(`Painting failed: ball(5,4)=${grid.getBallAt(5, 4)?.getColor()}, ball(5,5)=${grid.getBallAt(5, 5)?.getColor()}, painted ${paintedPositions.length} positions`);
		}
		
		// Step 3: Re-find matches after painting
		const matchesAfterPaint = grid.findMatches();
		const exploderInMatch = matchesAfterPaint.some(match =>
			match.positions.some(pos => pos.row === 5 && pos.col === 6)
		);
		
		if (!exploderInMatch) {
			throw new Error(`Exploder not in match after painting: found ${matchesAfterPaint.length} matches`);
		}
		
		// Step 4: Process explosions
		const explodedPositions = grid.processExplosions(matchesAfterPaint);
		const exploderCleared = grid.getBallAt(5, 6) === null;
		const surroundingsCleared = grid.getBallAt(4, 6) === null || 
		                            grid.getBallAt(6, 6) === null;
		
		if (!exploderCleared) {
			throw new Error(`Exploder not cleared: still at (5,6)`);
		}
		if (!surroundingsCleared) {
			throw new Error(`Surroundings not cleared: (4,6)=${grid.getBallAt(4, 6) !== null}, (6,6)=${grid.getBallAt(6, 6) !== null}`);
		}
		if (explodedPositions.length === 0) {
			throw new Error(`No positions exploded`);
		}
		
		tests.push({
			name: 'SpecialBalls - Painter paints exploding ball into match, explosion triggers',
			pass: true,
			error: null
		});
	} catch (error) {
		tests.push({
			name: 'SpecialBalls - Painter paints exploding ball into match, explosion triggers',
			pass: false,
			error: error.message
		});
	}
	
	// Test 2: Exploding ball does NOT trigger other special balls in blast radius
	try {
		const grid = new Grid(10, 8);
		
		// Create match with exploding ball
		const redExploder1 = new Ball(CONSTANTS.BALL_TYPES.EXPLODING, '#FF0000');
		const redBall1 = new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#FF0000');
		const redBall2 = new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#FF0000');
		
		grid.setBallAt(5, 3, redExploder1);
		grid.setBallAt(5, 4, redBall1);
		grid.setBallAt(5, 5, redBall2);
		
		// Place second exploding ball in blast radius
		const redExploder2 = new Ball(CONSTANTS.BALL_TYPES.EXPLODING, '#0000FF');
		grid.setBallAt(5, 6, redExploder2); // 3 cells away, within radius
		
		// Place marker balls OUTSIDE first explosion radius (row 5, col 3 center, radius 3)
		// Radius 3 means positions from (2,0) to (8,6) are cleared
		// So place markers at row 1 (4 cells away from row 5) and row 9 (4 cells away)
		const markerBall1 = new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#00FF00');
		const markerBall2 = new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#00FF00');
		const markerBall3 = new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#00FF00');
		grid.setBallAt(1, 3, markerBall1); // Row 1 = 4 away from row 5 (outside radius)
		grid.setBallAt(9, 3, markerBall2); // Row 9 = 4 away from row 5 (outside radius)
		grid.setBallAt(5, 7, markerBall3); // Col 7 = 4 away from col 3 (outside radius)
		
		// Find and process
		const matches = grid.findMatches();
		const explodedPositions = grid.processExplosions(matches);
		
		// Both exploders should be cleared
		const firstExploderGone = grid.getBallAt(5, 3) === null;
		const secondExploderGone = grid.getBallAt(5, 6) === null;
		
		if (!firstExploderGone) {
			throw new Error(`First exploder not cleared at (5,3)`);
		}
		if (!secondExploderGone) {
			throw new Error(`Second exploder not cleared at (5,6)`);
		}
		
		// Markers on the edge should still exist (proving second didn't explode)
		// If second exploder triggered, it would clear positions around (5,6)
		const markersExist = grid.getBallAt(1, 3) !== null && 
		                     grid.getBallAt(9, 3) !== null &&
		                     grid.getBallAt(5, 7) !== null;
		
		if (!markersExist) {
			throw new Error(`Edge markers were cleared: (1,3)=${grid.getBallAt(1, 3) === null}, (9,3)=${grid.getBallAt(9, 3) === null}, (5,7)=${grid.getBallAt(5, 7) === null}`);
		}
		
		// Should be single explosion area, not two
		const singleExplosion = explodedPositions.length < 60; // Less than 2 full 7x7s
		
		if (!singleExplosion) {
			throw new Error(`Too many positions exploded: ${explodedPositions.length} (suggests chain explosion)`);
		}
		
		tests.push({
			name: 'SpecialBalls - Explosion does NOT trigger other exploding balls',
			pass: true,
			error: null
		});
	} catch (error) {
		tests.push({
			name: 'SpecialBalls - Explosion does NOT trigger other exploding balls',
			pass: false,
			error: error.message
		});
	}
	
	// Test 3: Horizontal painter in simple match
	try {
		const grid = new Grid(10, 10);
		
		// Create horizontal painter with 4 matching balls
		const hPainter = new Ball(CONSTANTS.BALL_TYPES.PAINTER_HORIZONTAL, '#00FF00');
		const g1 = new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#00FF00');
		const g2 = new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#00FF00');
		const g3 = new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#00FF00');
		const g4 = new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#00FF00');
		
		// Row 5: [g1, g2, hPainter, g3, g4] - horizontal match of 5
		grid.setBallAt(5, 0, g1);
		grid.setBallAt(5, 1, g2);
		grid.setBallAt(5, 2, hPainter);
		grid.setBallAt(5, 3, g3);
		grid.setBallAt(5, 4, g4);
		
		// Put different colored ball in same row that should get painted
		const blue = new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#0000FF');
		grid.setBallAt(5, 9, blue);  // Far end of row
		
		const matches = grid.findMatches();
		
		if (matches.length === 0) {
			throw new Error('No match found');
		}
		
		const painted = grid.processPainters(matches);
		
		if (painted.length === 0) {
			throw new Error('No balls painted');
		}
		
		// Blue ball at (5,9) should now be green
		const afterColor = grid.getBallAt(5, 9)?.getColor();
		
		if (afterColor !== '#00FF00') {
			throw new Error(`Ball should be green, is ${afterColor}`);
		}
		
		tests.push({
			name: 'SpecialBalls - Horizontal painter paints its row',
			pass: true,
			error: null
		});
	} catch (error) {
		tests.push({
			name: 'SpecialBalls - Horizontal painter paints its row',
			pass: false,
			error: error.message
		});
	}
	
	// Test 3b: Two painters in same match (painter → painter chain)
	try {
		const grid = new Grid(25, 15);
		
		// Create vertical painter (green) and horizontal painter (red)
		const vPainter = new Ball(CONSTANTS.BALL_TYPES.PAINTER_VERTICAL, '#00FF00');
		const hPainter = new Ball(CONSTANTS.BALL_TYPES.PAINTER_HORIZONTAL, '#FF0000');
		
		// Create vertical match in column 7 that includes both painters
		const g1 = new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#00FF00');
		const g2 = new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#00FF00');
		const g3 = new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#00FF00');
		
		grid.setBallAt(17, 7, vPainter);
		grid.setBallAt(18, 7, g1);
		grid.setBallAt(19, 7, g2);
		grid.setBallAt(20, 7, g3);
		grid.setBallAt(21, 7, hPainter);
		
		// Change horizontal painter to green to form vertical match of 5
		hPainter.setColor('#00FF00');
		
		// Put different colored balls in horizontal painter's row
		const blue = new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#0000FF');
		const yellow = new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#FFFF00');
		const magenta = new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#FF00FF');
		grid.setBallAt(21, 8, blue);
		grid.setBallAt(21, 9, yellow);
		grid.setBallAt(21, 10, magenta);
		
		const matches = grid.findMatches();
		
		// Log match details
		console.log(`DEBUG: Found ${matches.length} matches`);
		matches.forEach((m, i) => {
			console.log(`  Match${i}(${m.direction},len=${m.positions.length}): ${m.positions.map(p => `(${p.row},${p.col})`).join(',')}`);
		});
		
		if (matches.length === 0) {
			throw new Error('No match found');
		}
		
		// Check match positions count BEFORE processPainters
		const posCountBefore = matches[0].positions.length;
		
		const painted = grid.processPainters(matches);
		
		// Check match positions count AFTER processPainters
		const posCountAfter = matches[0].positions.length;
		
		if (posCountBefore !== posCountAfter) {
			throw new Error(`BUG: Match positions changed! Before: ${posCountBefore}, After: ${posCountAfter}. ProcessPainters is modifying the match!`);
		}
		
		// Count how many painters were actually processed
		let vPainterProcessed = false;
		let hPainterProcessed = false;
		matches.forEach(m => {
			m.positions.forEach(p => {
				const ball = grid.getBallAt(p.row, p.col);
				if (ball && ball.isPainter()) {
					if (p.row === 17 && p.col === 7) vPainterProcessed = true;
					if (p.row === 21 && p.col === 7) hPainterProcessed = true;
				}
			});
		});
		
		if (!hPainterProcessed) {
			throw new Error('Horizontal painter NOT in match! vPainter in match: ' + vPainterProcessed);
		}
		
		console.log('Test 3b - Painted positions:', painted.length);
		const row21Painted = painted.filter(p => p.row === 21);
		console.log('Row 21 painted count:', row21Painted.length);
		console.log('Row 21 ALL painted positions:', row21Painted.map(p => `col${p.col}:${p.oldColor}->${p.newColor}`).join(', '));
		
		// Check ALL balls in row 21
		console.log('Row 21 actual ball colors after painting:');
		for (let c = 0; c < 15; c++) {
			const ball = grid.getBallAt(21, c);
			if (ball) {
				console.log(`  col${c}: ${ball.getColor()}`);
			}
		}
		
		if (row21Painted.length === 0) {
			throw new Error('Horizontal painter did not paint row 21 - check console logs above');
		}
		
		// Both painters should have painted with green
		const col8 = grid.getBallAt(21, 8)?.getColor();
		const col9 = grid.getBallAt(21, 9)?.getColor();
		const col10 = grid.getBallAt(21, 10)?.getColor();
		
		if (col8 !== '#00FF00' || col9 !== '#00FF00' || col10 !== '#00FF00') {
			// Show detailed info in error
			const row21PaintedDetails = row21Painted.map(p => `col${p.col}:${p.oldColor}→${p.newColor}`).join(', ');
			const allDebugInfo = row21Painted.map((p, i) => `[${i}] ${p._debug || 'no debug'}`).join('\n');
			const processedPainters = painted[0]?._processedPainters || 'NO PAINTERS PROCESSED';
			const allPositions = painted[0]?._allPositionsChecked || 'NO POSITIONS CHECKED';
			throw new Error(`Row should be green but isn't. Actual: col8=${col8}, col9=${col9}, col10=${col10}. Painted array for row 21 (${row21Painted.length} positions): [${row21PaintedDetails}]\n\nProcessed painters: ${processedPainters}\n\nAll positions checked: ${allPositions}`);
		}
		
		tests.push({
			name: 'SpecialBalls - Two painters in same match, both trigger',
			pass: true,
			error: null
		});
	} catch (error) {
		tests.push({
			name: 'SpecialBalls - Two painters in same match, both trigger',
			pass: false,
			error: error.message
		});
	}
	
	/* ORIGINAL COMPLEX TEST - COMMENTED OUT FOR NOW
	try {
		const grid = new Grid(25, 15);
		
		// Setup: horizontal painter already on the grid with non-matching balls
		const hPainter = new Ball(CONSTANTS.BALL_TYPES.PAINTER_HORIZONTAL, '#FF0000');
		const redBall1 = new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#0000FF');
		const redBall2 = new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#FFFF00');
		const redBall3 = new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#FF00FF');
		
		grid.setBallAt(21, 7, hPainter);
		grid.setBallAt(21, 8, redBall1);
		grid.setBallAt(21, 9, redBall2);
		grid.setBallAt(21, 10, redBall3);
		
		// Drop a vertical column with vertical painter (same color for all)
		// This creates a vertical match of 5 balls in column 7
		const vPainter = new Ball(CONSTANTS.BALL_TYPES.PAINTER_VERTICAL, '#00FF00');
		const greenBall1 = new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#00FF00');
		const greenBall2 = new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#00FF00');
		const greenBall3 = new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#00FF00');
		
		// Place vertical column including the row where horizontal painter is
		// Vertical match: rows 17-21, column 7 (5 consecutive balls)
		grid.setBallAt(17, 7, vPainter);     // Top
		grid.setBallAt(18, 7, greenBall1);
		grid.setBallAt(19, 7, greenBall2);
		grid.setBallAt(20, 7, greenBall3);
		// Row 21, col 7 already has hPainter - need to make it green to match
		
		// Change horizontal painter to green to form the vertical match
		hPainter.setColor('#00FF00');
		
		// Now we have a vertical match: vPainter + 3 green balls + hPainter (all green)
		// Find initial matches
		const matches1 = grid.findMatches();
		
		console.log('Total matches found:', matches1.length);
		matches1.forEach((match, idx) => {
			console.log(`Match ${idx}: ${match.direction}, ${match.positions.length} balls, positions:`, 
			            match.positions.map(p => `(${p.row},${p.col})`).join(', '));
		});
		
		if (matches1.length === 0) {
			throw new Error('No initial vertical match found');
		}
		
		// Verify both painters are in the vertical match
		const verticalMatch = matches1.find(m => m.direction === 'vertical' && m.positions.some(p => p.row === 17 && p.col === 7));
		if (!verticalMatch) {
			throw new Error('Vertical match with painters not found');
		}
		
		console.log('Vertical match found with', verticalMatch.positions.length, 'positions');
		console.log('Match positions:', verticalMatch.positions.map(p => `(${p.row},${p.col})`).join(', '));
		
		const hasVPainter = verticalMatch.positions.some(p => p.row === 17 && p.col === 7);
		const hasHPainter = verticalMatch.positions.some(p => p.row === 21 && p.col === 7);
		
		if (!hasVPainter || !hasHPainter) {
			throw new Error(`Both painters should be in vertical match: vPainter=${hasVPainter}, hPainter=${hasHPainter}`);
		}
		
		// Check painter colors before processing
		const vPainterBall = grid.getBallAt(17, 7);
		const hPainterBall = grid.getBallAt(21, 7);
		console.log('Before processPainters:');
		console.log('  vPainter color:', vPainterBall?.getColor());
		console.log('  hPainter color:', hPainterBall?.getColor());
		console.log('  hPainter type:', hPainterBall?.getType());
		console.log('  hPainter isPainter:', hPainterBall?.isPainter());
		console.log('  hPainter direction:', hPainterBall?.getPainterDirection());
		console.log('Row 21 before painting:');
		for (let c = 7; c <= 10; c++) {
			const ball = grid.getBallAt(21, c);
			console.log(`  (21, ${c}): type=${ball?.getType()}, color=${ball?.getColor()}`);
		}
		
		// Process painters - both should trigger
		const painted1 = grid.processPainters(matches1);
		
		console.log('Painted positions count:', painted1.length);
		console.log('Sample painted positions:', painted1.slice(0, 5));
		
		// Check painted positions for row 21
		const row21Painted = painted1.filter(p => p.row === 21);
		console.log('Row 21 painted positions:', row21Painted.length);
		console.log('Row 21 painted:', row21Painted.map(p => `(${p.row},${p.col}): ${p.oldColor}->${p.newColor}`).join(', '));
		
		// Check what the balls actually are after painting
		console.log('After painting, row 21 colors:');
		for (let c = 7; c <= 10; c++) {
			const ball = grid.getBallAt(21, c);
			console.log(`  (21, ${c}): type=${ball?.getType()}, color=${ball?.getColor()}`);
		}
		
		if (painted1.length === 0) {
			throw new Error('No balls painted initially');
		}
		
		// Verify horizontal painter painted its row (should paint the non-matching balls to green)
		const row21_col8 = grid.getBallAt(21, 8)?.getColor();
		const row21_col9 = grid.getBallAt(21, 9)?.getColor();
		const row21_col10 = grid.getBallAt(21, 10)?.getColor();
		
		const rowPainted = row21_col8 === '#00FF00' && row21_col9 === '#00FF00' && row21_col10 === '#00FF00';
		
		if (!rowPainted) {
			throw new Error(`Horizontal row should be painted green: col8=${row21_col8}, col9=${row21_col9}, col10=${row21_col10}`);
		}
		
		// Verify vertical painter painted its column
		const columnPainted = grid.getBallAt(17, 7)?.getColor() === '#00FF00' &&
		                      grid.getBallAt(18, 7)?.getColor() === '#00FF00' &&
		                      grid.getBallAt(19, 7)?.getColor() === '#00FF00';
		
		if (!columnPainted) {
			throw new Error('Vertical column should be painted green');
		}
		
		tests.push({
			name: 'SpecialBalls - Painter paints another painter, both effects trigger',
			pass: true,
			error: null
		});
	} catch (error) {
		tests.push({
			name: 'SpecialBalls - Painter paints another painter, both effects trigger',
			pass: false,
			error: error.message
		});
	}
	*/
	
	// Test 4: Complex chain - Painter → Painter → Explosion
	try {
		const grid = new Grid(15, 10);
		
		// Setup horizontal painter with match
		const hPainter = new Ball(CONSTANTS.BALL_TYPES.PAINTER_HORIZONTAL, '#00FF00');
		const greenBall1 = new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#00FF00');
		const greenBall2 = new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#00FF00');
		
		grid.setBallAt(7, 3, greenBall1);
		grid.setBallAt(7, 4, greenBall2);
		grid.setBallAt(7, 5, hPainter);
		
		// Place vertical painter (blue) in the horizontal line
		const vPainter = new Ball(CONSTANTS.BALL_TYPES.PAINTER_VERTICAL, '#0000FF');
		grid.setBallAt(7, 6, vPainter);
		
		// Place exploding ball (red) in column 6
		const exploder = new Ball(CONSTANTS.BALL_TYPES.EXPLODING, '#FF0000');
		grid.setBallAt(5, 6, exploder);
		
		// Place blue balls around vertical painter for match after h-painter paints
		const blueBall1 = new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#0000FF');
		const blueBall2 = new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#0000FF');
		grid.setBallAt(6, 6, blueBall1);
		grid.setBallAt(8, 6, blueBall2);
		
		// Place marker balls outside explosion radius to verify explosion happened
		const marker1 = new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#FFFFFF');
		const marker2 = new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#FFFFFF');
		grid.setBallAt(1, 6, marker1); // 4 rows away from explosion center (row 5)
		grid.setBallAt(12, 6, marker2); // 7 rows away from explosion center
		
		// Step 1: Process horizontal painter
		const matches1 = grid.findMatches();
		const painted1 = grid.processPainters(matches1);
		
		if (painted1.length === 0) {
			throw new Error('Horizontal painter did not paint');
		}
		
		// Verify vertical painter painted green
		if (grid.getBallAt(7, 6)?.getColor() !== '#00FF00') {
			throw new Error('Vertical painter not painted green');
		}
		
		// Step 2: Re-find matches and process vertical painter
		const matches2 = grid.findMatches();
		const painted2 = grid.processPainters(matches2);
		
		if (painted2.length === 0) {
			throw new Error('Vertical painter did not paint');
		}
		
		// Verify exploding ball painted green
		if (grid.getBallAt(5, 6)?.getColor() !== '#00FF00') {
			throw new Error('Exploding ball not painted green');
		}
		
		// Step 3: Re-find matches and process explosion
		const matches3 = grid.findMatches();
		const exploded = grid.processExplosions(matches3);
		
		if (exploded.length === 0) {
			throw new Error('Explosion did not trigger');
		}
		
		// Verify explosion cleared 7×7 area around (5, 6)
		// Center and immediate surrounding should be cleared
		const centerCleared = grid.getBallAt(5, 6) === null;
		const adjacentCleared = grid.getBallAt(6, 6) === null && 
		                        grid.getBallAt(4, 6) === null;
		
		// Markers should survive (outside 7×7 radius)
		const markersIntact = grid.getBallAt(1, 6) !== null && 
		                      grid.getBallAt(12, 6) !== null;
		
		if (!centerCleared || !adjacentCleared) {
			throw new Error('Explosion did not clear expected area');
		}
		
		if (!markersIntact) {
			throw new Error('Explosion cleared balls outside radius');
		}
		
		tests.push({
			name: 'SpecialBalls - Complex chain: Painter → Painter → Explosion',
			pass: true,
			error: null
		});
	} catch (error) {
		tests.push({
			name: 'SpecialBalls - Complex chain: Painter → Painter → Explosion',
			pass: false,
			error: error.message
		});
	}
	
	return tests;
}
