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
import { DebugMode } from '../utils/DebugMode.js';

/**
 * PieceFactory class for generating random pieces
 */
class PieceFactoryClass {
	
	constructor() {
		// Track pieces dropped for blocking ball spawn logic
		this.piecesDropped = 0;
		// Track current level for color selection
		this.currentLevel = 1;
	}
	
	/**
	 * Reset factory state
	 */
	reset() {
		this.piecesDropped = 0;
		this.currentLevel = 1;
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
		// Get available colors for random selection
		const availableColors = this.getAvailableColors(this.currentLevel || 1);
		
		// Check blocking ball first (difficulty-dependent)
		if (this.shouldSpawnBlockingBall(difficulty)) {
			const color = ConfigManager.get('colors.special.blocking', '#808080');
			return new Ball(CONSTANTS.BALL_TYPES.BLOCKING, color);
		}
		
		// Check other special types
		const specialTypes = [
			{ type: CONSTANTS.BALL_TYPES.EXPLODING, config: 'exploding' },
			{ type: CONSTANTS.BALL_TYPES.PAINTER_HORIZONTAL, config: 'painterHorizontal' },
			{ type: CONSTANTS.BALL_TYPES.PAINTER_VERTICAL, config: 'painterVertical' },
			{ type: CONSTANTS.BALL_TYPES.PAINTER_DIAGONAL_NE, config: 'painterDiagonal' },
			{ type: CONSTANTS.BALL_TYPES.PAINTER_DIAGONAL_NW, config: 'painterDiagonal' }
		];
		
		// Shuffle to randomize priority
		for (let i = specialTypes.length - 1; i > 0; i--) {
			const j = randomInt(0, i);
			[specialTypes[i], specialTypes[j]] = [specialTypes[j], specialTypes[i]];
		}
		
		// Check each type
		for (const special of specialTypes) {
			if (this.shouldSpawnSpecialBall(special.config)) {
				// Use random color from available colors
				const color = availableColors[randomInt(0, availableColors.length - 1)];
				return new Ball(special.type, color);
			}
		}
		
		return null;
	}
	
	/**
	 * Generate a random piece for the current game state
	 * @param {Number} level - Current game level
	 * @param {Number} difficulty - Current difficulty level (1-5)
	 * @param {Function} callback - Optional callback for async piece generation (debug mode)
	 * @returns {Piece|null} A new random piece, or null if waiting for debug selection
	 */
	generatePiece(level, difficulty, callback = null) {
		// In debug mode, show palette and wait for selection
		if (DebugMode.isEnabled() && callback) {
			DebugMode.requestPiece((shape, ballConfigs) => {
				console.log('🔧 Debug: PieceFactory received selection', { shape, ballConfigs });
				// User made selection, generate piece with overrides
				const piece = this._generatePieceInternal(level, difficulty, shape, ballConfigs);
				console.log('🔧 Debug: PieceFactory calling callback with piece', piece);
				callback(piece);
			});
			return null; // Will callback with piece later
		}
		
		// Normal synchronous generation
		return this._generatePieceInternal(level, difficulty, null, null);
	}
	
