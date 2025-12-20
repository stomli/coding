/**
 * LevelManager.js
 * 
 * Description: Manages level progression, unlocks, and level-specific configurations
 * 
 * Dependencies: ConfigManager, StorageManager
 * 
 * Exports: LevelManager singleton
 */

import { ConfigManager } from './ConfigManager.js';

/**
 * LevelManager class for handling level progression
 */
class LevelManagerClass {
	constructor() {
		this.currentLevel = 1;
		this.maxLevel = 20;
		this.unlockedLevels = [1]; // Start with level 1 unlocked
		this.levelTimer = 0;
		this.levelTimeLimit = 15; // seconds
		this.timerRunning = false;
	}

	/**
	 * Initialize level manager
	 */
	initialize() {
		this.currentLevel = 1;
		this.levelTimer = 0;
		this.timerRunning = false;
		this.loadUnlockedLevels();
	}

	/**
	 * Start level timer
	 */
	startTimer() {
		this.levelTimer = 0;
		this.timerRunning = true;
		this.levelTimeLimit = ConfigManager.get('game.levelDuration', 90);
	}

	/**
	 * Stop level timer
	 */
	stopTimer() {
		this.timerRunning = false;
	}

	/**
	 * Update timer (call each frame)
	 * @param {Number} deltaTime - Time elapsed since last frame in seconds
	 * @returns {Boolean} True if time is up
	 */
	updateTimer(deltaTime) {
		if (!this.timerRunning) return false;

		this.levelTimer += deltaTime;

		// Check if time limit exceeded
		if (this.levelTimer >= this.levelTimeLimit) {
			this.timerRunning = false;
			return true; // Time's up
		}

		return false;
	}

	/**
	 * Get remaining time in seconds
	 * @returns {Number} Seconds remaining
	 */
	getRemainingTime() {
		const remaining = this.levelTimeLimit - this.levelTimer;
		return Math.max(0, remaining);
	}

	/**
	 * Get timer display string
	 * @returns {String} Timer display (e.g., "12.5s")
	 */
	getTimerDisplay() {
		const remaining = this.getRemainingTime();
		return remaining.toFixed(1) + 's';
	}

	/**
	 * Complete current level
	 */
	completeLevel() {
		this.stopTimer();

		// Unlock next level
		const nextLevel = this.currentLevel + 1;
		if (nextLevel <= this.maxLevel && !this.unlockedLevels.includes(nextLevel)) {
			this.unlockedLevels.push(nextLevel);
			this.saveUnlockedLevels();
		}
	}

	/**
	 * Check if a level is unlocked
	 * @param {Number} level - Level number to check
	 * @returns {Boolean} True if unlocked
	 */
	isLevelUnlocked(level) {
		return this.unlockedLevels.includes(level);
	}

	/**
	 * Set current level
	 * @param {Number} level - Level number
	 */
	setLevel(level) {
		if (level >= 1 && level <= this.maxLevel) {
			this.currentLevel = level;
		}
	}

	/**
	 * Get current level
	 * @returns {Number} Current level number
	 */
	getLevel() {
		return this.currentLevel;
	}

	/**
	 * Get max available level
	 * @returns {Number} Maximum level number
	 */
	getMaxLevel() {
		return this.maxLevel;
	}

	/**
	 * Get all unlocked levels
	 * @returns {Array<Number>} Array of unlocked level numbers
	 */
	getUnlockedLevels() {
		return [...this.unlockedLevels];
	}

	/**
	 * Save unlocked levels to localStorage
	 */
	saveUnlockedLevels() {
		try {
			localStorage.setItem('ballDrop_unlockedLevels', JSON.stringify(this.unlockedLevels));
		} catch (e) {
			console.error('Failed to save unlocked levels:', e);
		}
	}

	/**
	 * Load unlocked levels from localStorage
	 */
	loadUnlockedLevels() {
		try {
			const saved = localStorage.getItem('ballDrop_unlockedLevels');
			if (saved) {
				this.unlockedLevels = JSON.parse(saved);
				// Ensure level 1 is always unlocked
				if (!this.unlockedLevels.includes(1)) {
					this.unlockedLevels.push(1);
				}
			}
		} catch (e) {
			console.error('Failed to load unlocked levels:', e);
			this.unlockedLevels = [1];
		}
	}

	/**
	 * Reset all progress (unlock only level 1)
	 */
	resetProgress() {
		this.unlockedLevels = [1];
		this.currentLevel = 1;
		this.saveUnlockedLevels();
	}

	/**
	 * Unlock all levels (for testing/debug)
	 */
	unlockAllLevels() {
		this.unlockedLevels = [];
		for (let i = 1; i <= this.maxLevel; i++) {
			this.unlockedLevels.push(i);
		}
		this.saveUnlockedLevels();
	}
}

// Export singleton instance
const LevelManager = new LevelManagerClass();
export default LevelManager;
