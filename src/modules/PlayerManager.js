/**
 * PlayerManager.js
 * 
 * Description: Manages player profiles for multi-player gameplay on the same computer
 * 
 * Dependencies: None (uses localStorage)
 * 
 * Exports: PlayerManager singleton
 */

/**
 * PlayerManager class for managing player profiles
 */
class PlayerManagerClass {
	constructor() {
		this.currentPlayer = null;
		this.players = {};
		this.storageKey = 'ballMatcher_players';
		this.currentPlayerKey = 'ballMatcher_currentPlayer';
		
		this.loadPlayers();
	}

	/**
	 * Load players from localStorage
	 */
	loadPlayers() {
		try {
			const savedPlayers = localStorage.getItem(this.storageKey);
			if (savedPlayers) {
				this.players = JSON.parse(savedPlayers);
				// Migrate old data format to new format
				this.migratePlayerData();
			} else {
				// Create default player
				this.players = {
					'Guest': this.createNewPlayerData('Guest')
				};
				this.savePlayers();
			}

			// Load current player
			const savedCurrentPlayer = localStorage.getItem(this.currentPlayerKey);
			if (savedCurrentPlayer && this.players[savedCurrentPlayer]) {
				this.currentPlayer = savedCurrentPlayer;
			} else {
				this.currentPlayer = 'Guest';
			}
		} catch (error) {
			console.error('PlayerManager: Error loading players', error);
			this.players = {
				'Guest': this.createNewPlayerData('Guest')
			};
			this.currentPlayer = 'Guest';
		}
	}

	/**
	 * Migrate old player data format to new format
	 * Converts old level-only completion to difficulty-level format
	 */
	migratePlayerData() {
		let migrated = false;
		
		Object.keys(this.players).forEach(playerName => {
			const player = this.players[playerName];
			
			if (!player.levelProgress) return;
			
			// Migrate old unlockedLevels array to unlockedLevelsByDifficulty object
			if (Array.isArray(player.levelProgress.unlockedLevels)) {
				const oldUnlockedLevels = [...player.levelProgress.unlockedLevels];
				player.levelProgress.unlockedLevelsByDifficulty = {
					"1": oldUnlockedLevels, // Migrate to Easy difficulty
					"2": [1],
					"3": [1],
					"4": [1],
					"5": [1]
				};
				delete player.levelProgress.unlockedLevels;
				migrated = true;
			}
			
			// Ensure unlockedLevelsByDifficulty exists
			if (!player.levelProgress.unlockedLevelsByDifficulty) {
				player.levelProgress.unlockedLevelsByDifficulty = {
					"1": [1], "2": [1], "3": [1], "4": [1], "5": [1]
				};
				migrated = true;
			}
			
			// Check if completedLevels has old format (numbers instead of "difficulty-level" strings)
			if (player.levelProgress.completedLevels) {
				const hasOldFormat = player.levelProgress.completedLevels.some(item => typeof item === 'number');
				
				if (hasOldFormat) {
					const oldCompletedLevels = [...player.levelProgress.completedLevels];
					const oldLevelScores = { ...player.levelProgress.levelScores };
					
					// Reset to new format
					player.levelProgress.completedLevels = [];
					player.levelProgress.levelScores = {};
					
					// Migrate old level numbers to "1-level" (assume difficulty 1)
					oldCompletedLevels.forEach(level => {
						if (typeof level === 'number') {
							const key = `1-${level}`;
							player.levelProgress.completedLevels.push(key);
							
							// Migrate score if exists
							if (oldLevelScores[level]) {
								player.levelProgress.levelScores[key] = oldLevelScores[level];
							}
						} else {
							// Already in new format, keep it
							player.levelProgress.completedLevels.push(level);
						}
					});
					
					// Migrate old score keys (number keys to "1-level" keys)
					Object.keys(oldLevelScores).forEach(key => {
						if (!isNaN(key)) {
							const newKey = `1-${key}`;
							if (!player.levelProgress.levelScores[newKey]) {
								player.levelProgress.levelScores[newKey] = oldLevelScores[key];
							}
						}
					});
					
					migrated = true;
				}
			}
		});
		
		if (migrated) {
			this.savePlayers();
			console.log('Player data migration completed');
		}
	}

	/**
	 * Save players to localStorage
	 */
	savePlayers() {
		try {
			localStorage.setItem(this.storageKey, JSON.stringify(this.players));
			localStorage.setItem(this.currentPlayerKey, this.currentPlayer);
		} catch (error) {
			console.error('PlayerManager: Error saving players', error);
		}
	}

