/**
 * DebugMode.js
 * 
 * Description: Debug mode utilities for testing specific game scenarios
 * 
 * Query string parameters:
 * - debug=1 : Enable debug mode
 * - shape=I|O|T|S|Z|L|J : Force specific piece shape
 * - colors=red,blue,green : Force specific ball colors (comma-separated)
 * - type=normal|exploding|blocking|painterH|painterV|painterD : Force ball type
 * 
 * Example: ?debug=1&shape=T&colors=red,red,blue,red&type=normal
 * 
 * Dependencies: Constants
 * 
 * Exports: DebugMode singleton
 */

import { CONSTANTS } from './Constants.js';

/**
 * DebugMode class for testing and development
 */
class DebugModeClass {
	
	constructor() {
		this.enabled = false;
		this.params = {};
		this.currentPieceIndex = 0;
		this.isPaused = false;
		this.pendingPieceCallback = null;
		this.deferredPieceCallback = null; // Callback deferred during cascade stepping
		this.selectedShape = null;
		this.selectedType = null;
		this.selectedColors = null;
		this.manualMode = false; // Will be set to true if debug enabled
		this.ballConfigs = []; // Array of {type, color} for each ball in piece
		
		// Step-through debugging
		this.stepMode = false; // When true, pause between cascade steps
		this.cascadeStep = 0; // Current step in cascade
		this.stepResolve = null; // Promise resolver for stepping
		this.stepPromise = null; // The promise itself for reuse
		
		// Parse query string immediately
		this._parseQueryString();
		
		// Default manual mode to ON when debug is enabled
		if (this.enabled) {
			this.manualMode = true;
		}
		
		// Log initialization
		if (this.enabled) {
			console.log('DebugMode initialized:', {
				enabled: this.enabled,
				params: this.params
			});
			this._setupDebugInputs();
		}
	}
	
	/**
	 * Setup debug input fields for level and difficulty
	 * @private
	 */
	_setupDebugInputs() {
		const levelDisplay = document.getElementById('levelDisplay');
		const levelInput = document.getElementById('levelInput');
		const difficultyDisplay = document.getElementById('difficultyDisplay');
		const difficultyInput = document.getElementById('difficultyInput');
		
		if (!levelInput || !difficultyInput) return;
		
		// Show inputs, hide displays
		if (levelDisplay) levelDisplay.style.display = 'none';
		if (difficultyDisplay) difficultyDisplay.style.display = 'none';
		levelInput.style.display = 'block';
		difficultyInput.style.display = 'block';
		
		// Add change handlers
		levelInput.addEventListener('change', () => {
			const newLevel = parseInt(levelInput.value);
			if (newLevel >= 1 && newLevel <= 20) {
				console.log('🔧 Debug: Setting level to', newLevel);
				// Import GameEngine dynamically to avoid circular dependency
				import('../modules/GameEngine.js').then(module => {
					const GameEngine = module.default || module.GameEngine;
					GameEngine.level = newLevel;
					GameEngine._updateAvailableColorsDisplay();
				});
			}
		});
		
		difficultyInput.addEventListener('change', () => {
			const newDifficulty = parseInt(difficultyInput.value);
			if (newDifficulty >= 1 && newDifficulty <= 5) {
				console.log('🔧 Debug: Setting difficulty to', newDifficulty);
				// Import GameEngine dynamically to avoid circular dependency
				import('../modules/GameEngine.js').then(module => {
					const GameEngine = module.default || module.GameEngine;
					GameEngine.difficulty = newDifficulty;
					GameEngine.dropInterval = Math.max(200, 1000 - (newDifficulty * 150));
				});
			}
		});
	}
	
	/**
	 * Parse query string parameters
	 * @private
	 */
	_parseQueryString() {
		const urlParams = new URLSearchParams(window.location.search);
		
		// Check if debug mode is enabled
		this.enabled = urlParams.get('debug') === '1';
		
		if (!this.enabled) {
			return;
		}
		
		// Parse shape parameter
		const shape = urlParams.get('shape');
		if (shape) {
			const upperShape = shape.toUpperCase();
			if (Object.values(CONSTANTS.PIECE_TYPES).includes(upperShape)) {
				this.params.shape = upperShape;
			} else {
				console.warn(`Invalid shape parameter: ${shape}`);
			}
		}
		
		// Parse colors parameter (comma-separated list)
		// Store color names/codes as strings, we'll resolve them later
		const colors = urlParams.get('colors');
		if (colors) {
			this.params.colors = colors.split(',').map(c => c.trim());
		}
		
		// Parse ball type parameter
		const type = urlParams.get('type');
		if (type) {
			const typeMap = {
				'normal': CONSTANTS.BALL_TYPES.NORMAL,
				'exploding': CONSTANTS.BALL_TYPES.EXPLODING,
				'blocking': CONSTANTS.BALL_TYPES.BLOCKING,
				'painterH': CONSTANTS.BALL_TYPES.PAINTER_HORIZONTAL,
				'painterV': CONSTANTS.BALL_TYPES.PAINTER_VERTICAL,
				'painterDNE': CONSTANTS.BALL_TYPES.PAINTER_DIAGONAL_NE,
				'painterDNW': CONSTANTS.BALL_TYPES.PAINTER_DIAGONAL_NW
			};
			
			const ballType = typeMap[type.toLowerCase()];
			if (ballType !== undefined) {
				this.params.type = ballType;
			} else {
				console.warn(`Invalid type parameter: ${type}`);
			}
		}
		
		// Log debug mode status
		if (this.enabled) {
			console.log('🔧 DEBUG MODE ENABLED');
			console.log('Parameters:', this.params);
		}
	}
	
