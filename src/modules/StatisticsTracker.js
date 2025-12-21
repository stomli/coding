/**
 * StatisticsTracker.js
 * 
 * Description: Tracks ball type/color combination statistics for clearing events
 * 
 * Dependencies: Constants, ConfigManager, PieceFactory
 * 
 * Exports: StatisticsTracker singleton
 */

import { CONSTANTS } from '../utils/Constants.js';
import { ConfigManager } from './ConfigManager.js';
import PieceFactory from './PieceFactory.js';

/**
 * StatisticsTracker class for tracking match statistics
 */
class StatisticsTrackerClass {
	constructor() {
		// Statistics: stats[ballType][color] = count
		this.stats = {};
		this.boardElement = null;
		this.currentLevel = 1;
		this.availableColors = [];
		
		// Initialize stats for all types and colors
		this.reset(1);
	}

	/**
	 * Initialize the statistics board UI
	 */
	initialize() {
		this.boardElement = document.getElementById('statsBoard');
		if (this.boardElement) {
			this.renderBoard();
		}
	}

	/**
	 * Reset all statistics
	 * @param {Number} level - Current level to determine available colors
	 */
	reset(level = 1) {
		this.currentLevel = level;
		
		// Get available colors for this level from PieceFactory
		this.availableColors = PieceFactory.getAvailableColors(level);

		// Completely clear stats object to remove any dynamically added keys
		this.stats = {};

		if (this.boardElement) {
			this.renderBoard();
		}
	}

	/**
	 * Record a match for a ball type and color
	 * @param {Number} ballType - Ball type constant
	 * @param {String} color - Ball color (hex code or color name)
	 */
	recordMatch(ballType, color) {
		// Ensure stats[ballType] exists
		if (!this.stats[ballType]) {
			this.stats[ballType] = {};
		}
		
		// Initialize color if it doesn't exist
		if (this.stats[ballType][color] === undefined) {
			this.stats[ballType][color] = 0;
		}
		
		this.stats[ballType][color]++;
		this.updateCell(ballType, color);
	}

	/**
	 * Record multiple matches from a match set
	 * @param {Array} matches - Array of match objects with positions arrays
	 * @param {Grid} grid - Grid instance to get ball data
	 */
	recordMatches(matches, grid) {
		// Each match object has a positions array
		matches.forEach(match => {
			// Iterate through each position in the match
			// Balls in a match have the same COLOR but can have different TYPES
			if (match.positions && match.positions.length > 0) {
				match.positions.forEach(pos => {
					const ball = grid.getBall(pos.row, pos.col);
					
					if (ball) {
						// Record each ball's specific type and color combination
						this.recordMatch(ball.type, ball.color);
					}
				});
			}
		});
	}

	/**
	 * Render the statistics board
	 */
	renderBoard() {
		if (!this.boardElement) return;

		// Use available colors for current level
		const colors = this.availableColors;
		
		const types = [
			{ type: CONSTANTS.BALL_TYPES.NORMAL, name: 'Normal', symbol: '●' },
			{ type: CONSTANTS.BALL_TYPES.EXPLODING, name: 'Exploding', symbol: '✱' },
			{ type: CONSTANTS.BALL_TYPES.PAINTER_HORIZONTAL, name: 'Paint H', symbol: '⬌' },
			{ type: CONSTANTS.BALL_TYPES.PAINTER_VERTICAL, name: 'Paint V', symbol: '⬍' },
			{ type: CONSTANTS.BALL_TYPES.PAINTER_DIAGONAL_NE, name: 'Paint DNE', symbol: '╱' },
			{ type: CONSTANTS.BALL_TYPES.PAINTER_DIAGONAL_NW, name: 'Paint DNW', symbol: '╲' }
		];

		let html = '<table class="stats-table">';
		
		// Header row with colors
		html += '<thead><tr><th></th>';
		colors.forEach(color => {
			html += `<th><div class="stats-color-cell" style="background: ${color};"></div></th>`;
		});
		html += '</tr></thead>';

		// Body rows with types
		html += '<tbody>';
		types.forEach(typeData => {
			html += '<tr>';
			html += `<td class="stats-type-cell" title="${typeData.name}">${typeData.symbol}</td>`;
			colors.forEach(color => {
				const count = this.stats[typeData.type]?.[color] || 0;
				const cellClass = count > 0 ? 'stat-value has-matches' : 'stat-value';
				html += `<td class="${cellClass}" id="stat-${typeData.type}-${color.replace('#', '')}">${count}</td>`;
			});
			html += '</tr>';
		});
		html += '</tbody>';

		html += '</table>';
		this.boardElement.innerHTML = html;
	}

