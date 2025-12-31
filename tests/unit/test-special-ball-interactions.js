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
	
	// Test 3: Painter paints another painter into match, both trigger
	try {
		const grid = new Grid(10, 8);
		
		// Create horizontal match with horizontal painter
		const redBall1 = new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#FF0000');
		const redBall2 = new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#FF0000');
		const hPainter = new Ball(CONSTANTS.BALL_TYPES.PAINTER_HORIZONTAL, '#FF0000');
		
		grid.setBallAt(5, 0, redBall1);
		grid.setBallAt(5, 1, redBall2);
		grid.setBallAt(5, 2, hPainter);
		
		// Place vertical painter (different color) that will be painted
		const vPainter = new Ball(CONSTANTS.BALL_TYPES.PAINTER_VERTICAL, '#0000FF');
		grid.setBallAt(5, 4, vPainter);
		
		// Place blue balls in column 4 to form a vertical match after painting
		// Need at least 3 balls including the painter for a match
		const blueBall1 = new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#0000FF');
		const blueBall2 = new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#0000FF');
		const blueBall3 = new Ball(CONSTANTS.BALL_TYPES.NORMAL, '#0000FF');
		grid.setBallAt(3, 4, blueBall1);
		grid.setBallAt(4, 4, blueBall2); // Add one more for consecutive match
		grid.setBallAt(6, 4, blueBall3); // Add one more for consecutive match
		
		// Process first painter
		const matches1 = grid.findMatches();
		const painted1 = grid.processPainters(matches1);
		
		if (painted1.length === 0) {
			throw new Error(`First painter did not paint anything`);
		}
		
		// Verify vertical painter is now red
		const painterColor = grid.getBallAt(5, 4)?.getColor();
		const painterPainted = painterColor === '#FF0000';
		
		if (!painterPainted) {
			throw new Error(`Vertical painter not painted red: color=${painterColor}`);
		}
		
		// Re-find matches
		const matches2 = grid.findMatches();
		
		if (matches2.length === 0) {
			throw new Error(`No matches found after painting vertical painter`);
		}
		
		// Verify v-painter is in a match
		const vPainterInMatch = matches2.some(match =>
			match.positions.some(pos => pos.row === 5 && pos.col === 4)
		);
		
		if (!vPainterInMatch) {
			throw new Error(`Vertical painter not in any match after being painted`);
		}
		
		// Process vertical painter
		const painted2 = grid.processPainters(matches2);
		
		if (painted2.length === 0) {
			throw new Error(`Vertical painter did not paint anything`);
		}
		
		// Verify column was painted
		const col4Ball1 = grid.getBallAt(3, 4)?.getColor();
		const col4Ball2 = grid.getBallAt(4, 4)?.getColor();
		const col4Ball3 = grid.getBallAt(6, 4)?.getColor();
		const columnPainted = col4Ball1 === '#FF0000' && 
		                      col4Ball2 === '#FF0000' && 
		                      col4Ball3 === '#FF0000';
		
		if (!columnPainted) {
			throw new Error(`Column not painted: (3,4)=${col4Ball1}, (4,4)=${col4Ball2}, (6,4)=${col4Ball3}`);
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
	
	return tests;
}