	/**
	 * Internal piece generation logic
	 * @private
	 */
	_generatePieceInternal(level, difficulty, debugShape = null, debugBallConfigs = null) {
		// Store current level for color selection
		this.currentLevel = level;
		
		// Increment pieces dropped counter
		this.piecesDropped++;
		
		// Choose piece shape (allow debug override)
		let shapeType;
		if (debugShape || (DebugMode.isEnabled() && DebugMode.getShape())) {
			shapeType = debugShape || DebugMode.getShape();
			console.log('🔧 Debug: Forcing shape:', shapeType);
		} else {
			// Only select from standard Tetris pieces, exclude SINGLE
			const pieceTypes = [
				CONSTANTS.PIECE_TYPES.I,
				CONSTANTS.PIECE_TYPES.O,
				CONSTANTS.PIECE_TYPES.T,
				CONSTANTS.PIECE_TYPES.L,
				CONSTANTS.PIECE_TYPES.J,
				CONSTANTS.PIECE_TYPES.S,
				CONSTANTS.PIECE_TYPES.Z
			];
			const randomIndex = randomInt(0, pieceTypes.length - 1);
			shapeType = pieceTypes[randomIndex];
		}
		
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
		let specialBallCount = 0;
		const maxSpecialBalls = ConfigManager.get('game.maxSpecialBallsPerPiece', 2);
		
		for (let i = 0; i < ballCount; i++) {
			let ballType = CONSTANTS.BALL_TYPES.NORMAL;
			let ballColor;
			
			// Check if we have per-ball debug configs
			if (debugBallConfigs && debugBallConfigs.length > i) {
				// Use the specific config for this ball
				const config = debugBallConfigs[i];
				ballType = config.type;
				
				// Resolve color name to hex
				if (config.color.startsWith('#')) {
					ballColor = config.color;
				} else {
					ballColor = ConfigManager.get(`colors.balls.${config.color.toLowerCase()}`);
					if (!ballColor) {
						ballColor = this._getColorForBallType(ballType, availableColors);
					}
				}
				
				if (i === 0) console.log('🔧 Debug: Using ball configs per ball');
			} else if (DebugMode.isEnabled() && (DebugMode.getType() || DebugMode.getColors())) {
				// Legacy query string debug mode (applies same type/color to all balls)
				const typeToUse = DebugMode.getType();
				if (typeToUse !== null && typeToUse !== undefined) {
					ballType = typeToUse;
					if (i === 0) console.log('🔧 Debug: Forcing ball type:', typeToUse);
				} else {
					// Check if this ball should be special (only if under limit)
					if (specialBallCount < maxSpecialBalls) {
						const specialBall = this.generateSpecialBall(difficulty);
						if (specialBall) {
							ballType = specialBall.getType();
							specialBallCount++;
						}
					}
				}
				
				// Override color if specified
				const colorsToUse = DebugMode.getColors();
				if (colorsToUse && colorsToUse.length > 0) {
					const colorIndex = i % colorsToUse.length;
					const colorValue = colorsToUse[colorIndex];
					
					// Resolve color name to hex
					if (colorValue.startsWith('#')) {
						ballColor = colorValue;
					} else {
						ballColor = ConfigManager.get(`colors.balls.${colorValue.toLowerCase()}`);
						if (!ballColor) {
							ballColor = this._getColorForBallType(ballType, availableColors);
						}
					}
					if (i === 0) console.log('🔧 Debug: Forcing ball color:', ballColor);
				} else {
					// Use default color for ball type
					ballColor = this._getColorForBallType(ballType, availableColors);
				}
			} else {
				// Normal generation (no debug mode)
				// Check if this ball should be special (respect limit)
				if (specialBallCount < maxSpecialBalls) {
					const specialBall = this.generateSpecialBall(difficulty);
					
					if (specialBall) {
						ballType = specialBall.getType();
						ballColor = specialBall.getColor();
						specialBallCount++;
					} else {
						// Generate normal ball with random color
						ballColor = availableColors[randomInt(0, availableColors.length - 1)];
					}
				} else {
					// Already at limit, must be normal ball
					ballColor = availableColors[randomInt(0, availableColors.length - 1)];
				}
			}
			
			balls.push(new Ball(ballType, ballColor));
		}
		
		return new Piece(shapeType, balls);
	}
	
	/**
	 * Get appropriate color for a ball type
	 * @param {String} ballType - Type of ball
	 * @param {Array<String>} availableColors - Available normal colors
	 * @returns {String} Hex color code
	 * @private
	 */
	_getColorForBallType(ballType, availableColors) {
		switch (ballType) {
			case CONSTANTS.BALL_TYPES.EXPLODING:
				return ConfigManager.get('colors.special.exploding', '#FFD700');
			case CONSTANTS.BALL_TYPES.BLOCKING:
				return ConfigManager.get('colors.special.blocking', '#808080');
			case CONSTANTS.BALL_TYPES.PAINTER_HORIZONTAL:
				return ConfigManager.get('colors.special.painterH', '#FF00FF');
			case CONSTANTS.BALL_TYPES.PAINTER_VERTICAL:
				return ConfigManager.get('colors.special.painterV', '#00FFFF');
			case CONSTANTS.BALL_TYPES.PAINTER_DIAGONAL_NE:
				return ConfigManager.get('colors.special.painterD', '#FFFF00');
			case CONSTANTS.BALL_TYPES.PAINTER_DIAGONAL_NW:
				return ConfigManager.get('colors.special.painterD', '#FFFF00');
			default:
				return availableColors[randomInt(0, availableColors.length - 1)];
		}
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
