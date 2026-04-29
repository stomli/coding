/**
 * test-special-balls.js
 * 
 * Unit tests for special ball behavior (exploding, painting, blocking)
 */

import Grid from '../../src/modules/Grid.js';
import Ball from '../../src/modules/Ball.js';
import { CONSTANTS } from '../../src/utils/Constants.js';
import { ConfigManager } from '../../src/modules/ConfigManager.js';

// Test Suite
const testSuite = {
	name: 'Special Balls Tests',
	tests: []
};

// Test: Exploding ball clears 7×7 area
testSuite.tests.push({
	name: 'processExplosions - Clears 7×7 area centered on exploding ball',
	async run() {
		
		const grid = new Grid(20, 10);
		
		// Place exploding ball at center
		const explodingBall = new Ball(CONSTANTS.BALL_TYPES.EXPLODING, '#FF0000');
		grid.setBallAt(10, 5, explodingBall); // row 10, col 5
		
		// Fill 7×7 area with normal balls
		for (let r = 7; r <= 13; r++) {
			for (let c = 2; c <= 8; c++) {
				if (grid.getBallAt(r, c) === null) {
					grid.setBallAt(r, c, new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#00FF00'));
				}
			}
		}
		
		// Create match with exploding ball
		const matches = [{
			positions: [{ row: 10, col: 5 }],
			type: 'horizontal'
		}];
		
		// Process explosions
		const exploded = grid.processExplosions(matches);
		
		// Should clear 49 positions (7×7)
		if (exploded.length !== 49) {
			throw new Error(`Should clear 49 positions, cleared ${exploded.length}`);
		}
		
		// All positions in 7×7 area should be cleared
		for (let r = 7; r <= 13; r++) {
			for (let c = 2; c <= 8; c++) {
				if (grid.getBallAt(r, c) !== null) {
					throw new Error(`Position (${r},${c}) should be cleared but wasn't`);
				}
			}
		}
	}
});

// Test: Exploding ball clears blocking balls in radius
testSuite.tests.push({
	name: 'processExplosions - Clears blocking balls within explosion radius',
	async run() {
		
		const grid = new Grid(20, 10);
		
		// Place exploding ball
		const explodingBall = new Ball(CONSTANTS.BALL_TYPES.EXPLODING, '#FF0000');
		grid.setBallAt(10, 5, explodingBall);
		
		// Place blocking ball in explosion radius
		const blockingBall = new Ball(CONSTANTS.BALL_TYPES.BLOCKING, '#000000');
		grid.setBallAt(10, 6, blockingBall); // 1 cell away
		
		// Create match
		const matches = [{
			positions: [{ row: 10, col: 5 }]
		}];
		
		// Process explosions
		grid.processExplosions(matches);
		
		// Blocking ball should be cleared
		if (grid.getBallAt(10, 6) !== null) {
			throw new Error('Blocking ball should be cleared by explosion');
		}
	}
});

// Test: Exploding ball only affects radius
testSuite.tests.push({
	name: 'processExplosions - Does not clear balls outside 7×7 radius',
	async run() {
		
		const grid = new Grid(20, 10);
		
		// Place exploding ball at center
		const explodingBall = new Ball(CONSTANTS.BALL_TYPES.EXPLODING, '#FF0000');
		grid.setBallAt(10, 5, explodingBall);
		
		// Place ball just outside radius (4 cells away = outside 3-cell radius)
		const outsideBall = new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#00FF00');
		grid.setBallAt(10, 9, outsideBall); // 4 cells away horizontally
		
		// Create match
		const matches = [{
			positions: [{ row: 10, col: 5 }]
		}];
		
		// Process explosions
		grid.processExplosions(matches);
		
		// Ball outside radius should remain
		if (grid.getBallAt(10, 9) === null) {
			throw new Error('Ball outside explosion radius should not be cleared');
		}
	}
});

// Test: Horizontal painter paints entire row
testSuite.tests.push({
	name: 'processPainters - Horizontal painter paints entire row',
	async run() {
		
		const grid = new Grid(20, 10);
		
		// Place horizontal painter ball
		const painterBall = new Ball(CONSTANTS.BALL_TYPES.PAINTER_HORIZONTAL, '#FF0000');
		grid.setBallAt(10, 5, painterBall);
		
		// Fill row with different colored balls
		for (let c = 0; c < 10; c++) {
			if (c !== 5) {
				grid.setBallAt(10, c, new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#0000FF'));
			}
		}
		
		// Create match
		const matches = [{
			positions: [{ row: 10, col: 5 }]
		}];
		
		// Process painters
		const painted = grid.processPainters(matches);
		
		// Should paint 10 positions (entire row)
		if (painted.length < 9) { // At least 9 (all except painter itself if already same color)
			throw new Error(`Should paint at least 9 positions, painted ${painted.length}`);
		}
		
		// All balls in row should be red now
		for (let c = 0; c < 10; c++) {
			const ball = grid.getBallAt(10, c);
			if (ball && ball.getColor() !== '#FF0000') {
				throw new Error(`Ball at (10,${c}) should be painted red`);
			}
		}
	}
});

// Test: Vertical painter paints entire column
testSuite.tests.push({
	name: 'processPainters - Vertical painter paints entire column',
	async run() {
		
		const grid = new Grid(20, 10);
		
		// Place vertical painter ball
		const painterBall = new Ball(CONSTANTS.BALL_TYPES.PAINTER_VERTICAL, '#00FF00');
		grid.setBallAt(10, 5, painterBall);
		
		// Fill column with different colored balls
		for (let r = 0; r < 20; r++) {
			if (r !== 10) {
				grid.setBallAt(r, 5, new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#0000FF'));
			}
		}
		
		// Create match
		const matches = [{
			positions: [{ row: 10, col: 5 }]
		}];
		
		// Process painters
		const painted = grid.processPainters(matches);
		
		// Should paint 20 positions (entire column)
		if (painted.length < 19) { // At least 19
			throw new Error(`Should paint at least 19 positions, painted ${painted.length}`);
		}
		
		// All balls in column should be green now
		for (let r = 0; r < 20; r++) {
			const ball = grid.getBallAt(r, 5);
			if (ball && ball.getColor() !== '#00FF00') {
				throw new Error(`Ball at (${r},5) should be painted green`);
			}
		}
	}
});

// Test: Diagonal NE painter paints diagonal lines
testSuite.tests.push({
	name: 'processPainters - Diagonal painter paints diagonal lines',
	async run() {
		
		const grid = new Grid(20, 10);
		
		// Place diagonal NE painter ball
		const painterBall = new Ball(CONSTANTS.BALL_TYPES.PAINTER_DIAGONAL_NE, '#FFFF00');
		grid.setBallAt(10, 5, painterBall);
		
		// Fill grid with blue balls
		for (let r = 0; r < 20; r++) {
			for (let c = 0; c < 10; c++) {
				if (r !== 10 || c !== 5) {
					grid.setBallAt(r, c, new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#0000FF'));
				}
			}
		}
		
		// Create match
		const matches = [{
			positions: [{ row: 10, col: 5 }]
		}];
		
		// Process painters
		const painted = grid.processPainters(matches);
		
		// Should paint NE-SW diagonal line
		if (painted.length < 5) { // At least some diagonal cells
			throw new Error(`Should paint diagonal cells, painted ${painted.length}`);
		}
		
		// Check some diagonal cells are painted
		// NE direction (row-1, col+1)
		if (grid.getBallAt(9, 6)) {
			const ball1 = grid.getBallAt(9, 6);
			if (ball1.getColor() !== '#FFFF00') {
				throw new Error('Diagonal cell (9,6) should be painted yellow');
			}
		}
		
		// SW direction (row+1, col-1)
		if (grid.getBallAt(11, 4)) {
			const ball2 = grid.getBallAt(11, 4);
			if (ball2.getColor() !== '#FFFF00') {
				throw new Error('Diagonal cell (11,4) should be painted yellow');
			}
		}
	}
});

// Test: Painters don't paint blocking balls
testSuite.tests.push({
	name: 'processPainters - Does not paint blocking balls',
	async run() {
		
		const grid = new Grid(20, 10);
		
		// Place horizontal painter ball
		const painterBall = new Ball(CONSTANTS.BALL_TYPES.PAINTER_HORIZONTAL, '#FF0000');
		grid.setBallAt(10, 5, painterBall);
		
		// Place blocking ball in same row
		const blockingBall = new Ball(CONSTANTS.BALL_TYPES.BLOCKING, '#000000');
		grid.setBallAt(10, 7, blockingBall);
		
		// Create match
		const matches = [{
			positions: [{ row: 10, col: 5 }]
		}];
		
		// Process painters
		grid.processPainters(matches);
		
		// Blocking ball should still be black
		const ball = grid.getBallAt(10, 7);
		if (ball.getColor() !== '#000000') {
			throw new Error('Blocking ball should not be painted');
		}
		
		// And should still be blocking type
		if (ball.getType() !== CONSTANTS.BALL_TYPES.BLOCKING) {
			throw new Error('Blocking ball type should not change');
		}
	}
});

// Test: Multiple explosions combine
testSuite.tests.push({
	name: 'processExplosions - Multiple exploding balls combine areas',
	async run() {
		
		const grid = new Grid(20, 10);
		
		// Place two exploding balls close together
		const explode1 = new Ball(CONSTANTS.BALL_TYPES.EXPLODING, '#FF0000');
		const explode2 = new Ball(CONSTANTS.BALL_TYPES.EXPLODING, '#FF0000');
		grid.setBallAt(10, 3, explode1);
		grid.setBallAt(10, 7, explode2);
		
		// Fill area with normal balls
		for (let r = 5; r < 15; r++) {
			for (let c = 0; c < 10; c++) {
				if (grid.getBallAt(r, c) === null) {
					grid.setBallAt(r, c, new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#00FF00'));
				}
			}
		}
		
		// Create match with both exploding balls
		const matches = [{
			positions: [
				{ row: 10, col: 3 },
				{ row: 10, col: 7 }
			]
		}];
		
		// Process explosions
		const exploded = grid.processExplosions(matches);
		
		// Should clear overlapping 7×7 areas
		// First explosion: rows 7-13, cols 0-6
		// Second explosion: rows 7-13, cols 4-10 (but max is 9)
		// Should have substantial clearing
		if (exploded.length < 70) {
			throw new Error(`Should clear at least 70 positions, cleared ${exploded.length}`);
		}
	}
});

// Test: Empty match list returns empty arrays
testSuite.tests.push({
	name: 'processExplosions - Returns empty array for no matches',
	async run() {
		
		const grid = new Grid(20, 10);
		
		const exploded = grid.processExplosions([]);
		
		if (exploded.length !== 0) {
			throw new Error('Should return empty array for no matches');
		}
	}
});

// Test: Painters with empty matches
testSuite.tests.push({
	name: 'processPainters - Returns empty array for no matches',
	async run() {
		
		const grid = new Grid(20, 10);
		
		const painted = grid.processPainters([]);
		
		if (painted.length !== 0) {
			throw new Error('Should return empty array for no matches');
		}
	}
});

// Test: Normal balls don't trigger special effects
testSuite.tests.push({
	name: 'processExplosions - Normal balls do not explode',
	async run() {
		
		const grid = new Grid(20, 10);
		
		// Place normal balls
		grid.setBallAt(10, 5, new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#FF0000'));
		grid.setBallAt(10, 6, new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#FF0000'));
		grid.setBallAt(10, 7, new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#FF0000'));
		
		// Place ball outside match area
		grid.setBallAt(10, 9, new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#00FF00'));
		
		// Create match with normal balls
		const matches = [{
			positions: [
				{ row: 10, col: 5 },
				{ row: 10, col: 6 },
				{ row: 10, col: 7 }
			]
		}];
		
		// Process explosions
		const exploded = grid.processExplosions(matches);
		
		// Should not clear anything (no exploding balls)
		if (exploded.length !== 0) {
			throw new Error('Normal balls should not trigger explosions');
		}
		
		// Ball outside should still exist
		if (grid.getBallAt(10, 9) === null) {
			throw new Error('Ball outside match should not be affected');
		}
	}
});

// Test: Painters only activate when matched in correct direction
testSuite.tests.push({
	name: 'processPainters - Paints when painter is in match',
	async run() {
		
		const grid = new Grid(20, 10);
		
		// Place horizontal painter
		const painterBall = new Ball(CONSTANTS.BALL_TYPES.PAINTER_HORIZONTAL, '#FF0000');
		grid.setBallAt(10, 5, painterBall);
		
		// Create match NOT including the painter position
		const matches = [{
			positions: [
				{ row: 10, col: 6 },
				{ row: 10, col: 7 },
				{ row: 10, col: 8 }
			]
		}];
		
		// Process painters
		const painted = grid.processPainters(matches);
		
		// Should not paint anything (painter not in match)
		if (painted.length !== 0) {
			throw new Error('Painter should only activate when included in match');
		}
	}
});

// Test: Explosion at grid edge doesn't go out of bounds
testSuite.tests.push({
	name: 'processExplosions - Edge explosion stays in bounds',
	async run() {
		
		const grid = new Grid(10, 10);
		
		// Place exploding ball at corner (0, 0)
		const explodingBall = new Ball(CONSTANTS.BALL_TYPES.EXPLODING, '#FF0000');
		grid.setBallAt(0, 0, explodingBall);
		
		// Fill grid with normal balls
		for (let r = 0; r < 10; r++) {
			for (let c = 0; c < 10; c++) {
				if (grid.getBallAt(r, c) === null) {
					grid.setBallAt(r, c, new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#00FF00'));
				}
			}
		}
		
		// Create match
		const matches = [{
			positions: [{ row: 0, col: 0 }]
		}];
		
		// Should not throw error even though explosion would go out of bounds
		let errorThrown = false;
		try {
			grid.processExplosions(matches);
		} catch (e) {
			errorThrown = true;
		}
		
		if (errorThrown) {
			throw new Error('Explosion at edge should not throw error');
		}
	}
});

// Test: Painter at grid edge works correctly
testSuite.tests.push({
	name: 'processPainters - Edge painter stays in bounds',
	async run() {
		
		const grid = new Grid(10, 10);
		
		// Place vertical painter at top edge
		const painterBall = new Ball(CONSTANTS.BALL_TYPES.PAINTER_VERTICAL, '#FF0000');
		grid.setBallAt(0, 5, painterBall);
		
		// Fill column
		for (let r = 0; r < 10; r++) {
			if (grid.getBallAt(r, 5) === null) {
				grid.setBallAt(r, 5, new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#00FF00'));
			}
		}
		
		// Create match
		const matches = [{
			positions: [{ row: 0, col: 5 }]
		}];
		
		// Should not throw error
		let errorThrown = false;
		try {
			grid.processPainters(matches);
		} catch (e) {
			errorThrown = true;
		}
		
		if (errorThrown) {
			throw new Error('Painter at edge should not throw error');
		}
		
		// Should paint the column
		if (grid.getBallAt(9, 5).getColor() !== '#FF0000') {
			throw new Error('Column should be painted');
		}
	}
});

// Test: Exploding ball in match with other special balls
testSuite.tests.push({
	name: 'processExplosions - Works with mixed special balls',
	async run() {
		
		const grid = new Grid(20, 10);
		
		// Place exploding ball and painter ball together
		const explodingBall = new Ball(CONSTANTS.BALL_TYPES.EXPLODING, '#FF0000');
		const painterBall = new Ball(CONSTANTS.BALL_TYPES.PAINTER_HORIZONTAL, '#FF0000');
		grid.setBallAt(10, 5, explodingBall);
		grid.setBallAt(10, 6, painterBall);
		
		// Fill area
		for (let r = 7; r <= 13; r++) {
			for (let c = 2; c <= 8; c++) {
				if (grid.getBallAt(r, c) === null) {
					grid.setBallAt(r, c, new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#00FF00'));
				}
			}
		}
		
		// Create match
		const matches = [{
			positions: [
				{ row: 10, col: 5 },
				{ row: 10, col: 6 }
			]
		}];
		
		// Process explosions
		const exploded = grid.processExplosions(matches);
		
		// Should clear explosion area
		if (exploded.length === 0) {
			throw new Error('Should clear explosion area');
		}
	}
});

// Test: Multiple painters in one match
testSuite.tests.push({
	name: 'processPainters - Multiple painters process correctly',
	async run() {
		
		const grid = new Grid(20, 10);
		
		// Place two horizontal painters
		const painter1 = new Ball(CONSTANTS.BALL_TYPES.PAINTER_HORIZONTAL, '#FF0000');
		const painter2 = new Ball(CONSTANTS.BALL_TYPES.PAINTER_HORIZONTAL, '#FF0000');
		grid.setBallAt(10, 5, painter1);
		grid.setBallAt(10, 6, painter2);
		
		// Fill row
		for (let c = 0; c < 10; c++) {
			if (grid.getBallAt(10, c) === null) {
				grid.setBallAt(10, c, new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#00FF00'));
			}
		}
		
		// Create match
		const matches = [{
			positions: [
				{ row: 10, col: 5 },
				{ row: 10, col: 6 }
			]
		}];
		
		// Process painters - should only process first painter found
		const painted = grid.processPainters(matches);
		
		// Should paint the row
		if (painted.length === 0) {
			throw new Error('Should paint when painters in match');
		}
		
		// Row should be red
		if (grid.getBallAt(10, 0).getColor() !== '#FF0000') {
			throw new Error('Row should be painted red');
		}
	}
});

// Test: Explosion returns correct position data
testSuite.tests.push({
	name: 'processExplosions - Returns correct cleared positions',
	async run() {
		
		const grid = new Grid(20, 10);
		
		// Place exploding ball
		const explodingBall = new Ball(CONSTANTS.BALL_TYPES.EXPLODING, '#FF0000');
		grid.setBallAt(10, 5, explodingBall);
		
		// Place specific balls around it
		grid.setBallAt(10, 6, new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#00FF00'));
		grid.setBallAt(11, 5, new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#00FF00'));
		
		// Create match
		const matches = [{
			positions: [{ row: 10, col: 5 }]
		}];
		
		// Process explosions
		const exploded = grid.processExplosions(matches);
		
		// Should return position objects with row and col
		if (exploded.length > 0) {
			const firstPos = exploded[0];
			if (typeof firstPos.row !== 'number' || typeof firstPos.col !== 'number') {
				throw new Error('Returned positions should have row and col properties');
			}
		}
		
		// Should include the exploding ball position
		const hasCenter = exploded.some(p => p.row === 10 && p.col === 5);
		if (!hasCenter) {
			throw new Error('Should include center explosion position');
		}
		
		// Should include adjacent positions
		const hasRight = exploded.some(p => p.row === 10 && p.col === 6);
		const hasBelow = exploded.some(p => p.row === 11 && p.col === 5);
		if (!hasRight || !hasBelow) {
			throw new Error('Should include adjacent positions in explosion');
		}
	}
});

// Test: Painter returns correct painted data
testSuite.tests.push({
	name: 'processPainters - Returns painted position data',
	async run() {
		
		const grid = new Grid(10, 10);
		
		// Place horizontal painter
		const painterBall = new Ball(CONSTANTS.BALL_TYPES.PAINTER_HORIZONTAL, '#FF0000');
		grid.setBallAt(5, 5, painterBall);
		
		// Fill row with blue balls
		for (let c = 0; c < 10; c++) {
			if (grid.getBallAt(5, c) === null) {
				grid.setBallAt(5, c, new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#0000FF'));
			}
		}
		
		// Create match
		const matches = [{
			positions: [{ row: 5, col: 5 }]
		}];
		
		// Process painters
		const painted = grid.processPainters(matches);
		
		// Should return painted position data
		if (painted.length > 0) {
			const firstPaint = painted[0];
			if (typeof firstPaint.row !== 'number' || 
			    typeof firstPaint.col !== 'number' ||
			    typeof firstPaint.oldColor !== 'string' ||
			    typeof firstPaint.newColor !== 'string') {
				throw new Error('Painted data should include row, col, oldColor, newColor');
			}
		}
		
		// Should have oldColor and newColor different
		const blueChanged = painted.find(p => p.oldColor === '#0000FF');
		if (blueChanged && blueChanged.newColor !== '#FF0000') {
			throw new Error('Should change blue to red');
		}
	}
});

// Test: Blocking ball properties
testSuite.tests.push({
	name: 'Blocking ball - Has correct properties',
	async run() {
		
		const blockingBall = new Ball(CONSTANTS.BALL_TYPES.BLOCKING, '#888888');
		
		if (blockingBall.isMatchable() !== false) {
			throw new Error('Blocking ball should not be matchable');
		}
		
		if (blockingBall.isSpecial() !== true) {
			throw new Error('Blocking ball should be special');
		}
		
		if (blockingBall.isExploding() !== false) {
			throw new Error('Blocking ball should not be exploding');
		}
		
		if (blockingBall.isPainter() !== false) {
			throw new Error('Blocking ball should not be painter');
		}
	}
});

// Test: Exploding ball properties
testSuite.tests.push({
	name: 'Exploding ball - Has correct properties',
	async run() {
		
		const explodingBall = new Ball(CONSTANTS.BALL_TYPES.EXPLODING, '#FF0000');
		
		if (explodingBall.isMatchable() !== true) {
			throw new Error('Exploding ball should be matchable');
		}
		
		if (explodingBall.isSpecial() !== true) {
			throw new Error('Exploding ball should be special');
		}
		
		if (explodingBall.isExploding() !== true) {
			throw new Error('Exploding ball should be exploding');
		}
		
		if (explodingBall.isPainter() !== false) {
			throw new Error('Exploding ball should not be painter');
		}
	}
});

// Test: Painter ball properties
testSuite.tests.push({
	name: 'Painter ball - Has correct properties',
	async run() {
		
		const painterBall = new Ball(CONSTANTS.BALL_TYPES.PAINTER_HORIZONTAL, '#00FF00');
		
		if (painterBall.isMatchable() !== true) {
			throw new Error('Painter ball should be matchable');
		}
		
		if (painterBall.isSpecial() !== true) {
			throw new Error('Painter ball should be special');
		}
		
		if (painterBall.isExploding() !== false) {
			throw new Error('Painter ball should not be exploding');
		}
		
		if (painterBall.isPainter() !== true) {
			throw new Error('Painter ball should be painter');
		}
		
		if (painterBall.getPainterDirection() !== 'horizontal') {
			throw new Error('Horizontal painter should return horizontal direction');
		}
	}
});

// ─────────────────────────────────────────────────────────────────────────────
// Effect-before-removal ordering tests
//
// These tests guard against the regression where processExplosions was called
// before processPainters, causing an explosion in the same match to silently
// destroy a painter before it could paint its line.
// ─────────────────────────────────────────────────────────────────────────────

// Test: Painter fires before the matched balls are removed
// The painter's effect (color changes to neighbouring balls) must be observable
// on the live grid BEFORE any clearing step removes the painter itself.
testSuite.tests.push({
	name: 'Ordering - Painter fires its effect before balls are removed from grid',
	async run() {
		const grid = new Grid(10, 10);

		// Row 5: [RED] [RED] [PAINTER-H-RED] [BLUE] [BLUE] [BLUE] ...
		// The horizontal painter sits inside a 3-ball red match.
		const painterBall = new Ball(CONSTANTS.BALL_TYPES.PAINTER_HORIZONTAL, '#FF0000');
		grid.setBallAt(5, 0, new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#FF0000'));
		grid.setBallAt(5, 1, new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#FF0000'));
		grid.setBallAt(5, 2, painterBall);
		// Remaining columns are blue
		for (let c = 3; c < 10; c++) {
			grid.setBallAt(5, c, new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#0000FF'));
		}

		const matches = [{
			positions: [
				{ row: 5, col: 0 },
				{ row: 5, col: 1 },
				{ row: 5, col: 2 }
			],
			direction: 'horizontal',
			color: '#FF0000'
		}];

		// Step 1 — painter fires (simulating what GameEngine now does FIRST)
		const painted = grid.processPainters(matches);

		// The effect must be visible on the grid before any removal happens.
		// All blue balls in row 5 should now be red.
		for (let c = 3; c < 10; c++) {
			const ball = grid.getBallAt(5, c);
			if (!ball) {
				throw new Error(`Ball at (5,${c}) should still exist (no clearing has happened yet)`);
			}
			if (ball.getColor() !== '#FF0000') {
				throw new Error(`Ball at (5,${c}) should be painted red before removal, got ${ball.getColor()}`);
			}
		}

		if (painted.length === 0) {
			throw new Error('processPainters should have returned painted positions');
		}

		// Step 2 — only NOW do we simulate the clearing step
		// The painter itself should still be present at this point
		if (grid.getBallAt(5, 2) === null) {
			throw new Error('Painter ball should still be on the grid after processPainters (clearing has not happened yet)');
		}
	}
});

// Test: Exploding ball fires before it is removed from the grid
// processExplosions removes the exploding ball as part of its area-clear, so by
// definition the ball "fires then is removed" atomically — but this test
// confirms the cleared area includes the exploder's own cell, proving it WAS
// present when the effect ran.
testSuite.tests.push({
	name: 'Ordering - Exploding ball fires before it is removed from grid',
	async run() {
		const grid = new Grid(10, 10);

		const explodingBall = new Ball(CONSTANTS.BALL_TYPES.EXPLODING, '#FF0000');
		grid.setBallAt(5, 5, explodingBall);
		// Surround with normal balls
		grid.setBallAt(5, 4, new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#FF0000'));
		grid.setBallAt(5, 6, new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#FF0000'));

		const matches = [{
			positions: [
				{ row: 5, col: 4 },
				{ row: 5, col: 5 },
				{ row: 5, col: 6 }
			],
			direction: 'horizontal',
			color: '#FF0000'
		}];

		// processExplosions fires and removes in one step; confirm the exploding
		// ball's own position is included in returned cleared positions (it was
		// present and participating when it fired).
		const exploded = grid.processExplosions(matches);

		const exploderCleared = exploded.some(p => p.row === 5 && p.col === 5);
		if (!exploderCleared) {
			throw new Error('Exploding ball position should be in cleared set — ball was present when explosion fired');
		}

		// And the grid cell should now be empty
		if (grid.getBallAt(5, 5) !== null) {
			throw new Error('Exploding ball should be gone from grid after processExplosions');
		}
	}
});

// Test: Painter in match alongside exploding ball — painter effect is visible
// before explosion removes everything. This is the exact scenario that was
// broken: processPainters is called FIRST; processExplosions is called SECOND.
// If the order were reversed, painted.length would be 0.
testSuite.tests.push({
	name: 'Ordering - Painter paints row before co-matched explosion can destroy it',
	async run() {
		const grid = new Grid(10, 10);

		// Row 5: [RED] [PAINTER-H-RED] [EXPLODING-RED] [BLUE] [BLUE] [BLUE] ...
		// All three reds form a match. In the old (wrong) order, the explosion
		// fires first, its 7×7 radius removes the painter, then processPainters
		// finds null and paints nothing.
		grid.setBallAt(5, 0, new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#FF0000'));
		grid.setBallAt(5, 1, new Ball(CONSTANTS.BALL_TYPES.PAINTER_HORIZONTAL, '#FF0000'));
		grid.setBallAt(5, 2, new Ball(CONSTANTS.BALL_TYPES.EXPLODING, '#FF0000'));
		for (let c = 3; c < 10; c++) {
			grid.setBallAt(5, c, new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#0000FF'));
		}

		const matches = [{
			positions: [
				{ row: 5, col: 0 },
				{ row: 5, col: 1 },
				{ row: 5, col: 2 }
			],
			direction: 'horizontal',
			color: '#FF0000'
		}];

		// Correct order: painters FIRST
		const painted = grid.processPainters(matches);

		// Blue balls in row 5 must be painted red before the explosion fires
		for (let c = 3; c < 10; c++) {
			const ball = grid.getBallAt(5, c);
			if (!ball) {
				throw new Error(`Ball at (5,${c}) unexpectedly null — explosion must not have run yet`);
			}
			if (ball.getColor() !== '#FF0000') {
				throw new Error(
					`Ball at (5,${c}) should be red (painter fired first), got ${ball.getColor()}. ` +
					`If this is blue, the explosion fired before the painter.`
				);
			}
		}

		if (painted.length === 0) {
			throw new Error(
				'processPainters returned 0 painted positions — ' +
				'this suggests the painter was already removed by an explosion before it could fire'
			);
		}

		// NOW fire explosion (second step, as GameEngine now does)
		grid.processExplosions(matches);

		// Painter ball itself cleared by explosion is fine — it already fired
		// Confirm some non-match blue cells (now red) were also swept by explosion radius
		// (row 5, cols within 3 of col 2 = cols 0-5 cleared)
		if (grid.getBallAt(5, 3) !== null) {
			// col 3 is within radius-3 of col 2, so it should be cleared
			throw new Error('Col 3 should be cleared by explosion radius (it is within 3 cells of col 2)');
		}
	}
});

export default testSuite;