	/**
	 * Update a specific cell in the statistics board
	 * @param {Number} ballType - Ball type
	 * @param {String} color - Ball color
	 */
	updateCell(ballType, color) {
		const cellId = `stat-${ballType}-${color.replace('#', '')}`;
		const cell = document.getElementById(cellId);
		
		if (cell) {
			const count = this.stats[ballType][color];
			cell.textContent = count;
			
			// Add/remove class based on count
			if (count > 0) {
				cell.classList.add('has-matches');
			} else {
				cell.classList.remove('has-matches');
			}
			
			// Animate the update
			cell.style.transform = 'scale(1.3)';
			setTimeout(() => {
				cell.style.transform = 'scale(1)';
			}, 200);
		}
	}

	/**
	 * Get statistics for a specific type/color
	 * @param {Number} ballType - Ball type
	 * @param {String} color - Ball color
	 * @returns {Number} - Match count
	 */
	getStat(ballType, color) {
		return this.stats[ballType]?.[color] || 0;
	}

	/**
	 * Get total matches for all combinations
	 * @returns {Number}
	 */
	getTotalMatches() {
		let total = 0;
		Object.values(this.stats).forEach(colorStats => {
			Object.values(colorStats).forEach(count => {
				total += count;
			});
		});
		return total;
	}
	
	/**
	 * Alias for getTotalMatches (for compatibility)
	 * @returns {Number} Total count
	 */
	getTotalCount() {
		return this.getTotalMatches();
	}
	
	/**
	 * Get statistics object
	 * @returns {Object} Statistics object
	 */
	getStats() {
		return this.stats;
	}
	
	/**
	 * Get count for specific ball type and color
	 * @param {String} ballType - Ball type constant
	 * @param {String} color - Ball color
	 * @returns {Number} Count for this combination
	 */
	getCount(ballType, color) {
		if (this.stats[ballType] && this.stats[ballType][color] !== undefined) {
			return this.stats[ballType][color];
		}
		return 0;
	}

	/**
	 * Render statistics to a specific element (e.g., for level complete overlay)
	 * @param {String} elementId - ID of element to render stats into
	 */
	renderToElement(elementId) {
		const element = document.getElementById(elementId);
		if (!element) return;

		// Use available colors for current level
		const colors = this.availableColors;

		// Build table HTML
		let html = '<table class="stats-table">';
		
		// Header row with color swatches
		html += '<thead><tr><th></th>';
		colors.forEach(color => {
			html += `<th><div class="stats-color-cell" style="background-color: ${color};"></div></th>`;
		});
		html += '</tr></thead>';
		
		// Data rows
		html += '<tbody>';
		const types = [
			{ type: CONSTANTS.BALL_TYPES.NORMAL, symbol: '●' },
			{ type: CONSTANTS.BALL_TYPES.EXPLODING, symbol: '✱' },
			{ type: CONSTANTS.BALL_TYPES.PAINTER_HORIZONTAL, symbol: '⬌' },
			{ type: CONSTANTS.BALL_TYPES.PAINTER_VERTICAL, symbol: '⬍' },
			{ type: CONSTANTS.BALL_TYPES.PAINTER_DIAGONAL_NE, symbol: '╱' },
			{ type: CONSTANTS.BALL_TYPES.PAINTER_DIAGONAL_NW, symbol: '╲' }
		];
		
		types.forEach(({ type, symbol }) => {
			html += `<tr><td class="stats-type-cell">${symbol}</td>`;
			colors.forEach(color => {
				const count = this.stats[type]?.[color] || 0;
				const hasMatches = count > 0;
				html += `<td class="stat-value${hasMatches ? ' has-matches' : ''}">${count}</td>`;
			});
			html += '</tr>';
		});
		
		html += '</tbody></table>';
		element.innerHTML = html;
	}
}

// Export singleton instance
const StatisticsTracker = new StatisticsTrackerClass();
export default StatisticsTracker;
