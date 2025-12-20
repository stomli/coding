/**
 * Main entry point for the Tetris Ball Matcher game.
 * Initializes the game engine when the DOM is ready.
 * @module main
 * @version 1.0.0
 */

import GameEngine from './modules/GameEngine.js';
import { EventEmitter } from './utils/EventEmitter.js';
import { CONSTANTS } from './utils/Constants.js';

/**
 * Initialize the game when the DOM is ready
 */
document.addEventListener('DOMContentLoaded', async () => {
	try {
		// Initialize the game engine
		await GameEngine.initialize();

		// Set up menu event listeners
		setupMenuListeners();
		
		// Set up score display listener
		setupScoreListener();

		// Show the main menu
		showScreen('menuScreen');
	}
	catch (error) {
		console.error('Failed to initialize game:', error);
		alert('Failed to initialize game. Please refresh the page.');
	}
});

/**
 * Set up event listeners for menu buttons
 */
function setupMenuListeners() {
	const startBtn = document.getElementById('startButton');
	const settingsBtn = document.getElementById('settingsButton');

	// Start new game
	if (startBtn) {
		startBtn.addEventListener('click', () => {
			showScreen('gameScreen');
			// Start at difficulty 1, level 1
			GameEngine.start(1, 1);
		});
	}

	// Settings (Phase 9 - Settings UI)
	if (settingsBtn) {
		settingsBtn.addEventListener('click', () => {
			// TODO: Implement in Phase 9
			console.log('Settings - not yet implemented');
		});
	}
}

/**
 * Show a specific screen and hide others
 * @param {string} screenId - The ID of the screen to show
 */
function showScreen(screenId) {
	const screens = ['menuScreen', 'gameScreen', 'pauseScreen', 'gameOverScreen'];

	screens.forEach(id => {
		const screen = document.getElementById(id);
		if (screen) {
			if (id === screenId) {
				screen.classList.remove('hidden');
			}
			else {
				screen.classList.add('hidden');
			}
		}
	});
}

/**
 * Set up score display listener
 */
function setupScoreListener() {
	const totalScoreDisplay = document.getElementById('totalScoreDisplay');
	const levelScoreDisplay = document.getElementById('levelScoreDisplay');
	
	EventEmitter.on(CONSTANTS.EVENTS.SCORE_UPDATE, (data) => {
		if (totalScoreDisplay) {
			totalScoreDisplay.textContent = data.score.toLocaleString();
		}
		if (levelScoreDisplay) {
			levelScoreDisplay.textContent = data.score.toLocaleString();
		}
	});
}
