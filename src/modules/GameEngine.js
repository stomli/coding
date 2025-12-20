/**
 * GameEngine.js
 * 
 * Description: Core game loop and state management (Phase 1: initialization only)
 * 
 * Dependencies: All modules
 * 
 * Exports: GameEngine class
 */

import Grid from './Grid.js';
import Piece from './Piece.js';
import Ball from './Ball.js';
import Renderer from './Renderer.js';
import { InputHandler } from './InputHandler.js';
import { ConfigManager } from './ConfigManager.js';
import { EventEmitter } from '../utils/EventEmitter.js';
import { CONSTANTS } from '../utils/Constants.js';
import { randomInt } from '../utils/Helpers.js';

/**
 * Game engine class managing core game state and loop
 */
class GameEngineClass {
	
	/**
	 * Constructor initializes game state
	 */
	constructor() {
		this.state = CONSTANTS.GAME_STATES.MENU;
		this.grid = null;
		this.renderer = null;
		this.currentPiece = null;
		this.nextPiece = null;
		this.isInitialized = false;
	}
	
	/**
	 * Initialize game engine and all subsystems
	 * @returns {Promise<void>}
	 */
	async initialize() {
		const hasConfig = ConfigManager.isConfigLoaded();
		
		// Load config if not loaded
		if (!hasConfig) {
			await ConfigManager.loadConfig();
		}
		else {
			// Config already loaded
		}
		
		// Initialize grid
		const gridRows = ConfigManager.get('game.gridRows', CONSTANTS.GRID_ROWS);
		const gridCols = ConfigManager.get('game.gridCols', CONSTANTS.GRID_COLS);
		this.grid = new Grid(gridRows, gridCols);
		
		// Initialize renderer
		const canvas = document.getElementById('gameCanvas');
		const hasCanvas = canvas !== null;
		
		// Create renderer if canvas exists
		if (hasCanvas) {
			this.renderer = new Renderer(canvas);
			this.renderer.initialize();
		}
		else {
			console.error('GameEngine: Canvas element not found');
		}
		
		// Initialize input handler
		InputHandler.initialize();
		
		// Set up event listeners (Phase 2+)
		this._setupEventListeners();
		
		this.isInitialized = true;
		
		console.log('GameEngine: Initialized successfully');
	}
	
	/**
	 * Set up event listeners for game events
	 * @returns {void}
	 * @private
	 */
	_setupEventListeners() {
		// TODO: Implement in Phase 2
		// EventEmitter.on(CONSTANTS.EVENTS.MOVE_LEFT, () => {...});
		// EventEmitter.on(CONSTANTS.EVENTS.MOVE_RIGHT, () => {...});
		// etc.
	}
	
	/**
	 * Start a new game (Phase 2+)
	 * @param {Number} difficulty - Difficulty level (1-5)
	 * @param {Number} level - Starting level number
	 * @returns {void}
	 */
	start(difficulty, level) {
		const isInitialized = this.isInitialized;
		
		// Check if initialized
		if (!isInitialized) {
			console.error('GameEngine: Not initialized. Call initialize() first.');
			return;
		}
		else {
			// Ready to start
		}
		
		// Clear grid
		this.grid.clear();
		
		// Generate test pieces
		this.currentPiece = this._generateRandomPiece();
		this.nextPiece = this._generateRandomPiece();
		
		// Position current piece at top center
		const startX = Math.floor(this.grid.cols / 2) - Math.floor(this.currentPiece.getWidth() / 2);
		this.currentPiece.setPosition(startX, 0);
		
		// Update state
		this.state = CONSTANTS.GAME_STATES.PLAYING;
		
		// Initial render
		this.render();
		
		console.log('GameEngine: Game started');
	}
	
	/**
	 * Generate a random piece with random color
	 * @returns {Piece} New piece instance
	 * @private
	 */
	_generateRandomPiece() {
		const pieceTypes = Object.values(CONSTANTS.PIECE_TYPES);
		const randomIndex = randomInt(0, pieceTypes.length - 1);
		const shapeType = pieceTypes[randomIndex];
		
		// Get available colors
		const colors = [
			ConfigManager.get('colors.balls.red', '#FF0000'),
			ConfigManager.get('colors.balls.green', '#00FF00'),
			ConfigManager.get('colors.balls.blue', '#0000FF')
		];
		
		const randomColor = colors[randomInt(0, colors.length - 1)];
		
		// Get shape definition
		const shapeDefinition = ConfigManager.get(`pieceShapes.${shapeType}`);
		const hasShape = shapeDefinition !== null;
		
		// Count balls needed
		let ballCount = 0;
		
		if (hasShape) {
			for (let row = 0; row < shapeDefinition.length; row++) {
				for (let col = 0; col < shapeDefinition[row].length; col++) {
					const hasBall = shapeDefinition[row][col] === 1;
					
					// Increment count
					if (hasBall) {
						ballCount++;
					}
					else {
						// Empty cell
					}
				}
			}
		}
		else {
			ballCount = 1;
		}
		
		// Create balls (all normal type for Phase 1)
		const balls = [];
		for (let i = 0; i < ballCount; i++) {
			balls.push(new Ball(CONSTANTS.BALL_TYPES.NORMAL, randomColor));
		}
		
		return new Piece(shapeType, balls);
	}
	
	/**
	 * Render current game state
	 * @returns {void}
	 */
	render() {
		const hasRenderer = this.renderer !== null;
		
		// Render if renderer exists
		if (hasRenderer) {
			this.renderer.clear();
			this.renderer.renderGrid(this.grid);
			
			const hasPiece = this.currentPiece !== null;
			
			// Render current piece
			if (hasPiece) {
				const pos = this.currentPiece.getPosition();
				this.renderer.renderPiece(this.currentPiece, pos.x, pos.y);
			}
			else {
				// No piece to render
			}
			
			// Render next piece preview
			const hasNextPiece = this.nextPiece !== null;
			const previewCanvas = document.getElementById('previewCanvas');
			const hasPreviewCanvas = previewCanvas !== null;
			
			// Render preview if available
			if (hasNextPiece && hasPreviewCanvas) {
				this.renderer.renderNextPiece(this.nextPiece, previewCanvas);
			}
			else {
				// No preview to render
			}
		}
		else {
			// No renderer available
		}
	}
	
	/**
	 * Update game state (Phase 2+)
	 * @param {Number} deltaTime - Time elapsed since last update in milliseconds
	 * @returns {void}
	 */
	update(deltaTime) {
		// TODO: Implement in Phase 2
	}
	
	/**
	 * Pause the game (Phase 2+)
	 * @returns {void}
	 */
	pause() {
		// TODO: Implement in Phase 2
	}
	
	/**
	 * Resume the game (Phase 2+)
	 * @returns {void}
	 */
	resume() {
		// TODO: Implement in Phase 2
	}
	
	/**
	 * Restart the game (Phase 2+)
	 * @returns {void}
	 */
	restart() {
		// TODO: Implement in Phase 2
	}
	
}

// Create singleton instance
const GameEngine = new GameEngineClass();

export default GameEngine;
export { GameEngine };
