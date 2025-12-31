/**
 * test-game-engine.js
 * 
 * Unit tests for GameEngine module (singleton)
 */

import { GameEngine } from '../../src/modules/GameEngine.js';
import { ConfigManager } from '../../src/modules/ConfigManager.js';
import { CONSTANTS } from '../../src/utils/Constants.js';

// Test Suite
const testSuite = {
	name: 'GameEngine Tests',
	tests: []
};

// Test: GameEngine exists as singleton
testSuite.tests.push({
	name: 'singleton - GameEngine exists',
	async run() {
		await ConfigManager.loadConfig();
		
		if (!GameEngine) {
			throw new Error('GameEngine singleton should exist');
		}
		
		if (typeof GameEngine.initialize !== 'function') {
			throw new Error('GameEngine should have initialize method');
		}
	}
});

// Test: GameEngine has required properties
testSuite.tests.push({
	name: 'properties - Has required game state properties',
	async run() {
		await ConfigManager.loadConfig();
		GameEngine.initialize();
		
		if (GameEngine.state === undefined) {
			throw new Error('GameEngine should have state property');
		}
		
		if (GameEngine.grid === undefined) {
			throw new Error('GameEngine should have grid property');
		}
		
		if (GameEngine.renderer === undefined) {
			throw new Error('GameEngine should have renderer property');
		}
		
		if (GameEngine.currentPiece === undefined) {
			throw new Error('GameEngine should have currentPiece property');
		}
	}
});

// Test: Initialize creates grid with correct dimensions
testSuite.tests.push({
	name: 'initialize - Creates grid with correct dimensions',
	async run() {
		await ConfigManager.loadConfig();
		GameEngine.initialize();
		
		const gridRows = ConfigManager.get('game.gridRows', 20);
		const gridCols = ConfigManager.get('game.gridCols', 10);
		
		if (!GameEngine.grid) {
			throw new Error('Grid should be created after initialization');
		}
		
		if (GameEngine.grid.cols !== gridCols) {
			throw new Error(`Grid cols should be ${gridCols}, got ${GameEngine.grid.cols}`);
		}
		
		if (GameEngine.grid.rows !== gridRows) {
			throw new Error(`Grid rows should be ${gridRows}, got ${GameEngine.grid.rows}`);
		}
	}
});

// Test: Start changes state to PLAYING
testSuite.tests.push({
	name: 'start - Changes state to PLAYING',
	async run() {
		await ConfigManager.loadConfig();
		GameEngine.initialize();
		GameEngine.start(1, 1);
		
		if (GameEngine.state !== CONSTANTS.GAME_STATES.PLAYING) {
			throw new Error(`State should be PLAYING, got ${GameEngine.state}`);
		}
	}
});

// Test: Start spawns first piece
testSuite.tests.push({
	name: 'start - Spawns first piece',
	async run() {
		await ConfigManager.loadConfig();
		GameEngine.initialize();
		GameEngine.start(1, 1);
		
		if (!GameEngine.currentPiece) {
			throw new Error('Current piece should exist after start');
		}
		
		if (!GameEngine.nextPiece) {
			throw new Error('Next piece should exist after start');
		}
	}
});

// Test: Pause toggles state
testSuite.tests.push({
	name: 'pause - Toggles between PLAYING and PAUSED',
	async run() {
		await ConfigManager.loadConfig();
		GameEngine.initialize();
		GameEngine.start(1, 1);
		
		const initialState = GameEngine.state;
		
		GameEngine.pause();
		
		if (GameEngine.state === initialState) {
			throw new Error('State should change after pause');
		}
		
		if (GameEngine.state !== CONSTANTS.GAME_STATES.PAUSED) {
			throw new Error(`State should be PAUSED, got ${GameEngine.state}`);
		}
		
		// Unpause (use resume, not pause again)
		GameEngine.resume();
		
		if (GameEngine.state !== CONSTANTS.GAME_STATES.PLAYING) {
			throw new Error(`State should return to PLAYING, got ${GameEngine.state}`);
		}
	}
});

