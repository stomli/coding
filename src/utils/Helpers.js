/**
 * Helpers.js
 * 
 * Description: Common utility functions for the Ball Drop Puzzle Game
 * 
 * Dependencies: None
 * 
 * Exports: Helper functions
 */

/**
 * Get a nested property from an object using dot notation
 * @param {Object} obj - Object to search
 * @param {String} path - Dot-notation path (e.g., 'colors.ball.red')
 * @param {*} defaultValue - Default value if path not found
 * @returns {*} Value at path or default value
 */
function getNestedProperty(obj, path, defaultValue = null) {
	const hasPath = path && typeof path === 'string';
	
	// Return default if no path provided
	if (!hasPath) {
		return defaultValue;
	}
	else {
		// Path exists, continue
	}
	
	const keys = path.split('.');
	let result = obj;
	
	for (let i = 0; i < keys.length; i++) {
		const key = keys[i];
		const hasProperty = result && result.hasOwnProperty(key);
		
		// Navigate to next level
		if (hasProperty) {
			result = result[key];
		}
		else {
			return defaultValue;
		}
	}
	
	return result;
}

/**
 * Clamp a number between min and max values
 * @param {Number} value - Value to clamp
 * @param {Number} min - Minimum value
 * @param {Number} max - Maximum value
 * @returns {Number} Clamped value
 */
function clamp(value, min, max) {
	return Math.max(min, Math.min(max, value));
}

/**
 * Check if a position is within grid bounds
 * @param {Number} row - Row index
 * @param {Number} col - Column index
 * @param {Number} rows - Total rows
 * @param {Number} cols - Total columns
 * @returns {Boolean} True if in bounds, false otherwise
 */
function isInBounds(row, col, rows, cols) {
	return row >= 0 && row < rows && col >= 0 && col < cols;
}

/**
 * Generate a random integer between min and max (inclusive)
 * @param {Number} min - Minimum value
 * @param {Number} max - Maximum value
 * @returns {Number} Random integer
 */
function randomInt(min, max) {
	const range = max - min + 1;
	const randomValue = Math.floor(Math.random() * range);
	return min + randomValue;
}

/**
 * Generate a random float between min and max
 * @param {Number} min - Minimum value
 * @param {Number} max - Maximum value
 * @returns {Number} Random float
 */
function randomFloat(min, max) {
	return min + Math.random() * (max - min);
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array (modifies original)
 */
function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = randomInt(0, i);
		const temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
	return array;
}

/**
 * Deep clone an object or array
 * @param {*} obj - Object to clone
 * @returns {*} Cloned object
 */
function deepClone(obj) {
	// Return primitives and null directly
	if (obj === null || typeof obj !== 'object') {
		return obj;
	}
	
	// Clone array
	if (Array.isArray(obj)) {
		return obj.map(item => deepClone(item));
	}
	
	// Clone object (own properties only)
	const cloned = {};
	for (const key in obj) {
		if (obj.hasOwnProperty(key)) {
			cloned[key] = deepClone(obj[key]);
		}
	}
	return cloned;
}

/**
 * Format a number with commas as thousands separators
 * @param {Number} num - Number to format
 * @returns {String} Formatted number string
 */
function formatNumber(num) {
	return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Format time in seconds to M:SS.S or S.S format
 * Examples: 8.3 → "8.3", 65.7 → "1:05.7", 125.2 → "2:05.2"
 * @param {Number} seconds - Time in seconds (can include decimal)
 * @returns {String} Formatted time string
 */
function formatTime(seconds) {
	// Clamp to zero if negative (prevents "−0.1" type displays)
	seconds = Math.max(0, seconds);
	
	const minutes = Math.floor(seconds / 60); // 60 seconds per minute
	const secs = Math.floor(seconds % 60); // Remaining seconds after minutes
	const tenths = Math.floor((seconds % 1) * 10); // Extract tenth of a second
	
	// If less than 60 seconds, show S.S format (e.g., "8.3")
	if (minutes === 0) {
		return `${secs}.${tenths}`;
	}
	
	// Show M:SS.S format (e.g., "1:05.7")
	const secsStr = secs.toString().padStart(2, '0'); // Pad to 2 digits (e.g., "05")
	return `${minutes}:${secsStr}.${tenths}`;
}

/**
 * Iterate over all balls in a piece shape and execute callback
 * @param {Array<Array<Number>>} shape - 2D array shape matrix
 * @param {Function} callback - Function to call for each ball: (row, col) => void
 * @returns {void}
 */
function iterateShapeCells(shape, callback) {
	for (let row = 0; row < shape.length; row++) {
		for (let col = 0; col < shape[row].length; col++) {
			if (shape[row][col] === 1) {
				callback(row, col);
			}
		}
	}
}

/**
 * Seeded pseudo-random number generator (mulberry32).
 * Produces deterministic sequences for a given integer seed.
 */
class SeededRandom {
	constructor(seed) {
		this._state = seed | 0;
	}

	/** Return a float in [0, 1) */
	next() {
		this._state |= 0;
		this._state = this._state + 0x6D2B79F5 | 0;
		let t = Math.imul(this._state ^ (this._state >>> 15), 1 | this._state);
		t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	}

	/** Return an integer in [min, max] inclusive */
	nextInt(min, max) {
		return min + Math.floor(this.next() * (max - min + 1));
	}

	/** Return a float in [min, max) */
	nextFloat(min, max) {
		return min + this.next() * (max - min);
	}
}

export {
	getNestedProperty,
	clamp,
	isInBounds,
	randomInt,
	randomFloat,
	shuffleArray,
	deepClone,
	formatNumber,
	formatTime,
	iterateShapeCells,
	SeededRandom
};