	/**
	 * Check if debug mode is enabled
	 * @returns {Boolean}
	 */
	isEnabled() {
		return this.enabled;
	}
	
	/**
	 * Get forced piece shape (if specified)
	 * @returns {String|null} Shape type or null if not specified
	 */
	getShape() {
		// Return selected shape from palette if available
		if (this.selectedShape) {
			return this.selectedShape;
		}
		return this.params.shape || null;
	}
	
	/**
	 * Get forced ball colors (if specified)
	 * @returns {Array<String>|null} Array of color hex codes or null
	 */
	getColors() {
		if (this.selectedColors) {
			return this.selectedColors;
		}
		return this.params.colors || null;
	}
	
	/**
	 * Get forced ball type (if specified)
	 * @returns {String|null} Ball type constant or null
	 */
	getType() {
		if (this.selectedType !== null) {
			return this.selectedType;
		}
		return this.params.type || null;
	}
	
	/**
	 * Get color for a specific ball index
	 * @param {Number} index - Ball index in piece
	 * @param {String} defaultColor - Default color if no override
	 * @param {Object} ConfigManager - ConfigManager instance for color lookup
	 * @returns {String} Hex color code
	 */
	getColorForBall(index, defaultColor, ConfigManager) {
		if (!this.enabled || !this.params.colors) {
			return defaultColor;
		}
		
		// Cycle through colors if we have fewer than balls needed
		const colorIndex = index % this.params.colors.length;
		const colorValue = this.params.colors[colorIndex];
		
		// Check if it's a hex code
		if (colorValue.startsWith('#')) {
			return colorValue;
		}
		
		// Try to look up color name from config
		const colorName = colorValue.toLowerCase();
		const hexColor = ConfigManager.get(`colors.balls.${colorName}`);
		
		if (hexColor) {
			return hexColor;
		}
		
		console.warn(`Invalid color: ${colorValue}, using default`);
		return defaultColor;
	}
	
	/**
	 * Get ball type for a specific ball index
	 * @param {Number} index - Ball index in piece
	 * @param {String} defaultType - Default type if no override
	 * @returns {String} Ball type constant
	 */
	getTypeForBall(index, defaultType) {
		if (!this.enabled || this.params.type === null || this.params.type === undefined) {
			return defaultType;
		}
		
		return this.params.type;
	}
	
