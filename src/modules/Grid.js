/**
 * Grid.js
 * 
 * Description: Game board state management with collision detection and matching
 * 
 * Dependencies: Ball, Constants, Helpers
 * 
 * Exports: Grid class
 */

import { Ball } from './Ball.js';
import { CONSTANTS } from '../utils/Constants.js';
import { isInBounds } from '../utils/Helpers.js';

/**
 * Grid class managing the game board state
 */
class Grid {
	
	/**
	 * Create a new grid
	 * @param {Number} rows - Number of rows (default: 25)
	 * @param {Number} cols - Number of columns (default: 15)
	 */
	constructor(rows = CONSTANTS.GRID_ROWS, cols = CONSTANTS.GRID_COLS) {
		this.rows = rows;
		this.cols = cols;
		
		// Initialize empty grid
		this.grid = [];
		for (let row = 0; row < rows; row++) {
			const gridRow = [];
			for (let col = 0; col < cols; col++) {
				gridRow.push(null);
			}
			this.grid.push(gridRow);
		}
	}
	
	/**
	 * Check if piece can be placed at given position without collision
	 * @param {Piece} piece - Piece to check
	 * @param {Number} x - Column position
	 * @param {Number} y - Row position
	 * @returns {Boolean} True if position is valid, false otherwise
	 */
	isValidPosition(piece, x, y) {
		const shape = piece.getShape();
		const shapeHeight = shape.length;
		const shapeWidth = shape[0].length;
		
		// Check each occupied cell in piece
		for (let row = 0; row < shapeHeight; row++) {
			for (let col = 0; col < shapeWidth; col++) {
				const hasBall = shape[row][col] === 1;
				
				// Check this position if occupied
				if (hasBall) {
					const gridRow = y + row;
					const gridCol = x + col;
					
					const isInGridBounds = isInBounds(gridRow, gridCol, this.rows, this.cols);
					
					// Position must be in bounds
					if (!isInGridBounds) {
						return false;
					}
					else {
						// Position is in bounds, check for collision
					}
					
					const cellOccupied = this.grid[gridRow][gridCol] !== null;
					
					// Cell must be empty
					if (cellOccupied) {
						return false;
					}
					else {
						// Cell is empty, continue checking
					}
				}
				else {
					// Empty cell in piece, skip
				}
			}
		}
		
		return true;
	}
	
	/**
	 * Place piece balls into grid at specified position
	 * @param {Piece} piece - Piece to place
	 * @param {Number} x - Column position
	 * @param {Number} y - Row position
	 * @returns {void}
	 */
	placePiece(piece, x, y) {
		const shape = piece.getShape();
		const balls = piece.getBalls();
		let ballIndex = 0;
		
		// Place each ball from piece into grid
		for (let row = 0; row < shape.length; row++) {
			for (let col = 0; col < shape[row].length; col++) {
				const hasBall = shape[row][col] === 1;
				
				// Place ball if cell is occupied
				if (hasBall) {
					const gridRow = y + row;
					const gridCol = x + col;
					const isInGridBounds = isInBounds(gridRow, gridCol, this.rows, this.cols);
					
					// Place ball if in bounds
					if (isInGridBounds) {
						this.grid[gridRow][gridCol] = balls[ballIndex];
						ballIndex++;
					}
					else {
						console.warn('Grid: Attempted to place ball out of bounds', gridRow, gridCol);
						ballIndex++;
					}
				}
				else {
					// Empty cell, skip
				}
			}
		}
	}
	
	/**
	 * Get ball at specified grid position
	 * @param {Number} row - Row index
	 * @param {Number} col - Column index
	 * @returns {Ball|null} Ball object or null if empty
	 */
	getBall(row, col) {
		const isInGridBounds = isInBounds(row, col, this.rows, this.cols);
		
		// Return ball if in bounds
		if (isInGridBounds) {
			return this.grid[row][col];
		}
		else {
			return null;
		}
	}
	
	/**
	 * Set ball at specified grid position
	 * @param {Number} row - Row index
	 * @param {Number} col - Column index
	 * @param {Ball|null} ball - Ball to place or null to clear
	 * @returns {void}
	 */
	setBall(row, col, ball) {
		const isInGridBounds = isInBounds(row, col, this.rows, this.cols);
		
		// Set ball if in bounds
		if (isInGridBounds) {
			this.grid[row][col] = ball;
		}
		else {
			console.warn('Grid: Attempted to set ball out of bounds', row, col);
		}
	}
	
	/**
	 * Remove ball from specified grid position
	 * @param {Number} row - Row index
	 * @param {Number} col - Column index
	 * @returns {void}
	 */
	removeBall(row, col) {
		this.setBall(row, col, null);
	}
	
	/**
	 * Find all color matches in the grid (3+ in a row)
	 * @returns {Array<Object>} Array of match objects
	 */
	findMatches() {
		const matches = [];
		
		// Find horizontal matches
		const horizontalMatches = this._findHorizontalMatches();
		matches.push(...horizontalMatches);
		
		// Find vertical matches
		const verticalMatches = this._findVerticalMatches();
		matches.push(...verticalMatches);
		
		// Find diagonal matches (all 4 directions)
		const diagonalMatches = this._findDiagonalMatches();
		matches.push(...diagonalMatches);
		
		return matches;
	}
	
