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

		// Test all painter types
		const painterVertical = new Ball(BALL_TYPES.PAINTER_VERTICAL, '#FF00FF');
		tests.push({
			name: 'Ball - vertical painter has correct direction',
			pass: painterVertical.getPainterDirection() === 'vertical',
			error: painterVertical.getPainterDirection() !== 'vertical' ? `Expected 'vertical', got '${painterVertical.getPainterDirection()}'` : null
		});

		const painterDiagonal = new Ball(BALL_TYPES.PAINTER_DIAGONAL, '#00FFFF');
		tests.push({
			name: 'Ball - diagonal painter has correct direction',
			pass: painterDiagonal.getPainterDirection() === 'diagonal',
			error: painterDiagonal.getPainterDirection() !== 'diagonal' ? `Expected 'diagonal', got '${painterDiagonal.getPainterDirection()}'` : null
		});

		// Test non-painter ball returns null for direction
		tests.push({
			name: 'Ball - normal ball has no painter direction',
			pass: normalBall.getPainterDirection() === null,
			error: normalBall.getPainterDirection() !== null ? `Expected null, got '${normalBall.getPainterDirection()}'` : null
		});

		// Test blocking ball properties
		tests.push({
			name: 'Ball - blocking ball is not exploding',
			pass: blockingBall.isExploding() === false,
			error: null
		});

		tests.push({
			name: 'Ball - blocking ball is not painter',
			pass: blockingBall.isPainter() === false,
			error: null
		});

		// Test invalid color handling
		const testBall = new Ball(BALL_TYPES.NORMAL, '#000000');
		testBall.setColor(null);
		tests.push({
			name: 'Ball - setColor rejects null',
			pass: testBall.getColor() === '#000000',
			error: testBall.getColor() !== '#000000' ? `Color should remain unchanged, got '${testBall.getColor()}'` : null
		});

		testBall.setColor(undefined);
		tests.push({
			name: 'Ball - setColor rejects undefined',
			pass: testBall.getColor() === '#000000',
			error: testBall.getColor() !== '#000000' ? `Color should remain unchanged, got '${testBall.getColor()}'` : null
		});

		testBall.setColor(123);
		tests.push({
			name: 'Ball - setColor rejects non-string',
			pass: testBall.getColor() === '#000000',
			error: testBall.getColor() !== '#000000' ? `Color should remain unchanged, got '${testBall.getColor()}'` : null
		});

		// Test all ball types are special or normal
		const allTypes = [
			BALL_TYPES.NORMAL,
			BALL_TYPES.EXPLODING,
			BALL_TYPES.PAINTER_HORIZONTAL,
			BALL_TYPES.PAINTER_VERTICAL,
			BALL_TYPES.PAINTER_DIAGONAL,
			BALL_TYPES.BLOCKING
		];

		const typeTests = allTypes.map(type => {
			const ball = new Ball(type, '#FFFFFF');
			const isNormalType = type === BALL_TYPES.NORMAL;
			const shouldBeSpecial = !isNormalType;
			return ball.isSpecial() === shouldBeSpecial;
		});

		tests.push({
			name: 'Ball - all ball types have correct special status',
			pass: typeTests.every(result => result === true),
			error: !typeTests.every(result => result === true) ? 'Some ball types have incorrect special status' : null
		});

		// Test all matchable types
		const matchableTypes = [
			BALL_TYPES.NORMAL,
			BALL_TYPES.EXPLODING,
			BALL_TYPES.PAINTER_HORIZONTAL,
			BALL_TYPES.PAINTER_VERTICAL,
			BALL_TYPES.PAINTER_DIAGONAL
		];

		const matchableTests = matchableTypes.map(type => {
			const ball = new Ball(type, '#FFFFFF');
			return ball.isMatchable() === true;
		});

		tests.push({
			name: 'Ball - all non-blocking types are matchable',
			pass: matchableTests.every(result => result === true),
			error: !matchableTests.every(result => result === true) ? 'Some non-blocking types are not matchable' : null
		});

		// Test color persistence across operations
		const colorBall = new Ball(BALL_TYPES.NORMAL, '#123456');
		const originalColor = colorBall.getColor();
		colorBall.isMatchable();
		colorBall.isSpecial();
		colorBall.getType();
		
		tests.push({
			name: 'Ball - color persists after method calls',
			pass: colorBall.getColor() === originalColor,
			error: colorBall.getColor() !== originalColor ? `Color changed from '${originalColor}' to '${colorBall.getColor()}'` : null
		});

		// Test type persistence
		const typeBall = new Ball(BALL_TYPES.EXPLODING, '#ABCDEF');
		const originalType = typeBall.getType();
		typeBall.setColor('#FEDCBA');
		typeBall.isMatchable();
		
		tests.push({
			name: 'Ball - type persists after color change',
			pass: typeBall.getType() === originalType,
			error: typeBall.getType() !== originalType ? `Type changed from '${originalType}' to '${typeBall.getType()}'` : null
		});

		// Test multiple color changes
		const multiColorBall = new Ball(BALL_TYPES.NORMAL, '#111111');
		multiColorBall.setColor('#222222');
		multiColorBall.setColor('#333333');
		multiColorBall.setColor('#444444');
		
		tests.push({
			name: 'Ball - handles multiple color changes',
			pass: multiColorBall.getColor() === '#444444',
			error: multiColorBall.getColor() !== '#444444' ? `Expected '#444444', got '${multiColorBall.getColor()}'` : null
		});

		// Test painter types are mutually exclusive
		tests.push({
			name: 'Ball - horizontal painter is not vertical',
			pass: painterBall.getPainterDirection() !== 'vertical',
			error: null
		});

		tests.push({
			name: 'Ball - horizontal painter is not diagonal',
			pass: painterBall.getPainterDirection() !== 'diagonal',
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