	/**
	 * Display debug overlay on screen
	 */
	showDebugInfo() {
		if (!this.enabled) {
			return;
		}
		
		// Create or update debug overlay
		let overlay = document.getElementById('debugOverlay');
		
		if (!overlay) {
			overlay = document.createElement('div');
			overlay.id = 'debugOverlay';
			overlay.style.cssText = `
				position: fixed;
				bottom: 10px;
				left: 10px;
				background: rgba(0, 0, 0, 0.8);
				color: #00ff88;
				padding: 10px;
				border-radius: 5px;
				font-family: monospace;
				font-size: 12px;
				z-index: 10000;
				border: 2px solid #00ff88;
				max-height: 80vh;
				overflow-y: auto;
			`;
			document.body.appendChild(overlay);
		}
		
		let info = '<strong>🔧 DEBUG MODE</strong><br>';
		
		// Manual mode toggle button
		const modeText = this.manualMode ? 'ON' : 'OFF';
		const modeColor = this.manualMode ? '#00ff88' : '#ff6666';
		info += `<button onclick="window.debugModeToggleManual()" 
			style="width: 100%; padding: 8px; margin: 5px 0; background: ${modeColor}; 
			color: #1a1a2e; border: none; border-radius: 5px; cursor: pointer; 
			font-weight: bold; font-size: 12px;">
			Manual Selection: ${modeText}
		</button><br>`;
		
		// Step mode toggle button
		const stepText = this.stepMode ? 'ON' : 'OFF';
		const stepColor = this.stepMode ? '#00ff88' : '#ff6666';
		info += `<button onclick="window.debugModeToggleStepMode()" 
			style="width: 100%; padding: 8px; margin: 5px 0; background: ${stepColor}; 
			color: #1a1a2e; border: none; border-radius: 5px; cursor: pointer; 
			font-weight: bold; font-size: 12px;">
			Step Mode: ${stepText}
		</button><br>`;
		
		// Weather control dropdown
		info += `<div style="margin: 10px 0;">
			<label style="display: block; margin-bottom: 5px;">🌤️ Weather Override:</label>
			<select id="debugWeatherSelect" onchange="window.debugModeSetWeather(this.value)" 
				style="width: 100%; padding: 8px; background: #2a2a3e; color: #00ff88; 
				border: 1px solid #00ff88; border-radius: 5px; cursor: pointer; font-size: 11px;">
				<option value="">Auto (Real Weather)</option>
				<option value="clear-day">☀️ Clear Day</option>
				<option value="clear-night">🌙 Clear Night</option>
				<option value="cloudy-day">☁️ Cloudy Day</option>
				<option value="cloudy-night">☁️ Cloudy Night</option>
				<option value="rainy-day">🌧️ Rainy Day</option>
				<option value="rainy-night">🌧️ Rainy Night</option>
				<option value="snowy-day">❄️ Snowy Day</option>
				<option value="snowy-night">❄️ Snowy Night</option>
				<option value="stormy-day">⛈️ Stormy Day</option>
				<option value="stormy-night">⛈️ Stormy Night</option>
				<option value="foggy-day">🌫️ Foggy Day</option>
				<option value="foggy-night">🌫️ Foggy Night</option>
			</select>
		</div>`;
		
		// Step counter (shown when step mode is active)
		if (this.stepMode) {
			info += `<div id="debugStepCounterOverlay" style="text-align: center; padding: 5px; 
				background: rgba(0, 255, 136, 0.2); border-radius: 3px; margin: 5px 0;">
				Step: ${this.cascadeStep}
			</div>`;
			
			// Show step controls when waiting for a step
			if (this.stepResolve) {
				info += '<div style="display: flex; gap: 5px; margin: 5px 0;">';
				info += '<button onclick="window.debugModeNextStep()" style="flex: 1; padding: 8px; background: #00ff88; color: #1a1a2e; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 11px;">NEXT ▶</button>';
				info += '<button onclick="window.debugModeContinueSteps()" style="flex: 1; padding: 8px; background: #ff8800; color: #1a1a2e; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 11px;">CONTINUE ⏭</button>';
				info += '</div>';
			}
		}
		
		if (this.manualMode) {
			info += '<small>Palette will appear for each piece</small><br>';
		} else {
			info += '<small>Auto-generating pieces</small><br>';
		}
		info += '<br>';
		
		if (this.params.shape) {
			info += `Default Shape: ${this.params.shape}<br>`;
		}
		
		if (this.params.colors) {
			info += `Default Colors: ${this.params.colors.join(', ')}<br>`;
		}
		
		if (this.params.type !== undefined && this.params.type !== null) {
			const typeNames = {
				[CONSTANTS.BALL_TYPES.NORMAL]: 'Normal',
				[CONSTANTS.BALL_TYPES.EXPLODING]: 'Exploding',
				[CONSTANTS.BALL_TYPES.BLOCKING]: 'Blocking',
				[CONSTANTS.BALL_TYPES.PAINTER_HORIZONTAL]: 'Painter H',
				[CONSTANTS.BALL_TYPES.PAINTER_VERTICAL]: 'Painter V',
				[CONSTANTS.BALL_TYPES.PAINTER_DIAGONAL_NE]: 'Painter DNE',
				[CONSTANTS.BALL_TYPES.PAINTER_DIAGONAL_NW]: 'Painter DNW'
			};
			info += `Default Type: ${typeNames[this.params.type] || this.params.type}<br>`;
		}
		
		overlay.innerHTML = info;
	}
	
	/**
	 * Toggle manual piece selection mode
	 */
	toggleManualMode() {
		this.manualMode = !this.manualMode;
		console.log('🔧 Debug: Manual mode', this.manualMode ? 'enabled' : 'disabled');
		this.showDebugInfo(); // Update display
	}
	
	/**
	 * Request next piece from debug palette
	 * @param {Function} callback - Called with (shape, type, colors) when piece selected
	 */
	requestPiece(callback) {
		console.log('🔧 Debug: requestPiece called', {
			enabled: this.enabled,
			manualMode: this.manualMode,
			stepMode: this.stepMode,
			stepResolve: !!this.stepResolve,
			stepPromise: !!this.stepPromise,
			hasPendingCallback: !!this.pendingPieceCallback,
			hasDeferredCallback: !!this.deferredPieceCallback
		});
		
		if (!this.enabled) {
			callback(null, null, null);
			return;
		}
		
		// Only show palette if manual mode is enabled
		if (!this.manualMode) {
			callback(null, null, null);
			return;
		}
		
		// If we're waiting for a cascade step OR in step mode, defer piece selection
		// (This prevents palette from showing during cascades)
		if (this.stepResolve || this.stepPromise) {
			console.log('🔧 Debug: Deferring piece selection - cascade in progress');
			// Store the callback to be called after cascade completes
			this.deferredPieceCallback = callback;
			return;
		}
		
		// If there's already a pending callback, this is a duplicate request
		if (this.pendingPieceCallback) {
			console.log('🔧 Debug: Already have pending callback, ignoring duplicate request');
			return;
		}
		
		// Store callback
		this.pendingPieceCallback = callback;
		this.isPaused = true;
		
		// Show debug palette
		console.log('🔧 Debug: Showing debug palette for piece selection');
		this.showDebugPalette();
	}
	
