/**
 * Piece.js
 * 
 * Description: Falling piece composition and rotation logic
 * 
 * Dependencies: Ball, Constants, ConfigManager
 * 
 * Exports: Piece class
 */

import Ball from './Ball.js';
import { CONSTANTS } from '../utils/Constants.js';
import { ConfigManager } from './ConfigManager.js';
import { deepClone } from '../utils/Helpers.js';

/**
 * Piece class representing falling pieces composed of balls
 */
class Piece {
	
	/**
	 * Create a new piece
	 * @param {String} shapeType - Piece shape type from CONSTANTS.PIECE_TYPES
	 * @param {Array<Array<Number>>|Array<Ball>} shapeOrBalls - Shape matrix or Ball array
	 * @param {Array<Ball>} [balls] - Array of Ball objects (if first param is shape)
	 */
	constructor(shapeType, shapeOrBalls, balls) {
		this.shapeType = shapeType;
		this.position = { x: 0, y: 0 };
		
		// Check if second parameter is a shape matrix or ball array
		const isShapeMatrix = Array.isArray(shapeOrBalls) && Array.isArray(shapeOrBalls[0]);
		
		if (isShapeMatrix && balls) {
			// Old signature: (type, shape, balls)
			this.shape = deepClone(shapeOrBalls);
			this.balls = balls;
		}
		else {
			// New signature: (type, balls)
			this.balls = shapeOrBalls;
			
			// Load shape definition from config
			const shapeDefinition = ConfigManager.get(`pieceShapes.${shapeType}`);
			const hasShape = shapeDefinition !== null;
			
			// Initialize shape matrix
			if (hasShape) {
				this.shape = deepClone(shapeDefinition);
			}
			else {
				console.error(`Piece: Shape type ${shapeType} not found in config`);
				this.shape = [[1]];
			}
		}
	}
	
	/**
	 * Rotate the piece 90 degrees clockwise
	 * @returns {void}
	 */
	rotate() {
		const oldShape = this.shape;
		const oldRows = oldShape.length;
		const oldCols = oldShape[0].length;
		
		// Create new rotated shape (transpose and reverse)
		const newShape = [];
		
		for (let col = 0; col < oldCols; col++) {
			const newRow = [];
			
			for (let row = oldRows - 1; row >= 0; row--) {
				newRow.push(oldShape[row][col]);
			}
			
			newShape.push(newRow);
		}
		
		this.shape = newShape;
	}
	
	/**
	 * Get the current shape matrix
	 * @returns {Array<Array<Number>>} 2D array where 1 = ball present, 0 = empty
	 */
	getShape() {
		return this.shape;
	}
	
	/**
	 * Get the piece type
	 * @returns {String} Shape type identifier
	 */
	getType() {
		return this.shapeType;
	}
	
	/**
	 * Get array of Ball objects in this piece
	 * @returns {Array<Ball>} Array of Ball instances
	 */
	getBalls() {
		return this.balls;
	}
	
	/**
	 * Get the current position
	 * @returns {Object} Object with x (column) and y (row) coordinates
	 */
	getPosition() {
		return { x: this.position.x, y: this.position.y };
	}
	
	/**
	 * Set the position of the piece
	 * @param {Number} x - Column position
	 * @param {Number} y - Row position
	 * @returns {void}
	 */
	setPosition(x, y) {
		const isValidX = typeof x === 'number';
		const isValidY = typeof y === 'number';
		
		// Update position if valid
		if (isValidX && isValidY) {
			this.position.x = x;
			this.position.y = y;
		}
		else {
			console.warn('Piece: Invalid position provided', x, y);
		}
	}
	
	/**
	 * Get the width of the piece
	 * @returns {Number} Number of columns occupied
	 */
	getWidth() {
		const hasShape = this.shape && this.shape.length > 0;
		
		// Return width from shape
		if (hasShape) {
			return this.shape[0].length;
		}
		else {
			return 0;
		}
	}
	
	/**
	 * Get the height of the piece
	 * @returns {Number} Number of rows occupied
	 */
	getHeight() {
		const hasShape = this.shape && this.shape.length > 0;
		
		// Return height from shape
		if (hasShape) {
			return this.shape.length;
		}
		else {
			return 0;
		}
	}
	
	/**
	 * Get the shape type
	 * @returns {String} Piece shape type constant
	 */
	getShapeType() {
		return this.shapeType;
	}
	
	/**
	 * Get ball at specific position within piece shape
	 * @param {Number} row - Row within piece
	 * @param {Number} col - Column within piece
	 * @returns {Ball|null} Ball object or null if position is empty
	 */
	getBallAt(row, col) {
		const isRowValid = row >= 0 && row < this.shape.length;
		const isColValid = col >= 0 && col < this.shape[0].length;
		
		// Check bounds
		if (!isRowValid || !isColValid) {
			return null;
		}
		else {
			// Position is valid, continue
		}
		
		const hasBall = this.shape[row][col] === 1;
		
		// Return ball if present
		if (hasBall) {
			// Calculate ball index in flat array (row-major order)
			let ballIndex = 0;
			
			for (let r = 0; r < this.shape.length; r++) {
				for (let c = 0; c < this.shape[r].length; c++) {
					const isTargetPosition = r === row && c === col;
					const cellHasBall = this.shape[r][c] === 1;
					
					// Return ball if we reached target position
					if (isTargetPosition && cellHasBall) {
						return this.balls[ballIndex];
					}
					else if (cellHasBall) {
						ballIndex++;
					}
					else {
						// Empty cell, skip
					}
				}
			}
			
			return null;
		}
		else {
			return null;
		}
	}
	
	/**
	 * Get all occupied positions relative to piece origin
	 * @returns {Array<Object>} Array of {x, y} positions (x=col, y=row)
	 */
	getOccupiedPositions() {
		const positions = [];
		
		for (let row = 0; row < this.shape.length; row++) {
			for (let col = 0; col < this.shape[row].length; col++) {
				const hasBall = this.shape[row][col] === 1;
				
				// Add position if occupied
				if (hasBall) {
					positions.push({ 
						x: this.position.x + col, 
						y: this.position.y + row 
					});
				}
				else {
					// Empty position, skip
				}
			}
		}
		
		return positions;
	}
	
}

export default Piece;
