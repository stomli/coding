/**
 * Unit tests for Piece class
 * @module test-piece
 */

import Piece from '../../src/modules/Piece.js';
import Ball from '../../src/modules/Ball.js';
import { BALL_TYPES } from '../../src/utils/Constants.js';

/**
 * Run all Piece tests
 * @returns {Array} Test results
 */
export function testPiece() {
	const tests = [];

	try {
		// Create a simple T-piece for testing
		const shape = [
			[0, 1, 0],
			[1, 1, 1]
		];
		const balls = [
			new Ball(BALL_TYPES.NORMAL, '#FF0000'),
			new Ball(BALL_TYPES.NORMAL, '#FF0000'),
			new Ball(BALL_TYPES.NORMAL, '#FF0000'),
			new Ball(BALL_TYPES.NORMAL, '#FF0000')
		];
		const piece = new Piece('T', shape, balls);

		// Test initial position
		try {
			tests.push({
				name: 'Piece - initializes at position 0,0',
				pass: piece.position.x === 0 && piece.position.y === 0,
				error: null
			});
		} catch (e) {
			tests.push({ name: 'Piece - initializes at position 0,0', pass: false, error: e.message });
		}

		// Test getBallAt
		try {
			const ball = piece.getBallAt(1, 0);
			tests.push({
				name: 'Piece - getBallAt returns correct ball',
				pass: ball instanceof Ball && ball.getColor() === '#FF0000',
				error: ball ? null : 'getBallAt returned null'
			});
		} catch (e) {
			tests.push({ name: 'Piece - getBallAt returns correct ball', pass: false, error: e.message });
		}

		try {
			tests.push({
				name: 'Piece - getBallAt returns null for empty cell',
				pass: piece.getBallAt(0, 0) === null,
				error: null
			});
		} catch (e) {
			tests.push({ name: 'Piece - getBallAt returns null for empty cell', pass: false, error: e.message });
		}

		// Test getOccupiedPositions
		const positions = piece.getOccupiedPositions();
		tests.push({
			name: 'Piece - getOccupiedPositions returns 4 positions',
			pass: positions.length === 4,
			error: null
		});

		tests.push({
			name: 'Piece - positions are relative to piece position',
			pass: positions.every(pos => pos.x >= 0 && pos.y >= 0),
			error: null
		});

		// Test rotation
		piece.rotate();
		const rotatedPositions = piece.getOccupiedPositions();
		tests.push({
			name: 'Piece - rotate changes occupied positions',
			pass: JSON.stringify(rotatedPositions) !== JSON.stringify(positions),
			error: null
		});

		tests.push({
			name: 'Piece - rotate maintains ball count',
			pass: rotatedPositions.length === 4,
			error: null
		});

		// Test position setting
		piece.position = { x: 5, y: 10 };
		const newPositions = piece.getOccupiedPositions();
		tests.push({
			name: 'Piece - position change affects occupied positions',
			pass: newPositions[0].x >= 5 && newPositions[0].y >= 10,
			error: null
		});

		// Test shape and type getters
		tests.push({
			name: 'Piece - getShape returns shape matrix',
			pass: Array.isArray(piece.getShape()) && piece.getShape().length === 3, // Rotated from 2x3 to 3x2
			error: null
		});

		tests.push({
			name: 'Piece - getType returns type',
			pass: piece.getType() === 'T',
			error: null
		});

		// Test getWidth and getHeight
		const widthBeforeRotate = piece.getWidth();
		const heightBeforeRotate = piece.getHeight();
		tests.push({
			name: 'Piece - getWidth returns correct width',
			pass: typeof widthBeforeRotate === 'number' && widthBeforeRotate > 0,
			error: widthBeforeRotate <= 0 ? `Expected positive width, got ${widthBeforeRotate}` : null
		});

		tests.push({
			name: 'Piece - getHeight returns correct height',
			pass: typeof heightBeforeRotate === 'number' && heightBeforeRotate > 0,
			error: heightBeforeRotate <= 0 ? `Expected positive height, got ${heightBeforeRotate}` : null
		});

		// Test rotation affects dimensions
		const piece2 = new Piece('T', [
			[0, 1, 0],
			[1, 1, 1]
		], [
			new Ball(BALL_TYPES.NORMAL, '#FF0000'),
			new Ball(BALL_TYPES.NORMAL, '#FF0000'),
			new Ball(BALL_TYPES.NORMAL, '#FF0000'),
			new Ball(BALL_TYPES.NORMAL, '#FF0000')
		]);
		
		const originalWidth = piece2.getWidth();
		const originalHeight = piece2.getHeight();
		piece2.rotate();
		const rotatedWidth = piece2.getWidth();
		const rotatedHeight = piece2.getHeight();
		
		tests.push({
			name: 'Piece - rotation swaps width and height',
			pass: originalWidth === rotatedHeight && originalHeight === rotatedWidth,
			error: `Original: ${originalWidth}x${originalHeight}, Rotated: ${rotatedWidth}x${rotatedHeight}`
		});

		// Test getBalls
		const retrievedBalls = piece.getBalls();
		tests.push({
			name: 'Piece - getBalls returns array of balls',
			pass: Array.isArray(retrievedBalls) && retrievedBalls.every(b => b instanceof Ball),
			error: !Array.isArray(retrievedBalls) ? 'getBalls did not return array' : 'Array contains non-Ball elements'
		});

		// Test getPosition
		piece.setPosition(3, 7);
		const pos = piece.getPosition();
		tests.push({
			name: 'Piece - getPosition returns current position',
			pass: pos.x === 3 && pos.y === 7,
			error: `Expected (3, 7), got (${pos.x}, ${pos.y})`
		});

		// Test setPosition with invalid values
		piece.setPosition(5, 5);
		piece.setPosition(null, 10);
		const posAfterInvalid = piece.getPosition();
		tests.push({
			name: 'Piece - setPosition rejects null x coordinate',
			pass: posAfterInvalid.x === 5 && posAfterInvalid.y === 5,
			error: `Position should remain (5, 5), got (${posAfterInvalid.x}, ${posAfterInvalid.y})`
		});

		piece.setPosition(10, undefined);
		const posAfterInvalid2 = piece.getPosition();
		tests.push({
			name: 'Piece - setPosition rejects undefined y coordinate',
			pass: posAfterInvalid2.x === 5 && posAfterInvalid2.y === 5,
			error: `Position should remain (5, 5), got (${posAfterInvalid2.x}, ${posAfterInvalid2.y})`
		});

		// Test getBallAt with out of bounds
		tests.push({
			name: 'Piece - getBallAt returns null for negative row',
			pass: piece.getBallAt(-1, 0) === null,
			error: 'Expected null for negative row'
		});

		tests.push({
			name: 'Piece - getBallAt returns null for negative col',
			pass: piece.getBallAt(0, -1) === null,
			error: 'Expected null for negative col'
		});

		tests.push({
			name: 'Piece - getBallAt returns null for row >= height',
			pass: piece.getBallAt(100, 0) === null,
			error: 'Expected null for out of bounds row'
		});

		tests.push({
			name: 'Piece - getBallAt returns null for col >= width',
			pass: piece.getBallAt(0, 100) === null,
			error: 'Expected null for out of bounds col'
		});

		// Test multiple rotations (4 rotations = back to original)
		const piece3 = new Piece('T', [
			[0, 1, 0],
			[1, 1, 1]
		], [
			new Ball(BALL_TYPES.NORMAL, '#00FF00'),
			new Ball(BALL_TYPES.NORMAL, '#00FF00'),
			new Ball(BALL_TYPES.NORMAL, '#00FF00'),
			new Ball(BALL_TYPES.NORMAL, '#00FF00')
		]);
		
		const originalShape = JSON.stringify(piece3.getShape());
		piece3.rotate();
		piece3.rotate();
		piece3.rotate();
		piece3.rotate();
		const afterFourRotations = JSON.stringify(piece3.getShape());
		
		tests.push({
			name: 'Piece - four rotations return to original shape',
			pass: originalShape === afterFourRotations,
			error: 'Shape changed after 4 rotations'
		});

		// Test occupied positions are absolute (include piece position)
		const piece4 = new Piece('I', [
			[1, 1, 1, 1]
		], [
			new Ball(BALL_TYPES.NORMAL, '#0000FF'),
			new Ball(BALL_TYPES.NORMAL, '#0000FF'),
			new Ball(BALL_TYPES.NORMAL, '#0000FF'),
			new Ball(BALL_TYPES.NORMAL, '#0000FF')
		]);
		
		piece4.setPosition(10, 5);
		const occupiedPos = piece4.getOccupiedPositions();
		
		tests.push({
			name: 'Piece - occupied positions include piece offset',
			pass: occupiedPos.every(p => p.x >= 10 && p.y >= 5),
			error: `Some positions below offset (10, 5): ${JSON.stringify(occupiedPos)}`
		});

		tests.push({
			name: 'Piece - occupied positions count matches ball count',
			pass: occupiedPos.length === piece4.getBalls().length,
			error: `Expected ${piece4.getBalls().length} positions, got ${occupiedPos.length}`
		});

		// Test single cell piece
		const singlePiece = new Piece('single', [
			[1]
		], [
			new Ball(BALL_TYPES.EXPLODING, '#FF00FF')
		]);
		
		tests.push({
			name: 'Piece - handles single cell piece',
			pass: singlePiece.getWidth() === 1 && singlePiece.getHeight() === 1,
			error: `Expected 1x1, got ${singlePiece.getWidth()}x${singlePiece.getHeight()}`
		});

		tests.push({
			name: 'Piece - single cell piece has one ball',
			pass: singlePiece.getBalls().length === 1,
			error: `Expected 1 ball, got ${singlePiece.getBalls().length}`
		});

		// Test complex shape (L-piece)
		const lPiece = new Piece('L', [
			[1, 0],
			[1, 0],
			[1, 1]
		], [
			new Ball(BALL_TYPES.NORMAL, '#FFFF00'),
			new Ball(BALL_TYPES.NORMAL, '#FFFF00'),
			new Ball(BALL_TYPES.NORMAL, '#FFFF00'),
			new Ball(BALL_TYPES.NORMAL, '#FFFF00')
		]);
		
		const lOccupied = lPiece.getOccupiedPositions();
		tests.push({
			name: 'Piece - L-piece has correct ball count',
			pass: lOccupied.length === 4,
			error: `Expected 4 positions, got ${lOccupied.length}`
		});

		// Test rotation preserves ball count
		const ballCountBefore = lPiece.getBalls().length;
		lPiece.rotate();
		const ballCountAfter = lPiece.getBalls().length;
		
		tests.push({
			name: 'Piece - rotation preserves ball count',
			pass: ballCountBefore === ballCountAfter,
			error: `Ball count changed from ${ballCountBefore} to ${ballCountAfter}`
		});

		// Test rotation preserves ball types
		const explodingPiece = new Piece('test', [
			[1, 1]
		], [
			new Ball(BALL_TYPES.EXPLODING, '#111111'),
			new Ball(BALL_TYPES.NORMAL, '#222222')
		]);
		
		explodingPiece.rotate();
		const ballsAfterRotate = explodingPiece.getBalls();
		const hasExploding = ballsAfterRotate.some(b => b.isExploding());
		const hasNormal = ballsAfterRotate.some(b => !b.isSpecial());
		
		tests.push({
			name: 'Piece - rotation preserves ball types',
			pass: hasExploding && hasNormal,
			error: `Expected exploding and normal balls after rotation`
		});

		// Test getShapeType
		tests.push({
			name: 'Piece - getShapeType returns shape type',
			pass: piece.getShapeType() === 'T',
			error: `Expected 'T', got '${piece.getShapeType()}'`
		});
	}
	catch (error) {
		tests.push({
			name: 'Piece tests',
			pass: false,
			error: error.message + '\n' + error.stack
		});
	}

	return tests;
}
