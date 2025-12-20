/**
 * Main entry point for the Tetris Ball Matcher game.
 * Initializes the game engine when the DOM is ready.
 * @module main
 * @version 1.0.0
 */

import GameEngine from './modules/GameEngine.js';
import { EventEmitter } from './utils/EventEmitter.js';
import { CONSTANTS } from './utils/Constants.js';
import { DebugMode } from './utils/DebugMode.js';
import LevelManager from './modules/LevelManager.js';
import AudioManager from './modules/AudioManager.js';
import ParticleSystem from './modules/ParticleSystem.js';

/**
 * Initialize the game when the DOM is ready
 */
document.addEventListener('DOMContentLoaded', async () => {
	try {
		// Initialize the game engine
		await GameEngine.initialize();
		
		// Initialize particle overlay canvas
		ParticleSystem.initializeOverlay();
		
		// Initialize AudioManager (must be done after user interaction for browser compatibility)
		// We'll initialize it on first button click
		document.body.addEventListener('click', () => {
			AudioManager.initialize();
			AudioManager.resume();
		}, { once: true });
		
		// Initialize level manager
		LevelManager.initialize();

		// Set up menu event listeners
		setupMenuListeners();
		
		// Populate level select grid
		populateLevelGrid();
		
		// Set up score display listener
		setupScoreListener();

		// Show debug overlay if enabled
		if (DebugMode.isEnabled()) {
			DebugMode.showDebugInfo();
		}

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
	const difficultyButtons = document.querySelectorAll('.difficulty-btn');

	// Difficulty selection
	difficultyButtons.forEach(btn => {
		btn.addEventListener('click', () => {
			AudioManager.playClick();
			const difficulty = parseInt(btn.dataset.difficulty);
			selectDifficulty(difficulty);
		});
	});
	
	// Select difficulty 1 by default
	selectDifficulty(1);

	// Start new game
	if (startBtn) {
		startBtn.addEventListener('click', async () => {
			AudioManager.playClick();
			console.log('Start button clicked, starting music...');
			
			// Ensure AudioManager is initialized
			AudioManager.initialize();
			await AudioManager.resume();
			
			await AudioManager.startMusic(); // Start background music
			showScreen('gameScreen');
			// Start with selected difficulty and level
			GameEngine.start(selectedDifficulty, selectedLevel);
		});
	}

	// Settings (Phase 9 - Settings UI)
	if (settingsBtn) {
		settingsBtn.addEventListener('click', () => {
			AudioManager.playClick();
			showSettingsOverlay();
		});
	}
	
	// Set up settings overlay controls
	setupSettingsControls();
	
	// Set up game over / pause / level complete screen buttons
	setupGameScreenListeners();
}

/**
 * Show a specific screen and hide others
 * @param {string} screenId - The ID of the screen to show
 */
function showScreen(screenId) {
	const screens = ['menuScreen', 'gameScreen', 'pauseScreen', 'gameOverScreen', 'levelCompleteScreen'];

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
 * Set up event listeners for game screens (pause, game over, level complete)
 */
function setupGameScreenListeners() {
	// Pause screen buttons
	const resumeBtn = document.getElementById('resumeButton');
	const menuFromPauseBtn = document.getElementById('menuFromPauseButton');
	
	if (resumeBtn) {
		resumeBtn.addEventListener('click', () => {
			AudioManager.playClick();
			GameEngine.resume();
		});
	}
	
	if (menuFromPauseBtn) {
		menuFromPauseBtn.addEventListener('click', () => {
			AudioManager.playClick();
			AudioManager.stopMusic();
			showScreen('menuScreen');
			populateLevelGrid(); // Refresh level grid in case new levels unlocked
		});
	}
	
	// Game over screen buttons
	const restartBtn = document.getElementById('restartButton');
	const menuFromGameOverBtn = document.getElementById('menuFromGameOverButton');
	
	if (restartBtn) {
		restartBtn.addEventListener('click', () => {
			AudioManager.playClick();
			showScreen('gameScreen');
			GameEngine.start(selectedDifficulty, selectedLevel);
		});
	}
	
	if (menuFromGameOverBtn) {
		menuFromGameOverBtn.addEventListener('click', () => {
			AudioManager.playClick();
			AudioManager.stopMusic();
			showScreen('menuScreen');
			populateLevelGrid();
		});
	}
	
	// Level complete screen buttons
	const nextLevelBtn = document.getElementById('nextLevelButton');
	const replayLevelBtn = document.getElementById('replayLevelButton');
	const menuFromCompleteBtn = document.getElementById('menuFromCompleteButton');
	
	if (nextLevelBtn) {
		nextLevelBtn.addEventListener('click', () => {
			AudioManager.playClick();
			// Hide overlay
			const overlay = document.getElementById('levelCompleteOverlay');
			if (overlay) overlay.classList.add('hidden');
			
			// Advance to next level
			selectedLevel = Math.min(selectedLevel + 1, LevelManager.getMaxLevel());
			showScreen('gameScreen');
			GameEngine.start(selectedDifficulty, selectedLevel);
		});
	}
	
	if (replayLevelBtn) {
		replayLevelBtn.addEventListener('click', () => {
			AudioManager.playClick();
			// Hide overlay
			const overlay = document.getElementById('levelCompleteOverlay');
			if (overlay) overlay.classList.add('hidden');
			
			// Replay same level
			showScreen('gameScreen');
			GameEngine.start(selectedDifficulty, selectedLevel);
		});
	}
	
	if (menuFromCompleteBtn) {
		menuFromCompleteBtn.addEventListener('click', () => {
			AudioManager.playClick();
			AudioManager.stopMusic();
			// Hide overlay
			const overlay = document.getElementById('levelCompleteOverlay');
			if (overlay) overlay.classList.add('hidden');
			
			showScreen('menuScreen');
			populateLevelGrid(); // Refresh to show newly unlocked levels
		});
	}
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

/**
 * Populate the level selection grid
 */
function populateLevelGrid() {
	const levelGrid = document.getElementById('levelGrid');
	if (!levelGrid) return;
	
	const maxLevel = LevelManager.getMaxLevel();
	const unlockedLevels = LevelManager.getUnlockedLevels();
	
	// Clear existing buttons
	levelGrid.innerHTML = '';
	
	// Create button for each level
	for (let level = 1; level <= maxLevel; level++) {
		const btn = document.createElement('button');
		btn.className = 'level-btn';
		btn.textContent = level;
		btn.dataset.level = level;
		
		// Check if level is unlocked
		const isUnlocked = unlockedLevels.includes(level);
		if (!isUnlocked) {
			btn.classList.add('locked');
			btn.disabled = true;
		}
		
		// Add click handler for unlocked levels
		if (isUnlocked) {
			btn.addEventListener('click', () => {
				AudioManager.playClick();
				selectLevel(level);
			});
		}
		
		levelGrid.appendChild(btn);
	}
	
	// Select level 1 by default
	selectLevel(1);
}

/**
 * Select a level (updates UI and stores selection)
 * @param {Number} level - Level number to select
 */
let selectedLevel = 1;
let selectedDifficulty = 1;

function selectLevel(level) {
	if (!LevelManager.isLevelUnlocked(level)) return;
	
	selectedLevel = level;
	
	// Update UI - highlight selected level
	const levelButtons = document.querySelectorAll('.level-btn');
	levelButtons.forEach(btn => {
		if (parseInt(btn.dataset.level) === level) {
			btn.classList.add('selected');
		} else {
			btn.classList.remove('selected');
		}
	});
}

/**
 * Select a difficulty (updates UI and stores selection)
 * @param {Number} difficulty - Difficulty number (1-5)
 */
function selectDifficulty(difficulty) {
	selectedDifficulty = difficulty;
	
	// Update UI - highlight selected difficulty
	const difficultyButtons = document.querySelectorAll('.difficulty-btn');
	difficultyButtons.forEach(btn => {
		if (parseInt(btn.dataset.difficulty) === difficulty) {
			btn.classList.add('selected');
		} else {
			btn.classList.remove('selected');
		}
	});
}

/**
 * Show settings overlay
 */
function showSettingsOverlay() {
	const overlay = document.getElementById('settingsOverlay');
	if (overlay) {
		// Load current settings from AudioManager
		const settings = AudioManager.getSettings();
		
		// Update UI to reflect current settings
		const muteToggle = document.getElementById('muteToggle');
		const masterSlider = document.getElementById('masterVolumeSlider');
		const sfxSlider = document.getElementById('sfxVolumeSlider');
		const musicSlider = document.getElementById('musicVolumeSlider');
		
		if (muteToggle) muteToggle.checked = settings.muted;
		if (masterSlider) masterSlider.value = settings.masterVolume * 100;
		if (sfxSlider) sfxSlider.value = settings.sfxVolume * 100;
		if (musicSlider) musicSlider.value = settings.musicVolume * 100;
		
		// Update value displays
		updateVolumeDisplay('masterVolumeValue', settings.masterVolume * 100);
		updateVolumeDisplay('sfxVolumeValue', settings.sfxVolume * 100);
		updateVolumeDisplay('musicVolumeValue', settings.musicVolume * 100);
		
		overlay.classList.remove('hidden');
	}
}

/**
 * Hide settings overlay
 */
function hideSettingsOverlay() {
	const overlay = document.getElementById('settingsOverlay');
	if (overlay) {
		overlay.classList.add('hidden');
	}
}

/**
 * Update volume display percentage
 */
function updateVolumeDisplay(elementId, value) {
	const display = document.getElementById(elementId);
	if (display) {
		display.textContent = Math.round(value) + '%';
	}
}

/**
 * Set up settings controls
 */
function setupSettingsControls() {
	// Close settings button
	const closeBtn = document.getElementById('closeSettingsButton');
	if (closeBtn) {
		closeBtn.addEventListener('click', () => {
			AudioManager.playClick();
			hideSettingsOverlay();
		});
	}
	
	// Mute toggle
	const muteToggle = document.getElementById('muteToggle');
	if (muteToggle) {
		muteToggle.addEventListener('change', (e) => {
			AudioManager.toggleMute();
			AudioManager.playClick();
		});
	}
	
	// Master volume slider
	const masterSlider = document.getElementById('masterVolumeSlider');
	if (masterSlider) {
		masterSlider.addEventListener('input', (e) => {
			const value = e.target.value / 100;
			AudioManager.setMasterVolume(value);
			updateVolumeDisplay('masterVolumeValue', e.target.value);
		});
	}
	
	// SFX volume slider
	const sfxSlider = document.getElementById('sfxVolumeSlider');
	if (sfxSlider) {
		sfxSlider.addEventListener('input', (e) => {
			const value = e.target.value / 100;
			AudioManager.setSFXVolume(value);
			updateVolumeDisplay('sfxVolumeValue', e.target.value);
		});
		
		// Play test sound on release
		sfxSlider.addEventListener('change', () => {
			AudioManager.playClick();
		});
	}
	
	// Music volume slider
	const musicSlider = document.getElementById('musicVolumeSlider');
	if (musicSlider) {
		musicSlider.addEventListener('input', (e) => {
			const value = e.target.value / 100;
			AudioManager.setMusicVolume(value);
			updateVolumeDisplay('musicVolumeValue', e.target.value);
		});
	}
}