	/**
	 * Create new player data structure
	 * @param {String} name - Player name
	 * @returns {Object} New player data
	 */
	createNewPlayerData(name) {
		return {
			name: name,
			createdAt: new Date().toISOString(),
			lastPlayed: new Date().toISOString(),
			stats: {
				gamesPlayed: 0,
				totalScore: 0,
				highScore: 0,
				longestTime: 0,
				levelsCompleted: 0
			},
			levelProgress: {
				highestLevel: 1,
				// Track unlocked levels by difficulty
				// Format: { "1": [1, 2, 3], "2": [1], "3": [1], "4": [1], "5": [1] }
				unlockedLevelsByDifficulty: {
					"1": [1], // Easy
					"2": [1], // Medium
					"3": [1], // Hard
					"4": [1], // Expert
					"5": [1]  // Master
				},
				// Track completion and scores by difficulty+level combination
				// Format: "difficulty-level" (e.g., "1-1", "3-5")
				completedLevels: [], // Array of "difficulty-level" strings
				levelScores: {} // Object mapping "difficulty-level" to best score: { "1-1": 1000, "2-5": 1500, etc. }
		},
		settings: {
			isMuted: false,
			masterVolume: 0.7,
			sfxVolume: 0.8,
			musicVolume: 0
		}
	};
}	/**
	 * Get current player name
	 * @returns {String} Current player name
	 */
	getCurrentPlayerName() {
		return this.currentPlayer;
	}

	/**
	 * Get current player data
	 * @returns {Object} Current player data
	 */
	getCurrentPlayerData() {
		return this.players[this.currentPlayer] || this.players['Guest'];
	}

	/**
	 * Get all player names
	 * @returns {Array<String>} Array of player names
	 */
	getPlayerNames() {
		return Object.keys(this.players);
	}

	/**
	 * Switch to a different player
	 * @param {String} playerName - Name of player to switch to
	 * @returns {Boolean} True if switch successful
	 */
	switchPlayer(playerName) {
		if (this.players[playerName]) {
			this.currentPlayer = playerName;
			this.players[playerName].lastPlayed = new Date().toISOString();
			this.savePlayers();
			console.log(`PlayerManager: Switched to player ${playerName}`);
			return true;
		}
		console.warn(`PlayerManager: Player ${playerName} not found`);
		return false;
	}

	/**
	 * Add a new player
	 * @param {String} playerName - Name of new player
	 * @returns {Boolean} True if player added successfully
	 */
	addPlayer(playerName) {
		// Validate name
		if (!playerName || playerName.trim() === '') {
			console.warn('PlayerManager: Invalid player name');
			return false;
		}

		playerName = playerName.trim();

		// Check if player already exists
		if (this.players[playerName]) {
			console.warn(`PlayerManager: Player ${playerName} already exists`);
			return false;
		}

		// Create new player
		this.players[playerName] = this.createNewPlayerData(playerName);
		this.savePlayers();
		console.log(`PlayerManager: Added new player ${playerName}`);
		return true;
	}

	/**
	 * Delete a player
	 * @param {String} playerName - Name of player to delete
	 * @returns {Boolean} True if player deleted successfully
	 */
	deletePlayer(playerName) {
		// Can't delete Guest or current player
		if (playerName === 'Guest') {
			console.warn('PlayerManager: Cannot delete Guest player');
			return false;
		}

		if (playerName === this.currentPlayer) {
			console.warn('PlayerManager: Cannot delete current player');
			return false;
		}

		if (this.players[playerName]) {
			delete this.players[playerName];
			this.savePlayers();
			console.log(`PlayerManager: Deleted player ${playerName}`);
			return true;
		}

		return false;
	}

