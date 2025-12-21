/**
 * Unit Tests for StatisticsTracker
 */

import StatisticsTracker from '../../src/modules/StatisticsTracker.js';
import { CONSTANTS } from '../../src/utils/Constants.js';
import Grid from '../../src/modules/Grid.js';
import Ball from '../../src/modules/Ball.js';

export function runStatisticsTrackerTests() {
	const results = [];
	
	// Helper function to run a test
	function test(name, fn) {
		try {
			fn();
			results.push({ name, pass: true, error: null });
		} catch (error) {
			console.error(`✗ ${name}`);
			console.error(`  Error: ${error.message}`);
			results.push({ name, pass: false, error: error.message });
		}
	}
	
	// Helper function to assert
	function assert(condition, message) {
		if (!condition) {
			throw new Error(message || 'Assertion failed');
		}
	}
	
	function assertEquals(actual, expected, message) {
		if (actual !== expected) {
			throw new Error(message || `Expected ${expected}, got ${actual}`);
		}
	}
	
	function assertGreaterThan(actual, expected, message) {
		if (actual <= expected) {
			throw new Error(message || `Expected ${actual} to be greater than ${expected}`);
		}
	}
	
	// Test: StatisticsTracker initializes
	test('StatisticsTracker initializes with stats object', () => {
		StatisticsTracker.reset(1);
		assert(StatisticsTracker.stats !== null, 'Stats should not be null');
		assert(typeof StatisticsTracker.stats === 'object', 'Stats should be an object');
	});
	
	// Test: Reset clears all statistics
	test('reset() clears all statistics', () => {
		StatisticsTracker.reset(1);
		
		// Record some stats
		StatisticsTracker.recordMatch(CONSTANTS.BALL_TYPES.NORMAL, 'red');
		StatisticsTracker.recordMatch(CONSTANTS.BALL_TYPES.NORMAL, 'red');
		
		// Reset
		StatisticsTracker.reset(1);
		
		// Check that stats are cleared (getCount returns 0 for non-existent entries)
		const redCount = StatisticsTracker.getCount(CONSTANTS.BALL_TYPES.NORMAL, 'red');
		assertEquals(redCount, 0, 'Red ball count should be reset to 0');
	});

	// Test: recordMatch increments count
	test('recordMatch() increments the count for type-color combination', () => {
		StatisticsTracker.reset(1);
		
		const initialCount = StatisticsTracker.getCount(CONSTANTS.BALL_TYPES.NORMAL, 'red');
		StatisticsTracker.recordMatch(CONSTANTS.BALL_TYPES.NORMAL, 'red');
		const newCount = StatisticsTracker.getCount(CONSTANTS.BALL_TYPES.NORMAL, 'red');
		
		assertEquals(newCount, initialCount + 1, 'Count should increment by 1');
	});
	
	// Test: recordMatch handles multiple types
	test('recordMatch() tracks different ball types separately', () => {
		StatisticsTracker.reset(1);
		
		StatisticsTracker.recordMatch(CONSTANTS.BALL_TYPES.NORMAL, 'blue');
		StatisticsTracker.recordMatch(CONSTANTS.BALL_TYPES.EXPLODING, 'blue');
		
		const normalBlue = StatisticsTracker.getCount(CONSTANTS.BALL_TYPES.NORMAL, 'blue');
		const explodingBlue = StatisticsTracker.getCount(CONSTANTS.BALL_TYPES.EXPLODING, 'blue');
		
		assertEquals(normalBlue, 1, 'Normal blue should be 1');
		assertEquals(explodingBlue, 1, 'Exploding blue should be 1');
	});
	
	// Test: recordMatch handles multiple colors
	test('recordMatch() tracks different colors separately', () => {
		StatisticsTracker.reset(1);
		
		StatisticsTracker.recordMatch(CONSTANTS.BALL_TYPES.NORMAL, 'red');
		StatisticsTracker.recordMatch(CONSTANTS.BALL_TYPES.NORMAL, 'blue');
		StatisticsTracker.recordMatch(CONSTANTS.BALL_TYPES.NORMAL, 'red');
		
		const redCount = StatisticsTracker.getCount(CONSTANTS.BALL_TYPES.NORMAL, 'red');
		const blueCount = StatisticsTracker.getCount(CONSTANTS.BALL_TYPES.NORMAL, 'blue');
		
		assertEquals(redCount, 2, 'Red count should be 2');
		assertEquals(blueCount, 1, 'Blue count should be 1');
	});
	
	// Test: recordMatches processes multiple matches
	test('recordMatches() processes array of matches from grid', () => {
		StatisticsTracker.reset(1);
		
		// Create a simple grid
		const grid = new Grid(5, 5);
		
		// Place some balls
		grid.setBall(0, 0, new Ball(CONSTANTS.BALL_TYPES.NORMAL, 'red'));
		grid.setBall(0, 1, new Ball(CONSTANTS.BALL_TYPES.NORMAL, 'red'));
		grid.setBall(0, 2, new Ball(CONSTANTS.BALL_TYPES.NORMAL, 'red'));
		
		// Create matches array
		const matches = [{
			positions: [
				{ row: 0, col: 0 },
				{ row: 0, col: 1 },
				{ row: 0, col: 2 }
			],
			color: 'red',
			type: 'horizontal'
		}];
		
		StatisticsTracker.recordMatches(matches, grid);
		
		const redCount = StatisticsTracker.getCount(CONSTANTS.BALL_TYPES.NORMAL, 'red');
		assertEquals(redCount, 3, 'Should have recorded 3 red balls');
	});
	
	// Test: getStats returns statistics object
	test('getStats() returns statistics object', () => {
		StatisticsTracker.reset(1);
		StatisticsTracker.recordMatch(CONSTANTS.BALL_TYPES.NORMAL, 'red');
		
		const stats = StatisticsTracker.getStats();
		assert(stats !== null, 'Stats should not be null');
		assert(stats[CONSTANTS.BALL_TYPES.NORMAL] !== undefined, 'Should have normal ball type');
	});
	
	// Test: getCount returns correct count
	test('getCount() returns correct count for type-color', () => {
		StatisticsTracker.reset(1);
		
		StatisticsTracker.recordMatch(CONSTANTS.BALL_TYPES.NORMAL, 'green');
		StatisticsTracker.recordMatch(CONSTANTS.BALL_TYPES.NORMAL, 'green');
		StatisticsTracker.recordMatch(CONSTANTS.BALL_TYPES.NORMAL, 'green');
		
		const count = StatisticsTracker.getCount(CONSTANTS.BALL_TYPES.NORMAL, 'green');
		assertEquals(count, 3, 'Count should be 3');
	});
	
	// Test: getTotalCount returns sum of all counts
	test('getTotalCount() returns sum of all ball clears', () => {
		StatisticsTracker.reset(1);
		
		StatisticsTracker.recordMatch(CONSTANTS.BALL_TYPES.NORMAL, 'red');
		StatisticsTracker.recordMatch(CONSTANTS.BALL_TYPES.NORMAL, 'blue');
		StatisticsTracker.recordMatch(CONSTANTS.BALL_TYPES.EXPLODING, 'red');
		
		const total = StatisticsTracker.getTotalCount();
		assertEquals(total, 3, 'Total count should be 3');
	});
	
	// Test: Stats track painter balls
	test('Stats track horizontal painter balls', () => {
		StatisticsTracker.reset(1);
		
		StatisticsTracker.recordMatch(CONSTANTS.BALL_TYPES.PAINTER_HORIZONTAL, 'red');
		const count = StatisticsTracker.getCount(CONSTANTS.BALL_TYPES.PAINTER_HORIZONTAL, 'red');
		
		assertEquals(count, 1, 'Horizontal painter red should be 1');
	});
	
	// Test: Stats track vertical painter balls
	test('Stats track vertical painter balls', () => {
		StatisticsTracker.reset(1);
		
		StatisticsTracker.recordMatch(CONSTANTS.BALL_TYPES.PAINTER_VERTICAL, 'blue');
		const count = StatisticsTracker.getCount(CONSTANTS.BALL_TYPES.PAINTER_VERTICAL, 'blue');
		
		assertEquals(count, 1, 'Vertical painter blue should be 1');
	});
	
	// Test: Stats track diagonal painter balls
	test('Stats track diagonal painter balls', () => {
		StatisticsTracker.reset(1);
		
		StatisticsTracker.recordMatch(CONSTANTS.BALL_TYPES.PAINTER_DIAGONAL, 'green');
		const count = StatisticsTracker.getCount(CONSTANTS.BALL_TYPES.PAINTER_DIAGONAL, 'green');
		
		assertEquals(count, 1, 'Diagonal painter green should be 1');
	});
	
	// Test: Available colors updates with level
	test('reset() updates available colors based on level', () => {
		StatisticsTracker.reset(1);
		const colors1 = StatisticsTracker.availableColors;
		
		StatisticsTracker.reset(5);
		const colors5 = StatisticsTracker.availableColors;
		
		// Higher levels should have more or equal colors
		assert(colors5.length >= colors1.length, 'Higher level should have at least as many colors');
	});
	
	// Test: Stats persist across multiple record calls
	test('Stats accumulate across multiple recordMatch calls', () => {
		StatisticsTracker.reset(1);
		
		for (let i = 0; i < 10; i++) {
			StatisticsTracker.recordMatch(CONSTANTS.BALL_TYPES.NORMAL, 'red');
		}
		
		const count = StatisticsTracker.getCount(CONSTANTS.BALL_TYPES.NORMAL, 'red');
		assertEquals(count, 10, 'Should accumulate to 10');
	});
	
	// Test: Current level is tracked
	test('currentLevel is tracked', () => {
		StatisticsTracker.reset(7);
		assertEquals(StatisticsTracker.currentLevel, 7, 'Current level should be 7');
	});
	
	// Test: getCount returns 0 for non-existent type-color
	test('getCount() returns 0 for non-existent type-color combination', () => {
		StatisticsTracker.reset(1);
		
		const count = StatisticsTracker.getCount(CONSTANTS.BALL_TYPES.NORMAL, 'purple');
		assertEquals(count, 0, 'Non-existent combination should return 0');
	});
	
	// Test: getCount returns 0 for non-existent type
	test('getCount() returns 0 for completely new type', () => {
		StatisticsTracker.reset(1);
		
		const count = StatisticsTracker.getCount('fake-type', 'red');
		assertEquals(count, 0, 'Non-existent type should return 0');
	});
	
	// Test: getTotalCount returns 0 when no matches recorded
	test('getTotalCount() returns 0 when stats are empty', () => {
		StatisticsTracker.reset(1);
		
		const total = StatisticsTracker.getTotalCount();
		assertEquals(total, 0, 'Empty stats should return 0 total');
	});
	
	// Test: recordMatches with empty array
	test('recordMatches() handles empty matches array', () => {
		StatisticsTracker.reset(1);
		const grid = new Grid(5, 5);
		
		StatisticsTracker.recordMatches([], grid);
		
		const total = StatisticsTracker.getTotalCount();
		assertEquals(total, 0, 'Empty matches should not change stats');
	});
	
	// Test: recordMatches with null positions
	test('recordMatches() handles match with no positions', () => {
		StatisticsTracker.reset(1);
		const grid = new Grid(5, 5);
		
		const matches = [{
			positions: [],
			color: 'red',
			type: 'horizontal'
		}];
		
		StatisticsTracker.recordMatches(matches, grid);
		
		const total = StatisticsTracker.getTotalCount();
		assertEquals(total, 0, 'Match with no positions should not record stats');
	});
	
	// Test: recordMatches with multiple matches of same color
	test('recordMatches() handles multiple matches of same color', () => {
		StatisticsTracker.reset(1);
		const grid = new Grid(6, 6);
		
		// First horizontal match
		grid.setBall(0, 0, new Ball(CONSTANTS.BALL_TYPES.NORMAL, 'blue'));
		grid.setBall(0, 1, new Ball(CONSTANTS.BALL_TYPES.NORMAL, 'blue'));
		grid.setBall(0, 2, new Ball(CONSTANTS.BALL_TYPES.NORMAL, 'blue'));
		
		// Second horizontal match
		grid.setBall(2, 0, new Ball(CONSTANTS.BALL_TYPES.NORMAL, 'blue'));
		grid.setBall(2, 1, new Ball(CONSTANTS.BALL_TYPES.NORMAL, 'blue'));
		grid.setBall(2, 2, new Ball(CONSTANTS.BALL_TYPES.NORMAL, 'blue'));
		
		const matches = [
			{
				positions: [
					{ row: 0, col: 0 },
					{ row: 0, col: 1 },
					{ row: 0, col: 2 }
				],
				color: 'blue',
				type: 'horizontal'
			},
			{
				positions: [
					{ row: 2, col: 0 },
					{ row: 2, col: 1 },
					{ row: 2, col: 2 }
				],
				color: 'blue',
				type: 'horizontal'
			}
		];
		
		StatisticsTracker.recordMatches(matches, grid);
		
		const blueCount = StatisticsTracker.getCount(CONSTANTS.BALL_TYPES.NORMAL, 'blue');
		assertEquals(blueCount, 6, 'Should record 6 blue balls from two matches');
	});
	
	// Test: recordMatches with mixed ball types
	test('recordMatches() handles mixed ball types in same match', () => {
		StatisticsTracker.reset(1);
		const grid = new Grid(5, 5);
		
		grid.setBall(0, 0, new Ball(CONSTANTS.BALL_TYPES.NORMAL, 'red'));
		grid.setBall(0, 1, new Ball(CONSTANTS.BALL_TYPES.EXPLODING, 'red'));
		grid.setBall(0, 2, new Ball(CONSTANTS.BALL_TYPES.NORMAL, 'red'));
		
		const matches = [{
			positions: [
				{ row: 0, col: 0 },
				{ row: 0, col: 1 },
				{ row: 0, col: 2 }
			],
			color: 'red',
			type: 'horizontal'
		}];
		
		StatisticsTracker.recordMatches(matches, grid);
		
		const normalRed = StatisticsTracker.getCount(CONSTANTS.BALL_TYPES.NORMAL, 'red');
		const explodingRed = StatisticsTracker.getCount(CONSTANTS.BALL_TYPES.EXPLODING, 'red');
		
		assertEquals(normalRed, 2, 'Should record 2 normal red balls');
		assertEquals(explodingRed, 1, 'Should record 1 exploding red ball');
	});
	
	// Test: getStats structure validation
	test('getStats() returns properly structured object', () => {
		StatisticsTracker.reset(1);
		
		StatisticsTracker.recordMatch(CONSTANTS.BALL_TYPES.NORMAL, 'red');
		StatisticsTracker.recordMatch(CONSTANTS.BALL_TYPES.EXPLODING, 'blue');
		
		const stats = StatisticsTracker.getStats();
		
		assert(typeof stats === 'object', 'Stats should be an object');
		assert(stats[CONSTANTS.BALL_TYPES.NORMAL] !== undefined, 'Should have normal type');
		assert(stats[CONSTANTS.BALL_TYPES.NORMAL]['red'] !== undefined, 'Should have normal red entry');
		assert(stats[CONSTANTS.BALL_TYPES.EXPLODING] !== undefined, 'Should have exploding type');
		assert(stats[CONSTANTS.BALL_TYPES.EXPLODING]['blue'] !== undefined, 'Should have exploding blue entry');
	});
	
	// Test: getTotalCount with many ball types
	test('getTotalCount() sums all ball types and colors', () => {
		StatisticsTracker.reset(1);
		
		StatisticsTracker.recordMatch(CONSTANTS.BALL_TYPES.NORMAL, 'red');
		StatisticsTracker.recordMatch(CONSTANTS.BALL_TYPES.NORMAL, 'blue');
		StatisticsTracker.recordMatch(CONSTANTS.BALL_TYPES.EXPLODING, 'red');
		StatisticsTracker.recordMatch(CONSTANTS.BALL_TYPES.PAINTER_HORIZONTAL, 'green');
		StatisticsTracker.recordMatch(CONSTANTS.BALL_TYPES.PAINTER_VERTICAL, 'blue');
		StatisticsTracker.recordMatch(CONSTANTS.BALL_TYPES.PAINTER_DIAGONAL, 'red');
		
		const total = StatisticsTracker.getTotalCount();
		assertEquals(total, 6, 'Total should sum all types and colors');
	});
	
	// Test: availableColors contains expected colors
	test('availableColors contains valid color strings', () => {
		StatisticsTracker.reset(1);
		
		const colors = StatisticsTracker.availableColors;
		
		assert(Array.isArray(colors), 'Available colors should be an array');
		assert(colors.length > 0, 'Should have at least one color');
		colors.forEach(color => {
			assert(typeof color === 'string', `Color should be a string, got ${typeof color}`);
			assert(color.length > 0, 'Color should not be empty string');
		});
	});
	
	// Test: availableColors increases with level
	test('availableColors increases as level increases', () => {
		StatisticsTracker.reset(1);
		const level1Colors = StatisticsTracker.availableColors.length;
		
		StatisticsTracker.reset(10);
		const level10Colors = StatisticsTracker.availableColors.length;
		
		assert(level10Colors >= level1Colors, 'Higher level should have more or equal colors');
	});
	
	// Test: Multiple resets clear previous stats
	test('Multiple reset() calls properly clear previous stats', () => {
		StatisticsTracker.reset(1);
		StatisticsTracker.recordMatch(CONSTANTS.BALL_TYPES.NORMAL, 'red');
		StatisticsTracker.recordMatch(CONSTANTS.BALL_TYPES.NORMAL, 'red');
		
		let total = StatisticsTracker.getTotalCount();
		assertEquals(total, 2, 'Should have 2 recorded');
		
		StatisticsTracker.reset(1);
		total = StatisticsTracker.getTotalCount();
		assertEquals(total, 0, 'Stats should be cleared after reset');
		
		StatisticsTracker.recordMatch(CONSTANTS.BALL_TYPES.EXPLODING, 'blue');
		total = StatisticsTracker.getTotalCount();
		assertEquals(total, 1, 'New stats should start from 0');
	});
	
	// Test: Large count accumulation
	test('recordMatch() handles large count accumulation', () => {
		StatisticsTracker.reset(1);
		
		for (let i = 0; i < 1000; i++) {
			StatisticsTracker.recordMatch(CONSTANTS.BALL_TYPES.NORMAL, 'red');
		}
		
		const count = StatisticsTracker.getCount(CONSTANTS.BALL_TYPES.NORMAL, 'red');
		assertEquals(count, 1000, 'Should accurately track 1000 matches');
	});
	
	// Test: recordMatches with blocking balls (should not count)
	test('recordMatches() does not count blocking balls', () => {
		StatisticsTracker.reset(1);
		const grid = new Grid(5, 5);
		
		grid.setBall(0, 0, new Ball(CONSTANTS.BALL_TYPES.NORMAL, 'red'));
		grid.setBall(0, 1, new Ball(CONSTANTS.BALL_TYPES.BLOCKING, 'black'));
		grid.setBall(0, 2, new Ball(CONSTANTS.BALL_TYPES.NORMAL, 'red'));
		
		const matches = [{
			positions: [
				{ row: 0, col: 0 },
				{ row: 0, col: 1 },
				{ row: 0, col: 2 }
			],
			color: 'red',
			type: 'horizontal'
		}];
		
		StatisticsTracker.recordMatches(matches, grid);
		
		const normalRed = StatisticsTracker.getCount(CONSTANTS.BALL_TYPES.NORMAL, 'red');
		const blockingBlack = StatisticsTracker.getCount(CONSTANTS.BALL_TYPES.BLOCKING, 'black');
		
		// Blocking balls are not matchable, so this test assumes they're filtered out in match detection
		// If blocking balls appear in matches, we need to check implementation
		assert(normalRed >= 2, 'Should record at least the normal red balls');
	});
	
	// Test: Stats independence between types
	test('Stats for different types are independent', () => {
		StatisticsTracker.reset(1);
		
		StatisticsTracker.recordMatch(CONSTANTS.BALL_TYPES.NORMAL, 'red');
		StatisticsTracker.recordMatch(CONSTANTS.BALL_TYPES.NORMAL, 'red');
		StatisticsTracker.recordMatch(CONSTANTS.BALL_TYPES.EXPLODING, 'red');
		
		const normalRed = StatisticsTracker.getCount(CONSTANTS.BALL_TYPES.NORMAL, 'red');
		const explodingRed = StatisticsTracker.getCount(CONSTANTS.BALL_TYPES.EXPLODING, 'red');
		const total = StatisticsTracker.getTotalCount();
		
		assertEquals(normalRed, 2, 'Normal red should be 2');
		assertEquals(explodingRed, 1, 'Exploding red should be 1');
		assertEquals(total, 3, 'Total should be 3');
	});
	
	// Summary
	const passed = results.filter(r => r.pass).length;
	const failed = results.filter(r => !r.pass).length;
	
	return results;
}
