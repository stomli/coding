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
	const isLessThanMin = value < min;
	const isGreaterThanMax = value > max;
	
	// Return clamped value
	if (isLessThanMin) {
		return min;
	}
	else if (isGreaterThanMax) {
		return max;
	}
	else {
		return value;
	}
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
	const isRowValid = row >= 0 && row < rows;
	const isColValid = col >= 0 && col < cols;
	
	// Both row and column must be valid
	if (isRowValid && isColValid) {
		return true;
	}
	else {
		return false;
	}
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
	const isNull = obj === null;
	const isObject = typeof obj === 'object';
	
	// Return primitives and null directly
	if (isNull || !isObject) {
		return obj;
	}
	else {
		// Clone object or array
	}
	
	const isArray = Array.isArray(obj);
	
	// Clone array or object
	if (isArray) {
		return obj.map(item => deepClone(item));
	}
	else {
		const cloned = {};
		for (const key in obj) {
			const hasProperty = obj.hasOwnProperty(key);
			
			// Copy own properties only
			if (hasProperty) {
				cloned[key] = deepClone(obj[key]);
			}
			else {
				// Skip inherited properties
			}
		}
		return cloned;
	}
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
 * @param {Number} seconds - Time in seconds
 * @returns {String} Formatted time string
 */
function formatTime(seconds) {
	const isNegative = seconds < 0;
	
	// Clamp to zero if negative
	if (isNegative) {
		seconds = 0;
	}
	else {
		// Time is positive, continue
	}
	
	const minutes = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);
	const tenths = Math.floor((seconds % 1) * 10);
	
	// If less than 60 seconds, show S.S format
	if (minutes === 0) {
		return `${secs}.${tenths}`;
	}
	else {
		// Show M:SS.S format
		const secsStr = secs.toString().padStart(2, '0');
		return `${minutes}:${secsStr}.${tenths}`;
	}
}

/**
 * Iterate over all balls in a piece shape and execute callback
 * @param {Array<Array<Number>>} shape - 2D array shape matrix
 * @param {Function} callback - Function to call for each ball: (row, col) => void
 * @returns {void}
 */
function iterateShapeCells(shape, callback) {
	// Iterate through shape matrix
	for (let row = 0; row < shape.length; row++) {
		for (let col = 0; col < shape[row].length; col++) {
			const hasBall = shape[row][col] === 1;
			
			// Execute callback for ball cells
			if (hasBall) {
				callback(row, col);
			}
			else {
				// Empty cell, skip
			}
		}
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
	iterateShapeCells
};
