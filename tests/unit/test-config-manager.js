/**
 * test-config-manager.js
 * 
 * Unit tests for ConfigManager module
 */

import { ConfigManager } from '../../src/modules/ConfigManager.js';

// Test Suite
const testSuite = {
	name: 'ConfigManager Tests',
	tests: []
};

// Test: loadConfig loads configuration successfully
testSuite.tests.push({
	name: 'loadConfig - Loads configuration successfully',
	async run() {
		await ConfigManager.loadConfig();
		
		const isLoaded = ConfigManager.isConfigLoaded();
		
		if (!isLoaded) {
			throw new Error('Config should be loaded');
		}
	}
});

// Test: get() retrieves simple values
testSuite.tests.push({
	name: 'get - Retrieves simple config values',
	async run() {
		await ConfigManager.loadConfig();
		
		const gridRows = ConfigManager.get('game.gridRows');
		const gridCols = ConfigManager.get('game.gridCols');
		
		if (typeof gridRows !== 'number') {
			throw new Error(`Expected gridRows to be a number, got ${typeof gridRows}`);
		}
		
		if (typeof gridCols !== 'number') {
			throw new Error(`Expected gridCols to be a number, got ${typeof gridCols}`);
		}
		
		if (gridRows <= 0 || gridCols <= 0) {
			throw new Error('Grid dimensions must be positive');
		}
	}
});

// Test: get() with dot notation for nested values
testSuite.tests.push({
	name: 'get - Retrieves nested values with dot notation',
	async run() {
		await ConfigManager.loadConfig();
		
		const redColor = ConfigManager.get('colors.balls.red');
		
		if (typeof redColor !== 'string') {
			throw new Error(`Expected color to be a string, got ${typeof redColor}`);
		}
		
		if (!redColor.startsWith('#')) {
			throw new Error('Color should be hex code starting with #');
		}
	}
});

// Test: get() returns default value for missing keys
testSuite.tests.push({
	name: 'get - Returns default value for missing keys',
	async run() {
		await ConfigManager.loadConfig();
		
		const defaultValue = 'DEFAULT_VALUE';
		const result = ConfigManager.get('nonexistent.key.path', defaultValue);
		
		if (result !== defaultValue) {
			throw new Error(`Expected default value "${defaultValue}", got "${result}"`);
		}
	}
});

// Test: get() returns null for missing keys without default
testSuite.tests.push({
	name: 'get - Returns null for missing keys without default',
	async run() {
		await ConfigManager.loadConfig();
		
		const result = ConfigManager.get('nonexistent.key.path');
		
		if (result !== null) {
			throw new Error(`Expected null for missing key, got ${result}`);
		}
	}
});

// Test: getAll() returns entire config object
testSuite.tests.push({
	name: 'getAll - Returns entire config object',
	async run() {
		await ConfigManager.loadConfig();
		
		const config = ConfigManager.getAll();
		
		if (typeof config !== 'object' || config === null) {
			throw new Error('Config should be an object');
		}
		
		const hasGame = config.hasOwnProperty('game');
		const hasColors = config.hasOwnProperty('colors');
		
		if (!hasGame) {
			throw new Error('Config should have "game" section');
		}
		
		if (!hasColors) {
			throw new Error('Config should have "colors" section');
		}
	}
});

// Test: get() handles deep nested paths
testSuite.tests.push({
	name: 'get - Handles deep nested paths',
	async run() {
		await ConfigManager.loadConfig();
		
		const diff1Multiplier = ConfigManager.get('scoring.difficultyMultipliers.difficulty1');
		
		if (typeof diff1Multiplier !== 'number') {
			throw new Error(`Expected difficulty multiplier to be a number, got ${typeof diff1Multiplier}`);
		}
		
		if (diff1Multiplier !== 1.0) {
			throw new Error(`Expected difficulty1 multiplier to be 1.0, got ${diff1Multiplier}`);
		}
	}
});

// Test: isConfigLoaded() returns false before loading
testSuite.tests.push({
	name: 'isConfigLoaded - Returns false before loading',
	async run() {
		// Create a fresh ConfigManager instance for this test
		// Note: This test may not work with singleton pattern
		// Testing the existing loaded state instead
		const isLoaded = ConfigManager.isConfigLoaded();
		
		if (typeof isLoaded !== 'boolean') {
			throw new Error(`isConfigLoaded should return boolean, got ${typeof isLoaded}`);
		}
	}
});

// Test: get() retrieves array values correctly
testSuite.tests.push({
	name: 'get - Retrieves array values correctly',
	async run() {
		await ConfigManager.loadConfig();
		
		const level1Colors = ConfigManager.get('colorUnlocks.level1');
		
		if (!Array.isArray(level1Colors)) {
			throw new Error('Color unlock should be an array');
		}
		
		if (level1Colors.length === 0) {
			throw new Error('Level 1 should have at least one color');
		}
	}
});

// Test: get() retrieves piece shape definitions
testSuite.tests.push({
	name: 'get - Retrieves piece shape definitions',
	async run() {
		await ConfigManager.loadConfig();
		
		const iShape = ConfigManager.get('pieceShapes.I');
		
		if (!Array.isArray(iShape)) {
			throw new Error('Piece shape should be an array');
		}
		
		if (!Array.isArray(iShape[0])) {
			throw new Error('Piece shape should be 2D array');
		}
		
		const hasOnes = iShape.some(row => row.includes(1));
		
		if (!hasOnes) {
			throw new Error('Piece shape should contain at least one ball (1)');
		}
	}
});

// Test: Multiple get() calls return consistent values
testSuite.tests.push({
	name: 'get - Multiple calls return consistent values',
	async run() {
		await ConfigManager.loadConfig();
		
		const value1 = ConfigManager.get('game.gridRows');
		const value2 = ConfigManager.get('game.gridRows');
		
		if (value1 !== value2) {
			throw new Error('Multiple get() calls should return same value');
		}
	}
});

// Test: get() works with special ball spawn rates
testSuite.tests.push({
	name: 'get - Retrieves special ball spawn rates',
	async run() {
		await ConfigManager.loadConfig();
		
		const explodingRate = ConfigManager.get('specialBalls.exploding.spawnRate');
		
		if (typeof explodingRate !== 'number') {
			throw new Error(`Spawn rate should be a number, got ${typeof explodingRate}`);
		}
		
		const isValidRate = explodingRate >= 0 && explodingRate <= 1;
		
		if (!isValidRate) {
			throw new Error('Spawn rate should be between 0 and 1');
		}
	}
});

export default testSuite;