// Test: _getGhostPieceY calculates landing position
testSuite.tests.push({
	name: '_getGhostPieceY - Calculates landing position',
	async run() {
		await ConfigManager.loadConfig();
		GameEngine.initialize();
		GameEngine.start(1, 1);
		
		if (!GameEngine.currentPiece) {
			throw new Error('Current piece should exist');
		}
		
		const ghostY = GameEngine._getGhostPieceY();
		
		if (typeof ghostY !== 'number') {
			throw new Error(`Ghost Y should be a number, got ${typeof ghostY}`);
		}
		
		if (ghostY < GameEngine.currentPiece.y) {
			throw new Error('Ghost piece should be at or below current piece');
		}
	}
});

// Test: Piece spawns at top center when game starts
testSuite.tests.push({
	name: 'start - Spawns piece at top center',
	async run() {
		await ConfigManager.loadConfig();
		GameEngine.initialize();
		GameEngine.start(1, 1);
		
		const piece = GameEngine.currentPiece;
		
		if (!piece) {
			throw new Error('Current piece should exist after start');
		}
		
		const pos = piece.getPosition();
		
		if (pos.y !== 0) {
			throw new Error(`Piece should spawn at y=0, got y=${pos.y}`);
		}
		
		// Should be approximately centered
		const gridCols = GameEngine.grid.cols;
		const expectedX = Math.floor(gridCols / 2) - Math.floor(piece.getWidth() / 2);
		
		if (Math.abs(pos.x - expectedX) > 1) {
			throw new Error(`Piece should be centered around x=${expectedX}, got x=${pos.x}`);
		}
	}
});

// Test: GameEngine has FloatingTextManager
testSuite.tests.push({
	name: 'properties - Has FloatingTextManager',
	async run() {
		await ConfigManager.loadConfig();
		GameEngine.initialize();
		
		if (!GameEngine.floatingTextManager) {
			throw new Error('GameEngine should have floatingTextManager');
		}
		
		if (typeof GameEngine.floatingTextManager.add !== 'function') {
			throw new Error('FloatingTextManager should have add method');
		}
	}
});

// Test: Drop speed increases with difficulty
testSuite.tests.push({
	name: 'start - Drop speed increases with difficulty',
	async run() {
		await ConfigManager.loadConfig();
		GameEngine.initialize();
		
		// Start with difficulty 1
		GameEngine.start(1, 1); // difficulty, level
		const speed1 = GameEngine.dropInterval;
		
		// Start with difficulty 5
		GameEngine.start(5, 1); // difficulty, level
		const speed5 = GameEngine.dropInterval;
		
		if (speed5 >= speed1) {
			throw new Error(`Higher difficulty should have faster drop speed. Diff 1: ${speed1}ms, Diff 5: ${speed5}ms`);
		}
	}
});

// Test: Start sets level and difficulty
testSuite.tests.push({
	name: 'start - Sets level and difficulty',
	async run() {
		await ConfigManager.loadConfig();
		GameEngine.initialize();
		GameEngine.start(5, 3); // difficulty=5, level=3
		
		if (GameEngine.level !== 3) {
			throw new Error(`Level should be 3, got ${GameEngine.level}`);
		}
		
		if (GameEngine.difficulty !== 5) {
			throw new Error(`Difficulty should be 5, got ${GameEngine.difficulty}`);
		}
	}
});

// Test: Soft drop increases drop speed
testSuite.tests.push({
	name: '_startSoftDrop - Increases drop speed by 2.5x',
	async run() {
		await ConfigManager.loadConfig();
		GameEngine.initialize();
		GameEngine.start(1, 1);
		
		const baseInterval = GameEngine.dropInterval;
		const baseDropInterval = GameEngine.basedropInterval;
		
		// Start soft drop
		GameEngine._startSoftDrop();
		
		const expectedInterval = baseDropInterval / 2.5;
		
		if (!GameEngine.isSoftDropping) {
			throw new Error('isSoftDropping should be true after starting soft drop');
		}
		
		if (Math.abs(GameEngine.dropInterval - expectedInterval) > 0.1) {
			throw new Error(`Drop interval should be ${expectedInterval}, got ${GameEngine.dropInterval}`);
		}
	}
});

