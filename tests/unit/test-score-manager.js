/**
 * test-score-manager.js
 * 
 * Unit tests for ScoreManager module
 */

import { ScoreManager } from '../../src/modules/ScoreManager.js';
import { ConfigManager } from '../../src/modules/ConfigManager.js';
import { EventEmitter } from '../../src/utils/EventEmitter.js';
import { CONSTANTS } from '../../src/utils/Constants.js';

// Test Suite
const testSuite = {
	name: 'ScoreManager Tests',
	tests: []
};

// Test: Initialize sets difficulty and resets score
testSuite.tests.push({
	name: 'initialize - Sets difficulty and resets score',
	async run() {
		await ConfigManager.loadConfig();
		
		ScoreManager.initialize(3);
		
		if (ScoreManager.difficulty !== 3) {
			throw new Error(`Expected difficulty 3, got ${ScoreManager.difficulty}`);
		}
		
		if (ScoreManager.getScore() !== 0) {
			throw new Error(`Expected score 0, got ${ScoreManager.getScore()}`);
		}
	}
});

// Test: Reset clears score
testSuite.tests.push({
	name: 'reset - Clears score to zero',
	async run() {
		await ConfigManager.loadConfig();
		
		ScoreManager.initialize(1);
		ScoreManager.addPoints(100);
		
		if (ScoreManager.getScore() === 0) {
			throw new Error('Score should not be 0 before reset');
		}
		
		ScoreManager.reset();
		
		if (ScoreManager.getScore() !== 0) {
			throw new Error(`Expected score 0 after reset, got ${ScoreManager.getScore()}`);
		}
	}
});

// Test: addPoints increases score
testSuite.tests.push({
	name: 'addPoints - Increases score correctly',
	async run() {
		await ConfigManager.loadConfig();
		
		ScoreManager.initialize(1);
		ScoreManager.addPoints(50);
		
		if (ScoreManager.getScore() !== 50) {
			throw new Error(`Expected score 50, got ${ScoreManager.getScore()}`);
		}
		
		ScoreManager.addPoints(25);
		
		if (ScoreManager.getScore() !== 75) {
			throw new Error(`Expected score 75, got ${ScoreManager.getScore()}`);
		}
	}
});

// Test: Single cascade scoring (no bonus)
testSuite.tests.push({
	name: 'Cascade scoring - Single cascade (no bonus)',
	async run() {
		await ConfigManager.loadConfig();
		
		ScoreManager.initialize(1); // Difficulty 1 (1.0x multiplier)
		
		// Simulate clearing 6 balls in one cascade
		EventEmitter.emit(CONSTANTS.EVENTS.BALLS_CLEARED, { count: 6, matches: 2 });
		EventEmitter.emit(CONSTANTS.EVENTS.CASCADE_COMPLETE, { cascadeCount: 1 });
		
		const score = ScoreManager.getScore();
		const expectedScore = 6 * 1; // 6 balls × 1 point, no cascade bonus
		
		if (score !== expectedScore) {
			throw new Error(`Expected score ${expectedScore}, got ${score}`);
		}
	}
});

// Test: Double cascade scoring (with bonus)
testSuite.tests.push({
	name: 'Cascade scoring - Double cascade (with bonus)',
	async run() {
		await ConfigManager.loadConfig();
		
		ScoreManager.initialize(1); // Difficulty 1 (1.0x multiplier)
		
		// Simulate 2 cascades
		EventEmitter.emit(CONSTANTS.EVENTS.BALLS_CLEARED, { count: 3, matches: 1 });
		EventEmitter.emit(CONSTANTS.EVENTS.BALLS_CLEARED, { count: 3, matches: 1 });
		EventEmitter.emit(CONSTANTS.EVENTS.CASCADE_COMPLETE, { cascadeCount: 2 });
		
		const score = ScoreManager.getScore();
		// 6 balls × 1 point = 6
		// Cascade 2 bonus = 3
		// Total = 9
		const expectedScore = 9;
		
		if (score !== expectedScore) {
			throw new Error(`Expected score ${expectedScore}, got ${score}`);
		}
	}
});

// Test: Triple cascade scoring (exponential bonus)
testSuite.tests.push({
	name: 'Cascade scoring - Triple cascade (exponential bonus)',
	async run() {
		await ConfigManager.loadConfig();
		
		ScoreManager.initialize(1); // Difficulty 1 (1.0x multiplier)
		
		// Simulate 3 cascades
		EventEmitter.emit(CONSTANTS.EVENTS.BALLS_CLEARED, { count: 3, matches: 1 });
		EventEmitter.emit(CONSTANTS.EVENTS.BALLS_CLEARED, { count: 3, matches: 1 });
		EventEmitter.emit(CONSTANTS.EVENTS.BALLS_CLEARED, { count: 3, matches: 1 });
		EventEmitter.emit(CONSTANTS.EVENTS.CASCADE_COMPLETE, { cascadeCount: 3 });
		
		const score = ScoreManager.getScore();
		// 9 balls × 1 point = 9
		// Cascade 2 bonus = 3
		// Cascade 3 bonus = 6 (3 × 2)
		// Total = 18
		const expectedScore = 18;
		
		if (score !== expectedScore) {
			throw new Error(`Expected score ${expectedScore}, got ${score}`);
		}
	}
});

// Test: Difficulty multiplier - Easy (1.0x)
testSuite.tests.push({
	name: 'Difficulty multiplier - Easy (1.0x)',
	async run() {
		await ConfigManager.loadConfig();
		
		ScoreManager.initialize(1); // Easy
		
		EventEmitter.emit(CONSTANTS.EVENTS.BALLS_CLEARED, { count: 10, matches: 1 });
		EventEmitter.emit(CONSTANTS.EVENTS.CASCADE_COMPLETE, { cascadeCount: 1 });
		
		const score = ScoreManager.getScore();
		const expectedScore = 10; // 10 × 1.0
		
		if (score !== expectedScore) {
			throw new Error(`Expected score ${expectedScore}, got ${score}`);
		}
	}
});