	/**
	 * Update player stats
	 * @param {Object} stats - Stats to update (score, time, difficulty, levelCompleted, gameStarted)
	 */
	updateStats(stats) {
		const player = this.getCurrentPlayerData();
		
		// Initialize levelProgress properties if they don't exist (backward compatibility)
		if (!player.levelProgress.completedLevels) {
			player.levelProgress.completedLevels = [];
		}
		if (!player.levelProgress.levelScores) {
			player.levelProgress.levelScores = {};
		}
		
		if (stats.score !== undefined) {
			player.stats.totalScore += stats.score;
			if (stats.score > player.stats.highScore) {
				player.stats.highScore = stats.score;
			}
		}

		if (stats.time !== undefined && stats.time > player.stats.longestTime) {
			player.stats.longestTime = stats.time;
		}

		if (stats.levelCompleted !== undefined && stats.difficulty !== undefined) {
			const level = stats.levelCompleted;
			const difficulty = stats.difficulty;
			const key = `${difficulty}-${level}`; // e.g., "1-5" for Easy Level 5
			
			// Ensure unlockedLevelsByDifficulty exists
			if (!player.levelProgress.unlockedLevelsByDifficulty) {
				player.levelProgress.unlockedLevelsByDifficulty = {
					"1": [1], "2": [1], "3": [1], "4": [1], "5": [1]
				};
			}
			
			// Mark difficulty+level as completed if not already
			if (!player.levelProgress.completedLevels.includes(key)) {
				player.levelProgress.completedLevels.push(key);
				player.stats.levelsCompleted++;
			}
			
			// Update best score for this difficulty+level combination
			if (stats.score !== undefined) {
				const currentBest = player.levelProgress.levelScores[key] || 0;
				if (stats.score > currentBest) {
					player.levelProgress.levelScores[key] = stats.score;
				}
			}
			
			// Update highest level reached
			if (level > player.levelProgress.highestLevel) {
				player.levelProgress.highestLevel = level;
			}
			
			// Unlock next level for this difficulty
			const difficultyKey = String(difficulty);
			if (!player.levelProgress.unlockedLevelsByDifficulty[difficultyKey]) {
				player.levelProgress.unlockedLevelsByDifficulty[difficultyKey] = [1];
			}
			
			// Ensure all levels up to and including current level are unlocked
			const unlockedArray = player.levelProgress.unlockedLevelsByDifficulty[difficultyKey];
			for (let i = 1; i <= level; i++) {
				if (!unlockedArray.includes(i)) {
					unlockedArray.push(i);
				}
			}
			
			// Unlock the next level
			if (!unlockedArray.includes(level + 1)) {
				unlockedArray.push(level + 1);
			}
		}

		if (stats.gameStarted) {
			player.stats.gamesPlayed++;
		}

		player.lastPlayed = new Date().toISOString();
		this.savePlayers();
	}

	/**
	 * Get high score for current player
	 * @returns {Number} High score
	 */
	getHighScore() {
		return this.getCurrentPlayerData().stats.highScore;
	}

	/**
	 * Get longest time for current player
	 * @returns {Number} Longest time survived
	 */
	getLongestTime() {
		return this.getCurrentPlayerData().stats.longestTime;
	}

	/**
	 * Get best score for a specific difficulty+level combination
	 * @param {Number} difficulty - Difficulty level (1-5)
	 * @param {Number} level - Level number
	 * @returns {Number} Best score for this difficulty+level (0 if never completed)
	 */
	getLevelBestScore(difficulty, level) {
		const player = this.getCurrentPlayerData();
		if (!player.levelProgress.levelScores) {
			player.levelProgress.levelScores = {};
		}
		const key = `${difficulty}-${level}`;
		return player.levelProgress.levelScores[key] || 0;
	}

	/**
	 * Check if a difficulty+level combination has been completed
	 * @param {Number} difficulty - Difficulty level (1-5)
	 * @param {Number} level - Level number
	 * @returns {Boolean} True if this difficulty+level has been completed at least once
	 */
	isLevelCompleted(difficulty, level) {
		const player = this.getCurrentPlayerData();
		if (!player.levelProgress.completedLevels) {
			player.levelProgress.completedLevels = [];
		}
		const key = `${difficulty}-${level}`;
		return player.levelProgress.completedLevels.includes(key);
	}

	/**
	 * Get settings for current player
	 * @returns {Object} Player settings
	 */
	getSettings() {
		const player = this.getCurrentPlayerData();
		// Ensure settings exist (for backward compatibility with old saves)
		if (!player.settings) {
			player.settings = {
				isMuted: false,
				masterVolume: 0.7,
				sfxVolume: 0.8,
				musicVolume: 0
			};
			this.savePlayers();
		}
		return player.settings;
	}

	/**
	 * Update settings for current player
	 * @param {Object} settings - Settings to update
	 */
	updateSettings(settings) {
		const player = this.getCurrentPlayerData();
		if (!player.settings) {
			player.settings = {};
		}
		
		Object.assign(player.settings, settings);
		this.savePlayers();
	}

	/**
	 * Reset current player's stats and progress
	 * @returns {Boolean} True if reset successful
	 */
	resetPlayerData() {
		const playerName = this.currentPlayer;
		const currentSettings = this.getSettings();
		
		// Create fresh player data but keep settings
		const freshData = this.createNewPlayerData(playerName);
		freshData.settings = currentSettings;
		
		this.players[playerName] = freshData;
		this.savePlayers();
		
		console.log(`PlayerManager: Reset data for player ${playerName}`);
		return true;
	}
}

// Export singleton instance
const PlayerManager = new PlayerManagerClass();
export default PlayerManager;
