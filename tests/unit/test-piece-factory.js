/**
 * test-piece-factory.js
 * 
 * Unit tests for PieceFactory module
 */

import { PieceFactory } from '../../src/modules/PieceFactory.js';
import { ConfigManager } from '../../src/modules/ConfigManager.js';
import { CONSTANTS } from '../../src/utils/Constants.js';

// Test Suite
const testSuite = {
	name: 'PieceFactory Tests',
	tests: []
};

// Test: getAvailableColors returns correct colors for level 1
testSuite.tests.push({
	name: 'getAvailableColors - Level 1 has 3 colors',
	async run() {
		await ConfigManager.loadConfig();
		const colors = PieceFactory.getAvailableColors(1);
		
		if (colors.length !== 3) {
			throw new Error(`Expected 3 colors, got ${colors.length}`);
		}
		
		// Should be red, green, blue
		const red = ConfigManager.get('colors.balls.red');
		const green = ConfigManager.get('colors.balls.green');
		const blue = ConfigManager.get('colors.balls.blue');
		
		if (!colors.includes(red) || !colors.includes(green) || !colors.includes(blue)) {
			throw new Error('Level 1 should have red, green, blue');
		}
	}
});

// Test: getAvailableColors returns correct colors for level 3
testSuite.tests.push({
	name: 'getAvailableColors - Level 3 has 4 colors',
	async run() {
		await ConfigManager.loadConfig();
		const colors = PieceFactory.getAvailableColors(3);
		
		if (colors.length !== 4) {
			throw new Error(`Expected 4 colors, got ${colors.length}`);
		}
		
		// Should include yellow
		const yellow = ConfigManager.get('colors.balls.yellow');
		if (!colors.includes(yellow)) {
			throw new Error('Level 3 should include yellow');
		}
	}
});

// Test: getAvailableColors returns correct colors for level 7
testSuite.tests.push({
	name: 'getAvailableColors - Level 7 has 5 colors',
	async run() {
		await ConfigManager.loadConfig();
		const colors = PieceFactory.getAvailableColors(7);
		
		if (colors.length !== 5) {
			throw new Error(`Expected 5 colors, got ${colors.length}`);
		}
		
		// Should include magenta
		const magenta = ConfigManager.get('colors.balls.magenta');
		if (!colors.includes(magenta)) {
			throw new Error('Level 7 should include magenta');
		}
	}
});

// Test: getAvailableColors returns correct colors for level 11
testSuite.tests.push({
	name: 'getAvailableColors - Level 11 has 6 colors',
	async run() {
		await ConfigManager.loadConfig();
		const colors = PieceFactory.getAvailableColors(11);
		
		if (colors.length !== 6) {
			throw new Error(`Expected 6 colors, got ${colors.length}`);
		}
		
		// Should include cyan
		const cyan = ConfigManager.get('colors.balls.cyan');
		if (!colors.includes(cyan)) {
			throw new Error('Level 11 should include cyan');
		}
	}
});

// Test: getAvailableColors returns correct colors for level 15
testSuite.tests.push({
	name: 'getAvailableColors - Level 15 has 7 colors',
	async run() {
		await ConfigManager.loadConfig();
		const colors = PieceFactory.getAvailableColors(15);
		
		if (colors.length !== 7) {
			throw new Error(`Expected 7 colors, got ${colors.length}`);
		}
		
		// Should include orange
		const orange = ConfigManager.get('colors.balls.orange');
		if (!colors.includes(orange)) {
			throw new Error('Level 15 should include orange');
		}
	}
});

// Test: getAvailableColors returns correct colors for level 19+
testSuite.tests.push({
	name: 'getAvailableColors - Level 19+ has 8 colors',
	async run() {
		await ConfigManager.loadConfig();
		const colors = PieceFactory.getAvailableColors(19);
		
		if (colors.length !== 8) {
			throw new Error(`Expected 8 colors, got ${colors.length}`);
		}
		
		// Should include purple
		const purple = ConfigManager.get('colors.balls.purple');
		if (!colors.includes(purple)) {
			throw new Error('Level 19 should include purple');
		}
		
		// Test level 25 also gets 8 colors
		const colors25 = PieceFactory.getAvailableColors(25);
		if (colors25.length !== 8) {
			throw new Error(`Level 25 should have 8 colors, got ${colors25.length}`);
		}
	}
});

// Test: shouldSpawnBlockingBall respects minimum pieces requirement
testSuite.tests.push({
	name: 'shouldSpawnBlockingBall - Respects min pieces requirement',
	async run() {
		await ConfigManager.loadConfig();
		PieceFactory.reset();
		
		// At 0 pieces dropped, should never spawn on difficulty 1 (requires 50)
		let spawnedEarly = false;
		for (let i = 0; i < 100; i++) {
			if (PieceFactory.shouldSpawnBlockingBall(1)) {
				spawnedEarly = true;
				break;
			}
		}
		
		if (spawnedEarly) {
			throw new Error('Blocking ball spawned before minimum pieces requirement met');
		}
		
		// Set pieces dropped to 50
		PieceFactory.piecesDropped = 50;
		
		// Now it should be possible to spawn (though not guaranteed)
		let canSpawn = false;
		for (let i = 0; i < 1000; i++) {
			if (PieceFactory.shouldSpawnBlockingBall(1)) {
				canSpawn = true;
				break;
			}
		}
		
		if (!canSpawn) {
			throw new Error('Blocking ball never spawned after minimum pieces requirement met');
		}
	}
});