	/**
	 * Find horizontal matches
	 * @returns {Array<Object>} Array of horizontal match objects
	 * @private
	 */
	_findHorizontalMatches() {
		const matches = [];
		
		for (let row = 0; row < this.rows; row++) {
			let currentColor = null;
			let matchStart = 0;
			let matchLength = 0;
			
			for (let col = 0; col <= this.cols; col++) {
				const ball = col < this.cols ? this.grid[row][col] : null;
				const hasBall = ball !== null;
				const isMatchable = hasBall && ball.isMatchable();
				const ballColor = isMatchable ? ball.getColor() : null;
				const colorsMatch = ballColor !== null && ballColor === currentColor;
				
				// Continue or end match
				if (colorsMatch) {
					matchLength++;
				}
				else {
					// Check if we have a valid match
					const hasMinLength = matchLength >= CONSTANTS.MIN_MATCH_LENGTH;
					
					// Save match if valid
					if (hasMinLength) {
						const positions = [];
						for (let c = matchStart; c < matchStart + matchLength; c++) {
							positions.push({ row, col: c });
						}
						matches.push({
							type: CONSTANTS.MATCH_DIRECTIONS.HORIZONTAL,
							color: currentColor,
							positions: positions,
							direction: null
						});
					}
					else {
						// Match too short, discard
					}
					
					// Start new potential match
					currentColor = ballColor;
					matchStart = col;
					matchLength = isMatchable ? 1 : 0;
				}
			}
		}
		
		return matches;
	}
	
	/**
	 * Find vertical matches
	 * @returns {Array<Object>} Array of vertical match objects
	 * @private
	 */
	_findVerticalMatches() {
		const matches = [];
		
		for (let col = 0; col < this.cols; col++) {
			let currentColor = null;
			let matchStart = 0;
			let matchLength = 0;
			
			for (let row = 0; row <= this.rows; row++) {
				const ball = row < this.rows ? this.grid[row][col] : null;
				const hasBall = ball !== null;
				const isMatchable = hasBall && ball.isMatchable();
				const ballColor = isMatchable ? ball.getColor() : null;
				const colorsMatch = ballColor !== null && ballColor === currentColor;
				
				// Continue or end match
				if (colorsMatch) {
					matchLength++;
				}
				else {
					// Check if we have a valid match
					const hasMinLength = matchLength >= CONSTANTS.MIN_MATCH_LENGTH;
					
					// Save match if valid
					if (hasMinLength) {
						const positions = [];
						for (let r = matchStart; r < matchStart + matchLength; r++) {
							positions.push({ row: r, col });
						}
						matches.push({
							type: CONSTANTS.MATCH_DIRECTIONS.VERTICAL,
							color: currentColor,
							positions: positions,
							direction: null
						});
					}
					else {
						// Match too short, discard
					}
					
					// Start new potential match
					currentColor = ballColor;
					matchStart = row;
					matchLength = isMatchable ? 1 : 0;
				}
			}
		}
		
		return matches;
	}
	
	/**
	 * Find diagonal matches (all 4 directions)
	 * @returns {Array<Object>} Array of diagonal match objects
	 * @private
	 */
	_findDiagonalMatches() {
		const matches = [];
		
		// TODO: Implement diagonal matching in future phase
		// For Phase 1, return empty array
		
		return matches;
	}
	
	/**
	 * Apply gravity - drop floating balls down
	 * @returns {Boolean} True if any balls moved, false if grid is stable
	 */
	applyGravity() {
		let ballsMoved = false;
		
		// Process from bottom up, column by column
		for (let col = 0; col < this.cols; col++) {
			let writeRow = this.rows - 1;
			
			// Scan from bottom to top
			for (let readRow = this.rows - 1; readRow >= 0; readRow--) {
				const ball = this.grid[readRow][col];
				const hasBall = ball !== null;
				
				// Move ball down to write position
				if (hasBall) {
					const movedDown = writeRow !== readRow;
					
					// Track if ball moved
					if (movedDown) {
						ballsMoved = true;
					}
					else {
						// Ball stayed in place
					}
					
					this.grid[writeRow][col] = ball;
					writeRow--;
				}
				else {
					// Empty cell, skip
				}
			}
			
			// Clear cells above
			for (let row = writeRow; row >= 0; row--) {
				this.grid[row][col] = null;
			}
		}
		
		return ballsMoved;
	}
	
	/**
	 * Check if specified column has reached the top row
	 * @param {Number} col - Column index
	 * @returns {Boolean} True if column is full, false otherwise
	 */
	isColumnFull(col) {
		const isInGridBounds = col >= 0 && col < this.cols;
		
		// Check top row
		if (isInGridBounds) {
			const topCell = this.grid[0][col];
			return topCell !== null;
		}
		else {
			return false;
		}
	}
	
	/**
	 * Check if any column has reached the top
	 * @returns {Boolean} True if any column is full
	 */
	isAnyColumnFull() {
		for (let col = 0; col < this.cols; col++) {
			const columnFull = this.isColumnFull(col);
			
			// Return true if any column full
			if (columnFull) {
				return true;
			}
			else {
				// Column not full, continue checking
			}
		}
		
		return false;
	}
	
	/**
	 * Clear entire grid
	 * @returns {void}
	 */
	clear() {
		for (let row = 0; row < this.rows; row++) {
			for (let col = 0; col < this.cols; col++) {
				this.grid[row][col] = null;
			}
		}
	}
	
	/**
	 * Get the raw grid array
	 * @returns {Array<Array<Ball|null>>} 2D grid array
	 */
	getGrid() {
		return this.grid;
	}
	
}

export { Grid };
