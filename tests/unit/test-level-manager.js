/**
 * Unit Tests for LevelManager
 */

import LevelManager from '../../src/modules/LevelManager.js';
import { ConfigManager } from '../../src/modules/ConfigManager.js';

export function runLevelManagerTests() {
	console.log('=== Running LevelManager Tests ===');
	
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
	
	function assertArrayEquals(actual, expected, message) {
		if (JSON.stringify(actual) !== JSON.stringify(expected)) {
			throw new Error(message || `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
		}
	}
	
	// Save original localStorage
	const originalGetItem = localStorage.getItem;
	const originalSetItem = localStorage.setItem;
	let mockStorage = {};
	
	// Setup: Mock localStorage
	function setupMockStorage() {
		mockStorage = {};
		localStorage.getItem = function(key) {
			return mockStorage[key] || null;
		};
		localStorage.setItem = function(key, value) {
			mockStorage[key] = value;
		};
	}
	
	// Teardown: Restore localStorage
	function teardownMockStorage() {
		localStorage.getItem = originalGetItem;
		localStorage.setItem = originalSetItem;
	}
	
	// Test: Initialization
	test('LevelManager initializes with default values', () => {
		setupMockStorage();
		LevelManager.initialize();
		
		assertEquals(LevelManager.currentLevel, 1, 'Current level should be 1');
		assertEquals(LevelManager.maxLevel, 24, 'Max level should be 24');
		assertEquals(LevelManager.levelTimer, 0, 'Timer should be 0');
		assertEquals(LevelManager.timerRunning, false, 'Timer should not be running');
		assert(LevelManager.unlockedLevels.includes(1), 'Level 1 should be unlocked');
		
		teardownMockStorage();
	});
	
	// Test: Start Timer
	test('startTimer() starts the level timer', () => {
		LevelManager.initialize();
		LevelManager.startTimer();
		
		assertEquals(LevelManager.timerRunning, true, 'Timer should be running');
		assertEquals(LevelManager.levelTimer, 0, 'Timer should start at 0');
		assert(LevelManager.levelTimeLimit > 0, 'Time limit should be set');
	});
	
	// Test: Stop Timer
	test('stopTimer() stops the level timer', () => {
		LevelManager.initialize();
		LevelManager.startTimer();
		LevelManager.stopTimer();
		
		assertEquals(LevelManager.timerRunning, false, 'Timer should not be running');
	});
	
	// Test: Update Timer
	test('updateTimer() advances the timer and returns false if time remains', () => {
		LevelManager.initialize();
		LevelManager.startTimer();
		LevelManager.levelTimeLimit = 10; // 10 seconds
		
		const timeUp = LevelManager.updateTimer(1); // 1 second
		
		assertEquals(LevelManager.levelTimer, 1, 'Timer should advance by 1 second');
		assertEquals(timeUp, false, 'Time should not be up');
	});
	
	// Test: Timer expires
	test('updateTimer() returns true when time limit exceeded', () => {
		LevelManager.initialize();
		LevelManager.startTimer();
		LevelManager.levelTimeLimit = 10; // 10 seconds
		
		const timeUp = LevelManager.updateTimer(11); // 11 seconds
		
		assertEquals(timeUp, true, 'Time should be up');
		assertEquals(LevelManager.timerRunning, false, 'Timer should stop');
	});
	
	// Test: Get Remaining Time
	test('getRemainingTime() returns correct remaining time', () => {
		LevelManager.initialize();
		LevelManager.startTimer();
		LevelManager.levelTimeLimit = 10; // 10 seconds
		LevelManager.levelTimer = 3; // 3 seconds elapsed
		
		const remaining = LevelManager.getRemainingTime();
		
		assertEquals(remaining, 7, 'Remaining time should be 7 seconds');
	});
	
	// Test: Get Timer Display
	test('getTimerDisplay() returns formatted time string', () => {
		LevelManager.initialize();
		LevelManager.startTimer();
		LevelManager.levelTimeLimit = 10;
		LevelManager.levelTimer = 3.5;
		
		const display = LevelManager.getTimerDisplay();
		
		assertEquals(display, '6.5s', 'Display should show 6.5s');
	});
	
	// Test: Set Level
	test('setLevel() changes the current level', () => {
		LevelManager.initialize();
		LevelManager.setLevel(5);
		
		assertEquals(LevelManager.currentLevel, 5, 'Current level should be 5');
	});
	
	// Test: Get Level
	test('getLevel() returns the current level', () => {
		LevelManager.initialize();
		LevelManager.setLevel(7);
		
		assertEquals(LevelManager.getLevel(), 7, 'Should return current level');
	});
	
	// Test: Complete Level (unlocks next)
	test('completeLevel() unlocks the next level', () => {
		setupMockStorage();
		LevelManager.initialize();
		LevelManager.setLevel(1);
		LevelManager.completeLevel();
		
		assert(LevelManager.unlockedLevels.includes(2), 'Level 2 should be unlocked');
		
		teardownMockStorage();
	});
	
	// Test: Complete Level (doesn't unlock beyond max)
	test('completeLevel() does not unlock beyond max level', () => {
		setupMockStorage();
		LevelManager.initialize();
		LevelManager.setLevel(20);
		LevelManager.completeLevel();
		
		assertEquals(LevelManager.unlockedLevels.length <= 20, true, 'Should not unlock more than max levels');
		
		teardownMockStorage();
	});
	
	// Test: Is Level Unlocked
	test('isLevelUnlocked() returns true for unlocked levels', () => {
		LevelManager.initialize();
		
		assertEquals(LevelManager.isLevelUnlocked(1), true, 'Level 1 should be unlocked');
		assertEquals(LevelManager.isLevelUnlocked(20), false, 'Level 20 should be locked');
	});
	
	// Test: Get Unlocked Levels
	test('getUnlockedLevels() returns array of unlocked levels', () => {
		setupMockStorage();
		LevelManager.initialize();
		
		const unlocked = LevelManager.getUnlockedLevels();
		
		assert(Array.isArray(unlocked), 'Should return an array');
		assert(unlocked.includes(1), 'Should include level 1');
		
		teardownMockStorage();
	});
	
	// Test: Save and Load Unlocked Levels
	test('saveUnlockedLevels() and loadUnlockedLevels() persist data', () => {
		setupMockStorage();
		
		LevelManager.initialize();
		LevelManager.unlockedLevels = [1, 2, 3, 4, 5];
		LevelManager.saveUnlockedLevels();
		
		// Simulate reload
		LevelManager.unlockedLevels = [1];
		LevelManager.loadUnlockedLevels();
		
		assertArrayEquals(LevelManager.unlockedLevels, [1, 2, 3, 4, 5], 'Should restore unlocked levels');
		
		teardownMockStorage();
	});
	
	// Test: Reset Progress
	test('resetProgress() resets to level 1 only', () => {
		setupMockStorage();
		
		LevelManager.initialize();
		LevelManager.unlockedLevels = [1, 2, 3, 4, 5];
		LevelManager.setLevel(5);
		LevelManager.resetProgress();
		
		assertArrayEquals(LevelManager.unlockedLevels, [1], 'Should only have level 1 unlocked');
		assertEquals(LevelManager.currentLevel, 1, 'Current level should be 1');
		
		teardownMockStorage();
	});
	
	// Test: Unlock All Levels
	test('unlockAllLevels() unlocks all levels', () => {
		setupMockStorage();
		
		LevelManager.initialize();
		LevelManager.unlockAllLevels();
		
		assertEquals(LevelManager.unlockedLevels.length, 24, 'Should have 24 unlocked levels');
		assert(LevelManager.isLevelUnlocked(20), 'Level 20 should be unlocked');
		
		teardownMockStorage();
	});
	
	// Test: Max Level
	test('getMaxLevel() returns the maximum level', () => {
		LevelManager.initialize();
		
		assertEquals(LevelManager.getMaxLevel(), 24, 'Max level should be 24');
	});
	
	// Test: Timer doesn't update when stopped
	test('updateTimer() does not update when timer is stopped', () => {
		LevelManager.initialize();
		LevelManager.startTimer();
		LevelManager.stopTimer();
		
		const initialTime = LevelManager.levelTimer;
		LevelManager.updateTimer(5);
		
		assertEquals(LevelManager.levelTimer, initialTime, 'Timer should not advance when stopped');
	});
	
	// Test: Negative time remaining shows as 0
	test('getRemainingTime() returns 0 when time is up', () => {
		LevelManager.initialize();
		LevelManager.startTimer();
		LevelManager.levelTimeLimit = 10;
		LevelManager.levelTimer = 15; // Over time
		
		const remaining = LevelManager.getRemainingTime();
		
		assertEquals(remaining, 0, 'Remaining time should be 0, not negative');
	});
	
	// Print summary
	const passed = results.filter(r => r.pass).length;
	const failed = results.filter(r => !r.pass).length;
	console.log(`\n=== LevelManager Test Summary ===`);
	console.log(`Passed: ${passed}`);
	console.log(`Failed: ${failed}`);
	console.log(`Total: ${passed + failed}`);
	
	return results;
}