// Test: generatePiece creates valid piece
testSuite.tests.push({
	name: 'generatePiece - Creates valid piece',
	async run() {
		await ConfigManager.loadConfig();
		PieceFactory.reset();
		
		const piece = PieceFactory.generatePiece(1, 1);
		
		if (!piece) {
			throw new Error('generatePiece returned null/undefined');
		}
		
		// Check piece has valid shape type
		const shapeType = piece.getType();
		const validTypes = Object.values(CONSTANTS.PIECE_TYPES);
		if (!validTypes.includes(shapeType)) {
			throw new Error(`Invalid shape type: ${shapeType}`);
		}
		
		// Check piece has balls
		const balls = piece.getBalls();
		if (!balls || balls.length === 0) {
			throw new Error('Piece has no balls');
		}
		
		// Check all balls are valid Ball objects
		for (const ball of balls) {
			if (!ball || typeof ball.getColor !== 'function') {
				throw new Error('Invalid ball in piece');
			}
		}
	}
});

// Test: generatePiece increments pieces dropped counter
testSuite.tests.push({
	name: 'generatePiece - Increments piecesDropped',
	async run() {
		await ConfigManager.loadConfig();
		PieceFactory.reset();
		
		const initialCount = PieceFactory.piecesDropped;
		if (initialCount !== 0) {
			throw new Error('Reset did not set piecesDropped to 0');
		}
		
		PieceFactory.generatePiece(1, 1);
		if (PieceFactory.piecesDropped !== 1) {
			throw new Error('piecesDropped not incremented after first piece');
		}
		
		PieceFactory.generatePiece(1, 1);
		if (PieceFactory.piecesDropped !== 2) {
			throw new Error('piecesDropped not incremented after second piece');
		}
	}
});

// Test: generatePiece uses level-appropriate colors
testSuite.tests.push({
	name: 'generatePiece - Uses level-appropriate colors',
	async run() {
		await ConfigManager.loadConfig();
		PieceFactory.reset();
		
		// Generate many pieces at level 1
		const level1Colors = new Set();
		for (let i = 0; i < 50; i++) {
			const piece = PieceFactory.generatePiece(1, 1);
			const balls = piece.getBalls();
			balls.forEach(ball => {
				if (ball.type === CONSTANTS.BALL_TYPES.NORMAL) {
					level1Colors.add(ball.getColor());
				}
			});
		}
		
		// Should only have 3 colors (red, green, blue)
		if (level1Colors.size > 3) {
			throw new Error(`Level 1 should only use 3 colors, found ${level1Colors.size}`);
		}
		
		// Generate pieces at level 19
		const level19Colors = new Set();
		for (let i = 0; i < 100; i++) {
			const piece = PieceFactory.generatePiece(19, 1);
			const balls = piece.getBalls();
			balls.forEach(ball => {
				if (ball.type === CONSTANTS.BALL_TYPES.NORMAL) {
					level19Colors.add(ball.getColor());
				}
			});
		}
		
		// Should have more colors available at level 19
		if (level19Colors.size < 6) {
			throw new Error(`Level 19 should use more colors, found only ${level19Colors.size}`);
		}
	}
});

// Test: reset() clears piecesDropped counter
testSuite.tests.push({
	name: 'reset - Clears piecesDropped counter',
	async run() {
		await ConfigManager.loadConfig();
		
		// Generate some pieces
		PieceFactory.generatePiece(1, 1);
		PieceFactory.generatePiece(1, 1);
		PieceFactory.generatePiece(1, 1);
		
		if (PieceFactory.piecesDropped === 0) {
			throw new Error('piecesDropped should not be 0 after generating pieces');
		}
		
		// Reset
		PieceFactory.reset();
		
		if (PieceFactory.piecesDropped !== 0) {
			throw new Error('Reset did not clear piecesDropped counter');
		}
	}
});

// Test: All piece shapes generate correct ball counts
testSuite.tests.push({
	name: 'generatePiece - All shapes have correct ball counts',
	async run() {
		await ConfigManager.loadConfig();
		
		// Expected ball counts for each shape
		const expectedCounts = {
			[CONSTANTS.PIECE_TYPES.I]: 4,
			[CONSTANTS.PIECE_TYPES.O]: 6,
			[CONSTANTS.PIECE_TYPES.T]: 4,
			[CONSTANTS.PIECE_TYPES.L]: 4,
			[CONSTANTS.PIECE_TYPES.J]: 4,
			[CONSTANTS.PIECE_TYPES.S]: 4,
			[CONSTANTS.PIECE_TYPES.Z]: 4,
			[CONSTANTS.PIECE_TYPES.SINGLE]: 1
		};
		
		// Generate many pieces and track ball counts by type
		const observedCounts = {};
		for (let i = 0; i < 200; i++) {
			const piece = PieceFactory.generatePiece(1, 1);
			const shapeType = piece.getType();
			const ballCount = piece.getBalls().length;
			
			if (!observedCounts[shapeType]) {
				observedCounts[shapeType] = ballCount;
			} else if (observedCounts[shapeType] !== ballCount) {
				throw new Error(`Inconsistent ball count for ${shapeType}`);
			}
		}
		
		// Verify observed counts match expected
		for (const shapeType in observedCounts) {
			const observed = observedCounts[shapeType];
			const expected = expectedCounts[shapeType];
			if (observed !== expected) {
				throw new Error(`${shapeType} has ${observed} balls, expected ${expected}`);
			}
		}
	}
});

export default testSuite;
