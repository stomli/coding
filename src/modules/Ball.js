/**
 * Ball.js
 * 
 * Description: Ball entity with type, color, and behavior properties
 * 
 * Dependencies: Constants
 * 
 * Exports: Ball class
 */

import { CONSTANTS } from '../utils/Constants.js';

/**
 * Ball class representing individual ball entities in the game
 */
class Ball {
	
	/**
	 * Create a new ball
	 * @param {String} type - Ball type from CONSTANTS.BALL_TYPES
	 * @param {String} color - Hex color code (e.g., '#FF0000')
	 */
	constructor(type, color) {
		this.type = type;
		this.color = color;
	}
	
	/**
	 * Get the ball's type
	 * @returns {String} Ball type constant
	 */
	getType() {
		return this.type;
	}
	
	/**
	 * Get the ball's color
	 * @returns {String} Hex color string
	 */
	getColor() {
		return this.color;
	}
	
	/**
	 * Set the ball's color (used by painting mechanic)
	 * @param {String} newColor - Hex color code
	 * @returns {void}
	 */
	setColor(newColor) {
		if (newColor && typeof newColor === 'string') {
			this.color = newColor;
		} else {
			console.warn('Ball: Invalid color provided', newColor);
		}
	}
	
	/**
	 * Check if this ball can participate in color matching
	 * @returns {Boolean} True for normal and special balls, false for blocking
	 */
	isMatchable() {
		return this.type !== CONSTANTS.BALL_TYPES.BLOCKING;
	}
	
	/**
	 * Check if ball has special properties
	 * @returns {Boolean} True if exploding or painting type
	 */
	isSpecial() {
		return CONSTANTS.SPECIAL_TYPES.includes(this.type);
	}
	
	/**
	 * Check if ball is an exploding type
	 * @returns {Boolean} True if exploding ball
	 */
	isExploding() {
		return this.type === CONSTANTS.BALL_TYPES.EXPLODING;
	}
	
	/**
	 * Check if ball is a painter type
	 * @returns {Boolean} True if any painter type
	 */
	isPainter() {
		return CONSTANTS.PAINTER_TYPES.includes(this.type);
	}
	
	/**
	 * Get the painter direction if this is a painter ball
	 * @returns {String|null} 'horizontal', 'vertical', 'diagonal-ne', 'diagonal-nw', or null if not a painter
	 */
	getPainterDirection() {
		const directionMap = {
			[CONSTANTS.BALL_TYPES.PAINTER_HORIZONTAL]: 'horizontal',
			[CONSTANTS.BALL_TYPES.PAINTER_VERTICAL]: 'vertical',
			[CONSTANTS.BALL_TYPES.PAINTER_DIAGONAL_NE]: 'diagonal-ne',
			[CONSTANTS.BALL_TYPES.PAINTER_DIAGONAL_NW]: 'diagonal-nw'
		};
		return directionMap[this.type] ?? null;
	}
	
}

export default Ball;