	/**
	 * Show interactive debug palette
	 */
	showDebugPalette() {
		let palette = document.getElementById('debugPalette');
		
		if (!palette) {
			palette = document.createElement('div');
			palette.id = 'debugPalette';
			document.body.appendChild(palette);
		}
		
		// Always recalculate position when showing
		const previewPanel = document.querySelector('.preview-panel');
		let paletteStyle = `
			background: rgba(0, 0, 0, 0.95);
			color: #00ff88;
			padding: 20px;
			border-radius: 10px;
			font-family: monospace;
			font-size: 14px;
			z-index: 10001;
			border: 3px solid #00ff88;
			box-shadow: 0 0 30px rgba(0, 255, 136, 0.5);
			display: flex;
			flex-direction: column;
		`;
		
		if (previewPanel) {
			// Position to fill from preview panel to right edge of viewport
			// and extend bottom to just above controls-info
			const rect = previewPanel.getBoundingClientRect();
			const controlsInfo = document.querySelector('.controls-info');
			const controlsRect = controlsInfo ? controlsInfo.getBoundingClientRect() : null;
			
			const bottomPos = controlsRect ? controlsRect.top - 10 : window.innerHeight - 20;
			
			palette.style.cssText = paletteStyle + `
				position: fixed;
				top: ${rect.bottom + 10}px;
				left: ${rect.left}px;
				right: 20px;
				bottom: ${window.innerHeight - bottomPos}px;
				overflow-y: auto;
				box-sizing: border-box;
			`;
		} else {
			// Fallback to fixed positioning
			palette.style.cssText = paletteStyle + `
				position: fixed;
				top: 100px;
				right: 20px;
				min-width: 400px;
				max-height: calc(100vh - 200px);
				overflow-y: auto;
			`;
		}
		
		palette.style.display = 'block';
		
		// Initialize ball configs if shape selected
		const ballCount = this._getBallCountForShape(this.selectedShape);
		if (ballCount > 0 && this.ballConfigs.length !== ballCount) {
			this.ballConfigs = Array(ballCount).fill(null).map(() => ({
				type: CONSTANTS.BALL_TYPES.NORMAL,
				color: 'red'
			}));
		}
		
		// Update preview canvas with configured piece
		if (this.selectedShape && this.ballConfigs.length > 0) {
			this._updatePreviewCanvas();
		}
		
		let html = '<h3 style="margin-top:0; color:#00ff88;">🔧 Select Next Piece</h3>';
		
		// Shape selection
		html += '<div style="margin-bottom: 15px;">';
		html += '<strong>1. Select Shape:</strong><br>';
		html += '<div style="display: flex; gap: 5px; margin-top: 5px; flex-wrap: wrap;">';
		const shapes = ['I', 'O', 'T', 'S', 'Z', 'L', 'J'];
		shapes.forEach(shape => {
			const isSelected = this.selectedShape === shape;
			const bgColor = isSelected ? '#00ff88' : '#2a2a3e';
			const textColor = isSelected ? '#1a1a2e' : 'white';
			html += `<button onclick="window.debugModeSelectShape('${shape}')" 
				style="padding: 10px; background: ${bgColor}; color: ${textColor}; border: 2px solid #00ff88; 
				border-radius: 5px; cursor: pointer; font-weight: bold;">${shape}</button>`;
		});
		html += '</div></div>';
		
		// If shape selected, show ball configuration
		if (this.selectedShape && this.ballConfigs.length > 0) {
			html += '<div style="display: flex; flex-direction: column; flex: 1; min-height: 0; margin-bottom: 15px;">';
			html += '<strong>2. Configure Each Ball:</strong><br>';
			html += '<div style="margin-top: 10px; flex: 1; overflow-y: auto; min-height: 0;">';
			
			this.ballConfigs.forEach((config, index) => {
				html += `<div style="background: #1a1a2e; padding: 10px; margin-bottom: 10px; border-radius: 5px; border: 1px solid #444; display: flex; align-items: center; gap: 15px;">`;
				html += `<strong style="color: #00ff88; min-width: 50px;">Ball ${index + 1}</strong>`;
				
				html += '<div style="display: flex; flex-direction: column; gap: 10px; flex: 1;">';
				
				// Type buttons as balls with icons matching game rendering
				html += '<div style="display: flex; gap: 8px; flex-wrap: wrap;">';
				const types = [
					{ name: 'Normal', value: CONSTANTS.BALL_TYPES.NORMAL, icon: '' },
					{ name: 'Exploding', value: CONSTANTS.BALL_TYPES.EXPLODING, icon: '✱' },
					{ name: 'Blocking', value: CONSTANTS.BALL_TYPES.BLOCKING, icon: '✕' },
					{ name: 'Painter H', value: CONSTANTS.BALL_TYPES.PAINTER_HORIZONTAL, icon: '─' },
					{ name: 'Painter V', value: CONSTANTS.BALL_TYPES.PAINTER_VERTICAL, icon: '│' },
					{ name: 'Painter DNE', value: CONSTANTS.BALL_TYPES.PAINTER_DIAGONAL_NE, icon: '╱' },
					{ name: 'Painter DNW', value: CONSTANTS.BALL_TYPES.PAINTER_DIAGONAL_NW, icon: '╲' }
				];
				
				types.forEach(type => {
					const isSelected = config.type === type.value;
					const borderColor = isSelected ? '#00ff88' : '#666';
					const bgColor = isSelected ? '#00ff88' : '#2a2a3e';
					const iconColor = isSelected ? '#1a1a2e' : '#fff';
					html += `<button onclick="window.debugModeSetBallType(${index}, '${type.value}')" 
						title="${type.name}"
						style="width: 32px; height: 32px; padding: 0; background: ${bgColor}; 
						border: 2px solid ${borderColor}; border-radius: 50%; cursor: pointer; 
						font-size: 18px; font-weight: bold; color: ${iconColor}; 
						display: flex; align-items: center; justify-content: center;">${type.icon}</button>`;
				});
				html += '</div>';
				
				// Color buttons as colored balls
				html += '<div style="display: flex; gap: 8px; flex-wrap: wrap;">';
				const colors = [
					{ name: 'Red', value: 'red', hex: '#ff0000' },
					{ name: 'Green', value: 'green', hex: '#00ff00' },
					{ name: 'Blue', value: 'blue', hex: '#0066ff' },
					{ name: 'Yellow', value: 'yellow', hex: '#ffff00' },
					{ name: 'Cyan', value: 'cyan', hex: '#00ffff' },
					{ name: 'Magenta', value: 'magenta', hex: '#ff00ff' },
					{ name: 'Orange', value: 'orange', hex: '#ff8800' },
					{ name: 'Purple', value: 'purple', hex: '#8800ff' }
				];
				
				colors.forEach(color => {
					const isSelected = config.color === color.value;
					const borderColor = isSelected ? '#00ff88' : '#666';
					const borderWidth = isSelected ? '3px' : '2px';
					html += `<button onclick="window.debugModeSetBallColor(${index}, '${color.value}')" 
						title="${color.name}"
						style="width: 32px; height: 32px; padding: 0; background: ${color.hex}; 
						border: ${borderWidth} solid ${borderColor}; border-radius: 50%; cursor: pointer;"></button>`;
				});
				html += '</div>';
				
				html += '</div>'; // Close flex container
				html += '</div>'; // Close ball config div
			});
			
			html += '</div></div>';
		}
		
		// Spawn button
		const canSpawn = this.selectedShape !== null;
		const buttonStyle = canSpawn 
			? 'background: #00ff88; color: #1a1a2e; cursor: pointer;'
			: 'background: #444; color: #888; cursor: not-allowed;';
		html += `<button onclick="window.debugModeSpawnPiece()" ${canSpawn ? '' : 'disabled'} `;
		html += `style="width: 100%; padding: 15px; ${buttonStyle} `;
		html += 'border: none; border-radius: 5px; font-weight: bold; font-size: 16px;">';
		html += canSpawn ? 'SPAWN PIECE' : 'SELECT SHAPE FIRST';
		html += '</button>';
		
		// Step controls (shown when step mode is active AND waiting for a step)
		if (this.stepMode && this.stepResolve) {
			html += '<div style="margin-top: 15px; padding: 15px; background: rgba(0, 255, 136, 0.1); border-radius: 5px; border: 2px solid #00ff88;">';
			html += '<strong style="display: block; margin-bottom: 10px; text-align: center;">⏯️ CASCADE STEPPING</strong>';
			html += `<div id="debugStepCounterPalette" style="text-align: center; padding: 8px; background: rgba(0, 255, 136, 0.2); border-radius: 3px; margin-bottom: 10px; font-size: 16px; font-weight: bold;">Step: ${this.cascadeStep}</div>`;
			html += '<div style="display: flex; gap: 10px;">';
			html += '<button onclick="window.debugModeNextStep()" style="flex: 1; padding: 12px; background: #00ff88; color: #1a1a2e; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 14px;">NEXT STEP ▶</button>';
			html += '<button onclick="window.debugModeContinueSteps()" style="flex: 1; padding: 12px; background: #ff8800; color: #1a1a2e; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 14px;">CONTINUE ⏭</button>';
			html += '</div>';
			html += '</div>';
		}
		
		palette.innerHTML = html;
	}
	
