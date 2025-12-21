/**
 * Unit Tests for StatisticsTracker
 */

import StatisticsTracker from '../../src/modules/StatisticsTracker.js';
import { CONSTANTS } from '../../src/utils/Constants.js';
import Grid from '../../src/modules/Grid.js';
import Ball from '../../src/modules/Ball.js';

export function runStatisticsTrackerTests() {
	console.log('=== Running StatisticsTracker Tests ===');
	
	const results = [];
	
	// Helper function to run a test
	function test(name, fn) {
		try {
			fn();
			console.log(`✓ ${name}`);
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
	
	// Summary
	const passed = results.filter(r => r.pass).length;
	const failed = results.filter(r => !r.pass).length;
	console.log(`\nStatisticsTracker Tests: ${passed} passed, ${failed} failed\n`);
	
	return results;
}
