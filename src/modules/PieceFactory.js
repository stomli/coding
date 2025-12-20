/**
 * PieceFactory.js
 * 
 * Description: Factory for generating random pieces with level-appropriate colors and special balls
 * 
 * Dependencies: Ball, Piece, Constants, ConfigManager, Helpers
 * 
 * Exports: PieceFactory singleton
 */

import Ball from './Ball.js';
import Piece from './Piece.js';
import { CONSTANTS } from '../utils/Constants.js';
import { ConfigManager } from './ConfigManager.js';
import { randomInt, randomFloat } from '../utils/Helpers.js';

/**
 * PieceFactory class for generating random pieces
 */
class PieceFactoryClass {
	
	constructor() {
		// Track pieces dropped for blocking ball spawn logic
		this.piecesDropped = 0;
	}
	
	/**
	 * Get available colors for the current level
	 * @param {Number} level - Current game level
	 * @returns {Array<String>} Array of color hex codes
	 */
	getAvailableColors(level) {
		// Determine which color unlock tier applies
		let colorKey = 'level1';
		
		if (level >= 19) colorKey = 'level19';
		else if (level >= 15) colorKey = 'level15';
		else if (level >= 11) colorKey = 'level11';
		else if (level >= 7) colorKey = 'level7';
		else if (level >= 3) colorKey = 'level3';
		
		// Get color names from config
		const colorNames = ConfigManager.get(`colorUnlocks.${colorKey}`, ['red', 'green', 'blue']);
		
		// Map to hex codes
		const colors = colorNames.map(name => {
			return ConfigManager.get(`colors.balls.${name}`, '#FFFFFF');
		});
		
		return colors;
	}
	
	/**
	 * Check if a special ball should spawn
	 * @param {String} specialType - Type of special ball (exploding, painterHorizontal, etc.)
	 * @returns {Boolean} True if special ball should spawn
	 */
	shouldSpawnSpecialBall(specialType) {
		const spawnRate = ConfigManager.get(`specialBalls.${specialType}.spawnRate`, 0);
		return randomFloat(0, 1) < spawnRate;
	}
	
	/**
	 * Check if a blocking ball should spawn
	 * @param {Number} difficulty - Current difficulty level (1-5)
	 * @returns {Boolean} True if blocking ball should spawn
	 */
	shouldSpawnBlockingBall(difficulty) {
		// Get base spawn rate and increment
		const baseRate = ConfigManager.get('specialBalls.blocking.baseSpawnRate', 0.005);
		const increment = ConfigManager.get('specialBalls.blocking.spawnRateIncrement', 0.001);
		
		// Calculate effective spawn rate
		const spawnRate = baseRate + (increment * (difficulty - 1));
		
		// Check minimum pieces requirement
		const minPieces = ConfigManager.get(`specialBalls.blocking.minPieceBeforeSpawn.difficulty${difficulty}`, 50);
		
		if (this.piecesDropped < minPieces) {
			return false;
		}
		
		return randomFloat(0, 1) < spawnRate;
	}
	
	/**
	 * Generate a random special ball
	 * @param {Number} difficulty - Current difficulty level (1-5)
	 * @returns {Ball} A special ball or null if none should spawn
	 */
	generateSpecialBall(difficulty) {
		// Check blocking ball first (difficulty-dependent)
		if (this.shouldSpawnBlockingBall(difficulty)) {
			const color = ConfigManager.get('colors.special.blocking', '#808080');
			return new Ball(CONSTANTS.BALL_TYPES.BLOCKING, color);
		}
		
		// Check other special types
		const specialTypes = [
			{ type: CONSTANTS.BALL_TYPES.EXPLODING, config: 'exploding', colorKey: 'exploding' },
			{ type: CONSTANTS.BALL_TYPES.PAINTER_HORIZONTAL, config: 'painterHorizontal', colorKey: 'painterH' },
			{ type: CONSTANTS.BALL_TYPES.PAINTER_VERTICAL, config: 'painterVertical', colorKey: 'painterV' },
			{ type: CONSTANTS.BALL_TYPES.PAINTER_DIAGONAL, config: 'painterDiagonal', colorKey: 'painterD' }
		];
		
		// Shuffle to randomize priority
		for (let i = specialTypes.length - 1; i > 0; i--) {
			const j = randomInt(0, i);
			[specialTypes[i], specialTypes[j]] = [specialTypes[j], specialTypes[i]];
		}
		
		// Check each type
		for (const special of specialTypes) {
			if (this.shouldSpawnSpecialBall(special.config)) {
				const color = ConfigManager.get(`colors.special.${special.colorKey}`, '#FFD700');
				return new Ball(special.type, color);
			}
		}
		
		return null;
	}
	
	/**
	 * Generate a random piece for the current game state
	 * @param {Number} level - Current game level
	 * @param {Number} difficulty - Current difficulty level (1-5)
	 * @returns {Piece} A new random piece
	 */
	generatePiece(level, difficulty) {
		// Increment pieces dropped counter
		this.piecesDropped++;
		
		// Choose random piece shape
		const pieceTypes = Object.values(CONSTANTS.PIECE_TYPES);
		const randomIndex = randomInt(0, pieceTypes.length - 1);
		const shapeType = pieceTypes[randomIndex];
		
		// Get shape definition
		const shapeDefinition = ConfigManager.get(`pieceShapes.${shapeType}`);
		const hasShape = shapeDefinition !== null;
		
		// Count balls needed
		let ballCount = 0;
		
		if (hasShape) {
			for (let row = 0; row < shapeDefinition.length; row++) {
				for (let col = 0; col < shapeDefinition[row].length; col++) {
					if (shapeDefinition[row][col] === 1) {
						ballCount++;
					}
				}
			}
		} else {
			ballCount = 1;
		}
		
		// Get available colors for this level
		const availableColors = this.getAvailableColors(level);
		
		// Generate balls
		const balls = [];
		for (let i = 0; i < ballCount; i++) {
			// Check if this ball should be special
			const specialBall = this.generateSpecialBall(difficulty);
			
			if (specialBall) {
				balls.push(specialBall);
			} else {
				// Generate normal ball with random color
				const randomColor = availableColors[randomInt(0, availableColors.length - 1)];
				balls.push(new Ball(CONSTANTS.BALL_TYPES.NORMAL, randomColor));
			}
		}
		
		return new Piece(shapeType, balls);
	}
	
	/**
	 * Reset the factory state (call when starting new game)
	 */
	reset() {
		this.piecesDropped = 0;
	}
}

// Export singleton instance
const PieceFactory = new PieceFactoryClass();
export default PieceFactory;
export { PieceFactory };