	/**
	 * Update preview canvas with configured piece
	 * @private
	 */
	_updatePreviewCanvas() {
		const previewCanvas = document.getElementById('previewCanvas');
		if (!previewCanvas) return;
		
		const ctx = previewCanvas.getContext('2d');
		const shapeMap = {
			'I': [[1, 1, 1, 1]],
			'O': [[1, 1], [1, 1], [1, 1]],
			'T': [[0, 1, 0], [1, 1, 1]],
			'L': [[1, 0], [1, 0], [1, 1]],
			'J': [[0, 1], [0, 1], [1, 1]],
			'S': [[0, 1, 1], [1, 1, 0]],
			'Z': [[1, 1, 0], [0, 1, 1]]
		};
		
		const shape = shapeMap[this.selectedShape];
		if (!shape) return;
		
		// Calculate preview size
		const pieceWidth = shape[0].length;
		const pieceHeight = shape.length;
		const previewCellSize = Math.min(
			previewCanvas.width / pieceWidth,
			previewCanvas.height / pieceHeight
		);
		
		// Clear preview canvas
		ctx.fillStyle = '#0f0f1e';
		ctx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
		
		// Center piece in preview
		const offsetX = (previewCanvas.width - pieceWidth * previewCellSize) / 2;
		const offsetY = (previewCanvas.height - pieceHeight * previewCellSize) / 2;
		
		let ballIndex = 0;
		
		// Draw each ball in piece
		for (let row = 0; row < shape.length; row++) {
			for (let col = 0; col < shape[row].length; col++) {
				if (shape[row][col] === 1) {
					const config = this.ballConfigs[ballIndex];
					const x = offsetX + col * previewCellSize + previewCellSize / 2;
					const y = offsetY + row * previewCellSize + previewCellSize / 2;
					const radius = previewCellSize / 2 * 0.8;
					
					// Get color hex value
					let colorHex = config.color;
					if (!colorHex.startsWith('#')) {
						// Map color names to hex (simplified)
						const colorMap = {
							'red': '#ff0000',
							'green': '#00ff00',
							'blue': '#0066ff',
							'yellow': '#ffff00',
							'cyan': '#00ffff',
							'magenta': '#ff00ff',
							'orange': '#ff8800',
							'purple': '#8800ff'
						};
						colorHex = colorMap[config.color] || '#ffffff';
					}
					
					// Draw ball
					ctx.fillStyle = colorHex;
					ctx.beginPath();
					ctx.arc(x, y, radius, 0, Math.PI * 2);
					ctx.fill();
					
					// Add special type indicator matching game rendering
					ctx.strokeStyle = '#ffffff';
					ctx.lineWidth = 2;
					
					if (config.type === CONSTANTS.BALL_TYPES.EXPLODING) {
						// Draw star burst
						this._drawStarOnCanvas(ctx, x, y, radius * 0.6);
					} else if (config.type === CONSTANTS.BALL_TYPES.PAINTER_HORIZONTAL) {
						// Horizontal line
						ctx.beginPath();
						ctx.moveTo(x - radius * 0.6, y);
						ctx.lineTo(x + radius * 0.6, y);
						ctx.stroke();
					} else if (config.type === CONSTANTS.BALL_TYPES.PAINTER_VERTICAL) {
						// Vertical line
						ctx.beginPath();
						ctx.moveTo(x, y - radius * 0.6);
						ctx.lineTo(x, y + radius * 0.6);
						ctx.stroke();
					} else if (config.type === CONSTANTS.BALL_TYPES.PAINTER_DIAGONAL_NE) {
						// NE-SW diagonal line
						ctx.beginPath();
						ctx.moveTo(x + radius * 0.5, y - radius * 0.5);
						ctx.lineTo(x - radius * 0.5, y + radius * 0.5);
						ctx.stroke();
					} else if (config.type === CONSTANTS.BALL_TYPES.PAINTER_DIAGONAL_NW) {
						// NW-SE diagonal line
						ctx.beginPath();
						ctx.moveTo(x - radius * 0.5, y - radius * 0.5);
						ctx.lineTo(x + radius * 0.5, y + radius * 0.5);
						ctx.stroke();
					} else if (config.type === CONSTANTS.BALL_TYPES.BLOCKING) {
						// X mark
						ctx.beginPath();
						ctx.moveTo(x - radius * 0.5, y - radius * 0.5);
						ctx.lineTo(x + radius * 0.5, y + radius * 0.5);
						ctx.moveTo(x + radius * 0.5, y - radius * 0.5);
						ctx.lineTo(x - radius * 0.5, y + radius * 0.5);
						ctx.stroke();
					}
					
					ballIndex++;
				}
			}
		}
	}
	
