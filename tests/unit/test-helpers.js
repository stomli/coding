/**
 * Unit tests for Helpers utility functions
 * @module test-helpers
 */

import { 
	getNestedProperty,
	clamp,
	isInBounds,
	randomInt,
	shuffleArray,
	deepClone,
	formatNumber,
	formatTime
} from '../../src/utils/Helpers.js';

/**
 * Run all helper tests
 * @returns {Array} Test results
 */
export function testHelpers() {
	const tests = [];

	// Test getNestedProperty
	tests.push({
		name: 'getNestedProperty - retrieves nested value',
		pass: getNestedProperty({ a: { b: { c: 42 } } }, 'a.b.c') === 42,
		error: null
	});

	tests.push({
		name: 'getNestedProperty - returns default for missing path',
		pass: getNestedProperty({ a: 1 }, 'b.c', 'default') === 'default',
		error: null
	});

	// Test clamp
	tests.push({
		name: 'clamp - clamps value below min',
		pass: clamp(5, 10, 20) === 10,
		error: null
	});

	tests.push({
		name: 'clamp - clamps value above max',
		pass: clamp(25, 10, 20) === 20,
		error: null
	});

	tests.push({
		name: 'clamp - returns value within range',
		pass: clamp(15, 10, 20) === 15,
		error: null
	});

	// Test isInBounds
	tests.push({
		name: 'isInBounds - returns true for valid position',
		pass: isInBounds(5, 5, 10, 10) === true,
		error: null
	});

	tests.push({
		name: 'isInBounds - returns false for out of bounds',
		pass: isInBounds(-1, 5, 10, 10) === false,
		error: null
	});

	tests.push({
		name: 'isInBounds - returns false for y out of bounds',
		pass: isInBounds(5, 15, 10, 10) === false,
		error: null
	});

	// Test randomInt
	const rand = randomInt(5, 10);
	tests.push({
		name: 'randomInt - returns value in range',
		pass: rand >= 5 && rand <= 10,
		error: null
	});

	// Test shuffleArray
	const arr = [1, 2, 3, 4, 5];
	const shuffled = shuffleArray([...arr]);
	tests.push({
		name: 'shuffleArray - maintains array length',
		pass: shuffled.length === arr.length,
		error: null
	});

	tests.push({
		name: 'shuffleArray - contains all original elements',
		pass: arr.every(item => shuffled.includes(item)),
		error: null
	});

	// Test deepClone
	const original = { a: 1, b: { c: 2 } };
	const cloned = deepClone(original);
	tests.push({
		name: 'deepClone - creates independent copy',
		pass: cloned !== original && cloned.b !== original.b,
		error: null
	});

	tests.push({
		name: 'deepClone - preserves values',
		pass: cloned.a === 1 && cloned.b.c === 2,
		error: null
	});

	// Test formatNumber
	tests.push({
		name: 'formatNumber - formats large numbers',
		pass: formatNumber(1234567) === '1,234,567',
		error: null
	});

	// Test formatTime
	tests.push({
		name: 'formatTime - formats seconds correctly',
		pass: formatTime(65.5) === '1:05.5',
		error: null
	});

	tests.push({
		name: 'formatTime - formats under 10 seconds',
		pass: formatTime(5.2) === '5.2',
		error: null
	});

	return tests;
}
