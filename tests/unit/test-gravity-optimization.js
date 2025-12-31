/**
 * Unit tests for optimized gravity behavior
 */

import Grid from '../../src/modules/Grid.js';
import Ball from '../../src/modules/Ball.js';
import { CONSTANTS } from '../../src/utils/Constants.js';

const { BALL_TYPES } = CONSTANTS;

/**
 * Run all gravity optimization tests
 * @returns {Array<Object>} Array of test results
 */
export function runGravityOptimizationTests() {
	const tests = [];

	// Test 1: Gravity only affects column with removed ball
	try {
		const grid = new Grid(10, 10);
		
		// Set up three columns with balls
		// Column 3: Stacked balls
		grid.setBallAt(0, 3, new Ball(BALL_TYPES.NORMAL, '#FF0000'));
		grid.setBallAt(1, 3, new Ball(BALL_TYPES.NORMAL, '#00FF00'));
		grid.setBallAt(2, 3, new Ball(BALL_TYPES.NORMAL, '#0000FF'));
		
		// Column 5: Balls that should NOT move
		grid.setBallAt(0, 5, new Ball(BALL_TYPES.NORMAL, '#FFFF00'));
		grid.setBallAt(2, 5, new Ball(BALL_TYPES.NORMAL, '#FF00FF'));
		
		// Column 7: Balls that should NOT move
		grid.setBallAt(1, 7, new Ball(BALL_TYPES.NORMAL, '#00FFFF'));
		grid.setBallAt(3, 7, new Ball(BALL_TYPES.NORMAL, '#FFFFFF'));
		
		// Remove middle ball from column 3
		grid.removeBallAt(1, 3);
		const removed = [{ row: 1, col: 3 }];
		grid.applyGravity(removed);
		
		// Verify column 3 was compacted (2 balls at bottom)
		const col3Compacted = grid.getBallAt(9, 3) !== null && 
		                      grid.getBallAt(8, 3) !== null &&
		                      grid.getBallAt(7, 3) === null;
		
		// Verify columns 5 and 7 were NOT affected
		const col5Unchanged = grid.getBallAt(0, 5) !== null &&
		                      grid.getBallAt(2, 5) !== null &&
		                      grid.getBallAt(9, 5) === null;
		
		const col7Unchanged = grid.getBallAt(1, 7) !== null &&
		                      grid.getBallAt(3, 7) !== null &&
		                      grid.getBallAt(9, 7) === null;
		
		if (!col3Compacted) {
			throw new Error(`Column 3 should be compacted: row9=${grid.getBallAt(9, 3)}, row8=${grid.getBallAt(8, 3)}, row7=${grid.getBallAt(7, 3)}`);
		}
		if (!col5Unchanged) {
			throw new Error('Column 5 should remain unchanged');
		}
		if (!col7Unchanged) {
			throw new Error('Column 7 should remain unchanged');
		}
		
		tests.push({
			name: 'GravityOpt - Only affects removed ball columns',
			pass: true,
			error: null
		});
	} catch (error) {
		tests.push({
			name: 'GravityOpt - Only affects removed ball columns',
			pass: false,
			error: error.message
		});
	}

	// Test 2: Multiple columns with removals
	try {
		const grid = new Grid(10, 10);
		
		// Column 2: balls at 0, 3
		grid.setBallAt(0, 2, new Ball(BALL_TYPES.NORMAL, '#FF0000'));
		grid.setBallAt(3, 2, new Ball(BALL_TYPES.NORMAL, '#00FF00'));
		
		// Column 4: balls at 1, 4 (should NOT move)
		grid.setBallAt(1, 4, new Ball(BALL_TYPES.NORMAL, '#0000FF'));
		grid.setBallAt(4, 4, new Ball(BALL_TYPES.NORMAL, '#FFFF00'));
		
		// Column 6: balls at 0, 2, 5
		grid.setBallAt(0, 6, new Ball(BALL_TYPES.NORMAL, '#FF00FF'));
		grid.setBallAt(2, 6, new Ball(BALL_TYPES.NORMAL, '#00FFFF'));
		grid.setBallAt(5, 6, new Ball(BALL_TYPES.NORMAL, '#FFFFFF'));
		
		// Remove from columns 2 and 6 only
		const removed = [
			{ row: 1, col: 2 },
			{ row: 2, col: 2 },
			{ row: 1, col: 6 },
			{ row: 3, col: 6 },
			{ row: 4, col: 6 }
		];
		grid.applyGravity(removed);
		
		// Column 2 should be compacted to bottom
		const col2Ok = grid.getBallAt(9, 2) !== null && 
		               grid.getBallAt(8, 2) !== null;
		
		// Column 4 should be unchanged (not in removed list)
		const col4Ok = grid.getBallAt(1, 4) !== null &&
		               grid.getBallAt(4, 4) !== null &&
		               grid.getBallAt(9, 4) === null;
		
		// Column 6 should be compacted to bottom
		const col6Ok = grid.getBallAt(9, 6) !== null &&
		               grid.getBallAt(8, 6) !== null &&
		               grid.getBallAt(7, 6) !== null;
		
		if (!col2Ok || !col4Ok || !col6Ok) {
			throw new Error(`Columns not properly handled: col2=${col2Ok}, col4=${col4Ok}, col6=${col6Ok}`);
		}
		
		tests.push({
			name: 'GravityOpt - Handles multiple affected columns',
			pass: true,
			error: null
		});
	} catch (error) {
		tests.push({
			name: 'GravityOpt - Handles multiple affected columns',
			pass: false,
			error: error.message
		});
	}

	// Test 3: Duplicate columns in removed positions
	try {
		const grid = new Grid(10, 10);
		
		grid.setBallAt(0, 5, new Ball(BALL_TYPES.NORMAL, '#FF0000'));
		grid.setBallAt(2, 5, new Ball(BALL_TYPES.NORMAL, '#00FF00'));
		grid.setBallAt(4, 5, new Ball(BALL_TYPES.NORMAL, '#0000FF'));
		
		// Multiple removals from same column (should handle duplicates)
		const removed = [
			{ row: 1, col: 5 },
			{ row: 3, col: 5 },
			{ row: 5, col: 5 },
			{ row: 1, col: 5 }, // Duplicate
			{ row: 3, col: 5 }  // Duplicate
		];
		grid.applyGravity(removed);
		
		// Should compact to 3 balls at bottom
		const ok = grid.getBallAt(9, 5) !== null &&
		           grid.getBallAt(8, 5) !== null &&
		           grid.getBallAt(7, 5) !== null &&
		           grid.getBallAt(6, 5) === null;
		
		if (!ok) {
			throw new Error('Failed to handle duplicate column indices');
		}
		
		tests.push({
			name: 'GravityOpt - Handles duplicate columns in removed list',
			pass: true,
			error: null
		});
	} catch (error) {
		tests.push({
			name: 'GravityOpt - Handles duplicate columns in removed list',
			pass: false,
			error: error.message
		});
	}

	// Test 4: Empty removed array uses legacy behavior
	try {
		const grid = new Grid(10, 10);
		
		grid.setBallAt(0, 3, new Ball(BALL_TYPES.NORMAL, '#FF0000'));
		grid.setBallAt(0, 7, new Ball(BALL_TYPES.NORMAL, '#00FF00'));
		
		// Empty array should process all columns
		grid.applyGravity([]);
		
		const ok = grid.getBallAt(9, 3) !== null &&
		           grid.getBallAt(9, 7) !== null;
		
		if (!ok) {
			throw new Error('Empty array should trigger all-column processing');
		}
		
		tests.push({
			name: 'GravityOpt - Empty array processes all columns',
			pass: true,
			error: null
		});
	} catch (error) {
		tests.push({
			name: 'GravityOpt - Empty array processes all columns',
			pass: false,
			error: error.message
		});
	}

	// Test 5: Null/undefined uses legacy behavior
	try {
		const grid = new Grid(10, 10);
		
		grid.setBallAt(0, 2, new Ball(BALL_TYPES.NORMAL, '#FF0000'));
		grid.setBallAt(0, 8, new Ball(BALL_TYPES.NORMAL, '#00FF00'));
		
		// No parameter should process all columns
		grid.applyGravity();
		
		const ok = grid.getBallAt(9, 2) !== null &&
		           grid.getBallAt(9, 8) !== null;
		
		if (!ok) {
			throw new Error('No parameter should trigger all-column processing');
		}
		
		tests.push({
			name: 'GravityOpt - No parameter processes all columns (legacy)',
			pass: true,
			error: null
		});
	} catch (error) {
		tests.push({
			name: 'GravityOpt - No parameter processes all columns (legacy)',
			pass: false,
			error: error.message
		});
	}

	// Test 6: Complex cascade scenario
	try {
		const grid = new Grid(15, 10);
		
		// Simulate a match clear scenario with multiple columns
		// Column 3: vertical stack
		for (let row = 0; row < 8; row++) {
			grid.setBallAt(row, 3, new Ball(BALL_TYPES.NORMAL, '#FF0000'));
		}
		
		// Column 5: scattered balls
		grid.setBallAt(1, 5, new Ball(BALL_TYPES.NORMAL, '#00FF00'));
		grid.setBallAt(4, 5, new Ball(BALL_TYPES.NORMAL, '#0000FF'));
		grid.setBallAt(7, 5, new Ball(BALL_TYPES.NORMAL, '#FFFF00'));
		
		// Column 8: should not be affected
		grid.setBallAt(2, 8, new Ball(BALL_TYPES.NORMAL, '#FF00FF'));
		grid.setBallAt(6, 8, new Ball(BALL_TYPES.NORMAL, '#00FFFF'));
		
		// Simulate clearing rows 3-5 from columns 3 and 5
		const removed = [
			{ row: 3, col: 3 },
			{ row: 4, col: 3 },
			{ row: 5, col: 3 },
			{ row: 4, col: 5 }
		];
		grid.applyGravity(removed);
		
		// Column 3: should have 5 balls at bottom (8 original - 3 removed)
		const col3Count = [14, 13, 12, 11, 10].filter(r => grid.getBallAt(r, 3) !== null).length;
		
		// Column 5: should have 2 balls at bottom (3 original - 1 removed)
		const col5Count = [14, 13].filter(r => grid.getBallAt(r, 5) !== null).length;
		
		// Column 8: should be unchanged
		const col8Unchanged = grid.getBallAt(2, 8) !== null &&
		                      grid.getBallAt(6, 8) !== null;
		
		if (col3Count !== 5 || col5Count !== 2 || !col8Unchanged) {
			throw new Error(`Cascade scenario failed: col3=${col3Count}/5, col5=${col5Count}/2, col8=${col8Unchanged}`);
		}
		
		tests.push({
			name: 'GravityOpt - Complex cascade scenario',
			pass: true,
			error: null
		});
	} catch (error) {
		tests.push({
			name: 'GravityOpt - Complex cascade scenario',
			pass: false,
			error: error.message
		});
	}

	// Test 7: Verify ball order preservation
	try {
		const grid = new Grid(10, 10);
		
		const redBall = new Ball(BALL_TYPES.NORMAL, '#FF0000');
		const greenBall = new Ball(BALL_TYPES.NORMAL, '#00FF00');
		const blueBall = new Ball(BALL_TYPES.NORMAL, '#0000FF');
		const yellowBall = new Ball(BALL_TYPES.NORMAL, '#FFFF00');
		
		// Set up column 4: place 4 balls we care about, with some gaps
		grid.setBallAt(1, 4, redBall);      // Top ball (first to fall)
		grid.setBallAt(3, 4, greenBall);    // Second ball
		grid.setBallAt(5, 4, blueBall);     // Third ball
		grid.setBallAt(8, 4, yellowBall);   // Bottom ball (last to fall)
		
		// Simulate removing balls at specific positions (but these balls don't exist, just gaps)
		// The removed positions just tell gravity which column to process
		const removed = [{ row: 0, col: 4 }]; // Just tell it to process column 4
		grid.applyGravity(removed);
		
		// After gravity, balls should compact to bottom in same order
		// yellowBall was lowest (8), should be at bottom (9)
		// blueBall was at 5, should be at 8
		// greenBall was at 3, should be at 7
		// redBall was at 1, should be at 6
		const correctOrder = grid.getBallAt(9, 4) === yellowBall &&
		                     grid.getBallAt(8, 4) === blueBall &&
		                     grid.getBallAt(7, 4) === greenBall &&
		                     grid.getBallAt(6, 4) === redBall;
		
		if (!correctOrder) {
			const r9 = grid.getBallAt(9, 4);
			const r8 = grid.getBallAt(8, 4);
			const r7 = grid.getBallAt(7, 4);
			const r6 = grid.getBallAt(6, 4);
			throw new Error(`Ball order not preserved: r9=${r9===yellowBall}, r8=${r8===blueBall}, r7=${r7===greenBall}, r6=${r6===redBall}`);
		}
		
		tests.push({
			name: 'GravityOpt - Preserves ball order',
			pass: true,
			error: null
		});
	} catch (error) {
		tests.push({
			name: 'GravityOpt - Preserves ball order',
			pass: false,
			error: error.message
		});
	}

	// Test 8: Edge case - remove from bottom row
	try {
		const grid = new Grid(10, 10);
		
		grid.setBallAt(5, 3, new Ball(BALL_TYPES.NORMAL, '#FF0000'));
		grid.setBallAt(7, 3, new Ball(BALL_TYPES.NORMAL, '#00FF00'));
		grid.setBallAt(9, 3, new Ball(BALL_TYPES.NORMAL, '#0000FF'));
		
		// Remove bottom ball
		grid.removeBallAt(9, 3);
		const removed = [{ row: 9, col: 3 }];
		grid.applyGravity(removed);
		
		// Should compact to 2 balls at bottom
		const ok = grid.getBallAt(9, 3) !== null &&
		           grid.getBallAt(8, 3) !== null &&
		           grid.getBallAt(7, 3) === null;
		
		if (!ok) {
			const r9 = grid.getBallAt(9, 3);
			const r8 = grid.getBallAt(8, 3);
			const r7 = grid.getBallAt(7, 3);
			throw new Error(`Failed to handle removal from bottom row: r9=${r9}, r8=${r8}, r7=${r7}`);
		}
		
		tests.push({
			name: 'GravityOpt - Handles removal from bottom row',
			pass: true,
			error: null
		});
	} catch (error) {
		tests.push({
			name: 'GravityOpt - Handles removal from bottom row',
			pass: false,
			error: error.message
		});
	}

	return tests;
}
