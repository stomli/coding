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
import { PieceFactory } from './PieceFactory.js';

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
		
		// Game state tracking
		this.level = 1;
		this.difficulty = 1;
		
		// Game loop state
		this.lastUpdateTime = 0;
		this.dropTimer = 0;
		this.dropInterval = 1000; // ms between automatic drops
		this.lockDelay = 500; // ms before piece locks
		this.lockTimer = 0;
		this.isLocking = false;
		this.animationFrameId = null;
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
		// Movement controls
		EventEmitter.on(CONSTANTS.EVENTS.MOVE_LEFT, () => this._moveLeft());
		EventEmitter.on(CONSTANTS.EVENTS.MOVE_RIGHT, () => this._moveRight());
		EventEmitter.on(CONSTANTS.EVENTS.ROTATE, () => this._rotatePiece());
		EventEmitter.on(CONSTANTS.EVENTS.HARD_DROP, () => this._hardDrop());
		
		// Pause/Resume
		EventEmitter.on(CONSTANTS.EVENTS.PAUSE, () => {
			if (this.state === CONSTANTS.GAME_STATES.PLAYING) {
				this.pause();
			}
			else if (this.state === CONSTANTS.GAME_STATES.PAUSED) {
				this.resume();
			}
		});
		
		// Restart
		EventEmitter.on(CONSTANTS.EVENTS.RESTART, () => this.restart());
	}
	
	/**
	 * Move piece left
	 * @returns {void}
	 * @private
	 */
	_moveLeft() {
		const isPlaying = this.state === CONSTANTS.GAME_STATES.PLAYING;
		const hasPiece = this.currentPiece !== null;
		
		if (isPlaying && hasPiece) {
			const pos = this.currentPiece.getPosition();
			this.currentPiece.setPosition(pos.x - 1, pos.y);
			
			const isValid = this.grid.isValidPosition(this.currentPiece);
			
			if (!isValid) {
				// Move back if invalid
				this.currentPiece.setPosition(pos.x, pos.y);
			}
		}
	}
	
	/**
	 * Move piece right
	 * @returns {void}
	 * @private
	 */
	_moveRight() {
		const isPlaying = this.state === CONSTANTS.GAME_STATES.PLAYING;
		const hasPiece = this.currentPiece !== null;
		
		if (isPlaying && hasPiece) {
			const pos = this.currentPiece.getPosition();
			this.currentPiece.setPosition(pos.x + 1, pos.y);
			
			const isValid = this.grid.isValidPosition(this.currentPiece);
			
			if (!isValid) {
				// Move back if invalid
				this.currentPiece.setPosition(pos.x, pos.y);
			}
		}
	}
	
	/**
	 * Rotate piece clockwise with wall kicks
	 * @returns {void}
	 * @private
	 */
	_rotatePiece() {
		const isPlaying = this.state === CONSTANTS.GAME_STATES.PLAYING;
		const hasPiece = this.currentPiece !== null;
		
		if (isPlaying && hasPiece) {
			const pos = this.currentPiece.getPosition();
			
			// Try rotation
			this.currentPiece.rotate();
			
			// Check if valid at same position
			let isValid = this.grid.isValidPosition(this.currentPiece);
			
			// Try wall kicks if rotation fails
			if (!isValid) {
				const kickOffsets = [
					{ x: -1, y: 0 },  // Try left
					{ x: 1, y: 0 },   // Try right
					{ x: -2, y: 0 },  // Try far left
					{ x: 2, y: 0 },   // Try far right
					{ x: 0, y: -1 }   // Try up
				];
				
				for (let i = 0; i < kickOffsets.length; i++) {
					const kick = kickOffsets[i];
					this.currentPiece.setPosition(pos.x + kick.x, pos.y + kick.y);
					
					if (this.grid.isValidPosition(this.currentPiece)) {
						isValid = true;
						break;
					}
				}
			}
			
			// Revert if all kicks failed
			if (!isValid) {
				// Rotate back 3 times (equivalent to rotating counter-clockwise once)
				this.currentPiece.rotate();
				this.currentPiece.rotate();
				this.currentPiece.rotate();
				this.currentPiece.setPosition(pos.x, pos.y);
			}
		}
	}
	
	/**
	 * Hard drop piece to bottom
	 * @returns {void}
	 * @private
	 */
	_hardDrop() {
		const isPlaying = this.state === CONSTANTS.GAME_STATES.PLAYING;
		const hasPiece = this.currentPiece !== null;
		
		if (isPlaying && hasPiece) {
			const pos = this.currentPiece.getPosition();
			let finalY = pos.y;
			
			// Find lowest valid position
			for (let testY = pos.y + 1; testY < this.grid.rows; testY++) {
				this.currentPiece.setPosition(pos.x, testY);
				
				if (this.grid.isValidPosition(this.currentPiece)) {
					finalY = testY;
				}
				else {
					// Can't go further
					break;
				}
			}
			
			// Move to final position
			this.currentPiece.setPosition(pos.x, finalY);
			
			// Lock immediately
			this._lockPiece();
		}
	}
	
	/**
	 * Start a new game
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
		
		// Store game state
		this.level = level || 1;
		this.difficulty = difficulty || 1;
		
		// Clear grid
		this.grid.clear();
		
		// Reset PieceFactory
		PieceFactory.reset();
		
		// Set drop speed based on difficulty
		this.dropInterval = Math.max(200, 1000 - (difficulty * 150));
		
		// Generate pieces
		this.currentPiece = PieceFactory.generatePiece(this.level, this.difficulty);
		this.nextPiece = PieceFactory.generatePiece(this.level, this.difficulty);
		
		// Position current piece at top center
		const startX = Math.floor(this.grid.cols / 2) - Math.floor(this.currentPiece.getWidth() / 2);
		this.currentPiece.setPosition(startX, 0);
		
		// Reset timers
		this.dropTimer = 0;
		this.lockTimer = 0;
		this.isLocking = false;
		this.lastUpdateTime = performance.now();
		
		// Update state
		this.state = CONSTANTS.GAME_STATES.PLAYING;
		
		// Initial render
		this.render();
		
		// Start game loop
		this._gameLoop();
		
		console.log('GameEngine: Game started');
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
	 * Update game state
	 * @param {Number} deltaTime - Time elapsed since last update in milliseconds
	 * @returns {void}
	 */
	update(deltaTime) {
		const isPlaying = this.state === CONSTANTS.GAME_STATES.PLAYING;
		
		// Only update if playing
		if (!isPlaying) {
			return;
		}
		else {
			// Game is active, update state
		}
		
		const hasPiece = this.currentPiece !== null;
		
		// Can't update without a piece
		if (!hasPiece) {
			return;
		}
		else {
			// Piece exists, continue
		}
		
		// Update drop timer
		this.dropTimer += deltaTime;
		
		// Check if it's time to drop
		const shouldDrop = this.dropTimer >= this.dropInterval;
		
		if (shouldDrop) {
			this.dropTimer = 0;
			this._dropPiece();
		}
		else {
			// Not time to drop yet
		}
		
		// Update lock timer if piece is at bottom
		if (this.isLocking) {
			this.lockTimer += deltaTime;
			
			const shouldLock = this.lockTimer >= this.lockDelay;
			
			if (shouldLock) {
				this._lockPiece();
			}
			else {
				// Still waiting to lock
			}
		}
		else {
			// Piece not at bottom
		}
	}
	
	/**
	 * Drop current piece one row
	 * @returns {void}
	 * @private
	 */
	_dropPiece() {
		const pos = this.currentPiece.getPosition();
		const newY = pos.y + 1;
		
		// Try to move piece down
		this.currentPiece.setPosition(pos.x, newY);
		
		const isValid = this.grid.isValidPosition(this.currentPiece);
		
		if (isValid) {
			// Piece moved successfully
			this.isLocking = false;
			this.lockTimer = 0;
		}
		else {
			// Hit bottom or collision, move back and start locking
			this.currentPiece.setPosition(pos.x, pos.y);
			this.isLocking = true;
		}
	}
	
	/**
	 * Lock current piece to grid and spawn next piece
	 * @returns {void}
	 * @private
	 */
	_lockPiece() {
		// Place piece on grid
		this.grid.placePiece(this.currentPiece);
		
		// TODO: Check for matches (Phase 3)
		
		// Spawn next piece
		this.currentPiece = this.nextPiece;
		this.nextPiece = PieceFactory.generatePiece(this.level, this.difficulty);
		
		// Position at top center
		const startX = Math.floor(this.grid.cols / 2) - Math.floor(this.currentPiece.getWidth() / 2);
		this.currentPiece.setPosition(startX, 0);
		
		// Reset lock state
		this.isLocking = false;
		this.lockTimer = 0;
		
		// Check if new piece collides (game over)
		const isValid = this.grid.isValidPosition(this.currentPiece);
		
		if (!isValid) {
			// Game over
			this.state = CONSTANTS.GAME_STATES.GAME_OVER;
			console.log('Game Over!');
		}
		else {
			// Continue playing
		}
	}
	
	/**
	 * Main game loop
	 * @returns {void}
	 * @private
	 */
	_gameLoop() {
		const currentTime = performance.now();
		const deltaTime = currentTime - this.lastUpdateTime;
		this.lastUpdateTime = currentTime;
		
		// Update game state
		this.update(deltaTime);
		
		// Render
		this.render();
		
		// Continue loop if playing
		const isPlaying = this.state === CONSTANTS.GAME_STATES.PLAYING;
		
		if (isPlaying) {
			this.animationFrameId = requestAnimationFrame(() => this._gameLoop());
		}
		else {
			// Game stopped
		}
	}
	
	/**
	 * Pause the game
	 * @returns {void}
	 */
	pause() {
		const isPlaying = this.state === CONSTANTS.GAME_STATES.PLAYING;
		
		if (isPlaying) {
			this.state = CONSTANTS.GAME_STATES.PAUSED;
			
			// Cancel animation frame
			if (this.animationFrameId) {
				cancelAnimationFrame(this.animationFrameId);
				this.animationFrameId = null;
			}
			
			// Show pause overlay
			const pauseScreen = document.getElementById('pauseScreen');
			if (pauseScreen) {
				pauseScreen.classList.remove('hidden');
			}
			
			console.log('GameEngine: Paused');
		}
	}
	
	/**
	 * Resume the game
	 * @returns {void}
	 */
	resume() {
		const isPaused = this.state === CONSTANTS.GAME_STATES.PAUSED;
		
		if (isPaused) {
			this.state = CONSTANTS.GAME_STATES.PLAYING;
			
			// Hide pause overlay
			const pauseScreen = document.getElementById('pauseScreen');
			if (pauseScreen) {
				pauseScreen.classList.add('hidden');
			}
			
			// Reset timing
			this.lastUpdateTime = performance.now();
			
			// Restart game loop
			this._gameLoop();
			
			console.log('GameEngine: Resumed');
		}
	}
	
	/**
	 * Restart the game
	 * @returns {void}
	 */
	restart() {
		// Cancel current game loop
		if (this.animationFrameId) {
			cancelAnimationFrame(this.animationFrameId);
			this.animationFrameId = null;
		}
		
		// Restart with same difficulty
		this.start(1, 1);
	}
	
}

// Create singleton instance
const GameEngine = new GameEngineClass();

export default GameEngine;
export { GameEngine };
