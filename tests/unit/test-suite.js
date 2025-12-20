/**
 * Test Suite Runner
 * Runs all unit tests and collects results
 * @module test-suite
 */

import { testHelpers } from './test-helpers.js';
import { testEventEmitter } from './test-event-emitter.js';
import { testBall } from './test-ball.js';
import { testPiece } from './test-piece.js';
import { testGrid } from './test-grid.js';
import testPieceFactory from './test-piece-factory.js';
import ConfigManager from '../../src/modules/ConfigManager.js';

/**
 * Run all test suites
 * @returns {Object} Test results
 */
export async function runAllTests() {
	// Load config before running tests (required for Piece class)
	await ConfigManager.loadConfig();
	
	const suites = [
		{ name: 'Helpers', tests: testHelpers() },
		{ name: 'EventEmitter', tests: testEventEmitter() },
		{ name: 'Ball', tests: testBall() },
		{ name: 'Piece', tests: testPiece() },
		{ name: 'Grid', tests: testGrid() }
	];
	
	// Run async test suites
	const asyncResults = await runAsyncTestSuite(testPieceFactory);
	suites.push({ name: testPieceFactory.name, tests: asyncResults });

	let totalPassed = 0;
	let totalFailed = 0;

	suites.forEach(suite => {
		suite.tests.forEach(test => {
			if (test.pass) {
				totalPassed++;
			}
			else {
				totalFailed++;
			}
		});
	});

	return {
		suites,
		total: totalPassed + totalFailed,
		passed: totalPassed,
		failed: totalFailed,
		allPassed: totalFailed === 0
	};
}

/**
 * Run an async test suite
 * @param {Object} suite - Test suite with name and tests array
 * @returns {Array} Test results
 */
async function runAsyncTestSuite(suite) {
	const results = [];
	
	for (const test of suite.tests) {
		try {
			await test.run();
			results.push({ name: test.name, pass: true });
		} catch (error) {
			results.push({ name: test.name, pass: false, error: error.message });
		}
	}
	
	return results;
}