// Test: End soft drop restores normal speed
testSuite.tests.push({
	name: '_endSoftDrop - Restores normal drop speed',
	async run() {
		await ConfigManager.loadConfig();
		GameEngine.initialize();
		GameEngine.start(1, 1);
		
		const baseInterval = GameEngine.basedropInterval;
		
		// Start and end soft drop
		GameEngine._startSoftDrop();
		GameEngine._endSoftDrop();
		
		if (GameEngine.isSoftDropping) {
			throw new Error('isSoftDropping should be false after ending soft drop');
		}
		
		if (GameEngine.dropInterval !== baseInterval) {
			throw new Error(`Drop interval should be ${baseInterval}, got ${GameEngine.dropInterval}`);
		}
	}
});

// Test: Soft drop only works when playing
testSuite.tests.push({
	name: '_startSoftDrop - Only works in PLAYING state',
	async run() {
		await ConfigManager.loadConfig();
		GameEngine.initialize();
		
		// Try to start soft drop when not playing
		GameEngine.state = CONSTANTS.GAME_STATES.PAUSED;
		GameEngine._startSoftDrop();
		
		if (GameEngine.isSoftDropping) {
			throw new Error('Soft drop should not activate when not in PLAYING state');
		}
	}
});

// Test: Soft drop requires active piece
testSuite.tests.push({
	name: '_startSoftDrop - Requires active piece',
	async run() {
		await ConfigManager.loadConfig();
		GameEngine.initialize();
		GameEngine.state = CONSTANTS.GAME_STATES.PLAYING;
		GameEngine.currentPiece = null;
		
		// Try to start soft drop without piece
		GameEngine._startSoftDrop();
		
		if (GameEngine.isSoftDropping) {
			throw new Error('Soft drop should not activate without active piece');
		}
	}
});

// Test: Soft drop prevents double activation
testSuite.tests.push({
	name: '_startSoftDrop - Prevents double activation',
	async run() {
		await ConfigManager.loadConfig();
		GameEngine.initialize();
		GameEngine.start(1, 1);
		
		const baseInterval = GameEngine.basedropInterval;
		
		// Start soft drop twice
		GameEngine._startSoftDrop();
		const firstInterval = GameEngine.dropInterval;
		GameEngine._startSoftDrop();
		const secondInterval = GameEngine.dropInterval;
		
		if (firstInterval !== secondInterval) {
			throw new Error('Double soft drop activation should not change drop interval again');
		}
		
		if (Math.abs(secondInterval - (baseInterval / 2.5)) > 0.1) {
			throw new Error('Drop interval should remain at 2.5x speed');
		}
	}
});

// Test: basedropInterval is set on difficulty change
testSuite.tests.push({
	name: 'setDifficulty - Updates basedropInterval',
	async run() {
		await ConfigManager.loadConfig();
		GameEngine.initialize();
		GameEngine.start(1, 3);
		
		if (!GameEngine.basedropInterval) {
			throw new Error('basedropInterval should be set after starting game');
		}
		
		if (GameEngine.basedropInterval !== GameEngine.dropInterval) {
			throw new Error('basedropInterval should match dropInterval when not soft dropping');
		}
	}
});

// Test: Restart resets game state
testSuite.tests.push({
	name: 'restart - Resets game state',
	async run() {
		await ConfigManager.loadConfig();
		GameEngine.initialize();
		GameEngine.start(5, 10);
		
		// Restart should keep same difficulty and level
		GameEngine.restart();
		
		if (GameEngine.level !== 10) {
			throw new Error(`Level should remain 10, got ${GameEngine.level}`);
		}
		
		if (GameEngine.difficulty !== 5) {
			throw new Error(`Difficulty should remain 5, got ${GameEngine.difficulty}`);
		}
		
		if (GameEngine.state !== CONSTANTS.GAME_STATES.PLAYING) {
			throw new Error(`State should be PLAYING after restart, got ${GameEngine.state}`);
		}
	}
});

export default testSuite;
