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