	/**
	 * Draw a star shape on canvas
	 * @private
	 */
	_drawStarOnCanvas(ctx, x, y, radius) {
		const spikes = 8;
		const step = Math.PI / spikes;
		
		ctx.beginPath();
		for (let i = 0; i < spikes * 2; i++) {
			const r = i % 2 === 0 ? radius : radius * 0.5;
			const angle = i * step - Math.PI / 2;
			const px = x + Math.cos(angle) * r;
			const py = y + Math.sin(angle) * r;
			
			if (i === 0) {
				ctx.moveTo(px, py);
			} else {
				ctx.lineTo(px, py);
			}
		}
		ctx.closePath();
		ctx.stroke();
	}
	
	/**
	 * Get ball count for a shape
	 * @private
	 */
	_getBallCountForShape(shape) {
		if (!shape) return 0;
		
		// Count balls from the shape definition
		const shapeMap = {
			'I': [[1, 1, 1, 1]],
			'O': [[1, 1], [1, 1], [1, 1]],
			'T': [[0, 1, 0], [1, 1, 1]],
			'L': [[1, 0], [1, 0], [1, 1]],
			'J': [[0, 1], [0, 1], [1, 1]],
			'S': [[0, 1, 1], [1, 1, 0]],
			'Z': [[1, 1, 0], [0, 1, 1]]
		};
		
		const shapeDefinition = shapeMap[shape];
		if (!shapeDefinition) return 0;
		
		let count = 0;
		for (let row = 0; row < shapeDefinition.length; row++) {
			for (let col = 0; col < shapeDefinition[row].length; col++) {
				if (shapeDefinition[row][col] === 1) {
					count++;
				}
			}
		}
		
		return count;
	}
	
