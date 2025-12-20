/**
 * Unit tests for Ball class
 * @module test-ball
 */

import Ball from '../../src/modules/Ball.js';
import { BALL_TYPES } from '../../src/utils/Constants.js';

/**
 * Run all Ball tests
 * @returns {Array} Test results
 */
export function testBall() {
	const tests = [];

	try {
		// Test normal ball creation
		const normalBall = new Ball(BALL_TYPES.NORMAL, '#FF0000');
		
		tests.push({
			name: 'Ball - creates with correct type',
			pass: normalBall.getType() === BALL_TYPES.NORMAL,
			error: null
		});

		tests.push({
			name: 'Ball - creates with correct color',
			pass: normalBall.getColor() === '#FF0000',
			error: null
		});

		// Test matchable
		tests.push({
			name: 'Ball - normal ball is matchable',
			pass: normalBall.isMatchable() === true,
			error: null
		});

		tests.push({
			name: 'Ball - normal ball is not special',
			pass: normalBall.isSpecial() === false,
			error: null
		});

		// Test exploding ball
		const explodingBall = new Ball(BALL_TYPES.EXPLODING, '#00FF00');
		
		tests.push({
			name: 'Ball - exploding ball is special',
			pass: explodingBall.isSpecial() === true,
			error: null
		});

		tests.push({
			name: 'Ball - identifies exploding ball',
			pass: explodingBall.isExploding() === true,
			error: null
		});

		tests.push({
			name: 'Ball - exploding ball is matchable',
			pass: explodingBall.isMatchable() === true,
			error: null
		});

		// Test painter ball
		const painterBall = new Ball(BALL_TYPES.PAINTER_HORIZONTAL, '#0000FF');
		
		tests.push({
			name: 'Ball - painter ball is special',
			pass: painterBall.isSpecial() === true,
			error: null
		});

		tests.push({
			name: 'Ball - identifies painter ball',
			pass: painterBall.isPainter() === true,
			error: null
		});

		tests.push({
			name: 'Ball - gets painter direction',
			pass: painterBall.getPainterDirection() === 'horizontal',
			error: null
		});

		// Test blocking ball
		const blockingBall = new Ball(BALL_TYPES.BLOCKING, '#888888');
		
		tests.push({
			name: 'Ball - blocking ball is special',
			pass: blockingBall.isSpecial() === true,
			error: null
		});

		tests.push({
			name: 'Ball - blocking ball is not matchable',
			pass: blockingBall.isMatchable() === false,
			error: null
		});

		// Test setColor
		normalBall.setColor('#FFFF00');
		tests.push({
			name: 'Ball - setColor updates color',
			pass: normalBall.getColor() === '#FFFF00',
			error: null
		});
	}
	catch (error) {
		tests.push({
			name: 'Ball tests',
			pass: false,
			error: error.message + '\n' + error.stack
		});
	}

	return tests;
}
