/**
 * Grid.js
 * 
 * Description: Game board state management with collision detection and matching
 * 
 * Dependencies: Ball, Constants, Helpers
 * 
 * Exports: Grid class
 */

import Ball from './Ball.js';
import { CONSTANTS } from '../utils/Constants.js';
import { isInBounds } from '../utils/Helpers.js';
import { iterateShapeCells } from '../utils/Helpers.js';

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
	 * Get the highest (lowest row number) row containing a ball
	 * @returns {Number} Row index of highest ball, or -1 if grid is empty
	 */
	getHighestBallRow() {
		for (let row = 0; row < this.rows; row++) {
			for (let col = 0; col < this.cols; col++) {
				if (this.grid[row][col] !== null) {
					return row;
				}
			}
		}
		return -1; // Grid is empty
	}
	
	/**
	 * Check if piece can be placed at given position without collision
	 * @param {Piece} piece - Piece to check
	 * @param {Number} [x] - Column position (defaults to piece.position.x)
	 * @param {Number} [y] - Row position (defaults to piece.position.y)
	 * @returns {Boolean} True if position is valid, false otherwise
	 */
	isValidPosition(piece, x, y) {
		// Use piece position if x,y not provided
		if (x === undefined || y === undefined) {
			const pos = piece.getPosition();
			x = pos.x;
			y = pos.y;
		}
		
		const shape = piece.getShape();
		let isValid = true;
		
		// Check each occupied cell in piece
		iterateShapeCells(shape, (row, col) => {
			const gridRow = y + row;
			const gridCol = x + col;
			
			const isInGridBounds = isInBounds(gridRow, gridCol, this.rows, this.cols);
			
			// Position is invalid if out of bounds
			if (!isInGridBounds) {
				isValid = false;
				return;
			}
			else {
				// In bounds, check for collision
			}
			
			const cellOccupied = this.grid[gridRow][gridCol] !== null;
			
			// Position is invalid if cell is occupied
			if (cellOccupied) {
				isValid = false;
				return;
			}
			else {
				// Cell is free
			}
		});
		
		return isValid;
	}
	
	/**
	 * Place piece balls into grid at specified position
	 * @param {Piece} piece - Piece to place
	 * @param {Number} [x] - Column position (defaults to piece.position.x)
	 * @param {Number} [y] - Row position (defaults to piece.position.y)
	 * @returns {void}
	 */
	placePiece(piece, x, y) {
		// Use piece position if x,y not provided
		if (x === undefined || y === undefined) {
			const pos = piece.getPosition();
			x = pos.x;
			y = pos.y;
		}
		
		const shape = piece.getShape();
		const balls = piece.getBalls();
		let ballIndex = 0;
		
		// Place each ball from piece into grid
		iterateShapeCells(shape, (row, col) => {
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
		});
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
	 * Alias for getBall - get ball at position (row, col)
	 * @param {Number} row - Row index
	 * @param {Number} col - Column index
	 * @returns {Ball|null} Ball object or null if empty
	 */
	getBallAt(row, col) {
		return this.getBall(row, col);
	}
	
	/**
	 * Alias for setBall - set ball at position (row, col)
	 * @param {Number} row - Row index
	 * @param {Number} col - Column index
	 * @param {Ball|null} ball - Ball to place or null to clear
	 * @returns {void}
	 */
	setBallAt(row, col, ball) {
		this.setBall(row, col, ball);
	}
	
	/**
	 * Alias for removeBall - remove ball at position (row, col)
	 * @param {Number} row - Row index
	 * @param {Number} col - Column index
	 * @returns {void}
	 */
	removeBallAt(row, col) {
		this.removeBall(row, col);
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
							direction: 'horizontal'
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
							direction: 'vertical'
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
		
		// Down-right diagonals (↘)
		for (let startRow = 0; startRow < this.rows; startRow++) {
			for (let startCol = 0; startCol < this.cols; startCol++) {
				let currentColor = null;
				let matchStart = { row: startRow, col: startCol };
				let matchLength = 0;
				
				let row = startRow;
				let col = startCol;
				
				while (row < this.rows && col < this.cols) {
					const ball = this.grid[row][col];
					const hasBall = ball !== null;
					const isMatchable = hasBall && ball.isMatchable();
					const ballColor = isMatchable ? ball.getColor() : null;
					const colorsMatch = ballColor !== null && ballColor === currentColor;
					
					if (colorsMatch) {
						matchLength++;
					} else {
						// Check if we have a valid match
						if (matchLength >= CONSTANTS.MIN_MATCH_LENGTH) {
							const positions = [];
							for (let i = 0; i < matchLength; i++) {
								positions.push({ 
									row: matchStart.row + i, 
									col: matchStart.col + i 
								});
							}
							matches.push({
								type: CONSTANTS.MATCH_DIRECTIONS.DIAGONAL,
								color: currentColor,
								positions: positions,
								direction: 'diagonal'
							});
						}
						
						// Start new potential match
						currentColor = ballColor;
						matchStart = { row, col };
						matchLength = isMatchable ? 1 : 0;
					}
					
					row++;
					col++;
				}
				
				// Check final match
				if (matchLength >= CONSTANTS.MIN_MATCH_LENGTH) {
					const positions = [];
					for (let i = 0; i < matchLength; i++) {
						positions.push({ 
							row: matchStart.row + i, 
							col: matchStart.col + i 
						});
					}
					matches.push({
						type: CONSTANTS.MATCH_DIRECTIONS.DIAGONAL,
						color: currentColor,
						positions: positions,
						direction: 'diagonal'
					});
				}
			}
		}
		
		// Down-left diagonals (↙)
		for (let startRow = 0; startRow < this.rows; startRow++) {
			for (let startCol = this.cols - 1; startCol >= 0; startCol--) {
				let currentColor = null;
				let matchStart = { row: startRow, col: startCol };
				let matchLength = 0;
				
				let row = startRow;
				let col = startCol;
				
				while (row < this.rows && col >= 0) {
					const ball = this.grid[row][col];
					const hasBall = ball !== null;
					const isMatchable = hasBall && ball.isMatchable();
					const ballColor = isMatchable ? ball.getColor() : null;
					const colorsMatch = ballColor !== null && ballColor === currentColor;
					
					if (colorsMatch) {
						matchLength++;
					} else {
						// Check if we have a valid match
						if (matchLength >= CONSTANTS.MIN_MATCH_LENGTH) {
							const positions = [];
							for (let i = 0; i < matchLength; i++) {
								positions.push({ 
									row: matchStart.row + i, 
									col: matchStart.col - i 
								});
							}
							matches.push({
								type: CONSTANTS.MATCH_DIRECTIONS.DIAGONAL,
								color: currentColor,
								positions: positions,
								direction: 'diagonal'
							});
						}
						
						// Start new potential match
						currentColor = ballColor;
						matchStart = { row, col };
						matchLength = isMatchable ? 1 : 0;
					}
					
					row++;
					col--;
				}
				
				// Check final match
				if (matchLength >= CONSTANTS.MIN_MATCH_LENGTH) {
					const positions = [];
					for (let i = 0; i < matchLength; i++) {
						positions.push({ 
							row: matchStart.row + i, 
							col: matchStart.col - i 
						});
					}
					matches.push({
						type: CONSTANTS.MATCH_DIRECTIONS.DIAGONAL,
						color: currentColor,
						positions: positions,
						direction: 'diagonal'
					});
				}
			}
		}
		
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
	
	/**
	 * Process exploding balls in matches and clear 7×7 areas
	 * @param {Array<Object>} matches - Array of match objects
	 * @returns {Array<Object>} Positions cleared by explosions with {row, col}
	 */
	processExplosions(matches) {
		const explodedPositions = [];
		const positionsToExplode = new Set();
		
		// Find all exploding balls in matches
		for (const match of matches) {
			for (const pos of match.positions) {
				const ball = this.getBallAt(pos.row, pos.col);
				if (ball && ball.isExploding()) {
					// Mark this position for explosion
					positionsToExplode.add(`${pos.row},${pos.col}`);
				}
			}
		}
		
		// Process each explosion
		for (const posStr of positionsToExplode) {
			const [row, col] = posStr.split(',').map(Number);
			
			// Clear 7×7 area centered on explosion
			const radius = 3; // 7×7 = 3 cells in each direction from center
			
			for (let r = row - radius; r <= row + radius; r++) {
				for (let c = col - radius; c <= col + radius; c++) {
					// Check bounds
					if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
						const ball = this.getBallAt(r, c);
						
						// Clear all balls (including blocking balls in explosion radius)
						if (ball) {
							explodedPositions.push({ row: r, col: c });
							this.removeBallAt(r, c);
						}
					}
				}
			}
		}
		
		return explodedPositions;
	}
	
	/**
	 * Process painting balls in matches and paint entire lines
	 * @param {Array<Object>} matches - Array of match objects
	 * @returns {Array<Object>} Positions painted with {row, col, oldColor, newColor}
	 */
	processPainters(matches) {
		const paintedPositions = [];
		
		// Find all painter balls in matches
		for (const match of matches) {
			// Check if any ball in this match is a painter
			for (const pos of match.positions) {
				const ball = this.getBallAt(pos.row, pos.col);
				
				if (ball && ball.isPainter()) {
					const painterColor = ball.getColor();
					const painterDirection = ball.getPainterDirection();
					
					// Paint the appropriate line based on painter type
					if (painterDirection === 'horizontal') {
						// Paint entire row
						for (let c = 0; c < this.cols; c++) {
							const targetBall = this.getBallAt(pos.row, c);
							if (targetBall && targetBall.getType() !== CONSTANTS.BALL_TYPES.BLOCKING) {
								const oldColor = targetBall.getColor();
								targetBall.setColor(painterColor);
								paintedPositions.push({
									row: pos.row,
									col: c,
									oldColor,
									newColor: painterColor
								});
							}
						}
					}
					else if (painterDirection === 'vertical') {
						// Paint entire column
						for (let r = 0; r < this.rows; r++) {
							const targetBall = this.getBallAt(r, pos.col);
							if (targetBall && targetBall.getType() !== CONSTANTS.BALL_TYPES.BLOCKING) {
								const oldColor = targetBall.getColor();
								targetBall.setColor(painterColor);
								paintedPositions.push({
									row: r,
									col: pos.col,
									oldColor,
									newColor: painterColor
								});
							}
						}
					}
					else if (painterDirection === 'diagonal') {
						// Paint diagonal line through this position
						// Paint both diagonals for simplicity
						
						// Down-right diagonal (↘)
						for (let offset = -Math.max(this.rows, this.cols); offset < Math.max(this.rows, this.cols); offset++) {
							const r = pos.row + offset;
							const c = pos.col + offset;
							if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
								const targetBall = this.getBallAt(r, c);
								if (targetBall && targetBall.getType() !== CONSTANTS.BALL_TYPES.BLOCKING) {
									const oldColor = targetBall.getColor();
									targetBall.setColor(painterColor);
									paintedPositions.push({
										row: r,
										col: c,
										oldColor,
										newColor: painterColor
									});
								}
							}
						}
						
						// Down-left diagonal (↙)
						for (let offset = -Math.max(this.rows, this.cols); offset < Math.max(this.rows, this.cols); offset++) {
							const r = pos.row + offset;
							const c = pos.col - offset;
							if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
								const targetBall = this.getBallAt(r, c);
								if (targetBall && targetBall.getType() !== CONSTANTS.BALL_TYPES.BLOCKING) {
									const oldColor = targetBall.getColor();
									targetBall.setColor(painterColor);
									paintedPositions.push({
										row: r,
										col: c,
										oldColor,
										newColor: painterColor
									});
								}
							}
						}
					}
					
					// Only process one painter per match
					break;
				}
			}
		}
		
		return paintedPositions;
	}
	
}

export default Grid;