	/**
	 * Hide debug palette
	 */
	hideDebugPalette() {
		const palette = document.getElementById('debugPalette');
		if (palette) {
			palette.style.display = 'none';
		}
		this.isPaused = false;
	}
	
	/**
	 * Handle shape selection from palette
	 */
	selectShape(shape) {
		this.selectedShape = shape;
		console.log('🔧 Debug: Selected shape', shape);
		
		// Initialize ball configs for this shape
		const ballCount = this._getBallCountForShape(shape);
		this.ballConfigs = Array(ballCount).fill(null).map(() => ({
			type: CONSTANTS.BALL_TYPES.NORMAL,
			color: 'red'
		}));
		
		this.showDebugPalette(); // Refresh UI
	}
	
	/**
	 * Set type for specific ball
	 */
	setBallType(ballIndex, type) {
		if (ballIndex >= 0 && ballIndex < this.ballConfigs.length) {
			this.ballConfigs[ballIndex].type = type;
			console.log(`🔧 Debug: Ball ${ballIndex + 1} type set to`, type);
			this.showDebugPalette(); // Refresh UI
		}
	}
	
	/**
	 * Set color for specific ball
	 */
	setBallColor(ballIndex, color) {
		if (ballIndex >= 0 && ballIndex < this.ballConfigs.length) {
			this.ballConfigs[ballIndex].color = color;
			console.log(`🔧 Debug: Ball ${ballIndex + 1} color set to`, color);
			this.showDebugPalette(); // Refresh UI
		}
	}
	
	/**
	 * Spawn the selected piece
	 */
	spawnPiece() {
		console.log('🔧 Debug: spawnPiece called', {
			hasPendingCallback: !!this.pendingPieceCallback,
			selectedShape: this.selectedShape,
			stepMode: this.stepMode,
			stepResolve: !!this.stepResolve
		});
		
		if (this.pendingPieceCallback && this.selectedShape) {
			console.log('🔧 Debug: Spawning piece with configs', this.ballConfigs);
			
			// Store callback and clear it BEFORE calling to allow recursive requests
			const callback = this.pendingPieceCallback;
			this.pendingPieceCallback = null;
			
			// Call the callback
			callback(this.selectedShape, this.ballConfigs);
		}
		
		// Reset selections for next piece
		this.selectedShape = null;
		this.ballConfigs = [];
		
		this.hideDebugPalette();
	}
	
	/**
	 * Toggle step-through mode for cascades
	 */
	toggleStepMode() {
		this.stepMode = !this.stepMode;
		console.log('🔧 Debug: Step mode', this.stepMode ? 'ON' : 'OFF');
		
		// Reset step counter when toggling
		if (!this.stepMode) {
			this.cascadeStep = 0;
			if (this.stepResolve) {
				this.stepResolve(); // Release any waiting cascade
				this.stepResolve = null;
			}
		}
		
		// Update debug overlay
		this.showDebugInfo();
		
		// Update palette if it's showing
		const palette = document.getElementById('debugPalette');
		if (palette && palette.style.display !== 'none') {
			this.showDebugPalette();
		}
	}
	
	/**
	 * Advance to next cascade step
	 */
	nextStep() {
		console.log('🔧 Debug: nextStep called', { hasStepResolve: !!this.stepResolve });
		if (this.stepResolve) {
			console.log('🔧 Debug: Resolving step promise');
			this.stepResolve();
			this.stepResolve = null;
			this.stepPromise = null;
			
			// Refresh overlay to hide step control buttons
			this.showDebugInfo();
		}
	}
	
