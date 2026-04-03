/**
 * Shared assertion helpers for unit tests.
 * Import only what each test file needs.
 */

export function assert(condition, message) {
	if (!condition) {
		throw new Error(message || 'Assertion failed');
	}
}

export function assertEquals(actual, expected, message) {
	if (actual !== expected) {
		throw new Error(message || `Expected ${expected}, got ${actual}`);
	}
}

export function assertNotEquals(actual, unexpected, message) {
	if (actual === unexpected) {
		throw new Error(message || `Expected value to not equal ${unexpected}`);
	}
}

export function assertBetween(value, min, max, message) {
	if (value < min || value > max) {
		throw new Error(message || `Expected ${value} to be between ${min} and ${max}`);
	}
}

export function assertGreaterThan(actual, expected, message) {
	if (actual <= expected) {
		throw new Error(message || `Expected ${actual} to be greater than ${expected}`);
	}
}

export function assertNotNull(value, message) {
	if (value === null || value === undefined) {
		throw new Error(message || 'Value should not be null or undefined');
	}
}

export function assertNull(value, message) {
	if (value !== null && value !== undefined) {
		throw new Error(message || `Expected null or undefined, got ${value}`);
	}
}

export function assertArrayEquals(actual, expected, message) {
	if (JSON.stringify(actual) !== JSON.stringify(expected)) {
		throw new Error(message || `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
	}
}

export function assertArrayContains(array, value, message) {
	if (!array.includes(value)) {
		throw new Error(message || `Array should contain ${value}`);
	}
}
