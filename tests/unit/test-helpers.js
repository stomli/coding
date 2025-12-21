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
	
	// Edge cases for clamp
	tests.push({
		name: 'clamp - handles value equal to min',
		pass: clamp(10, 10, 20) === 10,
		error: null
	});
	
	tests.push({
		name: 'clamp - handles value equal to max',
		pass: clamp(20, 10, 20) === 20,
		error: null
	});
	
	tests.push({
		name: 'clamp - handles min equal to max',
		pass: clamp(15, 10, 10) === 10,
		error: null
	});
	
	tests.push({
		name: 'clamp - handles negative numbers',
		pass: clamp(-5, -10, 0) === -5,
		error: null
	});
	
	tests.push({
		name: 'clamp - handles zero',
		pass: clamp(0, -5, 5) === 0,
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
	
	// Edge cases for isInBounds
	tests.push({
		name: 'isInBounds - returns true for top-left corner (0,0)',
		pass: isInBounds(0, 0, 10, 10) === true,
		error: null
	});
	
	tests.push({
		name: 'isInBounds - returns true for bottom-right corner (max-1, max-1)',
		pass: isInBounds(9, 9, 10, 10) === true,
		error: null
	});
	
	tests.push({
		name: 'isInBounds - returns false for row at boundary',
		pass: isInBounds(10, 5, 10, 10) === false,
		error: null
	});
	
	tests.push({
		name: 'isInBounds - returns false for col at boundary',
		pass: isInBounds(5, 10, 10, 10) === false,
		error: null
	});
	
	tests.push({
		name: 'isInBounds - returns false for negative row',
		pass: isInBounds(-1, 0, 10, 10) === false,
		error: null
	});
	
	tests.push({
		name: 'isInBounds - returns false for negative col',
		pass: isInBounds(0, -1, 10, 10) === false,
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
	
	// Edge cases for shuffleArray
	tests.push({
		name: 'shuffleArray - handles empty array',
		pass: shuffleArray([]).length === 0,
		error: null
	});
	
	tests.push({
		name: 'shuffleArray - handles single element',
		pass: (() => {
			const single = shuffleArray([42]);
			return single.length === 1 && single[0] === 42;
		})(),
		error: null
	});
	
	tests.push({
		name: 'shuffleArray - handles two elements',
		pass: (() => {
			const two = shuffleArray([1, 2]);
			return two.length === 2 && two.includes(1) && two.includes(2);
		})(),
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
	
	// Edge cases for deepClone
	tests.push({
		name: 'deepClone - handles null',
		pass: deepClone(null) === null,
		error: null
	});
	
	tests.push({
		name: 'deepClone - handles undefined',
		pass: deepClone(undefined) === undefined,
		error: null
	});
	
	tests.push({
		name: 'deepClone - handles primitive numbers',
		pass: deepClone(42) === 42,
		error: null
	});
	
	tests.push({
		name: 'deepClone - handles primitive strings',
		pass: deepClone('hello') === 'hello',
		error: null
	});
	
	tests.push({
		name: 'deepClone - handles empty object',
		pass: (() => {
			const empty = deepClone({});
			return typeof empty === 'object' && Object.keys(empty).length === 0;
		})(),
		error: null
	});
	
	tests.push({
		name: 'deepClone - handles empty array',
		pass: (() => {
			const emptyArr = deepClone([]);
			return Array.isArray(emptyArr) && emptyArr.length === 0;
		})(),
		error: null
	});
	
	tests.push({
		name: 'deepClone - handles nested arrays',
		pass: (() => {
			const nested = deepClone([[1, 2], [3, 4]]);
			return nested[0][0] === 1 && nested[1][1] === 4 && nested !== [[1,2],[3,4]];
		})(),
		error: null
	});

	// Test formatNumber
	tests.push({
		name: 'formatNumber - formats large numbers',
		pass: formatNumber(1234567) === '1,234,567',
		error: null
	});
	
	// Edge cases for formatNumber
	tests.push({
		name: 'formatNumber - handles zero',
		pass: formatNumber(0) === '0',
		error: null
	});
	
	tests.push({
		name: 'formatNumber - handles small numbers (no commas)',
		pass: formatNumber(999) === '999',
		error: null
	});
	
	tests.push({
		name: 'formatNumber - handles thousands boundary',
		pass: formatNumber(1000) === '1,000',
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
	
	// Edge cases for formatTime
	tests.push({
		name: 'formatTime - handles zero',
		pass: formatTime(0) === '0.0',
		error: null
	});
	
	tests.push({
		name: 'formatTime - handles negative (clamped to zero)',
		pass: formatTime(-10) === '0.0',
		error: null
	});
	
	tests.push({
		name: 'formatTime - handles exactly 60 seconds',
		pass: formatTime(60) === '1:00.0',
		error: null
	});
	
	tests.push({
		name: 'formatTime - handles single digit seconds with minutes',
		pass: formatTime(61.5) === '1:01.5',
		error: null
	});
	
	const largeTimeResult = formatTime(599.9);
	tests.push({
		name: 'formatTime - handles large times',
		pass: largeTimeResult === '9:59.8',
		error: largeTimeResult !== '9:59.8' ? `Expected '9:59.8', got '${largeTimeResult}'` : null
	});

	return tests;
}
