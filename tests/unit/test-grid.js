/**
 * Unit tests for Grid class
 * @module test-grid
 */

import Grid from '../../src/modules/Grid.js';
import Piece from '../../src/modules/Piece.js';
import Ball from '../../src/modules/Ball.js';
import { BALL_TYPES } from '../../src/utils/Constants.js';

/**
 * Run all Grid tests
 * @returns {Array} Test results
 */
export function testGrid() {
	const tests = [];

	try {
		// Create grid
		const grid = new Grid(10, 15); // 10 rows, 15 columns

		tests.push({
			name: 'Grid - creates with correct dimensions',
			pass: grid.rows === 10 && grid.cols === 15,
			error: null
		});

		// Test getBallAt
		tests.push({
			name: 'Grid - getBallAt returns null for empty cell',
			pass: grid.getBallAt(0, 0) === null,
			error: null
		});

		// Test setBallAt
		const ball = new Ball(BALL_TYPES.NORMAL, '#FF0000');
		grid.setBallAt(5, 7, ball);
		
		tests.push({
			name: 'Grid - setBallAt places ball correctly',
			pass: grid.getBallAt(5, 7) === ball,
			error: null
		});

		// Test removeBallAt
		grid.removeBallAt(5, 7);
		tests.push({
			name: 'Grid - removeBallAt clears cell',
			pass: grid.getBallAt(5, 7) === null,
			error: null
		});

		// Test piece placement validation
		const shape = [[1]]; // Single cell piece
		const balls = [new Ball(BALL_TYPES.NORMAL, '#00FF00')];
		const piece = new Piece('S', shape, balls);
		piece.position = { x: 0, y: 0 };

		tests.push({
			name: 'Grid - isValidPosition returns true for valid position',
			pass: grid.isValidPosition(piece) === true,
			error: null
		});

		// Test out of bounds
		piece.position = { x: -1, y: 0 };
		tests.push({
			name: 'Grid - isValidPosition returns false for out of bounds',
			pass: grid.isValidPosition(piece) === false,
			error: null
		});

		// Test collision detection
		grid.setBallAt(5, 5, new Ball(BALL_TYPES.NORMAL, '#0000FF'));
		piece.position = { x: 5, y: 5 };
		tests.push({
			name: 'Grid - isValidPosition returns false for collision',
			pass: grid.isValidPosition(piece) === false,
			error: null
		});

		// Test placePiece
		piece.position = { x: 3, y: 3 };
		grid.placePiece(piece);
		tests.push({
			name: 'Grid - placePiece places ball on grid',
			pass: grid.getBallAt(3, 3) !== null,
			error: null
		});

		// Test horizontal matching
		const grid2 = new Grid(10, 15);
		// Place 3 balls horizontally
		for (let x = 0; x < 3; x++) {
			grid2.setBallAt(0, x, new Ball(BALL_TYPES.NORMAL, '#FF0000'));
		}
		const matches = grid2.findMatches();
		
		tests.push({
			name: 'Grid - findMatches detects horizontal match',
			pass: matches.length > 0,
			error: null
		});

		tests.push({
			name: 'Grid - match contains correct positions',
			pass: matches[0].positions.length === 3,
			error: null
		});

		// Test vertical matching
		const grid3 = new Grid(10, 15);
		for (let y = 0; y < 3; y++) {
			grid3.setBallAt(y, 0, new Ball(BALL_TYPES.NORMAL, '#00FF00'));
		}
		const verticalMatches = grid3.findMatches();
		
		tests.push({
			name: 'Grid - findMatches detects vertical match',
			pass: verticalMatches.length > 0 && verticalMatches[0].direction === 'vertical',
			error: null
		});

		// Test gravity
		const grid4 = new Grid(10, 15);
		grid4.setBallAt(0, 5, new Ball(BALL_TYPES.NORMAL, '#0000FF'));
		grid4.setBallAt(5, 5, new Ball(BALL_TYPES.NORMAL, '#FF0000'));
		grid4.applyGravity();
		
		tests.push({
			name: 'Grid - applyGravity moves balls down',
			pass: grid4.getBallAt(9, 5) !== null,
			error: null
		});

		// Test isColumnFull
		const grid5 = new Grid(5, 5);
		for (let y = 0; y < 5; y++) {
			grid5.setBallAt(y, 2, new Ball(BALL_TYPES.NORMAL, '#FF0000'));
		}
		
		tests.push({
			name: 'Grid - isColumnFull detects full column',
			pass: grid5.isColumnFull(2) === true,
			error: null
		});

		tests.push({
			name: 'Grid - isColumnFull returns false for empty column',
			pass: grid5.isColumnFull(0) === false,
			error: null
		});

		// Test clear
		grid5.clear();
		tests.push({
			name: 'Grid - clear removes all balls',
			pass: grid5.getBallAt(2, 2) === null,
			error: null
		});
	}
	catch (error) {
		tests.push({
			name: 'Grid tests',
			pass: false,
			error: error.message + '\n' + error.stack
		});
	}

	return tests;
}
