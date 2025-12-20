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
import { ScoreManager } from './ScoreManager.js';
import { FloatingTextManager } from './FloatingText.js';
import { DebugMode } from '../utils/DebugMode.js';

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
		
		// Debug mode state
		this.waitingForDebugPiece = false;
		
		// Floating text manager
		this.floatingTextManager = new FloatingTextManager();
		
		// Guard to prevent concurrent cascade processing
		this.isHandlingMatches = false;
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
			const ghostY = this._getGhostPieceY();
			
			// Move to final position
			this.currentPiece.setPosition(this.currentPiece.getPosition().x, ghostY);
			
			// Lock immediately
			this._lockPiece();
		}
	}
	
	/**
	 * Calculate the Y position where the piece would land
	 * @returns {Number} Y position of ghost piece
	 * @private
	 */
	_getGhostPieceY() {
		if (!this.currentPiece) {
			return 0;
		}
		
		const pos = this.currentPiece.getPosition();
		let ghostY = pos.y;
		
		// Find lowest valid position
		for (let testY = pos.y + 1; testY < this.grid.rows; testY++) {
			this.currentPiece.setPosition(pos.x, testY);
			
			if (this.grid.isValidPosition(this.currentPiece)) {
				ghostY = testY;
			}
			else {
				// Can't go further
				break;
			}
		}
		
		// Restore original position
		this.currentPiece.setPosition(pos.x, pos.y);
		
		return ghostY;
	}
	
	/**
	 * Request next piece from PieceFactory (handles debug mode)
	 * @private
	 */
	_requestNextPiece() {
		if (DebugMode.isEnabled()) {
			console.log('🔧 Debug: GameEngine requesting next piece');
			this.waitingForDebugPiece = true;
			PieceFactory.generatePiece(this.level, this.difficulty, (piece) => {
				console.log('🔧 Debug: GameEngine received piece from callback', piece);
				
				// If currentPiece is null (waiting for this piece), spawn it now
				if (!this.currentPiece) {
					console.log('🔧 Debug: No current piece, spawning selected piece immediately');
					this.currentPiece = piece;
					this.waitingForDebugPiece = false;
					
					// Position at top center
					const startX = Math.floor(this.grid.cols / 2) - Math.floor(this.currentPiece.getWidth() / 2);
					this.currentPiece.setPosition(startX, 0);
					
					// Check if new piece collides (game over)
					const isValid = this.grid.isValidPosition(this.currentPiece);
					if (!isValid) {
						this._gameOver();
						return;
					}
					
					// Don't request next piece yet - wait until this piece locks
					// The next piece will be requested in _lockPiece() after cascade completes
				} else {
					// This is the preview piece
					this.nextPiece = piece;
					this.waitingForDebugPiece = false;
					console.log('🔧 Debug: waitingForDebugPiece set to false');
				}
			});
		} else {
			this.nextPiece = PieceFactory.generatePiece(this.level, this.difficulty);
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
		
		// Update available colors display
		this._updateAvailableColorsDisplay();
		
		// Clear grid
		this.grid.clear();
		
		// Reset PieceFactory
		PieceFactory.reset();
		
		// Initialize ScoreManager
		ScoreManager.initialize(this.difficulty);
		
		// Set drop speed based on difficulty
		this.dropInterval = Math.max(200, 1000 - (difficulty * 150));
		
		// Generate pieces (in debug mode, this will be async via callback)
		if (DebugMode.isEnabled()) {
			// In debug mode, request current piece (it will be spawned via callback)
			this._requestNextPiece();
		} else {
			// Normal mode: generate synchronously
			this.currentPiece = PieceFactory.generatePiece(this.level, this.difficulty);
			this._requestNextPiece();
			
			// Position current piece at top center
			const startX = Math.floor(this.grid.cols / 2) - Math.floor(this.currentPiece.getWidth() / 2);
			this.currentPiece.setPosition(startX, 0);
		}
		
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
			
			// Render ghost piece (shadow showing where piece will land)
			if (hasPiece) {
				const pos = this.currentPiece.getPosition();
				const ghostY = this._getGhostPieceY();
				
				// Only render ghost if it's below current position
				if (ghostY > pos.y) {
					this.renderer.renderGhostPiece(this.currentPiece, pos.x, ghostY);
				}
			}
			
			// Render current piece
			if (hasPiece) {
				const pos = this.currentPiece.getPosition();
				this.renderer.renderPiece(this.currentPiece, pos.x, pos.y);
			}
			else {
				// No piece to render
			}
			
			// Render next piece preview (skip if debug mode is waiting for selection)
			const hasNextPiece = this.nextPiece !== null;
			const previewCanvas = document.getElementById('previewCanvas');
			const hasPreviewCanvas = previewCanvas !== null;
			const isDebugWaiting = DebugMode.isEnabled() && this.waitingForDebugPiece;
			
			// Render preview if available and not in debug selection mode
			if (hasNextPiece && hasPreviewCanvas && !isDebugWaiting) {
				this.renderer.renderNextPiece(this.nextPiece, previewCanvas);
			}
			else {
				// No preview to render
			}
			
			// Update and render floating texts
			this.floatingTextManager.update();
			this.floatingTextManager.render(this.renderer.ctx);
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
		
		// Pause if waiting for debug piece selection AND we don't have a current piece
		// (Only block when waiting for the CURRENT piece, not the preview piece)
		if (this.waitingForDebugPiece && !hasPiece) {
			return;
		}
		
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
	async _lockPiece() {
		// Place piece on grid
		this.grid.placePiece(this.currentPiece);
		
		// Check for matches and handle cascades
		await this._handleMatching();
		
		// Spawn next piece (handle debug mode)
		this.currentPiece = this.nextPiece;
		
		// Request next piece (may be async in debug mode)
		// Don't request if already waiting for one
		if (!this.waitingForDebugPiece) {
			this._requestNextPiece();
		}
		
		// If currentPiece is null (debug mode waiting), skip positioning until piece is ready
		if (!this.currentPiece) {
			console.log('🔧 Debug: No next piece available, waiting for selection');
			this.isLocking = false;
			this.lockTimer = 0;
			return;
		}
		
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
	 * Handle matching and cascading
	 * @returns {Promise<void>}
	 * @private
	 */
	async _handleMatching() {
		// Prevent concurrent cascade processing
		if (this.isHandlingMatches) {
			console.log('🔧 Debug: Already handling matches, skipping duplicate call');
			return;
		}
		
		this.isHandlingMatches = true;
		console.log('🔧 Debug: _handleMatching called');
		
		let cascadeCount = 0;
		const matchDelay = ConfigManager.get('animations.matchDetectionDelay', 0);
		const clearDelay = ConfigManager.get('animations.clearAnimationDuration', 300);
		const cascadeDelay = ConfigManager.get('animations.cascadeCheckDelay', 0);
		
		// Import DebugMode dynamically
		const DebugModeModule = await import('../utils/DebugMode.js');
		const DebugMode = DebugModeModule.default;
		
		// Reset step counter at start of cascade
		if (DebugMode.enabled && DebugMode.stepMode) {
			DebugMode.resetStepCounter();
		}
		
		// Cascade loop
		while (true) {
			// Wait for match detection delay
			if (matchDelay > 0) {
				await this._delay(matchDelay);
			}
			
			// Find matches
			const matches = this.grid.findMatches();
			
			if (matches.length === 0) {
				break; // No more matches
			}
			
			cascadeCount++;
			
			// DEBUG: Wait for user to advance step
			if (DebugMode.enabled && DebugMode.stepMode) {
				console.log(`🔧 Debug: Cascade step ${cascadeCount} - found ${matches.length} match(es)`);
				await DebugMode.waitForStep();
			}
			
			// Process special balls FIRST (priority order)
			// 1. Process explosions
			const explodedPositions = this.grid.processExplosions(matches);
			
			// 2. Process painters (paint lines before clearing)
			const paintedPositions = this.grid.processPainters(matches);
			
			// 3. Clear matched balls (standard matches)
			await this._clearMatches(matches, clearDelay);
			
			// Apply gravity
			await this._applyGravity();
			
			// Wait before checking for next cascade
			if (cascadeDelay > 0) {
				await this._delay(cascadeDelay);
			}
		}
		
		// Emit cascade event for scoring
		if (cascadeCount > 0) {
			EventEmitter.emit(CONSTANTS.EVENTS.CASCADE_COMPLETE, { cascadeCount });
		}
		
		// Reset step counter after cascade completes
		if (DebugMode.enabled && DebugMode.stepMode) {
			DebugMode.resetStepCounter();
		}
		
		// Release the guard
		this.isHandlingMatches = false;
	}
	
	/**
	 * Clear matched balls from grid
	 * @param {Array<Object>} matches - Array of match objects
	 * @param {Number} duration - Animation duration in ms
	 * @returns {Promise<void>}
	 * @private
	 */
	async _clearMatches(matches, duration) {
		// Collect all positions to clear grouped by match
		const matchGroups = [];
		
		for (const match of matches) {
			const positions = [];
			for (const pos of match.positions) {
				positions.push({ row: pos.row, col: pos.col });
			}
			matchGroups.push({ positions, color: match.color });
		}
		
		// Calculate points per ball (base points only, cascade bonus added later)
		const basePoints = ConfigManager.get('scoring.basePointsPerBall', 1);
		const difficultyMultiplier = ConfigManager.get(`scoring.difficultyMultipliers.difficulty${this.difficulty}`, 1.0);
		
		// Collect all positions to clear
		const positionsToClear = new Set();
		
		for (const match of matches) {
			for (const pos of match.positions) {
				positionsToClear.add(`${pos.row},${pos.col}`);
			}
		}
		
		// Flash animation - mark balls for flashing
		const ballsToFlash = [];
		for (const posStr of positionsToClear) {
			const [row, col] = posStr.split(',').map(Number);
			const ball = this.grid.getBallAt(row, col);
			if (ball) {
				ballsToFlash.push({ row, col, ball });
			}
		}
		
		// Flash 3 times
		const flashCount = 3;
		const flashDuration = Math.floor(duration / (flashCount * 2));
		
		for (let i = 0; i < flashCount; i++) {
			// Make balls white
			for (const item of ballsToFlash) {
				const originalColor = item.ball.getColor();
				item.ball.color = '#FFFFFF';
				item.originalColor = originalColor;
			}
			this.render();
			await this._delay(flashDuration);
			
			// Restore original colors
			for (const item of ballsToFlash) {
				if (item.originalColor) {
					item.ball.color = item.originalColor;
				}
			}
			this.render();
			await this._delay(flashDuration);
		}
		
		// Add floating text for each match group
		for (const group of matchGroups) {
			const ballCount = group.positions.length;
			const points = Math.floor(ballCount * basePoints * difficultyMultiplier);
			
			// Calculate center position of match
			let centerRow = 0;
			let centerCol = 0;
			for (const pos of group.positions) {
				centerRow += pos.row;
				centerCol += pos.col;
			}
			centerRow /= group.positions.length;
			centerCol /= group.positions.length;
			
			// Convert grid position to screen position
			const screenX = centerCol * this.renderer.cellSize + this.renderer.offsetX;
			const screenY = centerRow * this.renderer.cellSize + this.renderer.offsetY;
			
			// Add floating text
			this.floatingTextManager.add(`+${points}`, screenX, screenY, 1500);
		}
		
		// Remove balls from grid
		for (const posStr of positionsToClear) {
			const [row, col] = posStr.split(',').map(Number);
			this.grid.removeBallAt(row, col);
		}
		
		// Render immediately to show cleared balls
		this.render();
		
		// Emit clear event
		EventEmitter.emit(CONSTANTS.EVENTS.BALLS_CLEARED, { 
			count: positionsToClear.size,
			matches: matches.length 
		});
	}
	
	/**
	 * Apply gravity to make balls fall
	 * @returns {Promise<void>}
	 * @private
	 */
	async _applyGravity() {
		const dropSpeed = ConfigManager.get('animations.dropAnimationSpeed', 50);
		let ballsMoved = true;
		
		// Keep dropping until no balls can fall
		while (ballsMoved) {
			ballsMoved = false;
			
			// Scan from bottom to top
			for (let row = this.grid.rows - 2; row >= 0; row--) {
				for (let col = 0; col < this.grid.cols; col++) {
					const ball = this.grid.getBallAt(row, col);
					
					if (ball && this.grid.getBallAt(row + 1, col) === null) {
						// Move ball down
						this.grid.setBallAt(row + 1, col, ball);
						this.grid.removeBallAt(row, col);
						ballsMoved = true;
					}
				}
			}
			
			// Render and wait
			if (ballsMoved) {
				this.render();
				await this._delay(dropSpeed);
			}
		}
	}
	
	/**
	 * Helper to create a delay
	 * @param {Number} ms - Milliseconds to wait
	 * @returns {Promise<void>}
	 * @private
	 */
	_delay(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
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
	
	/**
	 * Update available colors display
	 * @private
	 */
	_updateAvailableColorsDisplay() {
		const container = document.getElementById('availableColors');
		if (!container) return;
		
		// Get available colors for current level
		const colors = PieceFactory.getAvailableColors(this.level);
		
		// Clear existing
		container.innerHTML = '';
		
		// Add color balls
		colors.forEach(color => {
			const ball = document.createElement('div');
			ball.className = 'color-ball';
			ball.style.backgroundColor = color;
			container.appendChild(ball);
		});
	}
	
}

// Create singleton instance
const GameEngine = new GameEngineClass();

export default GameEngine;
export { GameEngine };