	/**
	 * Continue cascade without stepping
	 */
	continueSteps() {
		this.stepMode = false;
		this.cascadeStep = 0;
		if (this.stepResolve) {
			this.stepResolve();
			this.stepResolve = null;
			this.stepPromise = null;
		}
		console.log('🔧 Debug: Continuing cascade');
		
		// Update debug overlay
		this.showDebugInfo();
		
		// Update palette if it's showing
		const palette = document.getElementById('debugPalette');
		if (palette && palette.style.display !== 'none') {
			this.showDebugPalette();
		}
	}
	
	/**
	 * Wait for debug step advance (called by GameEngine)
	 * @returns {Promise<void>}
	 */
	async waitForStep() {
		if (!this.stepMode) return;
		
		// If already waiting for a step, return the existing promise
		if (this.stepPromise) {
			console.log('🔧 Debug: Already waiting for step, returning existing promise');
			return this.stepPromise;
		}
		
		this.cascadeStep++;
		console.log(`🔧 Debug: Cascade step ${this.cascadeStep} - waiting for advance`);
		
		// Update step counter in ALL UI locations
		this._updateStepCounters();
		
		// Create and store the promise (do this BEFORE showDebugInfo so the buttons appear)
		this.stepPromise = new Promise((resolve) => {
			this.stepResolve = resolve;
		});
		
		// Refresh debug overlay to show step controls (stepResolve is now set)
		this.showDebugInfo();
		
		return this.stepPromise;
	}
	
	/**
	 * Reset cascade step counter
	 */
	resetStepCounter() {
		console.log('🔧 Debug: resetStepCounter called', { hasDeferredCallback: !!this.deferredPieceCallback });
		this.cascadeStep = 0;
		this._updateStepCounters();
		
		// Hide palette when cascade starts
		this.hideDebugPalette();
		
		// If there's a deferred piece callback, handle it now that cascade is complete
		if (this.deferredPieceCallback) {
			console.log('🔧 Debug: Cascade complete, processing deferred piece request');
			const callback = this.deferredPieceCallback;
			this.deferredPieceCallback = null;
			
			// Now call requestPiece again, which will show the palette
			this.requestPiece(callback);
		}
	}
	
	/**
	 * Update all step counter displays
	 * @private
	 */
	_updateStepCounters() {
		const stepText = `Step: ${this.cascadeStep}`;
		
		// Update overlay counter
		const overlayCounter = document.getElementById('debugStepCounterOverlay');
		if (overlayCounter) {
			overlayCounter.textContent = stepText;
		}
		
		// Update palette counter
		const paletteCounter = document.getElementById('debugStepCounterPalette');
		if (paletteCounter) {
			paletteCounter.textContent = stepText;
		}
	}
	
	/**
	 * Set weather override for testing
	 * @param {String} weatherOverride - Weather condition string (e.g., "clear-day", "rainy-night")
	 */
	setWeather(weatherOverride) {
		console.log('🔧 Debug: Setting weather to', weatherOverride || 'auto');
		
		// Import WeatherBackground dynamically to avoid circular dependency
		import('../modules/WeatherBackground.js').then(module => {
			const WeatherBackground = module.default;
			
			if (!weatherOverride) {
				// Reset to auto - fetch real weather
				WeatherBackground.updateWeather();
			} else {
				// Parse the override string (e.g., "clear-day" -> condition: "clear", isDay: true)
				const parts = weatherOverride.split('-');
				const condition = parts[0];
				const isDay = parts[1] === 'day';
				
				// Create fake weather data
				WeatherBackground.currentWeather = {
					temperature: 20,
					weatherCode: this._getWeatherCode(condition),
					isDay: isDay,
					cloudCover: condition === 'cloudy' ? 75 : 20,
					location: 'Debug Mode',
					timestamp: new Date()
				};
				
				// Apply the weather
				WeatherBackground.applyWeatherBackground();
			}
		});
	}
	
	/**
	 * Get weather code from condition name
	 * @private
	 */
	_getWeatherCode(condition) {
		const codes = {
			'clear': 0,
			'cloudy': 3,
			'rainy': 61,
			'snowy': 71,
			'stormy': 95,
			'foggy': 45
		};
		return codes[condition] || 0;
	}
}

// Export singleton instance
const DebugMode = new DebugModeClass();

// Expose functions to window for onclick handlers
if (typeof window !== 'undefined') {
	window.debugModeSelectShape = (shape) => DebugMode.selectShape(shape);
	window.debugModeSetBallType = (ballIndex, type) => DebugMode.setBallType(ballIndex, type);
	window.debugModeSetBallColor = (ballIndex, color) => DebugMode.setBallColor(ballIndex, color);
	window.debugModeSpawnPiece = () => DebugMode.spawnPiece();
	window.debugModeToggleManual = () => DebugMode.toggleManualMode();
	window.debugModeToggleStepMode = () => DebugMode.toggleStepMode();
	window.debugModeNextStep = () => DebugMode.nextStep();
	window.debugModeContinueSteps = () => DebugMode.continueSteps();
	window.debugModeSetWeather = (weatherOverride) => DebugMode.setWeather(weatherOverride);
}

export default DebugMode;
export { DebugMode };
