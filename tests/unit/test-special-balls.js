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
		await ConfigManager.loadConfig();
		
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
		await ConfigManager.loadConfig();
		
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
		await ConfigManager.loadConfig();
		
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
		await ConfigManager.loadConfig();
		
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
		await ConfigManager.loadConfig();
		
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

// Test: Diagonal painter paints diagonal lines
testSuite.tests.push({
	name: 'processPainters - Diagonal painter paints diagonal lines',
	async run() {
		await ConfigManager.loadConfig();
		
		const grid = new Grid(20, 10);
		
		// Place diagonal painter ball
		const painterBall = new Ball(CONSTANTS.BALL_TYPES.PAINTER_DIAGONAL, '#FFFF00');
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
		
		// Should paint diagonal lines (both diagonals through the point)
		if (painted.length < 10) { // At least some diagonal cells
			throw new Error(`Should paint diagonal cells, painted ${painted.length}`);
		}
		
		// Check some diagonal cells are painted
		// Down-right diagonal
		if (grid.getBallAt(11, 6)) {
			const ball1 = grid.getBallAt(11, 6);
			if (ball1.getColor() !== '#FFFF00') {
				throw new Error('Diagonal cell (11,6) should be painted yellow');
			}
		}
		
		// Down-left diagonal
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
		await ConfigManager.loadConfig();
		
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
		await ConfigManager.loadConfig();
		
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
		await ConfigManager.loadConfig();
		
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
		await ConfigManager.loadConfig();
		
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
		await ConfigManager.loadConfig();
		
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
		await ConfigManager.loadConfig();
		
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
		await ConfigManager.loadConfig();
		
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
		await ConfigManager.loadConfig();
		
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
		await ConfigManager.loadConfig();
		
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
		await ConfigManager.loadConfig();
		
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
		await ConfigManager.loadConfig();
		
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
		await ConfigManager.loadConfig();
		
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
		await ConfigManager.loadConfig();
		
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
		await ConfigManager.loadConfig();
		
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
		await ConfigManager.loadConfig();
		
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

export default testSuite;