// Test: Difficulty multiplier - Medium (1.5x)
testSuite.tests.push({
	name: 'Difficulty multiplier - Medium (1.5x)',
	async run() {
		await ConfigManager.loadConfig();
		
		ScoreManager.initialize(2); // Medium
		
		EventEmitter.emit(CONSTANTS.EVENTS.BALLS_CLEARED, { count: 10, matches: 1 });
		EventEmitter.emit(CONSTANTS.EVENTS.CASCADE_COMPLETE, { cascadeCount: 1 });
		
		const score = ScoreManager.getScore();
		const expectedScore = 15; // 10 × 1.5
		
		if (score !== expectedScore) {
			throw new Error(`Expected score ${expectedScore}, got ${score}`);
		}
	}
});

// Test: Difficulty multiplier - Hard (2.0x)
testSuite.tests.push({
	name: 'Difficulty multiplier - Hard (2.0x)',
	async run() {
		await ConfigManager.loadConfig();
		
		ScoreManager.initialize(3); // Hard
		
		EventEmitter.emit(CONSTANTS.EVENTS.BALLS_CLEARED, { count: 10, matches: 1 });
		EventEmitter.emit(CONSTANTS.EVENTS.CASCADE_COMPLETE, { cascadeCount: 1 });
		
		const score = ScoreManager.getScore();
		const expectedScore = 20; // 10 × 2.0
		
		if (score !== expectedScore) {
			throw new Error(`Expected score ${expectedScore}, got ${score}`);
		}
	}
});

// Test: Difficulty multiplier - Expert (2.5x)
testSuite.tests.push({
	name: 'Difficulty multiplier - Expert (2.5x)',
	async run() {
		await ConfigManager.loadConfig();
		
		ScoreManager.initialize(4); // Expert
		
		EventEmitter.emit(CONSTANTS.EVENTS.BALLS_CLEARED, { count: 10, matches: 1 });
		EventEmitter.emit(CONSTANTS.EVENTS.CASCADE_COMPLETE, { cascadeCount: 1 });
		
		const score = ScoreManager.getScore();
		const expectedScore = 25; // 10 × 2.5
		
		if (score !== expectedScore) {
			throw new Error(`Expected score ${expectedScore}, got ${score}`);
		}
	}
});

// Test: Difficulty multiplier - Master (3.0x)
testSuite.tests.push({
	name: 'Difficulty multiplier - Master (3.0x)',
	async run() {
		await ConfigManager.loadConfig();
		
		ScoreManager.initialize(5); // Master
		
		EventEmitter.emit(CONSTANTS.EVENTS.BALLS_CLEARED, { count: 10, matches: 1 });
		EventEmitter.emit(CONSTANTS.EVENTS.CASCADE_COMPLETE, { cascadeCount: 1 });
		
		const score = ScoreManager.getScore();
		const expectedScore = 30; // 10 × 3.0
		
		if (score !== expectedScore) {
			throw new Error(`Expected score ${expectedScore}, got ${score}`);
		}
	}
});

// Test: Multiple separate cascades accumulate score
testSuite.tests.push({
	name: 'Multiple cascades - Score accumulates',
	async run() {
		await ConfigManager.loadConfig();
		
		ScoreManager.initialize(1);
		
		// First cascade
		EventEmitter.emit(CONSTANTS.EVENTS.BALLS_CLEARED, { count: 3, matches: 1 });
		EventEmitter.emit(CONSTANTS.EVENTS.CASCADE_COMPLETE, { cascadeCount: 1 });
		
		const scoreAfterFirst = ScoreManager.getScore();
		
		// Second cascade
		EventEmitter.emit(CONSTANTS.EVENTS.BALLS_CLEARED, { count: 4, matches: 1 });
		EventEmitter.emit(CONSTANTS.EVENTS.CASCADE_COMPLETE, { cascadeCount: 1 });
		
		const finalScore = ScoreManager.getScore();
		const expectedFinal = 7; // 3 + 4
		
		if (finalScore !== expectedFinal) {
			throw new Error(`Expected final score ${expectedFinal}, got ${finalScore}`);
		}
	}
});

// Test: Cascade data resets between separate cascades
testSuite.tests.push({
	name: 'Cascade data - Resets between cascades',
	async run() {
		await ConfigManager.loadConfig();
		
		ScoreManager.initialize(1);
		
		// First cascade with 2 levels
		EventEmitter.emit(CONSTANTS.EVENTS.BALLS_CLEARED, { count: 3, matches: 1 });
		EventEmitter.emit(CONSTANTS.EVENTS.BALLS_CLEARED, { count: 3, matches: 1 });
		EventEmitter.emit(CONSTANTS.EVENTS.CASCADE_COMPLETE, { cascadeCount: 2 });
		
		// Second cascade should start fresh (no bonus from first)
		EventEmitter.emit(CONSTANTS.EVENTS.BALLS_CLEARED, { count: 5, matches: 1 });
		EventEmitter.emit(CONSTANTS.EVENTS.CASCADE_COMPLETE, { cascadeCount: 1 });
		
		const finalScore = ScoreManager.getScore();
		// First cascade: 6 balls + 3 bonus = 9
		// Second cascade: 5 balls (no bonus) = 5
		// Total = 14
		const expectedScore = 14;
		
		if (finalScore !== expectedScore) {
			throw new Error(`Expected score ${expectedScore}, got ${finalScore}`);
		}
	}
});

export default testSuite;
